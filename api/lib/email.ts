/**
 * Resend Email Helper - Enterprise Configuration
 *
 * Sistema de emails transaccionales unificado para el sistema de reservas.
 * Este archivo es la ÚNICA fuente de verdad para todos los emails.
 *
 * @see https://resend.com/docs
 *
 * Configuración Resend Dashboard:
 * - Click Tracking: OFF (evita spam filters)
 * - Open Tracking: OFF (mejora entregabilidad)
 * - TLS: Opportunistic (balance seguridad/entrega)
 *
 * DNS Records requeridos:
 * - SPF: ✅ (configurado por Resend)
 * - DKIM: ✅ (configurado por Resend)
 * - DMARC: Añadir manualmente (ver README)
 */

import { Resend } from 'resend';

// ============================================================================
// CONFIGURACIÓN ENTERPRISE
// ============================================================================

/**
 * Colores corporativos de Farray's Center
 */
const BRAND_PRIMARY = '#B01E3C'; // Rojo carmesí del logo
const BRAND_DARK = '#800020'; // Borgoña oscuro
const SPAIN_TIMEZONE = 'Europe/Madrid';

/**
 * Formats ISO date to readable Spanish format.
 * "2026-03-13T17:00:00.000Z" → "Jueves 13 de marzo de 2026"
 * "2026-03-13" → "Jueves 13 de marzo de 2026"
 */
function formatDateReadable(isoDate: string): string {
  if (!isoDate) return '';
  try {
    // Handle both "YYYY-MM-DD" and full ISO datetime
    const dateStr = isoDate.includes('T') ? isoDate : isoDate + 'T12:00:00Z';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return isoDate;
    const formatted = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: SPAIN_TIMEZONE,
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return isoDate;
  }
}
const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_DARK} 100%)`;

/**
 * Estilos de botones (como en la web)
 */
const BUTTON_PRIMARY = `display: inline-block; background-color: ${BRAND_PRIMARY}; color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);`;
const BUTTON_SECONDARY = `display: inline-block; background-color: transparent; color: ${BRAND_PRIMARY}; text-decoration: none; padding: 14px 38px; border-radius: 50px; font-weight: bold; font-size: 16px; border: 2px solid ${BRAND_PRIMARY};`;

/**
 * URLs de producción
 */
const BASE_URL = 'https://www.farrayscenter.com';
const LOGO_URL = 'https://www.farrayscenter.com/images/logo/img/logo-fidc_256.png';
const INSTAGRAM_URL = 'https://www.instagram.com/farrays_centerbcn/';
const WHATSAPP_NUMBER = '+34622247085';
const WHATSAPP_URL = `https://wa.me/34622247085`;

/**
 * Ubicación del centro
 */
const LOCATION_ADDRESS = "Farray's International Dance Center";
const LOCATION_STREET = 'C/ Entença 100, 08015 Barcelona';
const LOCATION_FULL = `${LOCATION_ADDRESS}, ${LOCATION_STREET}`;
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/YMTQFik7dB1ykdux9';

/**
 * Email addresses configurados:
 * - FROM: Dirección verificada en Resend (dominio farrayscenter.com)
 * - REPLY_TO: Dirección donde recibes respuestas
 */
const FROM_EMAIL = "Farray's Center <reservas@farrayscenter.com>";
const REPLY_TO = 'info@farrayscenter.com';

/**
 * Headers adicionales para máxima entregabilidad
 */
const EMAIL_HEADERS = {
  'X-Entity-Ref-ID': 'farrayscenter-booking-system',
  'List-Unsubscribe': '<mailto:unsubscribe@farrayscenter.com>',
};

// Singleton Resend
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (resendInstance) {
    return resendInstance;
  }

  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

// ============================================================================
// EMAIL RETRY QUEUE (Redis-based)
// ============================================================================

const EMAIL_RETRY_QUEUE_KEY = 'email:retry:queue';
const EMAIL_RETRY_TTL_SECONDS = 24 * 60 * 60; // 24 hours

interface QueuedEmail {
  type: 'booking_confirmation' | 'reminder' | 'cancellation' | 'feedback';
  data: Record<string, unknown>;
  attempts: number;
  createdAt: number;
  lastError?: string;
}

/**
 * Queue a failed email for retry
 * Emails are stored in Redis and auto-expire after 24 hours
 */
