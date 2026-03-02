import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from 'ioredis';
import { MomenceApiClient } from './lib/momence-client.js';

/**
 * API Route: /api/admin-bookings-reschedule
 *
 * Reprograma una reserva de clase de prueba gratuita.
 * Cancela en Momence → busca misma clase semana siguiente → crea nueva reserva.
 *
 * POST /api/admin-bookings-reschedule
 * Body: { eventId, mode, targetSessionId?, notifyStudent?, reason }
 *
 * Headers: Authorization: Bearer {ADMIN_BOOKINGS_TOKEN}
 *
 * Also exported: rescheduleBooking() for reuse in cron-reconciliation and Laura tools.
 */

const SPAIN_TIMEZONE = 'Europe/Madrid';
const BOOKING_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

// ============================================================================
// TYPES
// ============================================================================

export interface BookingDetails {
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
  momenceVerified?: boolean;
  momenceBookingId?: number | null;
  sessionId?: string | null;
  rescheduleCount?: number;
  rescheduledFrom?: string | null;
  rescheduledTo?: string | null;
}

export interface RescheduleRequest {
  eventId: string;
  mode: 'next_week' | 'specific_session';
  targetSessionId?: number;
  notifyStudent?: boolean;
  reason: 'no_show' | 'manual' | 'class_cancelled';
}

