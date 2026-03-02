/* global Buffer */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Redis from 'ioredis';
import { Resend } from 'resend';

/**
 * API endpoint para cancelar una reserva
 * POST /api/cancelar-reserva
 *
 * Body: { email: string, eventId: string }
 *
 * NOTA: Este archivo tiene las plantillas de email/WhatsApp y Google Calendar
 * inlineadas para evitar problemas de bundling en Vercel serverless functions.
 */

// ============================================================================
// CONSTANTES
// ============================================================================

const MOMENCE_API_URL = 'https://api.momence.com';
const MOMENCE_AUTH_URL = 'https://api.momence.com/api/v2/auth/token';
const TOKEN_CACHE_KEY = 'momence:access_token';
const TOKEN_TTL_SECONDS = 3500;
const BOOKING_KEY_PREFIX = 'booking:';

// Fetch timeout
const DEFAULT_FETCH_TIMEOUT_MS = 8000; // 8 seconds

/**
 * Fetch with automatic timeout to prevent hanging requests
 */
async function fetchWithTimeout(
  url: string,
  options: Record<string, unknown> = {},
  timeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS
): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    } as globalThis.RequestInit);
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Brand colors
const BRAND_PRIMARY = '#B01E3C';

// Button styles
const BUTTON_PRIMARY = `display: inline-block; background-color: ${BRAND_PRIMARY}; color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);`;

// URLs
const BASE_URL = 'https://www.farrayscenter.com';
const LOGO_URL = 'https://www.farrayscenter.com/images/logo/img/logo-fidc_256.png';
const INSTAGRAM_URL = 'https://www.instagram.com/farrays_centerbcn/';
const WHATSAPP_NUMBER = '+34622247085';
const WHATSAPP_URL = `https://wa.me/34622247085`;

// Location
const LOCATION_STREET = 'C/ Entença 100, 08015 Barcelona';

// Email config
const FROM_EMAIL = "Farray's Center <reservas@farrayscenter.com>";
const REPLY_TO = 'info@farrayscenter.com';
const EMAIL_HEADERS = {
  'X-Entity-Ref-ID': 'farrayscenter-booking-system',
  'List-Unsubscribe': '<mailto:unsubscribe@farrayscenter.com>',
};

// WhatsApp Cloud API
const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

// Google Calendar API
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ============================================================================
// TIMEZONE UTILITIES
// ============================================================================

/**
 * Get Madrid timezone offset in hours for a given date
 * Returns 1 for winter (CET) or 2 for summer (CEST)
 *
 * DST in Spain:
 * - Starts: Last Sunday of March at 02:00 → 03:00
 * - Ends: Last Sunday of October at 03:00 → 02:00
 */
function getMadridOffset(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // Find last Sunday of March
  const marchLast = new Date(Date.UTC(year, 2, 31)); // March 31
  const marchLastSunday = 31 - marchLast.getUTCDay();

  // Find last Sunday of October
  const octLast = new Date(Date.UTC(year, 9, 31)); // October 31
  const octLastSunday = 31 - octLast.getUTCDay();

  // Check if date is in DST (summer time)
  // DST is active from last Sunday of March 02:00 UTC+1 (01:00 UTC)
  // to last Sunday of October 03:00 UTC+2 (01:00 UTC)
  const isDST =
    (month > 2 && month < 9) || // April to September
    (month === 2 && day > marchLastSunday) || // After last Sunday of March
    (month === 2 && day === marchLastSunday && date.getUTCHours() >= 1) || // On last Sunday after 01:00 UTC
    (month === 9 && day < octLastSunday) || // Before last Sunday of October
    (month === 9 && day === octLastSunday && date.getUTCHours() < 1); // On last Sunday before 01:00 UTC

  return isDST ? 2 : 1;
}

// ============================================================================
// REDIS CLIENT
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
// MOMENCE API
// ============================================================================