export async function queueEmailForRetry(
  type: QueuedEmail['type'],
  data: Record<string, unknown>,
  error: string
): Promise<void> {
  try {
    const Redis = (await import('ioredis')).default;
    const redisUrl = process.env['STORAGE_REDIS_URL'];
    if (!redisUrl) {
      console.warn('[EmailRetry] Redis not configured, cannot queue email');
      return;
    }

    const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, connectTimeout: 3000 });

    const queuedEmail: QueuedEmail = {
      type,
      data,
      attempts: 1,
      createdAt: Date.now(),
      lastError: error,
    };

    // Use email + timestamp as unique key
    const emailKey = `${EMAIL_RETRY_QUEUE_KEY}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    await redis.setex(emailKey, EMAIL_RETRY_TTL_SECONDS, JSON.stringify(queuedEmail));

    console.warn(`[EmailRetry] Queued ${type} email for retry:`, {
      to: (data as { to?: string }).to,
      error,
    });

    await redis.quit();
  } catch (e) {
    console.error('[EmailRetry] Failed to queue email:', e);
  }
}

/**
 * Get count of emails pending retry
 */
export async function getRetryQueueCount(): Promise<number> {
  try {
    const Redis = (await import('ioredis')).default;
    const redisUrl = process.env['STORAGE_REDIS_URL'];
    if (!redisUrl) return 0;

    const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, connectTimeout: 3000 });

    let count = 0;
    let cursor = '0';
    do {
      const [newCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        `${EMAIL_RETRY_QUEUE_KEY}:*`,
        'COUNT',
        100
      );
      cursor = newCursor;
      count += keys.length;
    } while (cursor !== '0');

    await redis.quit();
    return count;
  } catch {
    return 0;
  }
}

/**
 * Maximum retry attempts before giving up
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Process the email retry queue
 * Called by cron job to retry failed emails with exponential backoff
 *
 * @returns Summary of processed emails
 */
export async function processEmailRetryQueue(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  permanent: number;
}> {
  const summary = { processed: 0, succeeded: 0, failed: 0, permanent: 0 };

  try {
    const Redis = (await import('ioredis')).default;
    const redisUrl = process.env['STORAGE_REDIS_URL'];
    if (!redisUrl) {
      console.log('[EmailRetry] Redis not configured, skipping');
      return summary;
    }

    const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, connectTimeout: 5000 });

    // Get all queued emails
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [newCursor, foundKeys] = await redis.scan(
        cursor,
        'MATCH',
        `${EMAIL_RETRY_QUEUE_KEY}:*`,
        'COUNT',
        100
      );
      cursor = newCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    console.log(`[EmailRetry] Found ${keys.length} emails to retry`);

    for (const key of keys) {
      try {
        const data = await redis.get(key);
        if (!data) continue;

        const queuedEmail: QueuedEmail = JSON.parse(data);
        summary.processed++;

        // Check if max attempts exceeded
        if (queuedEmail.attempts >= MAX_RETRY_ATTEMPTS) {
          console.warn(`[EmailRetry] Max attempts reached for ${queuedEmail.type}, removing`);
          await redis.del(key);
          summary.permanent++;
          continue;
        }

        // Attempt to resend based on type
        let result: { success: boolean; error?: string } = { success: false };

        switch (queuedEmail.type) {
          case 'booking_confirmation':
            result = await sendBookingConfirmationRetry(queuedEmail.data);
            break;
          case 'cancellation':
            result = await sendCancellationEmailRetry(queuedEmail.data);
            break;
          case 'reminder':
            result = await sendReminderEmailRetry(queuedEmail.data);
            break;
          case 'feedback':
            result = await sendFeedbackEmailRetry(queuedEmail.data);
            break;
          default:
            console.warn(`[EmailRetry] Unknown email type: ${queuedEmail.type}`);
            await redis.del(key);
            continue;
        }

        if (result.success) {
          console.log(`[EmailRetry] Successfully retried ${queuedEmail.type}`);
          await redis.del(key);
          summary.succeeded++;
        } else {
          // Update attempts and keep in queue
          queuedEmail.attempts++;
          queuedEmail.lastError = result.error;
          await redis.setex(key, EMAIL_RETRY_TTL_SECONDS, JSON.stringify(queuedEmail));
          summary.failed++;
          console.warn(
            `[EmailRetry] Retry failed (attempt ${queuedEmail.attempts}): ${result.error}`
          );
        }
      } catch (e) {
        console.error(`[EmailRetry] Error processing ${key}:`, e);
        summary.failed++;
      }
    }

    await redis.quit();
    console.log(`[EmailRetry] Summary:`, summary);
    return summary;
  } catch (e) {
    console.error('[EmailRetry] Queue processing error:', e);
    return summary;
  }
}

/**
 * Internal retry functions - send without re-queueing on failure
 */
async function sendBookingConfirmationRetry(
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  const bookingData = data as unknown as BookingEmailData;

  const googleCalUrl = generateGoogleCalendarUrl({
    className: bookingData.className,
    classDate: bookingData.classDate,
    classTime: bookingData.classTime,
    classDateRaw: bookingData.classDateRaw,
  });
  const icsUrl = generateIcsDataUrl({
    className: bookingData.className,
    classDate: bookingData.classDate,
    classTime: bookingData.classTime,
    classDateRaw: bookingData.classDateRaw,
    eventId: bookingData.eventId,
  });

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: bookingData.to,
      replyTo: REPLY_TO,
      headers: EMAIL_HEADERS,
      subject: `Reserva confirmada: ${bookingData.className}`,
      html: generateConfirmationEmailHtml({
        firstName: bookingData.firstName,
        className: bookingData.className,
        classDate: bookingData.classDate,
        classTime: bookingData.classTime,
        managementUrl: bookingData.managementUrl,
        calendarUrl: googleCalUrl,
        icsUrl,
        instructor: bookingData.instructor,
        category: bookingData.category,
      }),
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function sendCancellationEmailRetry(
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  const cancelData = data as unknown as CancellationEmailData;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: cancelData.to,
      replyTo: REPLY_TO,
      headers: EMAIL_HEADERS,
      subject: `Reserva cancelada: ${cancelData.className}`,
      html: generateCancellationEmailHtml({
        firstName: cancelData.firstName,
        className: cancelData.className,
        classDate: '',
        classTime: '',
      }),
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function sendReminderEmailRetry(
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  const reminderData = data as unknown as ReminderEmailData;

  const googleCalUrl = generateGoogleCalendarUrl({
    className: reminderData.className,
    classDate: reminderData.classDate,
    classTime: reminderData.classTime,
    classDateRaw: reminderData.classDateISO,
  });
  const icsUrl = generateIcsDataUrl({
    className: reminderData.className,
    classDate: reminderData.classDate,
    classTime: reminderData.classTime,
    classDateRaw: reminderData.classDateISO,
    eventId: reminderData.eventId,
  });

  const is48h = reminderData.reminderType === '48h';
  const timeText = is48h ? 'pasado mañana' : 'mañana';

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: reminderData.to,
      replyTo: REPLY_TO,
      headers: EMAIL_HEADERS,
      subject: `Recordatorio: Tu clase de ${reminderData.className} es ${timeText}`,
      html: generateReminderEmailHtml({
        firstName: reminderData.firstName,
        className: reminderData.className,
        classDate: reminderData.classDate,
        classTime: reminderData.classTime,
        timeframe: timeText,
        managementUrl: reminderData.managementUrl,
        calendarUrl: googleCalUrl,
        icsUrl,
        category: reminderData.category,
      }),
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function sendFeedbackEmailRetry(
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  const feedbackData = data as unknown as FeedbackEmailData;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: feedbackData.to,
      replyTo: 'info@farrayscenter.com',
      headers: EMAIL_HEADERS,
      subject: `¿Qué tal tu clase de ${feedbackData.className}? 💃`,
      html: generateFeedbackEmailHtml({
        firstName: feedbackData.firstName,
        className: feedbackData.className,
        classDate: '',
        feedbackToken: feedbackData.feedbackToken,
      }),
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Categorías de clases - cada una tiene instrucciones específicas
 */
export type ClassCategory =
  | 'bailes_sociales' // Salsa, Bachata, Kizomba, etc.
  | 'danzas_urbanas' // Hip Hop, House, Breaking, etc.
  | 'danza' // Ballet, Contemporáneo, Jazz, etc.
  | 'entrenamiento' // Entrenamiento para bailarines
  | 'heels'; // Heels Dance

export interface BookingEmailData {
  to: string;
  firstName: string;
  className: string;
  classDate: string; // "Lunes 28 de Enero 2026"
  classTime: string; // "19:00"
  instructor?: string;
  managementUrl: string; // URL con magic link
  mapUrl?: string;
  category?: ClassCategory;
  classDateRaw?: string | null; // ISO date for calendar generation
  eventId?: string; // Para ICS UID
}

export interface CancellationEmailData {
  to: string;
  firstName: string;
  className: string;
  bookingUrl: string; // URL para reservar otra clase
}

export interface ReminderEmailData {
  to: string;
  firstName: string;
  className: string;
  classDate: string;
  classDateISO?: string; // "2026-01-28" - for calendar generation
  classTime: string;
  managementUrl: string;
  mapUrl?: string;
  reminderType?: '48h' | '24h';
  eventId?: string;
  category?: ClassCategory;
}

export interface FeedbackEmailData {
  to: string;
  firstName: string;
  className: string;
  feedbackToken: string; // Token para generar URLs de feedback
}

// ============================================================================
// CALENDAR GENERATION
// ============================================================================

const SPANISH_MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

/**
 * Parsea fecha en español a Date
 */
function parseSpanishDate(classDate: string, classDateRaw?: string | null): Date {
  if (classDateRaw) {
    return new Date(classDateRaw);
  }
  // Parse from formatted date "Lunes, 27 de enero de 2026"
  const match = classDate.match(/(\d{1,2}) de (\w+) de (\d{4})/);
  if (match && match[1] && match[2] && match[3]) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const month = SPANISH_MONTHS[monthName] ?? 0;
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  return new Date();
}

/**
 * Parsea hora y la aplica a una fecha
 */
function parseTime(timeStr: string, date: Date): void {
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch && timeMatch[1] && timeMatch[2]) {
    date.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
  }
}

/**
 * Formatea fecha para calendarios (formato iCal)
 */
function formatCalendarDate(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/**
 * Genera URL de Google Calendar
 */
export function generateGoogleCalendarUrl(data: {
  className: string;
  classDate: string;
  classTime: string;
  classDateRaw?: string | null;
}): string {
  const startDate = parseSpanishDate(data.classDate, data.classDateRaw);
  parseTime(data.classTime, startDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${data.className} - Farray's Center`,
    dates: `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`,
    details: `Clase de prueba en Farray's International Dance Center.\n\nRecuerda llegar 10 minutos antes para cambiarte.\n\nMás info: ${BASE_URL}`,
    location: LOCATION_FULL,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Genera contenido ICS como Data URL
 */
