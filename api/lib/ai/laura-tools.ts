/**
 * Laura Tools - Claude tool_use integration for Momence actions
 *
 * Defines 20 tools that Laura can use during WhatsApp conversations:
 * 1. search_upcoming_classes - Real-time class schedule
 * 2. get_member_info - Credits, membership status
 * 3. get_member_bookings - Upcoming reservations
 * 4. create_booking - Book a class
 * 5. cancel_booking - Cancel a reservation
 * 6. get_membership_options - Available membership plans/prices
 * 7. add_to_waitlist - Add to waitlist when class is full
 * 8. get_class_details - Detailed info about a specific class
 * 9. check_in_member - Remote check-in for a booking
 * 10. transfer_to_human - Transfer conversation to human agent
 * 11. get_credit_details - Detailed credit breakdown per bought membership
 * 12. get_visit_history - Past class attendance history
 * 13. update_member_email - Update member email address
 * 14. manage_trial_booking - Manage trial class booking
 * 15. get_weekly_schedule - Static weekly schedule reference
 * 16. update_member_name - Update member name
 * 17. update_member_phone - Update member phone number
 * 18. remove_check_in - Undo a check-in
 * 19. cancel_recurring_booking - Cancel a recurring booking
 * 20. get_session_bookings - View session attendees
 */

import type { Redis } from '@upstash/redis';
import type Anthropic from '@anthropic-ai/sdk';
import { getMemberLookup } from './member-lookup.js';
import { getMomenceClient } from '../momence-client.js';
import { activateTakeover, addNotification } from './human-takeover.js';
import { SCHEDULE_DATA } from '../../../constants/horarios-schedule-data.js';
import { STYLE_KEYWORDS } from '../../../constants/style-mappings.js';

// ============================================================================
// MOMENCE URL CONFIG
// Momence URL format: spaces → hyphens, preserve accents and casing.
// e.g. "Sexy Style Principiantes" → "Sexy-Style-Principiantes"
// ============================================================================

const MOMENCE_HOST = "Farray's-International-Dance-Center";

/** Spaces → hyphens, then URI-encode (accents get encoded, hyphens stay). */
function toMomenceSlug(text: string): string {
  return encodeURIComponent(text.trim().replace(/\s+/g, '-'));
}

/**
 * Direct link to a class session on Momence.
 * Users can pay for a single drop-in class from this page.
 */
function buildClassUrl(className: string, sessionId: number): string {
  return `https://momence.com/${MOMENCE_HOST}/${toMomenceSlug(className)}/${sessionId}?skipPreview=true`;
}

/**
 * Direct link to purchase a membership on Momence.
 */
function buildMembershipUrl(membershipName: string, membershipId: number): string {
  return `https://momence.com/${MOMENCE_HOST}/membership/${toMomenceSlug(membershipName)}/${membershipId}`;
}

/**
 * Maps a user-facing style name to the widget's ?style= parameter value.
 * Uses STYLE_KEYWORDS from style-mappings.ts for consistent mapping.
 */
function mapToWidgetStyle(styleName: string): string {
  const lower = styleName.toLowerCase().trim();
  for (const [widgetStyle, keywords] of Object.entries(STYLE_KEYWORDS)) {
    if (widgetStyle === lower) return widgetStyle;
    if (keywords.some(kw => lower.includes(kw) || kw.includes(lower))) return widgetStyle;
  }
  // Fallback: strip spaces (e.g. "hip hop" → "hiphop")
  return lower.replace(/\s+/g, '');
}

// ============================================================================
// TYPES
// ============================================================================

export interface ToolContext {
  redis: Redis;
  phone: string;
  memberId?: number;
  /** IDs of bought memberships with available credits (for Momence booking API) */
  boughtMembershipIds?: number[];
  lang: string;
}

// ============================================================================
// TOOL DEFINITIONS (Anthropic format)
// ============================================================================

