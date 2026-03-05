import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from 'ioredis';
import { MomenceApiClient } from './lib/momence-client.js';

/**
 * API Route: /api/cron-reconciliation
 *
 * Cron job for post-class attendance reconciliation.
 * ONLY processes trial class bookings (from our widget).
 *
 * Flow:
 * 1. Scans today's bookings from Redis (reminders:{date})
 * 2. For finished classes, checks Momence checkedIn status
 * 3. No-shows → auto-reschedule to next week + email + WhatsApp
 * 4. Updates Google Calendar colors
 * 5. Records analytics
 *
 * Schedule: Every hour via Vercel Cron (0 * * * *)
 * Guard: Only runs 10:00-22:00 Madrid time
 *
 * Headers: Authorization: Bearer {CRON_SECRET}
 */

const SPAIN_TIMEZONE = 'Europe/Madrid';
const BOOKING_TTL_SECONDS = 90 * 24 * 60 * 60;
const MAX_AUTO_RESCHEDULES_PER_RUN = 10;
const CLASS_DURATION_MINUTES = 60;
const POST_CLASS_BUFFER_MINUTES = 30; // Wait 30min after class ends before reconciling

// ============================================================================
// TYPES
// ============================================================================

interface BookingDetails {
  eventId: string;
  bookingType?: 'trial';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  className: string;
  classDate: string;
  classTime: string;
  category: string;
  calendarEventId?: string | null;
  createdAt: string;
  status?: 'confirmed' | 'cancelled';
  attendance?: 'pending' | 'confirmed' | 'not_attending';
  reconciliationStatus?: string;
  reconciliationProcessed?: boolean;
  reconciliationTimestamp?: string | null;
  momenceVerified?: boolean;
  momenceBookingId?: number | null;
  sessionId?: string | null;
  rescheduleCount?: number;
  rescheduledFrom?: string | null;
  rescheduledTo?: string | null;
}

interface ReconciliationResult {
  eventId: string;
  action:
    | 'attended'
    | 'no_show_rescheduled'
    | 'no_show_unresolved'
    | 'no_show_notified'
    | 'skipped'
    | 'error';
  details?: string;
}

// ============================================================================
// GOOGLE CALENDAR (inlined for Vercel bundler)
// ============================================================================

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_TOKEN_URL = 'https://oauth2.googleapis.com/token';

let cachedCalendarAccessToken: string | null = null;
let calendarTokenExpiry: number = 0;