export function generateIcsDataUrl(data: {
  className: string;
  classDate: string;
  classTime: string;
  classDateRaw?: string | null;
  eventId?: string;
}): string {
  const startDate = parseSpanishDate(data.classDate, data.classDateRaw);
  parseTime(data.classTime, startDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const uid =
    data.eventId ||
    `${Date.now()}-${Math.random().toString(36).substring(2, 11)}@farrayscenter.com`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Farrays Center//Booking System//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatCalendarDate(new Date())}`,
    `DTSTART:${formatCalendarDate(startDate)}`,
    `DTEND:${formatCalendarDate(endDate)}`,
    `SUMMARY:${data.className} - Farray's Center`,
    `DESCRIPTION:Clase de prueba en Farray's International Dance Center.\\nRecuerda llegar 10 minutos antes.`,
    `LOCATION:${LOCATION_FULL}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
}

/**
 * Genera sección unificada de 4 botones de acción
 * Usado en emails de confirmación y recordatorio
 */
function generateActionButtons(data: {
  managementUrl: string;
  mapUrl?: string;
  googleCalUrl: string;
  icsUrl: string;
}): string {
  return `
  <div style="text-align: center; margin-bottom: 30px;">
    <table align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td style="padding: 8px;"><a href="${data.managementUrl}" style="${BUTTON_SECONDARY}">Ver mi reserva</a></td>
        ${data.mapUrl ? `<td style="padding: 8px;"><a href="${data.mapUrl}" style="${BUTTON_SECONDARY}">Cómo llegar</a></td>` : ''}
      </tr>
      <tr>
        <td style="padding: 8px;"><a href="${data.googleCalUrl}" target="_blank" style="${BUTTON_SECONDARY}">Google Calendar</a></td>
        <td style="padding: 8px;"><a href="${data.icsUrl}" download="farrays-clase.ics" style="${BUTTON_SECONDARY}">Descargar .ics</a></td>
      </tr>
    </table>
  </div>`;
}

// ============================================================================
// INSTRUCCIONES POR CATEGORÍA
// ============================================================================

interface CategoryInstructions {
  title: string;
  items: string[];
  color: string;
}

/**
 * Obtiene las instrucciones específicas de "¿Qué traer?" según la categoría
 */
export function getCategoryInstructions(category?: ClassCategory): CategoryInstructions {
  const commonItems = [
    '💧 Botella de agua',
    '🧴 Toalla pequeña',
    '🔐 Candado para taquilla (opcional)',
  ];

  switch (category) {
    case 'bailes_sociales':
      return {
        title: '¿Qué traer a tu clase de Bailes Sociales?',
        color: BRAND_PRIMARY,
        items: [
          '👠 <strong>Chicas:</strong> Bambas o zapatos de tacón cómodos',
          '👞 <strong>Chicos:</strong> Bambas o zapatos de baile',
          '📝 <strong>Folklore:</strong> Sin calzado (se baila descalzo)',
          ...commonItems,
        ],
      };

    case 'danzas_urbanas':
      return {
        title: '¿Qué traer a tu clase de Danzas Urbanas?',
        color: BRAND_PRIMARY,
        items: [
          '👟 Bambas cómodas (suela limpia)',
          '👖 Leggings, pantalones cortos o chándal',
          '👕 Ropa cómoda y ligera (tipo fitness)',
          '💃 <strong>Sexy Style:</strong> Bambas o tacones Stiletto. Rodilleras recomendadas',
          '🍑 <strong>Twerk:</strong> Rodilleras recomendadas',
          ...commonItems,
        ],
      };

    case 'danza':
    case 'entrenamiento':
      return {
        title:
          category === 'entrenamiento'
            ? '¿Qué traer a tu Entrenamiento?'
            : '¿Qué traer a tu clase de Danza?',
        color: BRAND_PRIMARY,
        items: [
          '🦶 <strong>Sin calzado</strong> o calcetines antideslizantes',
          '🦵 Rodilleras recomendadas (especialmente para floorwork)',
          '👖 Ropa ajustada que permita ver la línea del cuerpo',
          ...commonItems,
        ],
      };

    case 'heels':
      return {
        title: '¿Qué traer a tu clase de Heels?',
        color: BRAND_PRIMARY,
        items: [
          '👠 <strong>Tacones Stiletto</strong> (obligatorios)',
          '💃 Ropa femenina y atrevida que te haga sentir poderosa',
          '🎽 Top o body que permita libertad de movimiento',
          ...commonItems,
        ],
      };

    default:
      return {
        title: '¿Qué traer?',
        color: BRAND_PRIMARY,
        items: ['👟 Ropa cómoda para bailar', '👠 Calzado según el estilo', ...commonItems],
      };
  }
}

/**
 * Genera el HTML de la sección "¿Qué traer?" personalizada por categoría
 */
export function generateWhatToBringSection(category?: ClassCategory): string {
  const inst = getCategoryInstructions(category);
  return `
  <div style="background: #fff3e0; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
    <h3 style="margin: 0 0 15px 0; color: ${inst.color};">${inst.title}</h3>
    <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
      ${inst.items.map(item => `<li>${item}</li>`).join('')}
    </ul>
    <div style="background: #fdf2f4; padding: 15px; border-radius: 8px; margin-top: 15px;">
      <strong style="color: ${BRAND_PRIMARY};">⏰ Importante:</strong>
      <p style="margin: 5px 0 0 0; color: #666;">Llega <strong>10 minutos antes</strong> para cambiarte.</p>
    </div>
  </div>
  <div style="background: #f5f5f5; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
    <h4 style="margin: 0 0 10px 0; color: #333;">📍 Cómo llegar</h4>
    <p style="margin: 0; color: #666;">
      <strong>${LOCATION_ADDRESS}</strong><br>
      ${LOCATION_STREET}<br><br>
      🚇 <strong>Metro:</strong> Rocafort (L1) o Entença (L5)<br>
      🚌 <strong>Bus:</strong> Líneas 41, 54, H8
    </p>
  </div>`;
}

// ============================================================================
// COMPONENTES COMUNES
// ============================================================================

/**
 * Genera el preheader (texto oculto que aparece en la preview del inbox)
 * Aumenta el open rate mostrando info relevante antes de abrir
 */
function generatePreheader(text: string): string {
  // El preheader debe ser invisible pero presente en el HTML
  // Usamos espacios para evitar que el cliente de email muestre contenido adicional
  const spacer = '&nbsp;'.repeat(150);
  return `
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${text}${spacer}
  </div>`;
}

/**
 * Header común para todos los emails
 */
function generateHeader(): string {
  return `
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: ${BRAND_PRIMARY}; margin: 0; font-size: 24px; font-weight: bold;">Farray's International Dance Center</h1>
  </div>`;
}

/**
 * Footer común para todos los emails
 */
function generateFooter(): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #1a1a1a; margin-top: 30px;">
    <tr>
      <td style="padding: 30px; text-align: center;">
        <img src="${LOGO_URL}" alt="Farray's International Dance Center" width="120" height="120" style="margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
        <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 15px; color: #ffffff;">Farray's International Dance Center</p>
        <p style="margin: 0 0 15px 0; color: #999999; font-size: 13px;">${LOCATION_STREET}</p>
        <p style="margin: 0 0 20px 0;">
          <a href="${BASE_URL}" style="color: ${BRAND_PRIMARY}; text-decoration: none; font-weight: bold; font-size: 14px;">www.farrayscenter.com</a>
        </p>
        <p style="margin: 0; padding-top: 15px; border-top: 1px solid #333;">
          <a href="${INSTAGRAM_URL}" style="color: #888888; text-decoration: none; margin: 0 12px; font-size: 13px;">Instagram</a>
          <a href="${WHATSAPP_URL}" style="color: #888888; text-decoration: none; margin: 0 12px; font-size: 13px;">WhatsApp</a>
        </p>
      </td>
    </tr>
  </table>`;
}

/**
 * Tabla de detalles de reserva
 */
function generateBookingDetails(data: {
  className: string;
  classDate: string;
  classTime: string;
  instructor?: string;
}): string {
  return `
  <div style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><span style="color: #666;">Clase</span><br><strong style="font-size: 18px;">${data.className}</strong></td></tr>
      <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><span style="color: #666;">Fecha</span><br><strong>${formatDateReadable(data.classDate)}</strong></td></tr>
      <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><span style="color: #666;">Hora</span><br><strong>${data.classTime}</strong></td></tr>
      ${data.instructor ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><span style="color: #666;">Instructor</span><br><strong>${data.instructor}</strong></td></tr>` : ''}
      <tr><td style="padding: 10px 0;"><span style="color: #666;">Ubicación</span><br><strong>${LOCATION_ADDRESS}</strong><br><span style="color: #666;">${LOCATION_STREET}</span></td></tr>
    </table>
  </div>`;
}

// ============================================================================
// HTML GENERATION FUNCTIONS (for preview-email.ts)
// ============================================================================

interface ConfirmationHtmlData {
  firstName: string;
  className: string;
  classDate: string;
  classTime: string;
  managementUrl: string;
  calendarUrl: string;
  icsUrl: string;
  instructor?: string;
  category?: ClassCategory;
}

interface ReminderHtmlData {
  firstName: string;
  className: string;
  classDate: string;
  classTime: string;
  timeframe: string;
  managementUrl: string;
  calendarUrl: string;
  icsUrl: string;
  category?: ClassCategory;
}

interface CancellationHtmlData {
  firstName: string;
  className: string;
  classDate: string;
  classTime: string;
}

interface FeedbackHtmlData {
  firstName: string;
  className: string;
  classDate: string;
  feedbackToken: string;
}

/**
 * Genera HTML del email de confirmación (sin enviarlo)
 */
export function generateConfirmationEmailHtml(data: ConfirmationHtmlData): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${generatePreheader(`${data.firstName}, tu clase de ${data.className} está confirmada para el ${formatDateReadable(data.classDate)} a las ${data.classTime}. ¡Te esperamos!`)}
  ${generateHeader()}
  <div style="background: ${BRAND_GRADIENT}; color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 10px 0;">¡Reserva Confirmada!</h2>
    <p style="margin: 0; opacity: 0.9;">Tu clase de prueba está lista</p>
  </div>
  <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 15px 0;">Hola <strong>${data.firstName}</strong>,</p>
    <p style="margin: 0;">Tu reserva ha sido confirmada. Aquí están los detalles:</p>
  </div>
  ${generateBookingDetails({ className: data.className, classDate: data.classDate, classTime: data.classTime, instructor: data.instructor })}
  ${generateActionButtons({ managementUrl: data.managementUrl, mapUrl: GOOGLE_MAPS_URL, googleCalUrl: data.calendarUrl, icsUrl: data.icsUrl })}
  ${generateWhatToBringSection(data.category)}
  <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0; color: #856404;">
      <strong>⚠️ Política de cancelación:</strong><br>
      Recuerda que si no puedes asistir, tienes hasta <strong>1 hora antes</strong> del inicio
      de la clase para cancelar y reprogramar para otro día. Pasado ese tiempo, la clase contará
      como asistida y perderás el derecho a la clase de prueba gratuita.
    </p>
  </div>
  <div style="text-align: center; padding: 25px 0;">
    <p style="color: #666; font-size: 14px; margin: 0 0 15px 0;">¿No puedes asistir?</p>
    <a href="${data.managementUrl}" style="${BUTTON_SECONDARY}">Reprogramar / Cancelar Reserva</a>
  </div>
  ${generateFooter()}
</body></html>`;
}