export interface RescheduleResult {
  success: boolean;
  error?: string;
  newEventId?: string;
  newClassName?: string;
  newClassDate?: string;
  newClassTime?: string;
  newSessionId?: number;
  notificationsSent?: {
    email: boolean;
    whatsapp: boolean;
  };
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
// AUTH
// ============================================================================

function validateAuth(req: VercelRequest): boolean {
  const token = process.env['ADMIN_BOOKINGS_TOKEN'];
  if (!token) return true;

  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;

  return authHeader.replace('Bearer ', '') === token;
}

// ============================================================================
// CORE RESCHEDULE LOGIC (exported for reuse)
// ============================================================================

/**
 * Reschedule a trial booking to next week (same class, same time).
 * Used by: API endpoint, cron-reconciliation, Laura manage_trial_booking tool.
 */
export async function rescheduleBooking(
  redis: Redis,
  request: RescheduleRequest
): Promise<RescheduleResult> {
  const { eventId, mode, targetSessionId, notifyStudent = true, reason } = request;

  // 1. Read original booking
  const raw = await redis.get(`booking_details:${eventId}`);
  if (!raw) {
    return { success: false, error: 'Booking not found' };
  }

  const booking: BookingDetails = JSON.parse(raw);

  // Safety: only trial bookings
  if (booking.bookingType && booking.bookingType !== 'trial') {
    return { success: false, error: 'Only trial bookings can be rescheduled' };
  }

  // Check reschedule limit (max 1)
  if ((booking.rescheduleCount || 0) >= 1 || booking.rescheduledFrom) {
    return { success: false, error: 'This booking has already been rescheduled (max 1 allowed)' };
  }

  const client = new MomenceApiClient(null);

  // 2. Find the target session (next week same class)
  let nextSessionId: number | undefined;
  let nextSessionName: string | undefined;
  let nextSessionDate: string | undefined;
  let nextSessionTime: string | undefined;

  if (mode === 'specific_session' && targetSessionId) {
    // Use specified session
    try {
      const session = await client.getSession(targetSessionId);
      nextSessionId = targetSessionId;
      nextSessionName = (session as { name?: string }).name || booking.className;
      const startsAt = (session as { startsAt?: string }).startsAt;
      if (startsAt) {
        const dt = new Date(startsAt);
        nextSessionDate = dt.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: SPAIN_TIMEZONE,
        });
        nextSessionTime = dt.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: SPAIN_TIMEZONE,
        });
      }
    } catch (e) {
      return {
        success: false,
        error: `Target session not found: ${e instanceof Error ? e.message : 'Unknown'}`,
      };
    }
  } else {
    // ================================================================
    // Find SAME class next week: same name, same day, same time
    // ================================================================

    // Validate classDate format
    if (!booking.classDate || !/^\d{4}-\d{2}-\d{2}$/.test(booking.classDate)) {
      return {
        success: false,
        error: `Invalid original class date: "${booking.classDate}". Cannot calculate next week.`,
      };
    }

    // Target date = original classDate + 7 days (same day of the week)
    const targetDate = new Date(booking.classDate + 'T12:00:00Z'); // noon UTC to avoid DST edge cases
    targetDate.setDate(targetDate.getDate() + 7);
    const targetDateStr = targetDate.toISOString().split('T')[0] || ''; // "YYYY-MM-DD"

    // Search window: target date ± 1 day (covers timezone edge cases)
    const searchStart = new Date(targetDate);
    searchStart.setDate(searchStart.getDate() - 1);
    const searchEnd = new Date(targetDate);
    searchEnd.setDate(searchEnd.getDate() + 2); // +2 because startBefore is exclusive

    // Original time in minutes from midnight (for comparison)
    const [origHour, origMin] = (booking.classTime || '00:00').split(':').map(Number);
    const originalTimeMinutes = (origHour || 0) * 60 + (origMin || 0);

    console.log(
      `[reschedule] Looking for "${booking.className}" on ${targetDateStr} at ${booking.classTime}` +
        ` (search window: ${searchStart.toISOString().split('T')[0]} to ${searchEnd.toISOString().split('T')[0]})`
    );

    try {
      const sessions = await client.getSessions({
        page: 1,
        pageSize: 50,
        startAfter: searchStart.toISOString(),
        startBefore: searchEnd.toISOString(),
        sortBy: 'startsAt',
        sortOrder: 'ASC',
      });

      // Exact name match target (case-insensitive, trimmed)
      const targetClassName = booking.className.toLowerCase().trim();

      // Score all matching sessions
      const scoredMatches: Array<{
        session: Record<string, unknown>;
        dayMatch: boolean;
        timeDiffMinutes: number;
      }> = [];

      for (const s of sessions.payload) {
        const sessionName = ((s as { name?: string }).name || '').toLowerCase().trim();
        const startsAt = (s as { startsAt?: string }).startsAt;
        if (!startsAt) continue;

        // EXACT name match only (no substring)
        if (sessionName !== targetClassName) continue;

        // Check day: must be on target date (in Madrid timezone)
        const sessionDt = new Date(startsAt);
        const sessionDateStr = sessionDt.toLocaleDateString('en-CA', {
          timeZone: SPAIN_TIMEZONE,
        }); // "YYYY-MM-DD" in Madrid time
        const dayMatch = sessionDateStr === targetDateStr;

        // Calculate time difference in minutes (Madrid timezone)
        const sessionTimeStr = sessionDt.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          timeZone: SPAIN_TIMEZONE,
        });
        const [sessHour, sessMin] = sessionTimeStr.split(':').map(Number);
        const sessionTimeMinutes = (sessHour || 0) * 60 + (sessMin || 0);
        const timeDiffMinutes = Math.abs(sessionTimeMinutes - originalTimeMinutes);

        scoredMatches.push({ session: s as Record<string, unknown>, dayMatch, timeDiffMinutes });
      }

      // Prioritized matching:
      // Priority 1: Same day + close time (±30 min)
      // Priority 2: Same day + any time
      let match: Record<string, unknown> | undefined;

      const sameDayCloseTime = scoredMatches
        .filter(m => m.dayMatch && m.timeDiffMinutes <= 30)
        .sort((a, b) => a.timeDiffMinutes - b.timeDiffMinutes);

      if (sameDayCloseTime.length > 0) {
        const bestMatch = sameDayCloseTime[0];
        match = bestMatch?.session;
        console.log(
          `[reschedule] ✅ Exact match: same name + same day + time diff ${bestMatch?.timeDiffMinutes ?? 0}min`
        );
      }

      if (!match) {
        const sameDayAnyTime = scoredMatches
          .filter(m => m.dayMatch)
          .sort((a, b) => a.timeDiffMinutes - b.timeDiffMinutes);

        if (sameDayAnyTime.length > 0) {
          const fallbackMatch = sameDayAnyTime[0];
          match = fallbackMatch?.session;
          console.log(
            `[reschedule] ⚠️ Fallback match: same name + same day but different time (${fallbackMatch?.timeDiffMinutes ?? 0}min diff)`
          );
        }
      }

      if (!match) {
        // Helpful error: show if class exists on other days
        const otherDates = scoredMatches.map(m => {
          const sa = (m.session as { startsAt?: string }).startsAt || '';
          return sa ? new Date(sa).toLocaleDateString('en-CA', { timeZone: SPAIN_TIMEZONE }) : '?';
        });
        const datesInfo =
          otherDates.length > 0
            ? ` Found "${booking.className}" on: ${[...new Set(otherDates)].join(', ')}.`
            : '';

        return {
          success: false,
          error:
            `No matching class "${booking.className}" found for ${targetDateStr}` +
            ` (expected same day next week at ${booking.classTime}).${datesInfo}`,
        };
      }

      nextSessionId = (match as { id?: number }).id;
      nextSessionName = (match as { name?: string }).name || booking.className;

      const startsAt = (match as { startsAt?: string }).startsAt;
      if (startsAt) {
        const dt = new Date(startsAt);
        nextSessionDate = dt.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: SPAIN_TIMEZONE,
        });
        nextSessionTime = dt.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: SPAIN_TIMEZONE,
        });
      }
    } catch (e) {
      return {
        success: false,
        error: `Failed to search sessions: ${e instanceof Error ? e.message : 'Unknown'}`,
      };
    }
  }

  if (!nextSessionId) {
    return { success: false, error: 'Could not find a valid session to reschedule to' };
  }

  // 3. Cancel original booking in Momence (if it exists there)
  if (booking.momenceBookingId) {
    try {
      await client.cancelBooking(booking.momenceBookingId, {
        refund: false,
        disableNotifications: true,
        isLateCancellation: reason === 'no_show',
      });
      console.log(`[reschedule] Cancelled Momence booking ${booking.momenceBookingId}`);
    } catch (e) {
      // Don't fail the whole operation if Momence cancel fails
      console.warn(
        `[reschedule] Failed to cancel Momence booking: ${e instanceof Error ? e.message : e}`
      );
    }
  }

  // 4. Find or create member in Momence for new booking
  let memberId: number | undefined;
  try {
    const members = await client.searchMembers({
      page: 1,
      pageSize: 1,
      filter: { email: booking.email },
    });

    if (members.payload.length > 0 && members.payload[0]) {
      memberId = members.payload[0].id;
    } else {
      const created = await client.createMember({
        email: booking.email,
        firstName: booking.firstName,
        lastName: booking.lastName,
        phoneNumber: booking.phone,
      });
      memberId = created.memberId;
    }
  } catch (e) {
    console.warn(`[reschedule] Member lookup/create failed: ${e instanceof Error ? e.message : e}`);
    // Continue without Momence booking - we'll still create the Redis booking
  }

  // 5. Create new booking in Momence
  let newMomenceBookingId: number | undefined;
  if (memberId && nextSessionId) {
    try {
      const result = await client.createFreeBooking(nextSessionId, memberId);
      newMomenceBookingId =
        (result as { sessionBookingId?: number; id?: number }).sessionBookingId ||
        (result as { id?: number }).id;
      console.log(`[reschedule] Created new Momence booking: ${newMomenceBookingId}`);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      if (errorMsg.includes('full') || errorMsg.includes('capacity')) {
        return { success: false, error: 'Target class is full. Cannot reschedule automatically.' };
      }
      console.warn(`[reschedule] Momence booking creation failed: ${errorMsg}`);
      // Continue - we'll still create the Redis booking
    }
  }

  // 6. Delete old deduplication key
  try {
    const normalizedEmail = booking.email.toLowerCase().trim();
    await redis.del(`booking:${normalizedEmail}`);
    console.log(`[reschedule] Cleared dedup for ${normalizedEmail}`);
  } catch (e) {
    console.warn(`[reschedule] Failed to clear dedup: ${e}`);
  }

  // 7. Generate new event ID and save new booking to Redis
  const newEventId = `evt_${Date.now()}_rsch_${Math.random().toString(36).substring(2, 10)}`;
  const newCalendarDateStr = nextSessionDate
    ? (() => {
        // Parse the ISO date from the session for reminders key
        const nextWeekDate = new Date();
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
        // Find the exact date from session - approximate with +7 days
        const originalDate = booking.classDate;
        if (originalDate && /^\d{4}-\d{2}-\d{2}$/.test(originalDate)) {
          const d = new Date(originalDate + 'T00:00:00');
          d.setDate(d.getDate() + 7);
          return d.toISOString().split('T')[0];
        }
        return nextWeekDate.toISOString().split('T')[0];
      })()
    : null;

  const newBookingDetails = {
    eventId: newEventId,
    bookingType: 'trial' as const,
    firstName: booking.firstName,
    lastName: booking.lastName,
    email: booking.email,
    phone: booking.phone,
    className: nextSessionName || booking.className,
    classDate: newCalendarDateStr || '',
    classTime: nextSessionTime || booking.classTime,
    category: booking.category,
    calendarEventId: null as string | null,
    createdAt: new Date().toISOString(),
    status: 'confirmed' as const,
    attendance: 'pending' as const,
    reconciliationStatus: 'pending' as const,
    reconciliationProcessed: false,
    rescheduleCount: 0,
    rescheduledFrom: eventId,
    rescheduledTo: null,
    momenceVerified: !!newMomenceBookingId,
    momenceBookingId: newMomenceBookingId || null,
    sessionId: nextSessionId ? String(nextSessionId) : null,
  };

  await redis.setex(
    `booking_details:${newEventId}`,
    BOOKING_TTL_SECONDS,
    JSON.stringify(newBookingDetails)
  );

  // Add to reminders for new date
  if (newCalendarDateStr) {
    await redis.sadd(`reminders:${newCalendarDateStr}`, newEventId);
  }

  // Remove old eventId from old date's reminders set
  if (booking.classDate && /^\d{4}-\d{2}-\d{2}$/.test(booking.classDate)) {
    try {
      await redis.srem(`reminders:${booking.classDate}`, eventId);
      console.log(`[reschedule] Removed old eventId from reminders:${booking.classDate}`);
    } catch (e) {
      console.warn(`[reschedule] Failed to remove old eventId from reminders:`, e);
    }
  }

  // Add phone index for new booking
  const normalizedPhone = booking.phone.replace(/[\s\-+()]/g, '');
  if (normalizedPhone) {
    await redis.setex(`phone:${normalizedPhone}`, BOOKING_TTL_SECONDS, newEventId);
  }

  // Set new dedup key
  const normalizedEmail = booking.email.toLowerCase().trim();
  await redis.setex(
    `booking:${normalizedEmail}`,
    BOOKING_TTL_SECONDS,
    JSON.stringify({
      timestamp: Date.now(),
      sessionId: nextSessionId,
      className: nextSessionName || booking.className,
      eventId: newEventId,
    })
  );

  // 8. Update original booking in Redis
  booking.rescheduledTo = newEventId;
  booking.reconciliationStatus = 'rescheduled';
  booking.rescheduleCount = (booking.rescheduleCount || 0) + 1;
  await redis.setex(`booking_details:${eventId}`, BOOKING_TTL_SECONDS, JSON.stringify(booking));

  // 9. Update Google Calendar events
  try {
    const calendarToken = await getCalendarAccessToken();
    if (calendarToken) {
      const calendarId = getCalendarId();

      // Update original event: red color + rescheduled note
      if (booking.calendarEventId) {
        await fetch(
          `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${booking.calendarEventId}?sendUpdates=none`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${calendarToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              colorId: '11', // Red
              description: `Estado: 🔴 No-show - Reprogramado\n\n➡️ Nueva reserva: ${newEventId}\n📅 ${nextSessionDate || 'próxima semana'}\n🕐 ${nextSessionTime || booking.classTime}`,
            }),
          }
        );
      }

      // Create new calendar event
      const newEvent = {
        summary: `${booking.firstName} ${booking.lastName} - ${nextSessionName || booking.className}`,
        description: [
          `━━━━━━━━━━ CONTACTO ━━━━━━━━━━`,
          `📧 ${booking.email}`,
          `📱 ${booking.phone}`,
          `💬 https://wa.me/${normalizedPhone.startsWith('34') ? normalizedPhone : '34' + normalizedPhone}`,
          ``,
          `━━━━━━━━━━ GESTIÓN ━━━━━━━━━━`,
          `📋 https://www.farrayscenter.com/es/mi-reserva?email=${encodeURIComponent(booking.email)}&event=${newEventId}`,
          ``,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `🎭 ${booking.category}`,
          `🆔 ${newEventId}`,
          `🔄 Reprogramado desde: ${eventId}`,
          ``,
          `Estado: ⚪ Pendiente - Reprogramado automáticamente`,
          ``,
          `Reservado vía: reprogramación automática`,
        ].join('\n'),
        location: "Farray's International Dance Center, C/ Entença 100, Local 1, 08015 Barcelona",
        start: {
          dateTime:
            newCalendarDateStr && nextSessionTime
              ? `${newCalendarDateStr}T${nextSessionTime}:00`
              : new Date().toISOString(),
          timeZone: SPAIN_TIMEZONE,
        },
        end: {
          dateTime:
            newCalendarDateStr && nextSessionTime
              ? (() => {
                  const [h, m] = nextSessionTime.split(':').map(Number);
                  return `${newCalendarDateStr}T${String((h || 0) + 1).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`;
                })()
              : new Date(Date.now() + 3600000).toISOString(),
          timeZone: SPAIN_TIMEZONE,
        },
        colorId: '8', // Graphite (pending)
        extendedProperties: {
          private: {
            bookingEventId: newEventId,
            email: booking.email,
            phone: booking.phone,
            category: booking.category,
            rescheduledFrom: eventId,
          },
        },
        reminders: { useDefault: false },
      };

      const calendarResponse = await fetch(
        `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=none`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${calendarToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent),
        }
      );

      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json();
        // Update new booking with calendar event ID
        newBookingDetails.calendarEventId = calendarData.id;
        await redis.setex(
          `booking_details:${newEventId}`,
          BOOKING_TTL_SECONDS,
          JSON.stringify(newBookingDetails)
        );
      }
    }
  } catch (e) {
    console.warn(`[reschedule] Calendar update failed: ${e}`);
  }

  // 10. Send notifications
  const notificationResults = { email: false, whatsapp: false, adminEmail: false };
  const managementUrl = `https://www.farrayscenter.com/es/mi-reserva?email=${encodeURIComponent(booking.email)}&event=${newEventId}`;

  // 10a. Email to student — ALWAYS sent (even when Laura handles WhatsApp)
  try {
    const { sendNoShowRescheduleEmail } = await import('./lib/email.js');
    const emailResult = await sendNoShowRescheduleEmail({
      to: booking.email,
      firstName: booking.firstName,
      originalClassName: booking.className,
      originalDate: booking.classDate,
      originalTime: booking.classTime,
      newClassName: nextSessionName || booking.className,
      newDate: nextSessionDate || newCalendarDateStr || '',
      newTime: nextSessionTime || booking.classTime,
      managementUrl,
      reason,
    });
    notificationResults.email = emailResult.success;
    console.log(`[reschedule] Student email: ${emailResult.success ? '✅' : '❌'}`);
  } catch (e) {
    console.warn(`[reschedule] Student email failed: ${e}`);
  }

  // 10b. Admin notification — ALWAYS sent
  try {
    const { sendAdminBookingNotification } = await import('./lib/email.js');
    const adminResult = await sendAdminBookingNotification({
      firstName: booking.firstName,
      lastName: booking.lastName || '',
      email: booking.email,
      phone: booking.phone,
      className: nextSessionName || booking.className,
      classDate: nextSessionDate || newCalendarDateStr || '',
      classTime: nextSessionTime || booking.classTime,
      category: booking.category || '',
      sourceUrl: `Reprogramación ${reason === 'no_show' ? '(no-show automática)' : '(manual vía WhatsApp)'}`,
    });
    notificationResults.adminEmail = adminResult.success;
    console.log(`[reschedule] Admin email: ${adminResult.success ? '✅' : '❌'}`);
  } catch (e) {
    console.warn(`[reschedule] Admin email failed: ${e}`);
  }

  // 10c. WhatsApp to student — only if notifyStudent (Laura handles it otherwise)
  if (notifyStudent) {
    try {
      const { sendNoShowRescheduleWhatsApp } = await import('./lib/whatsapp.js');
      const waResult = await sendNoShowRescheduleWhatsApp({
        to: booking.phone,
        firstName: booking.firstName,
        className: nextSessionName || booking.className,
        newDate: nextSessionDate || newCalendarDateStr || '',
        newTime: nextSessionTime || booking.classTime,
        managementUrl,
      });
      notificationResults.whatsapp = waResult.success;
    } catch (e) {
      console.warn(`[reschedule] WhatsApp failed: ${e}`);
    }
  }

  // 11. Record audit event
  try {
    const { recordAuditEvent } = await import('./lib/audit.js');
    await recordAuditEvent(redis, {
      action: reason === 'no_show' ? 'booking_auto_rescheduled' : 'booking_manual_rescheduled',
      channel: 'momence_api',
      eventId: newEventId,
      email: booking.email,
      className: nextSessionName || booking.className,
      classDate: newCalendarDateStr || '',
      success: true,
      metadata: {
        type: 'reschedule',
        reason,
        originalEventId: eventId,
        newEventId,
        newSessionId: nextSessionId,
        momenceBookingCancelled: !!booking.momenceBookingId,
        momenceBookingCreated: !!newMomenceBookingId,
      },
    });
  } catch (e) {
    console.warn(`[reschedule] Audit log failed: ${e}`);
  }

  return {
    success: true,
    newEventId,
    newClassName: nextSessionName || booking.className,
    newClassDate: nextSessionDate || newCalendarDateStr || '',
    newClassTime: nextSessionTime || booking.classTime,
    newSessionId: nextSessionId,
    notificationsSent: notificationResults,
  };
}

// ============================================================================
// HANDLER
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Set CORS headers for ALL responses (including preflight)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!validateAuth(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    res.status(503).json({ error: 'Redis not available' });
    return;
  }

  try {
    const { eventId, mode, targetSessionId, notifyStudent, reason } = req.body || {};

    if (!eventId || !reason) {
      res.status(400).json({ error: 'Missing required fields: eventId, reason' });
      return;
    }

    const result = await rescheduleBooking(redis, {
      eventId,
      mode: mode || 'next_week',
      targetSessionId,
      notifyStudent: notifyStudent !== false,
      reason,
    });

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('[admin-bookings-reschedule] Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