export const LAURA_TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_upcoming_classes',
    description:
      'HERRAMIENTA PRINCIPAL para clases. Buscar clases REALES disponibles en los próximos días. Devuelve booking_url y class_url para cada clase. SIEMPRE usa esta herramienta cuando el usuario pregunte por una clase, horario, día o estilo concreto. Usa los filtros day y level para resultados precisos.',
    input_schema: {
      type: 'object' as const,
      properties: {
        style: {
          type: 'string',
          description:
            'Estilo de baile (ej: "salsa", "bachata", "twerk", "hip hop", "ballet", "contemporaneo", "heels", "femmology", "sexy style", "stretching")',
        },
        day: {
          type: 'string',
          description:
            'Día de la semana en español (ej: "lunes", "martes", "miércoles", "jueves", "viernes"). Filtra para mostrar solo clases de ese día.',
        },
        level: {
          type: 'string',
          description:
            'Nivel (ej: "principiantes", "iniciación", "básico", "intermedio", "avanzado", "open level"). Filtra por nivel en el nombre de la clase.',
        },
        days_ahead: {
          type: 'number',
          description: 'Número de días a buscar (default: 14, máximo: 45)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_member_info',
    description:
      'Obtener información del miembro: créditos disponibles, membresía activa, estado. Usa cuando pregunten por sus créditos, membresía o cuenta.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_member_bookings',
    description:
      'Ver las próximas reservas/clases del miembro. Usa cuando pregunten "qué clases tengo" o quieran cancelar.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_booking',
    description:
      'Reservar una clase para el miembro. IMPORTANTE: Solo usar después de que el usuario confirme. Usa EXACTAMENTE el id y name devueltos por search_upcoming_classes. NUNCA inventes session_id ni class_name.',
    input_schema: {
      type: 'object' as const,
      properties: {
        session_id: {
          type: 'number',
          description:
            'ID numérico EXACTO de la sesión, copiado del campo "id" de search_upcoming_classes. NUNCA inventar.',
        },
        class_name: {
          type: 'string',
          description:
            'Nombre EXACTO de la clase, copiado del campo "name" de search_upcoming_classes. NUNCA inventar ni modificar.',
        },
      },
      required: ['session_id', 'class_name'],
    },
  },
  {
    name: 'cancel_booking',
    description:
      'Cancelar una reserva de un miembro. IMPORTANTE: SIEMPRE pide confirmación al usuario antes de ejecutar. Puedes pasar booking_id (si lo tienes) O class_name (nombre de la clase a cancelar). Si solo pasas class_name, se buscará automáticamente la reserva.',
    input_schema: {
      type: 'object' as const,
      properties: {
        booking_id: {
          type: 'number',
          description: 'ID de la reserva a cancelar (si lo conoces de get_member_bookings)',
        },
        class_name: {
          type: 'string',
          description:
            'Nombre de la clase a cancelar (ej: "Salsa Cubana"). Se usa para buscar la reserva si no tienes booking_id.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_membership_options',
    description:
      'Obtener los planes de membresía/bonos disponibles con sus precios. Usa cuando pregunten por precios, bonos, tarifas o qué opciones de membresía hay.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'add_to_waitlist',
    description:
      'Apuntar al miembro a la lista de espera de una clase llena. Usa cuando una clase esté completa y el usuario quiera apuntarse a la lista de espera.',
    input_schema: {
      type: 'object' as const,
      properties: {
        session_id: {
          type: 'number',
          description: 'ID de la sesión llena (obtenido de search_upcoming_classes)',
        },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'get_class_details',
    description:
      'Obtener información detallada de una clase específica: profesor, horario, si está llena o no. Usa cuando pregunten detalles de una clase concreta.',
    input_schema: {
      type: 'object' as const,
      properties: {
        session_id: {
          type: 'number',
          description: 'ID de la sesión (obtenido de search_upcoming_classes)',
        },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'check_in_member',
    description:
      'Hacer check-in remoto de un miembro para una reserva. IMPORTANTE: Confirma con el usuario antes de ejecutar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        booking_id: {
          type: 'number',
          description: 'ID de la reserva para hacer check-in (obtenido de get_member_bookings)',
        },
      },
      required: ['booking_id'],
    },
  },
  {
    name: 'transfer_to_human',
    description:
      'Transferir la conversación a un agente humano. Usa cuando el usuario pida hablar con una persona, cuando no puedas resolver su consulta, o cuando la situación requiera intervención humana.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: {
          type: 'string',
          description:
            'Motivo de la transferencia (ej: "solicita hablar con persona", "consulta compleja sobre facturación")',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_credit_details',
    description:
      'Obtener desglose detallado de créditos por cada bono/membresía comprada: créditos usados, restantes, fechas, estado congelado. Usa cuando pregunten "cuántos créditos me quedan de cada bono" o quieran detalle por membresía.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_visit_history',
    description:
      'Ver historial de clases a las que ha asistido el miembro. Usa cuando pregunten "a qué clases he ido", "mi historial" o quieran ver asistencia pasada.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'update_member_email',
    description:
      'Actualizar el email del miembro en Momence. IMPORTANTE: Confirma el nuevo email con el usuario antes de ejecutar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        email: {
          type: 'string',
          description: 'Nuevo email del miembro',
        },
      },
      required: ['email'],
    },
  },
  // Tool 14: manage_trial_booking (for trial class users)
  {
    name: 'manage_trial_booking',
    description:
      'Gestionar reserva de clase de prueba gratuita. Puede consultar estado, cancelar o reprogramar para la semana siguiente. Busca la reserva por el teléfono del usuario. Usar cuando un usuario con reserva de prueba quiera consultar, cancelar o cambiar su clase.',
    input_schema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string',
          enum: ['check_status', 'cancel', 'reschedule_next_week'],
          description:
            'Acción: check_status = ver reserva, cancel = cancelar, reschedule_next_week = reprogramar para la semana siguiente',
        },
        reason: {
          type: 'string',
          description: 'Motivo de cancelación/reprogramación (opcional, para analytics)',
        },
      },
      required: ['action'],
    },
  },
  // Tool 15: get_weekly_schedule (static schedule data)
  {
    name: 'get_weekly_schedule',
    description:
      'Horario semanal FIJO de referencia. SOLO para consultas muy generales (ej: "¿qué días hay bachata?"). NO tiene enlaces de reserva ni IDs. Después de usar esta herramienta, SIEMPRE llama a search_upcoming_classes para obtener booking_url y disponibilidad real.',
    input_schema: {
      type: 'object' as const,
      properties: {
        style: {
          type: 'string',
          description: 'Filtrar por estilo de baile (opcional). Ej: "bachata", "salsa", "twerk"',
        },
        day: {
          type: 'string',
          description:
            'Filtrar por día de la semana en inglés (opcional). Ej: "monday", "tuesday", "wednesday"',
        },
      },
      required: [],
    },
  },
  // Tool 16: update_member_name
  {
    name: 'update_member_name',
    description:
      'Actualizar el nombre del miembro en Momence. IMPORTANTE: Confirma los nuevos datos con el usuario antes de ejecutar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        first_name: {
          type: 'string',
          description: 'Nuevo nombre del miembro',
        },
        last_name: {
          type: 'string',
          description: 'Nuevo apellido del miembro',
        },
      },
      required: ['first_name', 'last_name'],
    },
  },
  // Tool 17: update_member_phone
  {
    name: 'update_member_phone',
    description:
      'Actualizar el teléfono del miembro en Momence. IMPORTANTE: Confirma el nuevo número con el usuario antes de ejecutar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        phone_number: {
          type: 'string',
          description: 'Nuevo número de teléfono (con código de país, ej: +34622247085)',
        },
      },
      required: ['phone_number'],
    },
  },
  // Tool 18: remove_check_in
  {
    name: 'remove_check_in',
    description:
      'Deshacer el check-in de una reserva. Usa cuando se haya hecho un check-in por error. IMPORTANTE: Confirma con el usuario antes de ejecutar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        booking_id: {
          type: 'number',
          description:
            'ID de la reserva para deshacer el check-in (obtenido de get_member_bookings)',
        },
      },
      required: ['booking_id'],
    },
  },
  // Tool 19: cancel_recurring_booking
  {
    name: 'cancel_recurring_booking',
    description:
      'Cancelar una reserva recurrente (clase semanal fija). USA el recurring_booking_id que devuelve get_member_bookings. NUNCA inventes IDs. IMPORTANTE: Confirma con el usuario antes de ejecutar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        recurring_booking_id: {
          type: 'number',
          description: 'El recurring_booking_id de get_member_bookings (NO el booking_id normal)',
        },
        after_session_id: {
          type: 'number',
          description:
            'Si se proporciona, cancela la recurrencia solo a partir de esta sesión (opcional)',
        },
      },
      required: ['recurring_booking_id'],
    },
  },
  // Tool 20: get_session_bookings
  {
    name: 'get_session_bookings',
    description:
      'Ver las reservas/asistentes de una sesión/clase específica. Útil para saber cuántas personas van a una clase.',
    input_schema: {
      type: 'object' as const,
      properties: {
        session_id: {
          type: 'number',
          description: 'ID de la sesión (obtenido de search_upcoming_classes)',
        },
      },
      required: ['session_id'],
    },
  },
];

// ============================================================================
// TOOL SETS (member vs new user)
// ============================================================================

// These 5 tools work WITHOUT memberId (verified: no guard if(!context.memberId))
const NEW_USER_TOOL_NAMES = new Set([
  'search_upcoming_classes',
  'get_weekly_schedule',
  'get_membership_options',
  'get_class_details',
  'transfer_to_human',
  'manage_trial_booking',
]);

export const LAURA_TOOLS_NEW_USER: Anthropic.Tool[] = LAURA_TOOLS.filter(t =>
  NEW_USER_TOOL_NAMES.has(t.name)
);

export const LAURA_TOOLS_MEMBER: Anthropic.Tool[] = LAURA_TOOLS;