/**
 * Genera HTML del email de recordatorio (sin enviarlo)
 */
export function generateReminderEmailHtml(data: ReminderHtmlData): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${generatePreheader(`${data.firstName}, tu clase de ${data.className} es ${data.timeframe} a las ${data.classTime}. ¡No olvides traer ropa cómoda!`)}
  ${generateHeader()}
  <div style="background: linear-gradient(135deg, #2e7d32 0%, #388e3c 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 10px 0;">📅 Recordatorio de clase</h2>
    <p style="margin: 0; opacity: 0.9;">Tu clase es ${data.timeframe}</p>
  </div>
  <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 15px 0;">Hola <strong>${data.firstName}</strong>,</p>
    <p style="margin: 0;">Te recordamos que ${data.timeframe} tienes tu clase de prueba:</p>
  </div>
  ${generateBookingDetails({ className: data.className, classDate: data.classDate, classTime: data.classTime })}

  <!-- PROMOCIÓN ESPECIAL 24H - justo después de info de clase -->
  <div style="background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_DARK} 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
    <p style="margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">💥 Promoción Especial 24h 💥</p>
    <h3 style="margin: 0 0 15px 0; font-size: 24px;">MATRÍCULA GRATIS</h3>
    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <p style="margin: 0; font-size: 14px;"><span style="text-decoration: line-through; opacity: 0.7;">ANTES 60€</span></p>
      <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold;">AHORA 0€</p>
    </div>
    <p style="margin: 0; font-size: 13px; opacity: 0.9; line-height: 1.5;">
      Oferta exclusiva para nuevos estudiantes.<br>
      Válida solo si te apuntas <strong>mañana después de tu clase de prueba</strong><br>
      y realizas el primer pago en efectivo.
    </p>
    <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.8;">
      💡 Tú te ahorras la matrícula... y nosotros las comisiones bancarias.<br>
      ¡Ganamos todos! Recibirás tu recibo al momento del alta.
    </p>
  </div>

  ${generateActionButtons({ managementUrl: data.managementUrl, mapUrl: GOOGLE_MAPS_URL, googleCalUrl: data.calendarUrl, icsUrl: data.icsUrl })}
  ${data.category ? generateWhatToBringSection(data.category) : ''}

  <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0; color: #856404;">
      <strong>⚠️ Política de cancelación:</strong><br>
      Recuerda que si no puedes asistir, tienes hasta <strong>1 hora antes</strong> del inicio
      de la clase para cancelar y reprogramar para otro día. Pasado ese tiempo, la clase contará
      como asistida y perderás el derecho a la clase de prueba gratuita.
    </p>
  </div>
  <div style="text-align: center; margin-bottom: 30px;">
    <p style="color: #666; margin-bottom: 15px;">¿Necesitas cambiar la fecha?</p>
    <a href="${data.managementUrl}" style="${BUTTON_SECONDARY}">
      Cancelar/Reprogramar
    </a>
  </div>
  ${generateFooter()}
</body></html>`;
}

/**
 * Genera HTML del email de cancelación (sin enviarlo)
 */
export function generateCancellationEmailHtml(data: CancellationHtmlData): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${generatePreheader(`Tu reserva ha sido cancelada. ¿Te arrepientes? Puedes reservar otra clase gratis cuando quieras.`)}
  ${generateHeader()}
  <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 15px 0; font-size: 18px;">¡Hola <strong>${data.firstName}</strong>!</p>
    <p style="margin: 0 0 15px 0;">¡Vaya! Sentimos que no puedas venir a la clase. 😔</p>
    <p style="margin: 0;">Tu clase de <strong>${data.className}</strong> del ${formatDateReadable(data.classDate)} a las ${data.classTime} ha sido cancelada y la plaza liberada para que otra persona pueda aprovecharla.</p>
  </div>
  <div style="background: #fff3e0; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 10px 0;"><strong>¿Te arrepientes?</strong> 😉</p>
    <p style="margin: 0;">Puedes reservar tu clase gratis cuando quieras, siempre que la promo siga activa y queden plazas.</p>
  </div>
  <div style="text-align: center; margin-bottom: 30px;">
    <a href="${BASE_URL}/es/reservas" style="${BUTTON_PRIMARY}">
      Reprogramar Clase
    </a>
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
</body></html>`;
}

