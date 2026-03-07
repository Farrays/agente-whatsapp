import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from 'ioredis';
import { MomenceApiClient } from './lib/momence-client.js';

/**
 * API Route: /api/admin-bookings
 *
 * Lista reservas de clases de prueba gratuitas para el dashboard admin.
 * Solo procesa booking_details de Redis (exclusivamente clases de prueba).
 *
 * Endpoints:
 * - GET /api/admin-bookings?date=2026-02-19           → Reservas de un día
 * - GET /api/admin-bookings?from=2026-02-17&to=2026-02-23 → Rango de fechas
 *
 * Headers: Authorization: Bearer {ADMIN_BOOKINGS_TOKEN}
 */

const SPAIN_TIMEZONE = 'Europe/Madrid';
const MAX_RANGE_DAYS = 31;

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
  reconciliationStatus?:
    | 'pending'
    | 'attended'
    | 'no_show'
    | 'no_show_unresolved'
    | 'cancelled_on_time'
    | 'cancelled_late'
    | 'rescheduled';
  reconciliationProcessed?: boolean;
  momenceVerified?: boolean;
  momenceBookingId?: number | null;
  sessionId?: string | null;
  rescheduleCount?: number;
  rescheduledFrom?: string | null;
  rescheduledTo?: string | null;
  reconciliationTimestamp?: string | null;
  reminder48hSent?: boolean;
  reminder24hSent?: boolean;
  feedbackSent?: boolean;
}

interface AdminBooking {
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  className: string;
  classDate: string;
  classTime: string;
  classEndTime: string;
  category: string;
  status: 'confirmed' | 'cancelled';
  attendance: 'pending' | 'confirmed' | 'not_attending' | 'attended' | 'no_show';
  reconciliationStatus:
    | 'pending'
    | 'attended'
    | 'no_show'
    | 'no_show_unresolved'
    | 'cancelled_on_time'
    | 'cancelled_late'
    | 'rescheduled';
  momenceBookingId: number | null;
  sessionId: string | null;
  managementUrl: string;
  whatsappUrl: string;
  calendarEventId: string | null;
  bookedAt: string;
  rescheduledTo: string | null;
  rescheduledFrom: string | null;
  rescheduleCount: number;
  // New fields for dashboard indicators
  checkedIn: boolean;
  membershipStatus: 'none' | 'active' | 'unknown';
  membershipName: string | null;
}

interface DaySummary {
  date: string;
  total: number;
  confirmed: number;
  attended: number;
  noShow: number;
  cancelled: number;
  rescheduled: number;
  bookings: AdminBooking[];
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
  // In development, allow without token
  if (!token) return true;

  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;

  const bearerToken = authHeader.replace('Bearer ', '');
  return bearerToken === token;
}

// ============================================================================
// HELPERS
// ============================================================================

function getDateInTimezone(date: Date, timezone: string): string {
  return date.toLocaleDateString('en-CA', { timeZone: timezone });
}

function calculateEndTime(classTime: string): string {
  const [hours, minutes] = classTime.split(':').map(Number);
  const endHours = (hours || 0) + 1;
  return `${String(endHours).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}`;
}

function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const start = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');

  const current = new Date(start);
  while (current <= end && dates.length < MAX_RANGE_DAYS) {
    dates.push(current.toISOString().split('T')[0] as string);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-+()]/g, '');
}

