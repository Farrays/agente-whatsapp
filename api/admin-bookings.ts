import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from 'ioredis';

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

function toAdminBooking(details: BookingDetails): AdminBooking {
  const phone = normalizePhone(details.phone);
  return {
    eventId: details.eventId,
    firstName: details.firstName,
    lastName: details.lastName,
    email: details.email,
    phone: details.phone,
    className: details.className,
    classDate: details.classDate,
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
  };
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
    const { date, from, to } = req.query;

    // Determine date range
    let dates: string[];
    if (date && typeof date === 'string') {
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

    // Fetch bookings for each date
    const days: DaySummary[] = [];
    let totalBookings = 0;
    let totalAttended = 0;
    let totalNoShow = 0;
    let totalCancelled = 0;
    let totalRescheduled = 0;

    for (const dateStr of dates) {
      const eventIds = await redis.smembers(`reminders:${dateStr}`);

      if (eventIds.length === 0) {
        days.push({
          date: dateStr,
          total: 0,
          confirmed: 0,
          attended: 0,
          noShow: 0,
          cancelled: 0,
          rescheduled: 0,
          bookings: [],
        });
        continue;
      }

      // Fetch all booking details in parallel
      const pipeline = redis.pipeline();
      for (const eventId of eventIds) {
        pipeline.get(`booking_details:${eventId}`);
      }
      const results = await pipeline.exec();

      const bookings: AdminBooking[] = [];
      let dayConfirmed = 0;
      let dayAttended = 0;
      let dayNoShow = 0;
      let dayCancelled = 0;
      let dayRescheduled = 0;

      if (results) {
        for (const [err, result] of results) {
          if (err || !result) continue;

          try {
            const details: BookingDetails = JSON.parse(result as string);

            // CRITICAL: Only process trial bookings
            // All bookings from our widget are trials, but filter explicitly for safety
            if (details.bookingType && details.bookingType !== 'trial') continue;

            const booking = toAdminBooking(details);
            bookings.push(booking);

            // Count by status
            const reconStatus = booking.reconciliationStatus;
            if (reconStatus === 'attended') dayAttended++;
            else if (reconStatus === 'no_show' || reconStatus === 'no_show_unresolved') dayNoShow++;
            else if (reconStatus === 'cancelled_on_time' || reconStatus === 'cancelled_late')
              dayCancelled++;
            else if (reconStatus === 'rescheduled') dayRescheduled++;
            else if (booking.status === 'cancelled') dayCancelled++;
            else dayConfirmed++;
          } catch {
            // Skip malformed entries
          }
        }
      }

      // Sort by class time
      bookings.sort((a, b) => a.classTime.localeCompare(b.classTime));

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
        dateRange: { from: dates[0], to: dates[dates.length - 1] },
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