/**
 * Genera HTML del email de feedback (sin enviarlo)
 */
export function generateFeedbackEmailHtml(data: FeedbackHtmlData): string {
  const feedbackBaseUrl = `${BASE_URL}/api/feedback?token=${data.feedbackToken}`;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${generatePreheader(`${data.firstName}, ¿qué tal tu clase? Cuéntanos con un click.`)}
  ${generateHeader()}
  <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 15px 0;">Hola <strong>${data.firstName}</strong>,</p>
    <p style="margin: 0;">¿Qué tal tu clase de <strong>${data.className}</strong> del ${formatDateReadable(data.classDate)}?</p>
    <p style="margin: 15px 0 0 0;">Cuéntanos con un click:</p>
  </div>

  <!-- Caritas clickeables -->
  <div style="text-align: center; margin-bottom: 30px;">
    <table align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td style="padding: 0 8px;">
          <a href="${feedbackBaseUrl}&rating=1" style="text-decoration: none; font-size: 40px; display: block;">😡</a>
        </td>
        <td style="padding: 0 8px;">
          <a href="${feedbackBaseUrl}&rating=2" style="text-decoration: none; font-size: 40px; display: block;">😟</a>
        </td>
        <td style="padding: 0 8px;">
          <a href="${feedbackBaseUrl}&rating=3" style="text-decoration: none; font-size: 40px; display: block;">😐</a>
        </td>
        <td style="padding: 0 8px;">
          <a href="${feedbackBaseUrl}&rating=4" style="text-decoration: none; font-size: 40px; display: block;">🙂</a>
        </td>
        <td style="padding: 0 8px;">
          <a href="${feedbackBaseUrl}&rating=5" style="text-decoration: none; font-size: 40px; display: block;">🤩</a>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; font-size: 12px; color: #999; padding-top: 5px;">1</td>
        <td style="text-align: center; font-size: 12px; color: #999; padding-top: 5px;">2</td>
        <td style="text-align: center; font-size: 12px; color: #999; padding-top: 5px;">3</td>
        <td style="text-align: center; font-size: 12px; color: #999; padding-top: 5px;">4</td>
        <td style="text-align: center; font-size: 12px; color: #999; padding-top: 5px;">5</td>
      </tr>
    </table>
    <p style="color: #666; font-size: 14px; margin-top: 15px;">Haz click en la carita que mejor represente tu experiencia</p>
  </div>

  <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">¿Quieres contarnos más?</p>
    <a href="${BASE_URL}/es/feedback-comentario?token=${data.feedbackToken}" style="${BUTTON_SECONDARY}">
      Dejar un comentario
    </a>
  </div>

  <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
    <p>¡Gracias por elegirnos! 💃🕺</p>
  </div>
  ${generateFooter()}
</body></html>`;
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Email de confirmación de reserva
 */
export async function sendBookingConfirmation(
  data: BookingEmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResend();

  const googleCalUrl = generateGoogleCalendarUrl({
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    classDateRaw: data.classDateRaw,
  });
  const icsUrl = generateIcsDataUrl({
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    classDateRaw: data.classDateRaw,
    eventId: data.eventId,
  });

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      replyTo: REPLY_TO,
      headers: EMAIL_HEADERS,
      subject: `Reserva confirmada: ${data.className}`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${generatePreheader(`${data.firstName}, tu clase de ${data.className} está confirmada para el ${formatDateReadable(data.classDate)} a las ${data.classTime}. ¡Te esperamos!`)}
  ${generateHeader()}
  <div style="background: ${BRAND_GRADIENT}; color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 10px 0;">¡Reserva Confirmada!</h2>
    <p style="margin: 0; opacity: 0.9;">Tu clase de prueba está lista</p>
  </div>
  <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 15px 0;">Hola <strong>${data.firstName}</strong>,</p>
    <p style="margin: 0;">Tu reserva ha sido confirmada. Aquí están los detalles:</p>
  </div>
  ${generateBookingDetails(data)}
  ${generateActionButtons({ managementUrl: data.managementUrl, mapUrl: data.mapUrl || GOOGLE_MAPS_URL, googleCalUrl, icsUrl })}
  ${generateWhatToBringSection(data.category)}
  <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0; color: #856404;">
      <strong>⚠️ Política de cancelación:</strong><br>
      Recuerda que si no puedes asistir, tienes hasta <strong>1 hora antes</strong> del inicio
      de la clase para cancelar y reprogramar para otro día. Pasado ese tiempo, la clase contará
      como asistida y perderás el derecho a la clase de prueba gratuita.
    </p>
  </div>
  <div style="text-align: center; padding: 25px 0;">
    <p style="color: #666; font-size: 14px; margin: 0 0 15px 0;">¿No puedes asistir?</p>
    <a href="${data.managementUrl}" style="${BUTTON_SECONDARY}">Reprogramar / Cancelar Reserva</a>
  </div>
  ${generateFooter()}
</body></html>`,
    });

    if (result.error) {
      // Queue for retry on API error
      queueEmailForRetry(
        'booking_confirmation',
        data as unknown as Record<string, unknown>,
        result.error.message
      ).catch(() => {});
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending booking confirmation email:', error);
    // Queue for retry on exception
    queueEmailForRetry(
      'booking_confirmation',
      data as unknown as Record<string, unknown>,
      errorMsg
    ).catch(() => {});
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Email de cancelación de reserva
 */
export async function sendCancellationEmail(
  data: CancellationEmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResend();

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
    <p style="margin: 0;">Tu clase de <strong>${data.className}</strong> ha sido cancelada y la plaza liberada para que otra persona pueda aprovecharla.</p>
  </div>
  <div style="background: #fff3e0; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 10px 0;"><strong>¿Te arrepientes?</strong> 😉</p>
    <p style="margin: 0;">Puedes reservar tu clase gratis cuando quieras, siempre que la promo siga activa y queden plazas.</p>
  </div>
  <div style="text-align: center; margin-bottom: 30px;">
    <a href="${data.bookingUrl}" style="${BUTTON_PRIMARY}">
      Reprogramar Clase
    </a>
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

    if (result.error) {
      // Queue for retry on API error
      queueEmailForRetry(
        'cancellation',
        data as unknown as Record<string, unknown>,
        result.error.message
      ).catch(() => {});
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending cancellation email:', error);
    // Queue for retry on exception
    queueEmailForRetry('cancellation', data as unknown as Record<string, unknown>, errorMsg).catch(
      () => {}
    );
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Email de recordatorio (48h o 24h antes)
 */
export async function sendReminderEmail(
  data: ReminderEmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResend();

  const is48h = data.reminderType === '48h';
  const timeText = is48h ? 'pasado mañana' : 'mañana';
  const headerText = is48h ? 'en 48 horas' : 'mañana';

  // Generate calendar URLs
  const googleCalUrl = generateGoogleCalendarUrl({
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    classDateRaw: data.classDateISO,
  });
  const icsUrl = generateIcsDataUrl({
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    classDateRaw: data.classDateISO,
    eventId: data.eventId,
  });

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      replyTo: REPLY_TO,
      headers: EMAIL_HEADERS,
      subject: `Recordatorio: Tu clase de ${data.className} es ${timeText}`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${generatePreheader(`${data.firstName}, tu clase de ${data.className} es ${timeText} a las ${data.classTime}. ¡No olvides traer ropa cómoda!`)}
  ${generateHeader()}
  <div style="background: linear-gradient(135deg, #2e7d32 0%, #388e3c 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 10px 0;">📅 Recordatorio de clase</h2>
    <p style="margin: 0; opacity: 0.9;">Tu clase es ${headerText}</p>
  </div>
  <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 15px 0;">Hola <strong>${data.firstName}</strong>,</p>
    <p style="margin: 0;">Te recordamos que ${timeText} tienes tu clase de prueba:</p>
  </div>
  ${generateBookingDetails({ className: data.className, classDate: data.classDate, classTime: data.classTime })}
  ${
    !is48h
      ? `
  <!-- PROMOCIÓN ESPECIAL 24H - justo después de info de clase -->
  <div style="background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_DARK} 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
    <p style="margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9;">💥 Promoción Especial 24h 💥</p>
    <h3 style="margin: 0 0 15px 0; font-size: 24px;">MATRÍCULA GRATIS</h3>
    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <p style="margin: 0; font-size: 14px;"><span style="text-decoration: line-through; opacity: 0.7;">ANTES 60€</span></p>
      <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold;">AHORA 0€</p>
    </div>
    <p style="margin: 0; font-size: 13px; opacity: 0.9; line-height: 1.5;">
      Oferta exclusiva para nuevos estudiantes.<br>
      Válida solo si te apuntas <strong>mañana después de tu clase de prueba</strong><br>
      y realizas el primer pago en efectivo.
    </p>
    <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.8;">
      💡 Tú te ahorras la matrícula... y nosotros las comisiones bancarias.<br>
      ¡Ganamos todos! Recibirás tu recibo al momento del alta.
    </p>
  </div>`
      : ''
  }
  ${generateActionButtons({ managementUrl: data.managementUrl, mapUrl: data.mapUrl || GOOGLE_MAPS_URL, googleCalUrl, icsUrl })}
  ${data.category ? generateWhatToBringSection(data.category) : ''}
  ${
    !is48h
      ? `
  <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0; color: #856404;">
      <strong>⚠️ Política de cancelación:</strong><br>
      Recuerda que si no puedes asistir, tienes hasta <strong>1 hora antes</strong> del inicio
      de la clase para cancelar y reprogramar para otro día. Pasado ese tiempo, la clase contará
      como asistida y perderás el derecho a la clase de prueba gratuita.
    </p>
  </div>`
      : ''
  }
  <div style="text-align: center; margin-bottom: 30px;">
    <p style="color: #666; margin-bottom: 15px;">¿Necesitas cambiar la fecha?</p>
    <a href="${data.managementUrl}" style="${BUTTON_SECONDARY}">
      Cancelar/Reprogramar
    </a>
  </div>
  ${generateFooter()}
</body></html>`,
    });

    if (result.error) {
      // Queue for retry on API error
      queueEmailForRetry(
        'reminder',
        data as unknown as Record<string, unknown>,
        result.error.message
      ).catch(() => {});
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending reminder email:', error);
    // Queue for retry on exception
    queueEmailForRetry('reminder', data as unknown as Record<string, unknown>, errorMsg).catch(
      () => {}
    );
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Email de feedback post-clase - simplificado
 * Pide al usuario que responda al email con su feedback
 * Sin caritas/ratings para reducir fricción
 */
export async function sendFeedbackEmail(
  data: FeedbackEmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResend();

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      replyTo: 'info@farrayscenter.com', // Las respuestas van directamente al admin
      headers: EMAIL_HEADERS,
      subject: `¿Qué tal tu clase de ${data.className}? 💃`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${generatePreheader(`${data.firstName}, ¿qué tal tu primera clase? Cuéntanos respondiendo a este email.`)}
  ${generateHeader()}

  <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
    <p style="margin: 0 0 20px 0; font-size: 18px;">Hola <strong>${data.firstName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">¿Cómo fue tu primera clase?</p>
    <p style="margin: 0;">Responde a este email con lo que quieras contarnos - lo que te gustó, lo que podemos mejorar, o simplemente un "todo bien" 😊</p>
  </div>

  <div style="background: #fff3e0; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
    <p style="margin: 0; color: #e65100; font-style: italic;">
      "Leo personalmente todos los mensajes"
    </p>
  </div>

  <div style="margin-bottom: 30px;">
    <p style="margin: 0;">Un abrazo,</p>
    <p style="margin: 10px 0 0 0;"><strong>El Director, Fábio</strong></p>
  </div>

  ${generateFooter()}
</body></html>`,
    });

    if (result.error) {
      // Queue for retry on API error
      queueEmailForRetry(
        'feedback',
        data as unknown as Record<string, unknown>,
        result.error.message
      ).catch(() => {});
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending feedback email:', error);
    // Queue for retry on exception
    queueEmailForRetry('feedback', data as unknown as Record<string, unknown>, errorMsg).catch(
      () => {}
    );
    return {
      success: false,
      error: errorMsg,
    };
  }
}

// ============================================================================
// NOTIFICACIÓN AL ADMIN
// ============================================================================

/**
 * Email addresses del admin para notificaciones de reservas
 * Se puede configurar via env var ADMIN_NOTIFICATION_EMAILS (comma-separated)
 * Default: info@farrayscenter.com
 */
const ADMIN_EMAIL = process.env['ADMIN_NOTIFICATION_EMAILS'] || 'info@farrayscenter.com';

// Parse multiple emails if comma-separated
const ADMIN_EMAILS = ADMIN_EMAIL.split(',')
  .map(e => e.trim())
  .filter(Boolean);

/**
 * Datos necesarios para notificar al admin de una nueva reserva
 */
interface AdminBookingNotificationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  className: string;
  classDate: string;
  classTime: string;
  category?: string;
  sourceUrl?: string;
}