function toAdminBooking(details: BookingDetails, fallbackDate?: string): AdminBooking {
  const phone = normalizePhone(details.phone);
  return {
    eventId: details.eventId,
    firstName: details.firstName,
    lastName: details.lastName,
    email: details.email,
    phone: details.phone,
    className: details.className,
    classDate: (details.classDate || fallbackDate || '').replace(/T.*$/, ''),
    classTime: details.classTime,
    classEndTime: calculateEndTime(details.classTime),
    category: details.category,
    status: details.status || 'confirmed',
    attendance: details.attendance || 'pending',
    reconciliationStatus: details.reconciliationStatus || 'pending',
    momenceBookingId: details.momenceBookingId || null,
    sessionId: details.sessionId || null,
    managementUrl: `/es/mi-reserva?email=${encodeURIComponent(details.email)}&event=${details.eventId}`,
    whatsappUrl: `https://wa.me/${phone.startsWith('34') ? phone : '34' + phone}`,
    calendarEventId: details.calendarEventId || null,
    bookedAt: details.createdAt,
    rescheduledTo: details.rescheduledTo || null,
    rescheduledFrom: details.rescheduledFrom || null,
    rescheduleCount: details.rescheduleCount || 0,
    // Defaults - enriched later by enrichBookingsWithMomenceData()
    checkedIn: false,
    membershipStatus: 'unknown',
    membershipName: null,
  };
}

// ============================================================================
// MOMENCE ENRICHMENT (check-in + membership status)
// ============================================================================

/**
 * Enrich bookings with live Momence data:
 * 1. Check-in status: queries getSessionBookings for each unique sessionId
 * 2. Membership status: queries searchMembers + active memberships for each unique email
 *
 * Both are batched to minimize API calls. Failures are non-blocking (defaults remain).
 */