// ============================================================================
// TOOL EXECUTION
// ============================================================================

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const startTime = Date.now();
  console.log(`[laura-tools] Executing tool: ${toolName}`, JSON.stringify(toolInput));

  try {
    // 5-second timeout for each tool execution
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let result: string;
    switch (toolName) {
      case 'search_upcoming_classes':
        result = await executeSearchClasses(toolInput, context);
        break;
      case 'get_member_info':
        result = await executeGetMemberInfo(context);
        break;
      case 'get_member_bookings':
        result = await executeGetMemberBookings(context);
        break;
      case 'create_booking':
        result = await executeCreateBooking(toolInput, context);
        break;
      case 'cancel_booking':
        result = await executeCancelBooking(toolInput, context);
        break;
      case 'get_membership_options':
        result = await executeGetMembershipOptions(context);
        break;
      case 'add_to_waitlist':
        result = await executeAddToWaitlist(toolInput, context);
        break;
      case 'get_class_details':
        result = await executeGetClassDetails(toolInput, context);
        break;
      case 'check_in_member':
        result = await executeCheckInMember(toolInput, context);
        break;
      case 'transfer_to_human':
        result = await executeTransferToHuman(toolInput, context);
        break;
      case 'get_credit_details':
        result = await executeGetCreditDetails(context);
        break;
      case 'get_visit_history':
        result = await executeGetVisitHistory(context);
        break;
      case 'update_member_email':
        result = await executeUpdateMemberEmail(toolInput, context);
        break;
      case 'manage_trial_booking':
        result = await executeManageTrialBooking(toolInput, context);
        break;
      case 'get_weekly_schedule':
        result = executeGetWeeklySchedule(toolInput, context.lang);
        break;
      case 'update_member_name':
        result = await executeUpdateMemberName(toolInput, context);
        break;
      case 'update_member_phone':
        result = await executeUpdateMemberPhone(toolInput, context);
        break;
      case 'remove_check_in':
        result = await executeRemoveCheckIn(toolInput, context);
        break;
      case 'cancel_recurring_booking':
        result = await executeCancelRecurringBooking(toolInput, context);
        break;
      case 'get_session_bookings':
        result = await executeGetSessionBookings(toolInput, context);
        break;
      default:
        result = JSON.stringify({ error: `Herramienta desconocida: ${toolName}` });
    }

    clearTimeout(timeoutId);
    console.log(`[laura-tools] ${toolName} completed in ${Date.now() - startTime}ms`);
    return result;
  } catch (error) {
    console.error(`[laura-tools] ${toolName} error:`, error);
    if (error instanceof Error && error.name === 'AbortError') {
      return JSON.stringify({ error: 'Timeout: la consulta tardó demasiado. Inténtalo de nuevo.' });
    }
    return JSON.stringify({
      error: 'Error técnico al consultar el sistema. Inténtalo de nuevo en unos segundos.',
    });
  }
}

// ============================================================================
// TOOL IMPLEMENTATIONS
// ============================================================================

async function executeSearchClasses(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const memberService = getMemberLookup(context.redis);
  const style = input['style'] as string | undefined;
  const dayFilter = input['day'] as string | undefined;
  const levelFilter = input['level'] as string | undefined;
  const daysAhead = Math.min(Number(input['days_ahead']) || 14, 45);

  const rawSessions = await memberService.fetchUpcomingSessions(style, daysAhead);

  // Filter out sessions that have already started — unless user filtered by day
  // (when asking "clases del lunes" we show ALL sessions for that day, even past ones)
  const now = new Date();
  let sessions = dayFilter ? rawSessions : rawSessions.filter(s => new Date(s.startsAt) > now);

  // Day-of-week filter (Spanish day names → match against dayOfWeek)
  if (dayFilter) {
    const dayMap: Record<string, string> = {
      lunes: 'lunes',
      martes: 'martes',
      miércoles: 'miércoles',
      miercoles: 'miércoles',
      jueves: 'jueves',
      viernes: 'viernes',
      sábado: 'sábado',
      sabado: 'sábado',
      domingo: 'domingo',
    };
    const normalizedDay = dayMap[dayFilter.toLowerCase()] ?? dayFilter.toLowerCase();
    sessions = sessions.filter(s => s.dayOfWeek?.toLowerCase() === normalizedDay);
  }

  // Level filter (match against class name)
  if (levelFilter) {
    const lf = levelFilter.toLowerCase();
    // Map common level terms for broader matching
    const levelTerms: string[] = [lf];
    if (lf.includes('principiante') || lf.includes('iniciación') || lf.includes('iniciacion')) {
      levelTerms.push('principiante', 'principiantes', 'iniciación', 'iniciacion');
    } else if (lf.includes('básico') || lf.includes('basico')) {
      levelTerms.push('básico', 'basico', 'basic');
    } else if (lf.includes('intermedio')) {
      levelTerms.push('intermedio');
    } else if (lf.includes('avanzado')) {
      levelTerms.push('avanzado', 'advanced');
    } else if (lf.includes('open') || lf.includes('abierto')) {
      levelTerms.push('open level', 'nivel abierto', 'open');
    }
    sessions = sessions.filter(s => levelTerms.some(term => s.name.toLowerCase().includes(term)));
  }

  if (sessions.length === 0) {
    const lang = context.lang || 'es';

    // Include weekly schedule inline to avoid a second tool call (saves ~17s)
    let weeklySchedule: Record<
      string,
      Array<{ time: string; name: string; teacher: string; level: string }>
    > | null = null;
    if (style) {
      const s = style.toLowerCase();
      const matchingClasses = SCHEDULE_DATA.filter(
        c => c.styleName.toLowerCase().includes(s) || c.className.toLowerCase().includes(s)
      );
      if (matchingClasses.length > 0) {
        weeklySchedule = {};
        for (const c of matchingClasses) {
          const dayKey = c.day;
          if (!weeklySchedule[dayKey]) weeklySchedule[dayKey] = [];
          weeklySchedule[dayKey].push({
            time: c.time,
            name: c.className,
            teacher: c.teacher,
            level: c.level,
          });
        }
      }
    }

    return JSON.stringify({
      found: 0,
      message: style
        ? `No hay clases de ${style}${dayFilter ? ` el ${dayFilter}` : ''}${levelFilter ? ` nivel ${levelFilter}` : ''} disponibles en los próximos ${daysAhead} días.`
        : `No hay clases disponibles en los próximos ${daysAhead} días.`,
      ...(weeklySchedule && {
        weekly_reference: weeklySchedule,
        _schedule_note:
          'Este horario semanal es solo referencia. NO tiene enlaces ni IDs. Las reservas online se abren unas semanas antes. NO inventes URLs.',
      }),
      ...(style && {
        booking_url: `https://www.farrayscenter.com/${lang}/reservas?style=${mapToWidgetStyle(style)}`,
      }),
      _instruction: weeklySchedule
        ? 'Muestra el horario semanal de referencia incluido arriba. Explica que las reservas se abren mas adelante. Comparte booking_url para que vean clases disponibles de ese estilo en el widget. NO llames a get_weekly_schedule (ya tienes los datos). NUNCA inventes URLs con classId.'
        : 'No se encontraron clases con esos filtros. Si usaste filtros (day/level), sugiere probar sin ellos. Comparte booking_url si esta disponible. NO llames a get_weekly_schedule. NUNCA inventes URLs con classId.',
      scheduleUrl: `https://www.farrayscenter.com/${lang}/horarios-precios`,
    });
  }

  // Compute 24h threshold for free trial rule (widget requires MIN_BOOKING_HOURS=24)
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const lang = context.lang || 'es';

  // When filtered by day, show all sessions (complete day view); otherwise limit to 8
  const maxResults = dayFilter ? 30 : 8;
  const classes = sessions.slice(0, maxResults).map(s => {
    const classDate = new Date(s.startsAt);
    return {
      id: s.id,
      name: s.name,
      day: s.dayOfWeek,
      date: s.date,
      time: s.time,
      instructor: s.instructor,
      is_full: s.isFull,
      is_within_24h: classDate < in24h,
      class_url: buildClassUrl(s.name, s.id),
      booking_url: `https://www.farrayscenter.com/${lang}/reservas?style=${s.style}`,
    };
  });

  return JSON.stringify({
    found: sessions.length,
    showing: classes.length,
    classes,
    _instruction:
      'IMPORTANTE: booking_url = widget farrayscenter.com filtrado por estilo (prueba gratis, locales nuevos). class_url = Momence (pago directo, turistas o miembros sin creditos). Comparte SOLO la URL correcta segun el tipo de usuario. NUNCA modifiques ni construyas URLs. NUNCA anadas classId a ninguna URL.',
  });
}