/**
 * Envía notificación al admin cuando hay una nueva reserva
 *
 * IMPORTANTE: Esta función está diseñada para NO bloquear el flujo de reserva.
 * Si falla, solo se loguea el error pero la reserva continúa.
 *
 * @see BOOKING_WIDGET_ROADMAP_COMPLETE.md - Sección "Notificación de Reservas al Admin"
 */
export async function sendAdminBookingNotification(
  data: AdminBookingNotificationData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResend();

  // Log attempt for debugging
  console.log('[email] Attempting admin notification to:', ADMIN_EMAILS);

  try {
    // Don't use replyTo with potentially fake/invalid emails - can cause deliverability issues
    // Instead, include the email in the body where admin can copy it
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS, // Supports multiple emails
      // replyTo removed - fake emails in replyTo can cause spam/rejection issues
      headers: EMAIL_HEADERS,
      subject: `Nueva reserva: ${data.firstName} ${data.lastName} - ${data.className}`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${BRAND_GRADIENT}; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
    <h2 style="margin: 0;">🎉 Nueva Reserva de Clase de Prueba</h2>
  </div>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 15px 0; color: ${BRAND_PRIMARY};">👤 Datos del Cliente</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Nombre:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.firstName} ${data.lastName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}" style="color: ${BRAND_PRIMARY};">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Teléfono:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${data.phone}" style="color: ${BRAND_PRIMARY};">${data.phone}</a></td>
      </tr>
    </table>
  </div>

  <div style="background: #e8f5e9; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 15px 0; color: #2e7d32;">📅 Datos de la Clase</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #c8e6c9;"><strong>Clase:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #c8e6c9;">${data.className}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #c8e6c9;"><strong>Fecha:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #c8e6c9;">${formatDateReadable(data.classDate)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #c8e6c9;"><strong>Hora:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #c8e6c9;">${data.classTime}</td>
      </tr>
      ${data.category ? `<tr><td style="padding: 8px 0;"><strong>Categoría:</strong></td><td style="padding: 8px 0;">${data.category}</td></tr>` : ''}
    </table>
  </div>

  ${data.sourceUrl ? `<p style="color: #666; font-size: 12px;">Reserva desde: ${data.sourceUrl}</p>` : ''}

  <div style="text-align: center; margin-top: 20px;">
    <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" style="${BUTTON_PRIMARY}">
      Contactar por WhatsApp
    </a>
  </div>

  <p style="color: #999; font-size: 11px; text-align: center; margin-top: 30px;">
    Este email se genera automáticamente. Timestamp: ${new Date().toISOString()}
  </p>
</body></html>`,
    });

    if (result.error) {
      console.error('[email] ❌ Admin notification RESEND ERROR:', {
        error: result.error.message,
        name: result.error.name,
        to: ADMIN_EMAILS,
        from: FROM_EMAIL,
      });
      return { success: false, error: result.error.message };
    }

    console.log('[email] ✅ Admin notification sent successfully:', {
      id: result.data?.id,
      to: ADMIN_EMAILS,
      subject: `Nueva reserva: ${data.firstName} - ${data.className}`,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[email] ❌ Admin notification EXCEPTION:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Enviar email de prueba
 */
export async function sendTestEmail(
  to: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResend();

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      headers: EMAIL_HEADERS,
      subject: "Test de conexión - Farray's Center",
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 20px;">
  <h1 style="color: ${BRAND_PRIMARY};">Test de Email</h1>
  <p>Si recibes este email, la conexión con Resend funciona correctamente.</p>
  <p>Timestamp: ${new Date().toISOString()}</p>
  ${generateFooter()}
</body></html>`,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Verifica si el email está configurado
 */
export function isEmailConfigured(): boolean {
  return !!process.env['RESEND_API_KEY'];
}

// ============================================================================
// GENERIC EMAIL (for fichaje system)
// ============================================================================

export interface GenericEmailData {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envía un email genérico usando Resend
 * Usado por el sistema de fichaje para resúmenes mensuales y confirmaciones de firma
 */
export async function sendEmail(
  data: GenericEmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResend();

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      replyTo: REPLY_TO,
      headers: EMAIL_HEADERS,
      subject: data.subject,
      html: data.html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[sendEmail] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// SYSTEM ALERTS
// ============================================================================

/**
 * Rate limiting for alerts to prevent spam
 * Max 1 alert per error type per 5 minutes
 */
const alertCooldowns = new Map<string, number>();
const ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Send critical error alert to admin
 * Used for system errors that need immediate attention.
 *
 * Features:
 * - Rate limited: max 1 alert per error type every 5 minutes
 * - Non-blocking: failures don't affect the main flow
 * - Includes timestamp and error details
 *
 * @example
 * await sendSystemAlert({
 *   type: 'MOMENCE_API_DOWN',
 *   message: 'Momence API is not responding',
 *   details: { lastError: error.message, failureCount: 3 }
 * });
 */
export async function sendSystemAlert(data: {
  type: string;
  message: string;
  details?: Record<string, unknown>;
  severity?: 'warning' | 'critical';
}): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  // Check cooldown to prevent alert spam
  const lastAlert = alertCooldowns.get(data.type);
  const now = Date.now();

  if (lastAlert && now - lastAlert < ALERT_COOLDOWN_MS) {
    console.log(`[Alert] Skipped (cooldown): ${data.type}`);
    return { success: true, skipped: true };
  }

  try {
    const resend = getResend();
    const severity = data.severity || 'warning';
    const emoji = severity === 'critical' ? '🚨' : '⚠️';
    const bgColor = severity === 'critical' ? '#dc3545' : '#ffc107';
    const textColor = severity === 'critical' ? 'white' : '#333';

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      headers: EMAIL_HEADERS,
      subject: `${emoji} [${severity.toUpperCase()}] ${data.type} - Farray's System`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${bgColor}; color: ${textColor}; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
    <h2 style="margin: 0;">${emoji} System Alert: ${data.type}</h2>
  </div>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
    <p style="margin: 0 0 15px 0; font-size: 16px;"><strong>Mensaje:</strong></p>
    <p style="margin: 0; background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${bgColor};">
      ${data.message}
    </p>
  </div>

  ${
    data.details
      ? `
  <div style="background: #fff3e0; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
    <p style="margin: 0 0 15px 0; font-size: 16px;"><strong>Detalles:</strong></p>
    <pre style="margin: 0; background: white; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 12px;">${JSON.stringify(data.details, null, 2)}</pre>
  </div>
  `
      : ''
  }

  <p style="color: #999; font-size: 11px; text-align: center; margin-top: 30px;">
    Timestamp: ${new Date().toISOString()}<br>
    Environment: ${process.env['VERCEL_ENV'] || 'development'}
  </p>
</body></html>`,
    });

    if (result.error) {
      console.error('[Alert] Failed to send:', result.error.message);
      return { success: false, error: result.error.message };
    }

    // Update cooldown
    alertCooldowns.set(data.type, now);
    console.log(`[Alert] Sent: ${data.type}`);
    return { success: true };
  } catch (error) {
    console.error('[Alert] Error sending alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// LEAD WELCOME EMAIL
// ============================================================================

export interface LeadWelcomeEmailData {
  to: string;
  firstName: string;
  estilo?: string;
  locale?: string;
}

/**
 * Email de bienvenida para leads del formulario "Descubre cómo empezar"
 */
export async function sendLeadWelcomeEmail(
  data: LeadWelcomeEmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResend();
  const locale = data.locale || 'es';
  const horariosUrl = `${BASE_URL}/${locale}/horarios-precios?utm_source=email&utm_medium=lead_welcome&utm_campaign=descubre`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      replyTo: 'info@farrayscenter.com',
      headers: EMAIL_HEADERS,
      subject: `${data.firstName}, te estamos esperando 💃`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  ${generatePreheader('Reserva tu clase gratis y conócenos en persona - plazas limitadas por grupo')}
  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    ${generateHeader()}
    <div style="background: ${BRAND_GRADIENT}; color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0 0 10px 0; font-size: 24px;">¡Bienvenido/a, ${data.firstName}!</h1>
      <p style="margin: 0; opacity: 0.9;">Te estamos esperando</p>
    </div>
    <div style="padding: 30px;">
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        Elige el horario que mejor te venga y reserva tu clase de bienvenida gratis (plazas limitadas por grupo):
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${horariosUrl}" style="${BUTTON_PRIMARY}">
          👉 Ver Horarios y Reservar
        </a>
      </div>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          <strong>¿Ya lo tienes claro y quieres darte de alta o hacer una clase suelta?</strong><br>
          En la misma página pulsa "Hazte Socio".
        </p>
      </div>
      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          📱 <strong>¿Dudas?</strong> WhatsApp: <a href="${WHATSAPP_URL}" style="color: ${BRAND_PRIMARY}; text-decoration: none;">${WHATSAPP_NUMBER}</a>
        </p>
      </div>
      <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="margin: 0; color: #888; font-size: 13px;">
          ⭐ 4.9 en Google · +509 opiniones
        </p>
      </div>
    </div>
    ${generateFooter()}
  </div>
</body></html>`,
    });

    if (result.error) {
      console.error('[email] Lead welcome email error:', result.error.message);
      return { success: false, error: result.error.message };
    }

    console.log('[email] Lead welcome email sent:', { to: data.to, id: result.data?.id });
    return { success: true, id: result.data?.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[email] Lead welcome email exception:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Exportar constantes para uso externo
 */
export const EMAIL_CONFIG = {
  FROM_EMAIL,
  REPLY_TO,
  BRAND_PRIMARY,
  BRAND_DARK,
  BASE_URL,
  LOGO_URL,
  LOCATION_FULL,
  GOOGLE_MAPS_URL,
};

// =============================================================================
// NO-SHOW RESCHEDULE EMAIL
// =============================================================================

interface NoShowRescheduleEmailData {
  to: string;
  firstName: string;
  originalClassName: string;
  originalDate: string;
  originalTime: string;
  newClassName: string;
  newDate: string;
  newTime: string;
  managementUrl: string;
  reason: 'no_show' | 'manual' | 'class_cancelled' | 'cancelled_late';
}

/**
 * Send email when a trial class booking is rescheduled due to no-show.
 * Notifies the student that their class has been moved to next week.
 */
export async function sendNoShowRescheduleEmail(
  data: NoShowRescheduleEmailData
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();

  const subject =
    data.reason === 'class_cancelled'
      ? `Tu clase de ${data.newClassName} ha sido reprogramada`
      : `Hemos reprogramado tu clase de ${data.newClassName} 💃`;

  const introText =
    data.reason === 'class_cancelled'
      ? `Lamentablemente tu clase de <strong>${data.originalClassName}</strong> del ${data.originalDate} a las ${data.originalTime} ha sido cancelada.`
      : data.reason === 'cancelled_late'
        ? `Vemos que cancelaste tu clase de <strong>${data.originalClassName}</strong> del ${data.originalDate} a las ${data.originalTime} con poco tiempo de antelación.`
        : `Sentimos que no hayas podido asistir a tu clase de <strong>${data.originalClassName}</strong> del ${data.originalDate} a las ${data.originalTime}.`;

  const reasonText =
    data.reason === 'class_cancelled'
      ? 'Por eso, hemos reprogramado tu clase automáticamente para:'
      : 'Entendemos que surgen imprevistos, por eso <strong>de forma excepcional</strong> hemos reprogramado tu clase para:';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <!-- Header -->
    <tr>
      <td style="background: ${BRAND_GRADIENT}; padding: 30px 40px; text-align: center;">
        <img src="${LOGO_URL}" alt="Farray's Center" width="80" style="display: block; margin: 0 auto 10px;" />
        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600;">Clase Reprogramada</h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 40px;">
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hola <strong>${data.firstName}</strong>,
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          ${introText}
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          ${reasonText}
        </p>

        <!-- New Class Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #fef2f2; border-radius: 12px; margin: 24px 0; border-left: 4px solid ${BRAND_PRIMARY};">
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #666;">📅 <strong>Fecha:</strong> ${data.newDate}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #666;">🕐 <strong>Hora:</strong> ${data.newTime}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #666;">💃 <strong>Clase:</strong> ${data.newClassName}</p>
              <p style="margin: 0; font-size: 14px; color: #666;">📍 <strong>Lugar:</strong> ${LOCATION_FULL}</p>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #d97706; background: #fffbeb; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #d97706;">
          ⚠️ Esta reprogramación es <strong>excepcional y por única vez</strong>.
        </p>

        <p style="font-size: 15px; color: #333; line-height: 1.6; margin-top: 24px;">
          Si la semana que viene tampoco te va bien o <strong>prefieres probar otro estilo de baile</strong>,
          entra en tu reserva y cámbiala por la clase que mejor te encaje.
          Lo importante es que vengas a conocernos 😊
        </p>

        <!-- Action Buttons -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
          <tr>
            <td align="center">
              <a href="${data.managementUrl}" style="${BUTTON_PRIMARY}">
                Gestionar mi reserva
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 12px;">
              <a href="${BASE_URL}/es/horarios-precios" style="${BUTTON_SECONDARY}">
                🗓️ Ver todos los horarios
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 12px;">
              <a href="${GOOGLE_MAPS_URL}" style="${BUTTON_SECONDARY}">
                📍 Cómo llegar
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #999; line-height: 1.5;">
          Puedes cancelar o cambiar tu clase desde el enlace de tu reserva hasta 2 horas antes. Solo se permite un cambio por reserva.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background: #1a1a2e; padding: 30px 40px; text-align: center;">
        <p style="color: #ccc; font-size: 13px; margin: 0 0 8px;">
          ${LOCATION_FULL}
        </p>
        <p style="margin: 0;">
          <a href="${INSTAGRAM_URL}" style="color: ${BRAND_PRIMARY}; text-decoration: none; font-size: 13px;">Instagram</a>
          &nbsp;·&nbsp;
          <a href="${WHATSAPP_URL}" style="color: ${BRAND_PRIMARY}; text-decoration: none; font-size: 13px;">WhatsApp</a>
          &nbsp;·&nbsp;
          <a href="${BASE_URL}" style="color: ${BRAND_PRIMARY}; text-decoration: none; font-size: 13px;">Web</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      replyTo: REPLY_TO,
      headers: EMAIL_HEADERS,
      subject,
      html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    console.log(`[email] No-show reschedule email sent to ${data.to}`);
    return { success: true };
  } catch (error) {
    console.error('[sendNoShowRescheduleEmail] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// NO-SHOW FAILED (RESCHEDULE NOT POSSIBLE) EMAIL
// =============================================================================

interface NoShowFailedEmailData {
  to: string;
  firstName: string;
  className: string;
  classDate: string;
  classTime: string;
}

/**
 * Send email when a no-show is detected but automatic rescheduling failed
 * (class full, no availability next week, etc.).
 * Uses branded template consistent with the reschedule email.
 */
export async function sendNoShowFailedEmail(
  data: NoShowFailedEmailData
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();

  const subject = `Sentimos que no hayas podido venir a ${data.className}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <!-- Header -->
    <tr>
      <td style="background: ${BRAND_GRADIENT}; padding: 30px 40px; text-align: center;">
        <img src="${LOGO_URL}" alt="Farray's Center" width="80" style="display: block; margin: 0 auto 10px;" />
        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600;">Te esperamos</h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 40px;">
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hola <strong>${data.firstName}</strong>,
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Sentimos que no hayas podido asistir a tu clase de <strong>${data.className}</strong> del ${data.classDate} a las ${data.classTime}.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hemos intentado reprogramar tu clase automáticamente, pero no hay disponibilidad la semana que viene.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          ¡No te preocupes! Puedes reservar otra clase de prueba gratuita en el horario que mejor te venga:
        </p>

        <!-- Action Buttons -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
          <tr>
            <td align="center">
              <a href="${BASE_URL}/es/horarios-precios" style="${BUTTON_PRIMARY}">
                Reservar otra clase
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 12px;">
              <a href="${WHATSAPP_URL}" style="${BUTTON_SECONDARY}">
                Contactar por WhatsApp
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 12px;">
              <a href="${GOOGLE_MAPS_URL}" style="${BUTTON_SECONDARY}">
                📍 Cómo llegar
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size: 15px; color: #333; line-height: 1.6;">
          Lo importante es que vengas a conocernos 😊
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background: #1a1a2e; padding: 30px 40px; text-align: center;">
        <p style="color: #ccc; font-size: 13px; margin: 0 0 8px;">
          ${LOCATION_FULL}
        </p>
        <p style="margin: 0;">
          <a href="${INSTAGRAM_URL}" style="color: ${BRAND_PRIMARY}; text-decoration: none; font-size: 13px;">Instagram</a>
          &nbsp;·&nbsp;
          <a href="${WHATSAPP_URL}" style="color: ${BRAND_PRIMARY}; text-decoration: none; font-size: 13px;">WhatsApp</a>
          &nbsp;·&nbsp;
          <a href="${BASE_URL}" style="color: ${BRAND_PRIMARY}; text-decoration: none; font-size: 13px;">Web</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      replyTo: REPLY_TO,
      headers: EMAIL_HEADERS,
      subject,
      html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    console.log(`[email] No-show failed email sent to ${data.to}`);
    return { success: true };
  } catch (error) {
    console.error('[sendNoShowFailedEmail] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// RE-EXPORT GOOGLE CALENDAR (Bundler Compatibility)
// =============================================================================
/**
 * Re-exportamos google-calendar desde aquí para forzar al bundler de Vercel
 * a incluirlo. Sin esta re-exportación, google-calendar.ts no se incluye
 * porque no tiene dependencias npm externas.
 *
 * Los archivos API pueden importar de ./lib/google-calendar directamente,
 * pero gracias a esta re-exportación, el archivo se incluirá en el bundle.
 */
export * from './google-calendar.js';