async function enrichBookingsWithMomenceData(allBookings: AdminBooking[]): Promise<void> {
  let momence: MomenceApiClient;
  try {
    momence = new MomenceApiClient(null);
    // Validate credentials early (also warms up token cache for parallel calls)
    await momence.getAccessToken();
  } catch (e) {
    console.warn(
      '[admin-bookings] Momence unavailable, skipping enrichment:',
      e instanceof Error ? e.message : e
    );
    return;
  }

  // ------------------------------------------------------------------
  // 1. CHECK-IN STATUS: fetch all sessions IN PARALLEL
  // ------------------------------------------------------------------
  const sessionIds = new Set<string>();
  for (const b of allBookings) {
    if (b.sessionId) sessionIds.add(b.sessionId);
  }

  const checkinMap = new Map<
    string,
    { byId: Map<number, boolean>; byEmail: Map<string, boolean> }
  >();

  // Parallel fetch all session bookings
  const sessionResults = await Promise.allSettled(
    [...sessionIds].map(async sid => {
      const resp = await momence.getSessionBookings(parseInt(sid, 10), {
        page: 0,
        pageSize: 200,
        includeCancelled: true,
      });
      const byId = new Map<number, boolean>();
      const byEmail = new Map<string, boolean>();
      for (const booking of resp.payload) {
        byId.set(booking.id, booking.checkedIn || false);
        const raw = booking as unknown as Record<string, unknown>;
        const member = raw['member'] as Record<string, unknown> | undefined;
        const email = (member?.['email'] as string) || '';
        if (email) byEmail.set(email.toLowerCase(), booking.checkedIn || false);
      }
      return { sid, byId, byEmail };
    })
  );

  for (const result of sessionResults) {
    if (result.status === 'fulfilled') {
      checkinMap.set(result.value.sid, {
        byId: result.value.byId,
        byEmail: result.value.byEmail,
      });
    }
  }

  // Apply check-in data
  for (const b of allBookings) {
    if (b.sessionId) {
      const sessionData = checkinMap.get(b.sessionId);
      if (sessionData) {
        if (b.momenceBookingId) {
          b.checkedIn = sessionData.byId.get(b.momenceBookingId) ?? false;
        } else if (b.email) {
          b.checkedIn = sessionData.byEmail.get(b.email.toLowerCase()) ?? false;
        }
      }
    }
    if (b.reconciliationStatus === 'attended') {
      b.checkedIn = true;
    }
  }

  // ------------------------------------------------------------------
  // 2. MEMBERSHIP + CHECK-IN FALLBACK: fetch all emails IN PARALLEL
  // ------------------------------------------------------------------
  const uniqueEmails = new Set<string>();
  for (const b of allBookings) {
    if (b.email) uniqueEmails.add(b.email.toLowerCase());
  }

  const needsCheckinByEmail = new Set<string>();
  for (const b of allBookings) {
    if (!b.sessionId && !b.checkedIn && b.email) {
      needsCheckinByEmail.add(b.email.toLowerCase());
    }
  }

  const membershipMap = new Map<string, { status: 'none' | 'active'; name: string | null }>();
  const emailCheckinMap = new Map<string, Map<string, boolean>>();

  // Process all emails in parallel (each email: search → membership + optionally check-in)
  const emailResults = await Promise.allSettled(
    [...uniqueEmails].map(async email => {
      const searchResult = await momence.searchMembers({
        page: 0,
        pageSize: 5,
        query: email,
      });

      const member = searchResult.payload.find(m => m.email?.toLowerCase() === email);
      if (!member) {
        return { email, membership: { status: 'none' as const, name: null }, checkinDates: null };
      }

      // Fetch membership + check-in in parallel
      const [membershipsResult, checkinResult] = await Promise.allSettled([
        momence.getMemberBoughtMemberships(member.id, { page: 0, pageSize: 10 }),
        needsCheckinByEmail.has(email)
          ? momence.getMemberSessionBookings(member.id, { page: 0, pageSize: 30 })
          : Promise.resolve(null),
      ]);

      // Process membership
      let membership: { status: 'none' | 'active'; name: string | null } = {
        status: 'none',
        name: null,
      };
      if (membershipsResult.status === 'fulfilled') {
        const active = membershipsResult.value.payload.filter(m => !m.isFrozen);
        if (active.length > 0) {
          membership = { status: 'active', name: active[0]?.membership?.name || null };
        }
      }

      // Process check-in dates
      let checkinDates: Map<string, boolean> | null = null;
      if (
        checkinResult.status === 'fulfilled' &&
        checkinResult.value &&
        'payload' in checkinResult.value
      ) {
        checkinDates = new Map<string, boolean>();
        for (const mb of checkinResult.value.payload) {
          if (mb.session?.startsAt) {
            const dateStr = mb.session.startsAt.split('T')[0] || '';
            if (mb.checkedIn) checkinDates.set(dateStr, true);
            else if (!checkinDates.has(dateStr)) checkinDates.set(dateStr, false);
          }
        }
      }

      return { email, membership, checkinDates };
    })
  );

  for (const result of emailResults) {
    if (result.status === 'fulfilled') {
      const { email, membership, checkinDates } = result.value;
      membershipMap.set(email, membership);
      if (checkinDates) emailCheckinMap.set(email, checkinDates);
    }
  }

  // Apply membership data + check-in fallback
  for (const b of allBookings) {
    const emailKey = b.email?.toLowerCase();
    const info = emailKey ? membershipMap.get(emailKey) : undefined;
    if (info) {
      b.membershipStatus = info.status;
      b.membershipName = info.name;
    }
    if (!b.checkedIn && !b.sessionId && emailKey) {
      const dateMap = emailCheckinMap.get(emailKey);
      if (dateMap && b.classDate) {
        const dateOnly = b.classDate.split('T')[0] || b.classDate;
        b.checkedIn = dateMap.get(dateOnly) ?? false;
      }
    }
  }

  console.log(
    `[admin-bookings] Enriched ${allBookings.length} bookings: ` +
      `${sessionIds.size} sessions, ${uniqueEmails.size} emails (parallel)`
  );
}