async function getCalendarAccessToken(): Promise<string | null> {
  const clientId = process.env['GOOGLE_CALENDAR_CLIENT_ID'];
  const clientSecret = process.env['GOOGLE_CALENDAR_CLIENT_SECRET'];
  const refreshToken = process.env['GOOGLE_CALENDAR_REFRESH_TOKEN'];

  if (!clientId || !clientSecret || !refreshToken) return null;

  if (cachedCalendarAccessToken && Date.now() < calendarTokenExpiry - 60000) {
    return cachedCalendarAccessToken;
  }

  try {
    const response = await fetch(CALENDAR_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    cachedCalendarAccessToken = data.access_token;
    calendarTokenExpiry = Date.now() + data.expires_in * 1000;
    return cachedCalendarAccessToken;
  } catch {
    return null;
  }
}

function getCalendarId(): string {
  return process.env['GOOGLE_CALENDAR_ID'] || 'primary';
}

async function updateCalendarEventColor(
  calendarEventId: string,
  colorId: string,
  description?: string
): Promise<void> {
  const token = await getCalendarAccessToken();
  if (!token) return;

  const body: Record<string, unknown> = { colorId };
  if (description) body['description'] = description;

  await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(getCalendarId())}/events/${calendarEventId}?sendUpdates=none`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

// ============================================================================
// REDIS
// ============================================================================

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  const redisUrl = process.env['STORAGE_REDIS_URL'];
  if (!redisUrl) return null;

  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
    });
  }
  return redisClient;
}

// ============================================================================
// HELPERS
// ============================================================================

function getDateInTimezone(date: Date, timezone: string): string {
  return date.toLocaleDateString('en-CA', { timeZone: timezone });
}

function getHourInTimezone(date: Date, timezone: string): number {
  return parseInt(
    date.toLocaleTimeString('en-US', { timeZone: timezone, hour12: false, hour: '2-digit' }),
    10
  );
}

function isClassFinished(classDate: string, classTime: string): boolean {
  const now = new Date();
  const [hours, minutes] = classTime.split(':').map(Number);

  // Build class end time: classTime + duration + buffer
  let classEndDate: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(classDate)) {
    classEndDate = new Date(`${classDate}T${classTime}:00`);
  } else {
    // Try to parse Spanish date format
    classEndDate = new Date();
    classEndDate.setHours(hours || 0, minutes || 0, 0, 0);
  }

  classEndDate.setMinutes(
    classEndDate.getMinutes() + CLASS_DURATION_MINUTES + POST_CLASS_BUFFER_MINUTES
  );
  return now > classEndDate;
}

// ============================================================================
// RECONCILIATION LOGIC
// ============================================================================

async function reconcileBooking(
  redis: Redis,
  booking: BookingDetails,
  momenceClient: MomenceApiClient,
  autoRescheduleCount: { value: number }
): Promise<ReconciliationResult> {
  const { eventId } = booking;

  // Skip cancelled bookings
  if (booking.status === 'cancelled') {
    return { eventId, action: 'skipped', details: 'Already cancelled' };
  }

  // Skip already processed
  if (booking.reconciliationProcessed) {
    return { eventId, action: 'skipped', details: 'Already processed' };
  }

  // Skip if class hasn't finished yet
  if (!isClassFinished(booking.classDate, booking.classTime)) {
    return { eventId, action: 'skipped', details: 'Class not finished yet' };
  }

  // CRITICAL: Only process trial bookings
  if (booking.bookingType && booking.bookingType !== 'trial') {
    console.warn(`[reconciliation] SKIP: not a trial booking (${eventId})`);
    return { eventId, action: 'skipped', details: 'Not a trial booking' };
  }

  // Check Momence for actual check-in status
  let momenceCheckedIn = false;
  if (booking.sessionId && booking.momenceBookingId) {
    try {
      const sessionBookings = await momenceClient.getSessionBookings(
        parseInt(booking.sessionId, 10),
        { page: 1, pageSize: 100, includeCancelled: true }
      );

      const ourBooking = sessionBookings.payload.find(b => b.id === booking.momenceBookingId);

      if (ourBooking) {
        momenceCheckedIn = ourBooking.checkedIn || false;
      }
    } catch (e) {
      console.warn(
        `[reconciliation] Momence check failed for ${eventId}:`,
        e instanceof Error ? e.message : e
      );
      // Continue with what we know from WhatsApp attendance buttons
    }
  }

  // ATTENDED: Momence checked in
  if (momenceCheckedIn) {
    booking.attendance = 'attended' as BookingDetails['attendance'];
    booking.reconciliationStatus = 'attended';
    booking.reconciliationProcessed = true;
    booking.reconciliationTimestamp = new Date().toISOString();

    await redis.setex(`booking_details:${eventId}`, BOOKING_TTL_SECONDS, JSON.stringify(booking));

    // Update calendar to green
    if (booking.calendarEventId) {
      try {
        await updateCalendarEventColor(booking.calendarEventId, '10', `Estado: 🟢 Asistió ✅`);
      } catch {
        /* non-blocking */
      }
    }

    // Record individual audit event
    try {
      const { recordAuditEvent } = await import('./lib/audit.js');
      await recordAuditEvent(redis, {
        action: 'booking_attended',
        eventId,
        email: booking.email,
        className: booking.className,
        classDate: booking.classDate,
        success: true,
      });
    } catch {
      /* non-blocking */
    }

    return { eventId, action: 'attended' };
  }

  // NO-SHOW: Class finished but didn't check in
  booking.attendance = 'no_show' as BookingDetails['attendance'];
  booking.reconciliationStatus = 'no_show';
  booking.reconciliationProcessed = true;
  booking.reconciliationTimestamp = new Date().toISOString();

  // Update calendar to red
  if (booking.calendarEventId) {
    try {
      await updateCalendarEventColor(booking.calendarEventId, '11', `Estado: 🔴 No-show`);
    } catch {
      /* non-blocking */
    }
  }

  // Record no-show audit event
  try {
    const { recordAuditEvent } = await import('./lib/audit.js');
    await recordAuditEvent(redis, {
      action: 'booking_no_show',
      eventId,
      email: booking.email,
      className: booking.className,
      classDate: booking.classDate,
      success: true,
    });
  } catch {
    /* non-blocking */
  }

  // Auto-reschedule if within limit
  const canReschedule =
    (booking.rescheduleCount || 0) < 1 &&
    !booking.rescheduledFrom &&
    autoRescheduleCount.value < MAX_AUTO_RESCHEDULES_PER_RUN;

  if (canReschedule) {
    try {
      const { rescheduleBooking } = await import('./admin-bookings-reschedule.js');
      const result = await rescheduleBooking(redis, {
        eventId,
        mode: 'next_week',
        notifyStudent: true,
        reason: 'no_show',
      });

      if (result.success) {
        autoRescheduleCount.value++;
        // Re-read booking since rescheduleBooking updated it
        const updatedRaw = await redis.get(`booking_details:${eventId}`);
        if (updatedRaw) {
          const updated = JSON.parse(updatedRaw);
          updated.reconciliationProcessed = true;
          updated.reconciliationTimestamp = new Date().toISOString();
          await redis.setex(
            `booking_details:${eventId}`,
            BOOKING_TTL_SECONDS,
            JSON.stringify(updated)
          );
        }

        return {
          eventId,
          action: 'no_show_rescheduled',
          details: `Rescheduled to ${result.newClassDate} at ${result.newClassTime}`,
        };
      }

      // Reschedule failed (class full, etc.)
      booking.reconciliationStatus = 'no_show_unresolved';
      await redis.setex(`booking_details:${eventId}`, BOOKING_TTL_SECONDS, JSON.stringify(booking));

      // Send branded "could not reschedule" notification
      await sendNoShowFailedNotification(booking);

      return {
        eventId,
        action: 'no_show_unresolved',
        details: result.error || 'Could not auto-reschedule',
      };
    } catch (e) {
      console.error(`[reconciliation] Reschedule error for ${eventId}:`, e);
      booking.reconciliationStatus = 'no_show_unresolved';
      await redis.setex(`booking_details:${eventId}`, BOOKING_TTL_SECONDS, JSON.stringify(booking));

      return {
        eventId,
        action: 'error',
        details: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }

  // No reschedule possible (already rescheduled before, or limit reached)
  // No notification for repeat no-shows — they already received a reschedule notification before
  await redis.setex(`booking_details:${eventId}`, BOOKING_TTL_SECONDS, JSON.stringify(booking));

  return {
    eventId,
    action: 'no_show_notified',
    details: canReschedule ? 'Rate limit reached' : 'Max reschedules reached',
  };
}

function formatDateForDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('es-ES', {
    timeZone: SPAIN_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

async function sendNoShowFailedNotification(booking: BookingDetails): Promise<void> {
  const classDate = formatDateForDisplay(booking.classDate);

  // 1. Branded email explaining reschedule failed
  try {
    const { sendNoShowFailedEmail } = await import('./lib/email.js');
    await sendNoShowFailedEmail({
      to: booking.email,
      firstName: booking.firstName,
      className: booking.className,
      classDate,
      classTime: booking.classTime,
    });
  } catch (e) {
    console.warn(`[reconciliation] No-show failed email error:`, e);
  }

  // 2. WhatsApp (coherent with email — no link to old useless booking)
  try {
    const { sendTextMessage } = await import('./lib/whatsapp.js');
    await sendTextMessage(
      booking.phone,
      `Hola ${booking.firstName} 👋\n\nSentimos que no hayas podido venir a tu clase de ${booking.className}.\n\nHemos intentado reprogramarla, pero no hay disponibilidad la semana que viene.\n\nPuedes reservar otra clase de prueba gratuita aquí:\n🗓️ https://www.farrayscenter.com/es/horarios-precios\n\n¡Te esperamos! 💃`
    );
  } catch {
    // WhatsApp window may have expired, email is the reliable channel
  }
}