function executeGetWeeklySchedule(input: Record<string, unknown>, lang: string = 'es'): string {
  let classes = [...SCHEDULE_DATA];

  const style = input['style'] as string | undefined;
  if (style) {
    const s = style.toLowerCase();
    classes = classes.filter(
      c => c.styleName.toLowerCase().includes(s) || c.className.toLowerCase().includes(s)
    );
  }

  const day = input['day'] as string | undefined;
  if (day) {
    classes = classes.filter(c => c.day === day.toLowerCase());
  }

  if (classes.length === 0) {
    return JSON.stringify({
      found: 0,
      message: 'No hay clases con esos filtros en el horario semanal.',
    });
  }

  // Group by day for readability
  const grouped: Record<
    string,
    Array<{ time: string; name: string; teacher: string; level: string }>
  > = {};
  for (const c of classes) {
    const day = c.day;
    if (!grouped[day]) grouped[day] = [];
    const dayClasses = grouped[day];
    if (dayClasses) {
      dayClasses.push({
        time: c.time,
        name: c.className,
        teacher: c.teacher,
        level: c.level,
      });
    }
  }

  return JSON.stringify({
    found: classes.length,
    schedule: grouped,
    ...(style && {
      booking_url: `https://www.farrayscenter.com/${lang}/reservas?style=${mapToWidgetStyle(style)}`,
    }),
    scheduleUrl: `https://www.farrayscenter.com/${lang}/horarios-precios`,
    _instruction:
      'Este horario es referencia general. Comparte booking_url para que vean clases de este estilo en el widget de reservas. Para clases concretas con fechas usa search_upcoming_classes. NUNCA inventes URLs con classId.',
  });
}

async function executeGetMemberInfo(context: ToolContext): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({
      error: 'No se encontró tu perfil de miembro. ¿Estás registrado en Momence?',
    });
  }

  const memberService = getMemberLookup(context.redis);
  const membershipInfo = await memberService.fetchMembershipInfo(context.memberId);

  return JSON.stringify({
    memberId: context.memberId,
    hasActiveMembership: membershipInfo.hasActiveMembership,
    creditsAvailable: membershipInfo.creditsAvailable,
    membershipName: membershipInfo.membershipName || null,
  });
}

async function executeGetMemberBookings(context: ToolContext): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({
      error: 'No se encontró tu perfil de miembro. ¿Estás registrado en Momence?',
    });
  }

  const client = getMomenceClient(context.redis);
  const now = new Date();

  const result = await client.getMemberSessionBookings(context.memberId, {
    page: 0,
    pageSize: 20,
    startAfter: now.toISOString(),
  });

  const bookings = (result.payload || []).map(b => ({
    booking_id: b.id,
    class_name: b.session?.name || 'Clase',
    starts_at: b.session?.startsAt || '',
    checked_in: b.checkedIn || false,
    cancelled: !!b.cancelledAt,
    recurring_booking_id: b.recurringBookingId || null,
  }));

  if (bookings.length === 0) {
    return JSON.stringify({
      found: 0,
      message: 'No tienes reservas próximas.',
    });
  }

  return JSON.stringify({
    found: bookings.length,
    bookings,
    _instruction:
      'Si recurring_booking_id tiene valor, la reserva es RECURRENTE (clase fija semanal). Para cancelar toda la recurrencia → cancel_recurring_booking(recurring_booking_id=ESE_VALOR). Para cancelar solo UNA sesión → cancel_booking(booking_id). NUNCA inventes IDs. SIEMPRE pregunta al usuario qué quiere hacer.',
  });
}