// ============================================================================
// HANDLER
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Set CORS headers for ALL responses (including preflight)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Auth check
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
    const { date, from, to, search } = req.query;
    const searchQuery =
      typeof search === 'string' && search.trim().length >= 2 ? search.trim().toLowerCase() : '';

    // Determine date range (ignored when searching)
    let dates: string[];
    if (searchQuery) {
      // Search mode: no date filter, fetch ALL bookings
      dates = [];
    } else if (date && typeof date === 'string') {
      dates = [date];
    } else if (from && to && typeof from === 'string' && typeof to === 'string') {
      dates = getDatesInRange(from, to);
      if (dates.length === 0) {
        res.status(400).json({ error: 'Invalid date range' });
        return;
      }
    } else {
      // Default to today
      const today = getDateInTimezone(new Date(), SPAIN_TIMEZONE);
      dates = [today];
    }

    const dateSet = new Set(dates);

    // =========================================================================
    // COLLECT ALL BOOKING IDs — global index + reminders sets (hybrid)
    // =========================================================================

    // 1. Try global index first (reliable, contains ALL trial booking IDs)
    let allEventIds = await redis.smembers('all_trial_booking_ids');

    // 2. If global index is empty, bootstrap from SCAN (one-time for old data)
    if (allEventIds.length === 0) {
      console.log('[admin-bookings] Global index empty, bootstrapping from SCAN...');
      const scannedIds: string[] = [];
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          'MATCH',
          'booking_details:*',
          'COUNT',
          200
        );
        cursor = nextCursor;
        for (const key of keys) {
          const id = key.replace('booking_details:', '');
          if (id) scannedIds.push(id);
        }
      } while (cursor !== '0');

      if (scannedIds.length > 0) {
        // Populate the global index for future requests
        await redis.sadd('all_trial_booking_ids', ...scannedIds);
        allEventIds = scannedIds;
        console.log(
          `[admin-bookings] Bootstrapped ${scannedIds.length} booking IDs into global index`
        );
      }
    }

    // 3. Also merge IDs from reminders sets for the requested dates (belt & suspenders)
    const reminderEventIds = new Set<string>();
    for (const dateStr of dates) {
      const ids = await redis.smembers(`reminders:${dateStr}`);
      for (const id of ids) reminderEventIds.add(id);
    }

    // Merge: global + reminders (deduplicate)
    const combinedIds = new Set([...allEventIds, ...reminderEventIds]);

    // =========================================================================
    // FETCH ALL BOOKING DETAILS IN BATCH
    // =========================================================================

    const bookingsByDate = new Map<string, AdminBooking[]>();
    for (const d of dates) bookingsByDate.set(d, []);

    if (combinedIds.size > 0) {
      const idArray = [...combinedIds];
      // Batch fetch in chunks of 200 to avoid huge pipelines
      const CHUNK_SIZE = 200;
      for (let i = 0; i < idArray.length; i += CHUNK_SIZE) {
        const chunk = idArray.slice(i, i + CHUNK_SIZE);
        const pipeline = redis.pipeline();
        for (const eventId of chunk) {
          pipeline.get(`booking_details:${eventId}`);
        }
        const results = await pipeline.exec();

        if (!results) continue;

        for (let j = 0; j < results.length; j++) {
          const [err, result] = results[j] as [Error | null, string | null];
          if (err || !result) continue;

          try {
            const details: BookingDetails = JSON.parse(result);

            // Only process trial bookings
            if (details.bookingType && details.bookingType !== 'trial') continue;

            // NOTE: rescheduled bookings are now included (not skipped)
            // so the frontend can show them with a visual indicator

            // Extract the ISO date from classDate (handles both "2026-03-05" and "2026-03-05T18:00:00Z")
            const isoMatch = (details.classDate || '').match(/\d{4}-\d{2}-\d{2}/);
            const bookingDate = isoMatch ? isoMatch[0] : '';

            if (searchQuery) {
              // Search mode: skip date filter, match by name/email/phone
              if (!bookingDate) continue;
              const fullName = `${details.firstName} ${details.lastName}`.toLowerCase();
              const matches =
                fullName.includes(searchQuery) ||
                details.email.toLowerCase().includes(searchQuery) ||
                normalizePhone(details.phone).includes(searchQuery) ||
                details.phone.includes(searchQuery);
              if (!matches) continue;

              const booking = toAdminBooking(details, bookingDate);
              let dayList = bookingsByDate.get(bookingDate);
              if (!dayList) {
                dayList = [];
                bookingsByDate.set(bookingDate, dayList);
              }
              dayList.push(booking);
            } else {
              // Normal mode: only include bookings whose date falls in the requested range
              if (!bookingDate || !dateSet.has(bookingDate)) continue;

              const booking = toAdminBooking(details, bookingDate);
              const dayBookings = bookingsByDate.get(bookingDate);
              if (dayBookings) {
                dayBookings.push(booking);
              }

              // Self-heal: ensure this booking is in the reminders set
              if (!reminderEventIds.has(details.eventId)) {
                redis.sadd(`reminders:${bookingDate}`, details.eventId).catch(() => {});
              }
            }
          } catch {
            // Skip malformed entries
          }
        }
      }
    }

    // =========================================================================
    // ENRICH WITH MOMENCE DATA (check-in + membership)
    // =========================================================================

    const allBookingsFlat: AdminBooking[] = [];
    for (const dayBookings of bookingsByDate.values()) {
      allBookingsFlat.push(...dayBookings);
    }

    if (allBookingsFlat.length > 0) {
      try {
        await enrichBookingsWithMomenceData(allBookingsFlat);
      } catch (e) {
        console.warn(
          '[admin-bookings] Enrichment failed (non-blocking):',
          e instanceof Error ? e.message : e
        );
      }
    }

    // =========================================================================
    // BUILD RESPONSE
    // =========================================================================

    const days: DaySummary[] = [];
    let totalBookings = 0;
    let totalAttended = 0;
    let totalNoShow = 0;
    let totalCancelled = 0;
    let totalRescheduled = 0;

    // In search mode, iterate all dates found; otherwise use requested dates
    const responseDates = searchQuery ? [...bookingsByDate.keys()].sort() : dates;

    for (const dateStr of responseDates) {
      const bookings = bookingsByDate.get(dateStr) || [];

      // Sort by class time
      bookings.sort((a, b) => a.classTime.localeCompare(b.classTime));

      let dayConfirmed = 0;
      let dayAttended = 0;
      let dayNoShow = 0;
      let dayCancelled = 0;
      let dayRescheduled = 0;

      for (const booking of bookings) {
        const reconStatus = booking.reconciliationStatus;
        // Count as attended if reconciliation says so OR Momence check-in confirmed
        if (reconStatus === 'attended' || booking.checkedIn) dayAttended++;
        else if (reconStatus === 'no_show' || reconStatus === 'no_show_unresolved') dayNoShow++;
        else if (reconStatus === 'cancelled_on_time' || reconStatus === 'cancelled_late')
          dayCancelled++;
        else if (reconStatus === 'rescheduled') dayRescheduled++;
        else if (booking.status === 'cancelled') dayCancelled++;
        else dayConfirmed++;
      }

      days.push({
        date: dateStr,
        total: bookings.length,
        confirmed: dayConfirmed,
        attended: dayAttended,
        noShow: dayNoShow,
        cancelled: dayCancelled,
        rescheduled: dayRescheduled,
        bookings,
      });

      totalBookings += bookings.length;
      totalAttended += dayAttended;
      totalNoShow += dayNoShow;
      totalCancelled += dayCancelled;
      totalRescheduled += dayRescheduled;
    }

    const attendanceRate =
      totalBookings > 0 ? Math.round((totalAttended / (totalBookings - totalCancelled)) * 100) : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalBookings,
        totalAttended,
        totalNoShow,
        totalCancelled,
        totalRescheduled,
        attendanceRate: isNaN(attendanceRate) || !isFinite(attendanceRate) ? 0 : attendanceRate,
        dateRange: { from: responseDates[0], to: responseDates[responseDates.length - 1] },
      },
      days,
    });
  } catch (error) {
    console.error('[admin-bookings] Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