// ============================================================================
// HANDLER
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Auth: Vercel Cron sends CRON_SECRET
  const cronSecret = process.env['CRON_SECRET'];
  if (cronSecret) {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const redis = getRedisClient();
  if (!redis) {
    res.status(503).json({ error: 'Redis not available' });
    return;
  }

  const now = new Date();
  const currentHour = getHourInTimezone(now, SPAIN_TIMEZONE);

  // Guard: Only run between 10:00-22:00 Madrid
  if (currentHour < 10 || currentHour >= 22) {
    res.status(200).json({
      status: 'skipped',
      reason: `Outside operating hours (${currentHour}:00, window: 10:00-22:00)`,
    });
    return;
  }

  const todayStr = getDateInTimezone(now, SPAIN_TIMEZONE);

  // Distributed lock (5 min TTL)
  const lockKey = `reconciliation:lock:${todayStr}:${currentHour}`;
  const lockAcquired = await redis.set(lockKey, '1', 'EX', 300, 'NX');
  if (!lockAcquired) {
    res.status(200).json({ status: 'skipped', reason: 'Another instance is running' });
    return;
  }

  try {
    console.log(`[cron-reconciliation] Starting for ${todayStr} at ${currentHour}:00`);

    // Get all bookings for today
    const eventIds = await redis.smembers(`reminders:${todayStr}`);

    if (eventIds.length === 0) {
      console.log('[cron-reconciliation] No bookings found for today');
      res.status(200).json({ status: 'completed', processed: 0, results: [] });
      return;
    }

    const momenceClient = new MomenceApiClient(null);
    const autoRescheduleCount = { value: 0 };
    const results: ReconciliationResult[] = [];

    // Process each booking
    for (const eventId of eventIds) {
      try {
        const raw = await redis.get(`booking_details:${eventId}`);
        if (!raw) continue;

        const booking: BookingDetails = JSON.parse(raw);
        const result = await reconcileBooking(redis, booking, momenceClient, autoRescheduleCount);
        results.push(result);
      } catch (e) {
        console.error(`[cron-reconciliation] Error processing ${eventId}:`, e);
        results.push({
          eventId,
          action: 'error',
          details: e instanceof Error ? e.message : 'Unknown',
        });
      }
    }

    // Store reconciliation stats
    const stats = {
      total_bookings: String(eventIds.length),
      attended: String(results.filter(r => r.action === 'attended').length),
      no_shows: String(results.filter(r => r.action.startsWith('no_show')).length),
      auto_rescheduled: String(results.filter(r => r.action === 'no_show_rescheduled').length),
      skipped: String(results.filter(r => r.action === 'skipped').length),
      errors: String(results.filter(r => r.action === 'error').length),
    };

    await redis.hset(`reconciliation:stats:${todayStr}`, stats);
    await redis.expire(`reconciliation:stats:${todayStr}`, 30 * 24 * 60 * 60); // 30 days

    // Record audit event
    try {
      const { recordAuditEvent } = await import('./lib/audit.js');
      await recordAuditEvent(redis, {
        action: 'reconciliation_completed',
        success: true,
        metadata: {
          date: todayStr,
          ...stats,
        },
      });
    } catch {
      /* non-blocking */
    }

    const summary = {
      status: 'completed',
      date: todayStr,
      processed: results.length,
      stats,
      results: results.filter(r => r.action !== 'skipped'),
    };

    console.log('[cron-reconciliation] Completed:', JSON.stringify(stats));
    res.status(200).json(summary);
  } catch (error) {
    console.error('[cron-reconciliation] Fatal error:', error);
    res.status(500).json({
      error: 'Reconciliation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    // Release lock
    await redis.del(lockKey).catch(() => {});
  }
}