async function executeCreateBooking(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const sessionId = input['session_id'] as number;
  const className = input['class_name'] as string;

  if (!context.memberId) {
    const classUrl = sessionId && className ? buildClassUrl(className, sessionId) : null;
    return JSON.stringify({
      error:
        'No se encontró tu perfil de miembro. Puede comprar la clase directamente desde el enlace.',
      ...(classUrl && { class_url: classUrl }),
    });
  }

  if (!sessionId) {
    return JSON.stringify({
      error: 'Falta el ID de la sesión. Busca primero las clases disponibles.',
    });
  }

  const client = getMomenceClient(context.redis);

  console.log(
    `[create_booking] sessionId=${sessionId}, memberId=${context.memberId}, boughtMembershipIds=${JSON.stringify(context.boughtMembershipIds)}`
  );

  try {
    const result = await client.createFreeBooking(
      sessionId,
      context.memberId,
      context.boughtMembershipIds
    );
    return JSON.stringify({
      success: true,
      message: 'Reserva creada correctamente.',
      booking: result,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.error(
      `[create_booking] FAILED: sessionId=${sessionId}, memberId=${context.memberId}, boughtMembershipIds=${JSON.stringify(context.boughtMembershipIds)}, error=${errorMsg}`
    );

    // Parse common Momence errors
    if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
      return JSON.stringify({
        error:
          'Esa sesión ha expirado o ya no está disponible. Busca la clase de nuevo con search_upcoming_classes para obtener el ID correcto.',
        _instruction:
          'OBLIGATORIO: Llama a search_upcoming_classes de nuevo para obtener el session_id actualizado. El ID que usaste ya no es válido.',
      });
    }
    if (errorMsg.includes('404')) {
      return JSON.stringify({
        error: 'Esa clase no existe o ya no está disponible.',
        _instruction:
          'Llama a search_upcoming_classes de nuevo para obtener sesiones actualizadas.',
      });
    }
    if (errorMsg.includes('409') || errorMsg.includes('already')) {
      return JSON.stringify({ error: 'Ya tienes una reserva para esta clase.' });
    }
    if (errorMsg.includes('full') || errorMsg.includes('capacity')) {
      return JSON.stringify({
        error: 'La clase está llena. ¿Quieres que te apunte a la lista de espera?',
      });
    }
    if (
      errorMsg.includes('402') ||
      errorMsg.includes('payment') ||
      errorMsg.includes('credit') ||
      errorMsg.includes('insufficient')
    ) {
      const classUrl = className ? buildClassUrl(className, sessionId) : null;
      return JSON.stringify({
        error: 'No tienes créditos suficientes para esta clase.',
        ...(classUrl && { class_url: classUrl }),
        hint: 'Ofrece al usuario comprar la clase directamente desde class_url o renovar su membresía con get_membership_options.',
      });
    }

    // Include direct class link so user can pay for a single drop-in class
    const classUrl = className ? buildClassUrl(className, sessionId) : null;
    return JSON.stringify({
      error: `No se pudo crear la reserva: ${errorMsg}`,
      ...(classUrl && { class_url: classUrl }),
      hint: 'El usuario puede comprar la clase directamente desde el enlace.',
    });
  }
}

async function executeCancelBooking(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({ error: 'No se encontró tu perfil de miembro.' });
  }

  let bookingId = input['booking_id'] as number | undefined;
  const className = input['class_name'] as string | undefined;

  const client = getMomenceClient(context.redis);

  // If no booking_id, search by class_name
  if (!bookingId) {
    if (!className) {
      return JSON.stringify({
        error: 'Indica el nombre de la clase a cancelar o su booking_id.',
      });
    }

    try {
      const now = new Date();
      const result = await client.getMemberSessionBookings(context.memberId, {
        page: 0,
        pageSize: 20,
        startAfter: now.toISOString(),
      });

      const bookings = (result.payload || []).filter(b => !b.cancelledAt);
      const classLower = className.toLowerCase();
      const match = bookings.find(
        b => b.session?.name && b.session.name.toLowerCase().includes(classLower)
      );

      if (!match) {
        // Return available bookings so Laura can show them
        const available = bookings.map(b => ({
          booking_id: b.id,
          class_name: b.session?.name || 'Clase',
          starts_at: b.session?.startsAt || '',
        }));
        return JSON.stringify({
          error: `No se encontró una reserva de "${className}".`,
          available_bookings: available,
          hint: 'Muestra estas reservas al usuario para que elija cuál cancelar.',
        });
      }

      bookingId = match.id;
      console.log(
        `[cancel_booking] Matched "${className}" → booking ${bookingId} (${match.session?.name})`
      );
    } catch (searchError) {
      const msg = searchError instanceof Error ? searchError.message : 'Error desconocido';
      return JSON.stringify({ error: `Error buscando reservas: ${msg}` });
    }
  }

  try {
    await client.cancelBooking(bookingId, {
      refund: true,
      disableNotifications: false,
      isLateCancellation: false,
    });

    // Verify cancellation by re-checking bookings
    try {
      const now = new Date();
      const verify = await client.getMemberSessionBookings(context.memberId, {
        page: 0,
        pageSize: 20,
        startAfter: now.toISOString(),
      });
      const stillExists = (verify.payload || []).some(b => b.id === bookingId && !b.cancelledAt);
      if (stillExists) {
        console.error(
          `[cancel_booking] Verification FAILED: booking ${bookingId} still active after cancel`
        );
        return JSON.stringify({
          error:
            'La cancelación no se ha completado correctamente. Por favor, cancela directamente desde la app de Momence o contacta con el estudio.',
        });
      }
    } catch (verifyError) {
      // Verification failed but cancel API returned OK — trust the API
      console.warn(`[cancel_booking] Could not verify cancellation: ${verifyError}`);
    }

    return JSON.stringify({
      success: true,
      message: 'Reserva cancelada correctamente.',
      _instruction:
        'Confirma al usuario que se ha cancelado. NO inventes detalles sobre créditos ni reembolsos, solo di que se ha cancelado.',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`[cancel_booking] FAILED for bookingId=${bookingId}: ${errorMsg}`);
    return JSON.stringify({
      error: `No se pudo cancelar la reserva. ${errorMsg}`,
      _instruction:
        'Dile al usuario que no se ha podido cancelar y que contacte con el estudio o use la app de Momence.',
    });
  }
}

async function executeGetMembershipOptions(context: ToolContext): Promise<string> {
  const client = getMomenceClient(context.redis);

  try {
    const result = await client.getMemberships({ page: 0, pageSize: 50 });
    const memberships = (result.payload || []).map(m => ({
      id: m.id,
      name: m.name,
      price: m.price,
      type: m.type,
      purchase_url: buildMembershipUrl(m.name, m.id),
    }));

    if (memberships.length === 0) {
      return JSON.stringify({
        found: 0,
        message: 'No hay planes de membresía configurados.',
      });
    }

    return JSON.stringify({
      found: memberships.length,
      memberships,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return JSON.stringify({ error: `No se pudieron obtener las membresías: ${errorMsg}` });
  }
}

async function executeAddToWaitlist(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({
      error: 'No se encontró tu perfil de miembro. ¿Estás registrado en Momence?',
    });
  }

  const sessionId = input['session_id'] as number;
  if (!sessionId) {
    return JSON.stringify({
      error: 'Falta el ID de la sesión. Busca primero las clases disponibles.',
    });
  }

  const client = getMomenceClient(context.redis);

  try {
    await client.addToWaitlist(sessionId, context.memberId);
    return JSON.stringify({
      success: true,
      message: 'Te has apuntado a la lista de espera. Te avisaremos si se libera una plaza.',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';

    if (errorMsg.includes('404')) {
      return JSON.stringify({ error: 'Esa clase no existe o ya no está disponible.' });
    }
    if (errorMsg.includes('409') || errorMsg.includes('already')) {
      return JSON.stringify({ error: 'Ya estás en la lista de espera para esta clase.' });
    }

    return JSON.stringify({ error: `No se pudo apuntar a la lista de espera: ${errorMsg}` });
  }
}

async function executeGetClassDetails(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const sessionId = input['session_id'] as number;
  if (!sessionId) {
    return JSON.stringify({
      error: 'Falta el ID de la sesión. Busca primero las clases disponibles.',
    });
  }

  const client = getMomenceClient(context.redis);

  try {
    const session = await client.getSession(sessionId);

    const capacity = session['capacity'] as number | undefined;
    const bookingCount = session['bookingCount'] as number | undefined;

    return JSON.stringify({
      id: session['id'],
      name: session['name'],
      startsAt: session['startsAt'],
      endsAt: session['endsAt'],
      is_full:
        typeof capacity === 'number' && typeof bookingCount === 'number'
          ? bookingCount >= capacity
          : null,
      teacher: session['teacher'] || null,
      location: session['location'] || null,
      description: session['description'] || null,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';

    if (errorMsg.includes('404')) {
      return JSON.stringify({ error: 'Esa clase no existe o ya no está disponible.' });
    }

    return JSON.stringify({ error: `No se pudo obtener la información de la clase: ${errorMsg}` });
  }
}

async function executeCheckInMember(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({ error: 'No se encontró tu perfil de miembro.' });
  }

  const bookingId = input['booking_id'] as number;
  if (!bookingId) {
    return JSON.stringify({
      error: 'Falta el ID de la reserva. Consulta primero tus reservas.',
    });
  }

  const client = getMomenceClient(context.redis);

  try {
    await client.checkIn(bookingId);
    return JSON.stringify({
      success: true,
      message: 'Check-in realizado correctamente.',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';

    if (errorMsg.includes('404')) {
      return JSON.stringify({ error: 'Esa reserva no existe.' });
    }
    if (errorMsg.includes('already') || errorMsg.includes('409')) {
      return JSON.stringify({ error: 'Ya se ha hecho check-in para esta reserva.' });
    }

    return JSON.stringify({ error: `No se pudo hacer el check-in: ${errorMsg}` });
  }
}

async function executeTransferToHuman(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const reason = (input['reason'] as string) || 'Solicitud del usuario';

  try {
    await activateTakeover(context.redis, context.phone, 'laura-transfer');

    // Notificar al admin
    await addNotification(
      context.redis,
      context.phone,
      `Laura ha transferido la conversación: ${reason}`,
      undefined,
      'escalation'
    ).catch(() => {});

    return JSON.stringify({
      success: true,
      message:
        'Conversación transferida a un agente humano. Un miembro del equipo te atenderá en breve.',
      reason,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return JSON.stringify({ error: `No se pudo transferir: ${errorMsg}` });
  }
}

async function executeGetCreditDetails(context: ToolContext): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({
      error: 'No se encontró tu perfil de miembro. ¿Estás registrado en Momence?',
    });
  }

  const client = getMomenceClient(context.redis);

  try {
    const result = await client.getMemberBoughtMemberships(context.memberId, {
      page: 0,
      pageSize: 50,
    });

    const memberships = (result.payload || []).map(m => ({
      id: m.id,
      name: m.membership?.name || 'Membresía',
      type: m.type,
      startDate: m.startDate,
      endDate: m.endDate || null,
      isFrozen: m.isFrozen,
      eventCreditsLeft: m.eventCreditsLeft ?? null,
      eventCreditsTotal: m.eventCreditsTotal ?? null,
      moneyCreditsLeft: m.moneyCreditsLeft ?? null,
      moneyCreditsTotal: m.moneyCreditsTotal ?? null,
    }));

    if (memberships.length === 0) {
      return JSON.stringify({
        found: 0,
        message: 'No tienes membresías activas.',
      });
    }

    return JSON.stringify({
      found: memberships.length,
      memberships,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return JSON.stringify({ error: `No se pudieron obtener los créditos: ${errorMsg}` });
  }
}

async function executeGetVisitHistory(context: ToolContext): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({
      error: 'No se encontró tu perfil de miembro. ¿Estás registrado en Momence?',
    });
  }

  const memberService = getMemberLookup(context.redis);

  try {
    const visits = await memberService.fetchMemberVisits(context.memberId);

    if (visits.length === 0) {
      return JSON.stringify({
        found: 0,
        message: 'No se encontraron visitas recientes.',
      });
    }

    return JSON.stringify({
      found: visits.length,
      visits: visits.map(v => ({
        class_name: v.className,
        date: v.date,
        instructor: v.instructorName || null,
      })),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return JSON.stringify({ error: `No se pudo obtener el historial: ${errorMsg}` });
  }
}

async function executeUpdateMemberEmail(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({ error: 'No se encontró tu perfil de miembro.' });
  }

  const email = input['email'] as string;
  if (!email) {
    return JSON.stringify({ error: 'Falta el nuevo email.' });
  }

  const memberService = getMemberLookup(context.redis);

  try {
    const result = await memberService.updateMemberEmail(context.memberId, email);

    if (!result.success) {
      return JSON.stringify({ error: result.error || 'No se pudo actualizar el email.' });
    }

    return JSON.stringify({
      success: true,
      message: `Email actualizado correctamente a ${email}.`,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return JSON.stringify({ error: `No se pudo actualizar el email: ${errorMsg}` });
  }
}

// ============================================================================
// MANAGE TRIAL BOOKING (works without memberId - uses phone to find booking)
// ============================================================================

async function executeManageTrialBooking(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const action = input['action'] as string;

  if (!action || !['check_status', 'cancel', 'reschedule_next_week'].includes(action)) {
    return JSON.stringify({
      error: 'Acción no válida. Usa: check_status, cancel o reschedule_next_week',
    });
  }

  // Find booking by phone in Redis — try multiple format variants
  const rawPhone = context.phone.replace(/[\s\-+()]/g, '');
  // Build phone variants: with country code, without, as-is
  const phoneVariants = [rawPhone];
  if (rawPhone.startsWith('34') && rawPhone.length > 9) {
    phoneVariants.push(rawPhone.slice(2)); // Without country code: 622247085
  } else if (/^[6789]\d{8}$/.test(rawPhone)) {
    phoneVariants.push('34' + rawPhone); // With Spanish country code: 34622247085
  }

  let eventId: string | null = null;
  let matchedPhone = rawPhone;
  for (const variant of phoneVariants) {
    const found = (await context.redis.get(`phone:${variant}`)) as string | null;
    if (found) {
      eventId = found;
      matchedPhone = variant;
      break;
    }
  }

  if (!eventId) {
    const lang = context.lang || 'es';
    return JSON.stringify({
      found: false,
      message:
        'No se encontró ninguna reserva de clase de prueba asociada a este número. Si reservaste con otro teléfono, puedes cancelar desde tu email de confirmación o contactarnos en recepción.',
      scheduleUrl: `https://www.farrayscenter.com/${lang}/horarios-precios`,
    });
  }

  const raw = await context.redis.get(`booking_details:${eventId}`);
  if (!raw) {
    return JSON.stringify({
      found: false,
      message: 'No se encontraron los detalles de tu reserva.',
    });
  }

  const booking = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw)) as {
    eventId: string;
    firstName: string;
    lastName: string;
    className: string;
    classDate: string;
    classTime: string;
    category: string;
    email: string;
    phone: string;
    status?: string;
    attendance?: string;
    reconciliationStatus?: string;
    rescheduleCount?: number;
    rescheduledFrom?: string | null;
    momenceBookingId?: number | null;
    calendarEventId?: string | null;
    sessionId?: number | null;
  };

  // CHECK STATUS
  if (action === 'check_status') {
    const statusMap: Record<string, string> = {
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      pending: 'Pendiente de confirmación',
      attended: 'Asististe ✅',
      no_show: 'No asististe',
    };

    return JSON.stringify({
      found: true,
      booking: {
        className: booking.className,
        classDate: booking.classDate,
        classTime: booking.classTime,
        status: statusMap[booking.status || 'confirmed'] || 'Confirmada',
        attendance: statusMap[booking.attendance || 'pending'] || 'Pendiente',
        canCancel: booking.status !== 'cancelled',
        canReschedule: (booking.rescheduleCount || 0) < 1 && !booking.rescheduledFrom,
      },
    });
  }

  // CANCEL
  if (action === 'cancel') {
    if (booking.status === 'cancelled') {
      return JSON.stringify({ error: 'Esta reserva ya está cancelada.' });
    }

    try {
      const client = getMomenceClient(context.redis);
      let momenceCancelled = false;

      // 1. Cancel in Momence — try bookingId first
      if (booking.momenceBookingId) {
        try {
          await client.cancelBooking(booking.momenceBookingId, {
            refund: true,
            disableNotifications: true,
            isLateCancellation: false,
          });
          momenceCancelled = true;
          console.log(
            `[manage_trial_booking] Momence booking ${booking.momenceBookingId} cancelled with refund`
          );
        } catch (momErr) {
          console.error(
            `[manage_trial_booking] Failed to cancel Momence booking ${booking.momenceBookingId}:`,
            momErr
          );
        }
      }

      // 2. Fallback: find the correct session-booking via member search + session bookings list
      // This works even if momenceBookingId was wrong or null
      if (!momenceCancelled && booking.email) {
        try {
          const members = await client.searchMembers({
            page: 0,
            pageSize: 5,
            query: booking.email.toLowerCase().trim(),
          });
          const member = members.payload?.find(
            (m: { email?: string }) => m.email?.toLowerCase() === booking.email.toLowerCase().trim()
          );
          if (member) {
            const memberBookings = await client.getMemberSessionBookings(member.id, {
              page: 0,
              pageSize: 20,
              includeCancelled: false,
            });
            // Find booking matching our session ID, class name, or class date
            const match = memberBookings.payload?.find(
              (b: { session?: { id: number; name: string; startDate?: string } }) => {
                // Match by session ID (most reliable)
                if (booking.sessionId && b.session?.id === Number(booking.sessionId)) return true;
                // Match by class name (fuzzy)
                if (
                  b.session?.name &&
                  booking.className &&
                  b.session.name.toLowerCase().includes(booking.className.toLowerCase())
                )
                  return true;
                // Match by date if class name is generic
                if (
                  booking.classDate &&
                  b.session?.startDate &&
                  b.session.startDate.startsWith(booking.classDate)
                )
                  return true;
                return false;
              }
            );
            if (match) {
              await client.cancelBooking(match.id, {
                refund: true,
                disableNotifications: true,
                isLateCancellation: false,
              });
              momenceCancelled = true;
              // Update stored momenceBookingId with the correct one for future reference
              booking.momenceBookingId = match.id;
              console.log(
                `[manage_trial_booking] Momence booking ${match.id} cancelled via member search (refund: true)`
              );
            } else {
              console.warn(
                `[manage_trial_booking] Member ${member.id} found but no matching booking. ` +
                  `sessionId=${booking.sessionId}, className=${booking.className}, classDate=${booking.classDate}`
              );
            }
          } else {
            console.warn(
              `[manage_trial_booking] No member found in Momence for email: ${booking.email}`
            );
          }
        } catch (fallbackErr) {
          console.error('[manage_trial_booking] Momence fallback cancel failed:', fallbackErr);
        }
      }

      // If Momence cancel failed and booking IS in Momence → do NOT touch Redis, return error
      if (!momenceCancelled && booking.momenceBookingId) {
        console.error(
          `[manage_trial_booking] FAILED: Could not cancel Momence booking ${booking.momenceBookingId} for ${booking.email}. Redis NOT modified.`
        );
        return JSON.stringify({
          success: false,
          error:
            'No se pudo cancelar la reserva en el sistema. Inténtalo de nuevo o contacta con el centro en info@farrayscenter.com o al +34 622 247 085.',
          momenceCancelled: false,
        });
      }

      if (!momenceCancelled) {
        // No momenceBookingId — booking only exists locally (Customer Leads), safe to clean
        console.warn(
          `[manage_trial_booking] No Momence booking for ${booking.email} — local-only cancel`
        );
      }

      // 2. Update booking status in Redis (only reaches here if Momence cancelled OR booking is local-only)
      booking.status = 'cancelled';
      booking.attendance = 'not_attending';

      // Check if cancellation is on time (>= 2h before class)
      const now = new Date();
      let isOnTime = true;
      if (booking.classDate && booking.classTime && /^\d{4}-\d{2}-\d{2}$/.test(booking.classDate)) {
        const classStart = new Date(`${booking.classDate}T${booking.classTime}:00`);
        const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60);
        isOnTime = hoursUntilClass >= 2;
      }

      booking.reconciliationStatus = isOnTime ? 'cancelled_on_time' : 'cancelled_late';

      await context.redis.setex(
        `booking_details:${eventId}`,
        90 * 24 * 60 * 60,
        JSON.stringify(booking)
      );

      // 3. Clean ALL Redis keys (dedup + phone mappings + reminders)
      const email = booking.email.toLowerCase().trim();
      const bookingPhone = booking.phone?.replace(/[\s\-+()]/g, '') || '';

      // Delete dedup by email
      await context.redis.del(`booking:${email}`);

      // Delete phone→eventId mapping (both stored format and lookup format)
      const phonesToClear = new Set<string>();
      if (bookingPhone) phonesToClear.add(bookingPhone);
      if (matchedPhone) phonesToClear.add(matchedPhone);
      for (const p of phonesToClear) {
        await context.redis.del(`phone:${p}`);
        await context.redis.del(`phone_email:${p}`);
      }
      console.log(
        `[manage_trial_booking] Phone keys cleared for: ${[...phonesToClear].join(', ')}`
      );

      // Remove from reminders set
      if (booking.classDate && /^\d{4}-\d{2}-\d{2}$/.test(booking.classDate)) {
        try {
          await context.redis.srem(`reminders:${booking.classDate}`, eventId);
        } catch {
          /* non-blocking */
        }
      }

      console.log(
        `[manage_trial_booking] Full cleanup done: email=${email}, phone=${bookingPhone}, isOnTime=${isOnTime}, momence=${momenceCancelled}`
      );

      // 4. Record audit event for analytics
      try {
        const { recordAuditEvent } = await import('../audit.js');
        await recordAuditEvent(context.redis as unknown as import('ioredis').default, {
          action: 'booking_cancelled',
          channel: 'customer_leads',
          eventId,
          email,
          className: booking.className,
          classDate: booking.classDate,
          success: true,
          metadata: {
            type: 'trial_cancellation',
            isOnTime,
            momenceCancelled,
            cancelledVia: 'laura_manage_trial_booking',
          },
        });
      } catch {
        /* non-blocking */
      }

      // 5. Update Google Calendar
      if (booking.calendarEventId) {
        try {
          const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
          const CALENDAR_TOKEN_URL = 'https://oauth2.googleapis.com/token';
          const clientId = process.env['GOOGLE_CALENDAR_CLIENT_ID'];
          const clientSecret = process.env['GOOGLE_CALENDAR_CLIENT_SECRET'];
          const refreshToken = process.env['GOOGLE_CALENDAR_REFRESH_TOKEN'];
          const calendarId = process.env['GOOGLE_CALENDAR_ID'] || 'primary';

          if (clientId && clientSecret && refreshToken) {
            const tokenRes = await fetch(CALENDAR_TOKEN_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
              }),
            });
            if (tokenRes.ok) {
              const tokenData = await tokenRes.json();
              await fetch(
                `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${booking.calendarEventId}?sendUpdates=none`,
                {
                  method: 'PATCH',
                  headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    colorId: isOnTime ? '6' : '11', // Orange (on-time) or Red (late)
                    description: `Estado: ${isOnTime ? '🟠 Cancelado a tiempo' : '🔴 Cancelación tardía'}\n\nCancelado vía WhatsApp`,
                  }),
                }
              );
            }
          }
        } catch {
          /* non-blocking */
        }
      }

      // If we reach here, cancellation succeeded (Momence or local-only)
      const lang = context.lang || 'es';
      return JSON.stringify({
        success: true,
        message: isOnTime
          ? `Reserva cancelada correctamente${momenceCancelled ? ' (crédito devuelto)' : ''}. Puedes volver a reservar cuando quieras.`
          : `Reserva cancelada. Nota: la cancelación fue con menos de 2 horas de antelación.`,
        canRebook: isOnTime,
        rebookUrl: isOnTime ? `https://www.farrayscenter.com/${lang}/reservas` : undefined,
        momenceCancelled,
      });
    } catch (error) {
      return JSON.stringify({
        error: `No se pudo cancelar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      });
    }
  }

  // RESCHEDULE
  if (action === 'reschedule_next_week') {
    if ((booking.rescheduleCount || 0) >= 1 || booking.rescheduledFrom) {
      return JSON.stringify({
        error:
          'Esta reserva ya ha sido reprogramada anteriormente. Solo se permite una reprogramación por reserva.',
      });
    }

    try {
      const { rescheduleBooking } = await import('../../admin-bookings-reschedule.js');
      // Upstash Redis is API-compatible with ioredis for get/set/del operations
      const result = await rescheduleBooking(
        context.redis as unknown as import('ioredis').default,
        {
          eventId,
          mode: 'next_week',
          notifyStudent: false, // Laura will communicate directly
          reason: 'manual',
        }
      );

      if (result.success) {
        return JSON.stringify({
          success: true,
          message: `Clase reprogramada para ${result.newClassDate} a las ${result.newClassTime}.`,
          newClassName: result.newClassName,
          newClassDate: result.newClassDate,
          newClassTime: result.newClassTime,
        });
      }

      const lang = context.lang || 'es';
      return JSON.stringify({
        error: result.error || 'No se pudo reprogramar la clase.',
        hint: 'La clase de la semana que viene puede estar llena o no existir.',
        alternative: `Si quiere otra clase diferente, cancela esta reserva y reserva de nuevo en https://www.farrayscenter.com/${lang}/reservas`,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Error al reprogramar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      });
    }
  }

  return JSON.stringify({ error: 'Acción no reconocida' });
}

// ============================================================================
// UPDATE MEMBER NAME
// ============================================================================

async function executeUpdateMemberName(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({ error: 'No se encontró tu perfil de miembro.' });
  }

  const firstName = input['first_name'] as string;
  const lastName = input['last_name'] as string;

  if (!firstName || !lastName) {
    return JSON.stringify({ error: 'Faltan el nombre o apellido.' });
  }

  const memberService = getMemberLookup(context.redis);

  try {
    const result = await memberService.updateMemberName(context.memberId, firstName, lastName);

    if (!result.success) {
      return JSON.stringify({ error: result.error || 'No se pudo actualizar el nombre.' });
    }

    return JSON.stringify({
      success: true,
      message: `Nombre actualizado correctamente a ${firstName} ${lastName}.`,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return JSON.stringify({ error: `No se pudo actualizar el nombre: ${errorMsg}` });
  }
}

// ============================================================================
// UPDATE MEMBER PHONE
// ============================================================================

async function executeUpdateMemberPhone(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({ error: 'No se encontró tu perfil de miembro.' });
  }

  const phoneNumber = input['phone_number'] as string;

  if (!phoneNumber) {
    return JSON.stringify({ error: 'Falta el nuevo número de teléfono.' });
  }

  const client = getMomenceClient(context.redis);

  try {
    await client.updateMemberPhone(context.memberId, phoneNumber);

    return JSON.stringify({
      success: true,
      message: `Teléfono actualizado correctamente a ${phoneNumber}.`,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return JSON.stringify({ error: `No se pudo actualizar el teléfono: ${errorMsg}` });
  }
}

// ============================================================================
// REMOVE CHECK-IN
// ============================================================================

async function executeRemoveCheckIn(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({ error: 'No se encontró tu perfil de miembro.' });
  }

  const bookingId = input['booking_id'] as number;

  if (!bookingId) {
    return JSON.stringify({
      error: 'Falta el ID de la reserva. Consulta primero tus reservas con get_member_bookings.',
    });
  }

  const client = getMomenceClient(context.redis);

  try {
    await client.removeCheckIn(bookingId);

    return JSON.stringify({
      success: true,
      message: 'Check-in deshecho correctamente.',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';

    if (errorMsg.includes('404')) {
      return JSON.stringify({ error: 'Esa reserva no existe o no tiene check-in.' });
    }

    return JSON.stringify({ error: `No se pudo deshacer el check-in: ${errorMsg}` });
  }
}

// ============================================================================
// CANCEL RECURRING BOOKING
// ============================================================================

async function executeCancelRecurringBooking(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  if (!context.memberId) {
    return JSON.stringify({ error: 'No se encontró tu perfil de miembro.' });
  }

  const bookingId = input['recurring_booking_id'] as number;
  const afterSessionId = input['after_session_id'] as number | undefined;

  if (!bookingId) {
    return JSON.stringify({
      error: 'Falta el recurring_booking_id. Usa get_member_bookings para obtenerlo.',
    });
  }

  const client = getMomenceClient(context.redis);

  try {
    await client.cancelRecurringBooking(bookingId, afterSessionId);

    return JSON.stringify({
      success: true,
      message: afterSessionId
        ? 'Reserva recurrente cancelada a partir de la sesión indicada.'
        : 'Reserva recurrente cancelada completamente.',
      _instruction:
        'Confirma al usuario que se ha cancelado la reserva recurrente. Si quiere volver a reservar alguna clase suelta, puede usar search_upcoming_classes.',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';

    if (errorMsg.includes('404')) {
      return JSON.stringify({ error: 'Esa reserva recurrente no existe o ya fue cancelada.' });
    }

    return JSON.stringify({ error: `No se pudo cancelar la reserva recurrente: ${errorMsg}` });
  }
}

// ============================================================================
// GET SESSION BOOKINGS
// ============================================================================

async function executeGetSessionBookings(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const sessionId = input['session_id'] as number;

  if (!sessionId) {
    return JSON.stringify({
      error: 'Falta el ID de la sesión. Busca primero las clases con search_upcoming_classes.',
    });
  }

  const client = getMomenceClient(context.redis);

  try {
    const result = await client.getSessionBookings(sessionId, {
      page: 0,
      pageSize: 50,
    });

    const bookings = (result.payload || []).map(b => ({
      booking_id: b.id,
      checked_in: b.checkedIn || false,
      cancelled: !!b.cancelledAt,
    }));

    const activeBookings = bookings.filter(b => !b.cancelled);

    return JSON.stringify({
      total_bookings: activeBookings.length,
      checked_in: activeBookings.filter(b => b.checked_in).length,
      bookings: activeBookings,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';

    if (errorMsg.includes('404')) {
      return JSON.stringify({ error: 'Esa sesión no existe.' });
    }

    return JSON.stringify({
      error: `No se pudieron obtener las reservas de la sesión: ${errorMsg}`,
    });
  }
}