async function getAccessToken(): Promise<string | null> {
  const { MOMENCE_CLIENT_ID, MOMENCE_CLIENT_SECRET, MOMENCE_USERNAME, MOMENCE_PASSWORD } =
    process.env;
  if (!MOMENCE_CLIENT_ID || !MOMENCE_CLIENT_SECRET || !MOMENCE_USERNAME || !MOMENCE_PASSWORD)
    return null;

  const redis = getRedisClient();
  if (redis) {
    try {
      const cached = await redis.get(TOKEN_CACHE_KEY);
      if (cached) return cached;
    } catch (e) {
      console.warn('Redis token lookup failed:', e);
    }
  }

  const basicAuth = Buffer.from(`${MOMENCE_CLIENT_ID}:${MOMENCE_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await fetchWithTimeout(MOMENCE_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: MOMENCE_USERNAME,
        password: MOMENCE_PASSWORD,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const token = data.access_token;

    if (redis && token) {
      try {
        await redis.setex(TOKEN_CACHE_KEY, TOKEN_TTL_SECONDS, token);
      } catch (e) {
        console.warn('Redis token save failed:', e);
      }
    }

    return token;
  } catch (error) {
    console.error('Momence auth error:', error);
    return null;
  }
}

async function cancelMomenceBooking(
  accessToken: string,
  bookingId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.warn('[Momence Cancel] Cancelling session-booking:', bookingId);
    const response = await fetchWithTimeout(
      `${MOMENCE_API_URL}/api/v2/host/session-bookings/${bookingId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refund: true,
          disableNotifications: true,
          isLateCancellation: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Momence Cancel] Failed:', response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    console.warn('[Momence Cancel] SUCCESS! Booking cancelled');
    return { success: true };
  } catch (error) {
    console.error('[Momence Cancel] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// GOOGLE CALENDAR API (INLINED)
// ============================================================================

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
    const response = await fetchWithTimeout(TOKEN_URL, {
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
  } catch (error) {
    console.error('[google-calendar] Token refresh error:', error);
    return null;
  }
}

function getCalendarId(): string {
  return process.env['GOOGLE_CALENDAR_ID'] || 'primary';
}

function isGoogleCalendarConfigured(): boolean {
  return !!(
    process.env['GOOGLE_CALENDAR_CLIENT_ID'] &&
    process.env['GOOGLE_CALENDAR_CLIENT_SECRET'] &&
    process.env['GOOGLE_CALENDAR_REFRESH_TOKEN']
  );
}

async function deleteCalendarEvent(
  calendarEventId: string
): Promise<{ success: boolean; error?: string }> {
  const accessToken = await getCalendarAccessToken();
  if (!accessToken) return { success: false, error: 'Failed to get access token' };

  try {
    const response = await fetchWithTimeout(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(getCalendarId())}/events/${calendarEventId}?sendUpdates=none`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (response.status === 204 || response.status === 404) {
      console.log(`[google-calendar] Event ${calendarEventId} deleted`);
      return { success: true };
    }

    const error = await response.text();
    return { success: false, error: `HTTP ${response.status}: ${error}` };
  } catch (error) {
    console.error('[google-calendar] Error deleting event:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// EMAIL HTML COMPONENTS (INLINED)
// ============================================================================

function generatePreheader(text: string): string {
  const spacer = '&nbsp;'.repeat(150);
  return `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${text}${spacer}</div>`;
}

function generateHeader(): string {
  return `<div style="text-align: center; margin-bottom: 30px;"><h1 style="color: ${BRAND_PRIMARY}; margin: 0; font-size: 24px; font-weight: bold;">Farray's International Dance Center</h1></div>`;
}

function generateFooter(): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a1a; margin-top: 30px;">
    <tr>
      <td style="padding: 30px; text-align: center;">
        <img src="${LOGO_URL}" alt="Farray's International Dance Center" width="120" height="120" style="margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
        <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 15px; color: #ffffff;">Farray's International Dance Center</p>
        <p style="margin: 0 0 15px 0; color: #999999; font-size: 13px;">${LOCATION_STREET}</p>
        <p style="margin: 0 0 20px 0;"><a href="${BASE_URL}" style="color: ${BRAND_PRIMARY}; text-decoration: none; font-weight: bold; font-size: 14px;">www.farrayscenter.com</a></p>
        <p style="margin: 0; padding-top: 15px; border-top: 1px solid #333;">
          <a href="${INSTAGRAM_URL}" style="color: #888888; text-decoration: none; margin: 0 12px; font-size: 13px;">Instagram</a>
          <a href="${WHATSAPP_URL}" style="color: #888888; text-decoration: none; margin: 0 12px; font-size: 13px;">WhatsApp</a>
        </p>
      </td>
    </tr>
  </table>`;
}

// ============================================================================
// INLINED EMAIL FUNCTION
// ============================================================================

async function sendCancellationEmailInline(data: {
  to: string;
  firstName: string;
  className: string;
  classDate?: string;
  classTime?: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) return { success: false, error: 'Missing RESEND_API_KEY' };

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      replyTo: REPLY_TO,
      headers: EMAIL_HEADERS,
      subject: `Reserva cancelada: ${data.className}`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${generatePreheader(`Tu reserva ha sido cancelada. ¿Te arrepientes? Puedes reservar otra clase gratis cuando quieras.`)}
  ${generateHeader()}
  <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 15px 0; font-size: 18px;">¡Hola <strong>${data.firstName}</strong>!</p>
    <p style="margin: 0 0 15px 0;">¡Vaya! Sentimos que no puedas venir a la clase. 😔</p>
    <p style="margin: 0;">Tu clase de <strong>${data.className}</strong>${data.classDate ? ` del ${data.classDate}` : ''}${data.classTime ? ` a las ${data.classTime}` : ''} ha sido cancelada y la plaza liberada para que otra persona pueda aprovecharla.</p>
  </div>
  <div style="background: #fff3e0; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 10px 0;"><strong>¿Te arrepientes?</strong> 😉</p>
    <p style="margin: 0;">Puedes reservar tu clase gratis cuando quieras, siempre que la promo siga activa y queden plazas.</p>
  </div>
  <div style="text-align: center; margin-bottom: 30px;">
    <a href="${BASE_URL}/es/reservas" style="${BUTTON_PRIMARY}">Reprogramar Clase</a>
  </div>
  <div style="background: #e8f5e9; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 10px 0;"><strong>💡 ¿Sabías que...?</strong></p>
    <p style="margin: 0;">Las clases sueltas están desde <strong>20€</strong>. Y la clase gratis... ¡es una oferta top por tiempo limitado y las plazas vuelan!</p>
  </div>
  <div style="background: #f5f5f5; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
    <p style="margin: 0 0 10px 0;"><strong>¿Tienes dudas? 💬</strong></p>
    <p style="margin: 0;">Escríbenos por WhatsApp al <a href="${WHATSAPP_URL}" style="color: ${BRAND_PRIMARY}; text-decoration: none;"><strong>${WHATSAPP_NUMBER}</strong></a><br>y te responderemos lo antes posible.</p>
  </div>
  ${generateFooter()}
</body></html>`,
    });

    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (error) {
    console.error('[Cancel] Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// INLINED WHATSAPP FUNCTION
// ============================================================================

function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  // Spanish: 9 digits starting with 6,7,8,9
  if (cleaned.length === 9 && /^[6789]/.test(cleaned)) cleaned = '34' + cleaned;
  // French: 10 digits starting with 0
  if (cleaned.length === 10 && cleaned.startsWith('0')) cleaned = '33' + cleaned.substring(1);
  return cleaned;
}

async function sendCancellationWhatsAppInline(data: {
  to: string;
  firstName: string;
}): Promise<{ success: boolean; error?: string }> {
  const accessToken = process.env['WHATSAPP_TOKEN'];
  const phoneId = process.env['WHATSAPP_PHONE_ID'];
  if (!accessToken || !phoneId)
    return { success: false, error: 'Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_ID' };

  try {
    const response = await fetchWithTimeout(`${WHATSAPP_API_URL}/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhoneNumber(data.to),
        type: 'template',
        template: {
          name: 'cancelar',
          language: { code: 'es_ES' },
          components: [{ type: 'body', parameters: [{ type: 'text', text: data.firstName }] }],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// PII REDACTION (GDPR-compliant logging)
// ============================================================================

/** Redact email for logging */
function redactEmail(email: string | null | undefined): string {
  if (!email) return 'N/A';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@invalid';
  return `${local.length > 3 ? local.slice(0, 3) + '***' : '***'}@${domain}`;
}

/** Redact phone for GDPR-compliant logging */
function redactPhone(phone: string | null | undefined): string {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.length < 6) return '***';
  return `${cleaned.slice(0, 4)}***${cleaned.slice(-2)}`;
}

// ============================================================================
// TYPES
// ============================================================================

interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  className: string;
  classDate: string;
  classTime: string;
  momenceEventId: string;
  momenceBookingId?: number | null;
  bookedAt: string;
  category?: string;
  calendarEventId?: string;
}

interface BookingDetailsData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  className: string;
  classDate: string;
  classTime: string;
  category?: string;
  calendarEventId?: string | null;
  momenceEventId?: string;
  momenceBookingId?: number | null;
}

// ============================================================================
// HANDLER
// ============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  const { email, eventId } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email parameter required' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const bookingKey = `${BOOKING_KEY_PREFIX}${normalizedEmail}`;

  const redis = getRedisClient();
  if (!redis) {
    return res.status(500).json({ error: 'Redis not configured' });
  }

  try {
    let bookingData: BookingData | null = null;
    let bookingDetailsKey: string | null = null;

    // STRATEGY 1: If eventId provided, search booking_details:eventId first
    if (eventId) {
      const detailsKey = `booking_details:${eventId}`;
      const detailsStr = await redis.get(detailsKey);
      if (detailsStr) {
        const details: BookingDetailsData = JSON.parse(detailsStr);
        if (details.email?.toLowerCase() !== normalizedEmail) {
          return res.status(404).json({
            error: 'Email mismatch',
            message: 'El email no coincide con la reserva encontrada',
          });
        }
        bookingData = {
          firstName: details.firstName,
          lastName: details.lastName,
          email: details.email,
          phone: details.phone,
          className: details.className,
          classDate: details.classDate,
          classTime: details.classTime,
          momenceEventId: details.momenceEventId || eventId,
          momenceBookingId: details.momenceBookingId,
          bookedAt: new Date().toISOString(),
          category: details.category,
          calendarEventId: details.calendarEventId || undefined,
        };
        bookingDetailsKey = detailsKey;
        console.log(`[Cancel] Found booking in booking_details:${eventId}`);
      }
    }

    // STRATEGY 2: Fallback to booking:email
    if (!bookingData) {
      const bookingDataStr = await redis.get(bookingKey);
      if (bookingDataStr) {
        bookingData = JSON.parse(bookingDataStr);
        console.log(`[Cancel] Found booking in booking:${redactEmail(normalizedEmail)}`);
      }
    }

    if (!bookingData) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'No se encontró ninguna reserva con este email',
      });
    }

    console.warn(
      '[Cancel] Booking data found, momenceBookingId:',
      bookingData.momenceBookingId || 'NULL'
    );

    if (eventId && !bookingDetailsKey && bookingData.momenceEventId !== eventId) {
      return res.status(404).json({
        error: 'Booking mismatch',
        message: 'El evento no coincide con la reserva encontrada',
      });
    }

    // 1b. Validar política de cancelación: no se puede cancelar menos de 1 hora antes
    const MIN_HOURS_BEFORE_CANCELLATION = 1;
    if (bookingData.classDate && bookingData.classTime) {
      try {
        // Parse class date and time
        const dateMatch = bookingData.classDate.match(/(\d{4})-(\d{2})-(\d{2})/);
        const timeMatch = bookingData.classTime.match(/(\d{1,2}):(\d{2})/);

        if (
          dateMatch &&
          timeMatch &&
          dateMatch[1] &&
          dateMatch[2] &&
          dateMatch[3] &&
          timeMatch[1] &&
          timeMatch[2]
        ) {
          const year = parseInt(dateMatch[1], 10);
          const month = parseInt(dateMatch[2], 10) - 1;
          const day = parseInt(dateMatch[3], 10);
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);

          // Create class datetime as ISO string in Madrid timezone, then parse
          // Format: "2026-01-28T19:00:00+01:00" (winter) or "+02:00" (summer)
          // We use a simplified approach: create the date and adjust for Madrid offset
          const classDateTimeUTC = Date.UTC(year, month, day, hours, minutes, 0);

          // Get Madrid offset for this specific date (handles DST automatically)
          // Madrid is UTC+1 in winter, UTC+2 in summer
          const testDate = new Date(classDateTimeUTC);
          const madridOffset = getMadridOffset(testDate);

          // Class time is stored in Madrid local time, so we need to convert to UTC
          // by subtracting the Madrid offset
          const classDateTimeInUTC = classDateTimeUTC - madridOffset * 60 * 60 * 1000;

          const now = Date.now();
          const hoursUntilClass = (classDateTimeInUTC - now) / (1000 * 60 * 60);

          console.warn(
            `[Cancel] Time check: class at ${new Date(classDateTimeInUTC).toISOString()} (Madrid: ${hours}:${String(minutes).padStart(2, '0')}), ` +
              `now ${new Date(now).toISOString()}, hours until: ${hoursUntilClass.toFixed(2)}, Madrid offset: UTC+${madridOffset}`
          );

          if (hoursUntilClass < MIN_HOURS_BEFORE_CANCELLATION && hoursUntilClass > -24) {
            // Only block if class is in the future (within 1 hour) or just started (within last 24h)
            // Allow cancellation of old classes (more than 24h ago)
            return res.status(400).json({
              error: 'Cancellation window closed',
              message: `No se puede cancelar con menos de ${MIN_HOURS_BEFORE_CANCELLATION} hora de antelación. Por favor, contacta con nosotros por WhatsApp.`,
              hoursUntilClass: hoursUntilClass.toFixed(2),
              whatsappUrl: WHATSAPP_URL,
            });
          }
        }
      } catch (dateError) {
        console.warn(
          '[Cancel] Could not parse class date/time for cancellation policy check:',
          dateError
        );
        // Continue with cancellation if we can't parse the date
      }
    }

    // 2. Cancelar en Momence
    let momenceCancelled = false;
    if (bookingData.momenceBookingId) {
      const accessToken = await getAccessToken();
      if (accessToken) {
        const cancelResult = await cancelMomenceBooking(accessToken, bookingData.momenceBookingId);
        momenceCancelled = cancelResult.success;
        if (!cancelResult.success)
          console.warn('[Cancel] Momence cancellation failed:', cancelResult.error);
      } else {
        console.warn('[Cancel] Could not get Momence access token');
      }
    } else {
      console.warn('[Cancel] No momenceBookingId found, skipping Momence API');
    }

    // 2b. Eliminar evento de Google Calendar
    let calendarDeleted = false;
    if (isGoogleCalendarConfigured() && bookingData.calendarEventId) {
      try {
        const calendarResult = await deleteCalendarEvent(bookingData.calendarEventId);
        calendarDeleted = calendarResult.success;
        if (!calendarResult.success)
          console.warn('[Cancel] Calendar delete failed:', calendarResult.error);
      } catch (e) {
        console.warn('[Cancel] Calendar error (non-blocking):', e);
      }
    } else {
      console.log('[Cancel] Google Calendar not configured or no calendarEventId');
    }

    // 3. Eliminar de Redis
    await redis.del(bookingKey);
    console.warn('[Cancel] Redis key deleted:', bookingKey);

    if (bookingDetailsKey) {
      await redis.del(bookingDetailsKey);
      console.warn('[Cancel] Redis key deleted:', bookingDetailsKey);
    }

    // También eliminar del set de reminders
    if (bookingData.classDate) {
      const dateMatch = bookingData.classDate.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch) {
        const reminderKey = `reminders:${dateMatch[0]}`;
        await redis.srem(reminderKey, eventId || bookingData.momenceEventId);
        console.log(`[Cancel] Removed from ${reminderKey}`);
      }
    }

    // 4. Enviar notificaciones

    // 4a. WhatsApp (INLINED)
    let whatsappSent = false;
    if (bookingData.phone) {
      try {
        const whatsappResult = await sendCancellationWhatsAppInline({
          to: bookingData.phone,
          firstName: bookingData.firstName,
        });
        whatsappSent = whatsappResult.success;
        if (!whatsappResult.success)
          console.warn('[Cancel] WhatsApp failed:', whatsappResult.error);
      } catch (e) {
        console.warn('[Cancel] WhatsApp error:', e);
      }
    }

    // 4b. Email (INLINED)
    let emailSent = false;
    try {
      const emailResult = await sendCancellationEmailInline({
        to: bookingData.email,
        firstName: bookingData.firstName,
        className: bookingData.className,
        classDate: bookingData.classDate,
        classTime: bookingData.classTime,
      });
      emailSent = emailResult.success;
      if (!emailResult.success) console.warn('[Cancel] Email failed:', emailResult.error);
    } catch (e) {
      console.warn('[Cancel] Email error:', e);
    }

    // 4c. Email admin (non-blocking)
    try {
      const apiKey = process.env['RESEND_API_KEY'];
      if (apiKey) {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: `"${bookingData.firstName} ${bookingData.lastName}" <noreply@farrayscenter.com>`,
          to: 'info@farrayscenter.com',
          replyTo: bookingData.email,
          subject: `Cancelación de ${bookingData.className} (${bookingData.firstName} ${bookingData.lastName}) el ${bookingData.classDate}`,
          html: `<h2>Cancelación de Reserva</h2>
            <p><strong>Alumno:</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
            <p><strong>Email:</strong> ${bookingData.email}</p>
            <p><strong>Teléfono:</strong> ${bookingData.phone || 'No proporcionado'}</p>
            <hr>
            <p><strong>Clase:</strong> ${bookingData.className}</p>
            <p><strong>Fecha:</strong> ${bookingData.classDate}</p>
            <p><strong>Hora:</strong> ${bookingData.classTime}</p>
            <hr>
            <p style="color: #dc3545;"><strong>Estado:</strong> CANCELADA</p>
            <p><em>Cancelado el ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</em></p>`,
        });
        console.log('[Cancel] Admin notification email sent');
      }
    } catch (adminError) {
      console.warn('[Cancel] Admin notification failed:', adminError);
    }

    // Record audit event for cancellation
    try {
      const { recordAuditEvent } = await import('./lib/audit');
      await recordAuditEvent(redis, {
        action: 'booking_cancelled',
        eventId: eventId || bookingData.momenceEventId,
        email: redactEmail(bookingData.email),
        phone: redactPhone(bookingData.phone),
        className: bookingData.className,
        classDate: bookingData.classDate,
        success: true,
        metadata: {
          momenceCancelled,
          calendarDeleted,
          whatsappSent,
          emailSent,
        },
      });
    } catch {
      // Audit is non-critical
    }

    return res.status(200).json({
      success: true,
      message: 'Reserva cancelada correctamente',
      data: {
        className: bookingData.className,
        classDate: bookingData.classDate,
        momenceCancelled,
        calendarDeleted,
        whatsappSent,
        emailSent,
      },
    });
  } catch (error) {
    console.error('Cancel API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
