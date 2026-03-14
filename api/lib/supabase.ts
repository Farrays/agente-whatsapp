/**
 * Supabase Client
 *
 * Cliente configurado para:
 * - Sistema de fichaje de profesores (RD-ley 8/2019, Art. 34.9 ET)
 * - CRM de leads omnicanal (WhatsApp, Instagram, Voz, Web)
 *
 * @see https://supabase.com/docs/reference/javascript
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// DATABASE TYPES
// ============================================================================

/**
 * Profesor - Datos del trabajador para fichaje
 */
export interface Profesor {
  id: string;
  nombre: string;
  apellidos: string | null;
  dni: string | null;
  email: string | null;
  telefono_whatsapp: string;
  nombre_momence: string;

  // Datos contractuales (obligatorio legalmente para tiempo parcial)
  tipo_contrato: 'parcial' | 'completo';
  coeficiente_parcialidad: number | null;
  horas_semanales_contrato: number | null;

  activo: boolean;
  fecha_alta: string;
  fecha_baja: string | null;

  created_at: string;
  updated_at: string;
}

/**
 * Fichaje - Registro de jornada laboral
 * Cumple requisitos legales: hora exacta entrada/salida, modalidad, tipo horas
 */
export interface Fichaje {
  id: string;
  profesor_id: string;

  // Identificación clase
  clase_momence_id: number | null;
  clase_nombre: string;

  // DATOS OBLIGATORIOS LEGALMENTE
  fecha: string; // YYYY-MM-DD
  hora_inicio: string | null; // HH:MM:SS
  hora_fin: string | null;

  // Pausas
  pausa_inicio: string | null;
  pausa_fin: string | null;

  // Modalidad (obligatorio 2026)
  modalidad: 'presencial' | 'remoto';

  // Tipo de horas
  tipo_horas: 'ordinarias' | 'extraordinarias' | 'complementarias';

  // Horas calculadas
  minutos_trabajados: number | null;

  // Estado del fichaje
  estado:
    | 'pendiente'
    | 'entrada_registrada'
    | 'completado'
    | 'no_fichado'
    | 'editado_admin'
    | 'clase_cancelada';

  // Trazabilidad (OBLIGATORIO para inmutabilidad legal)
  metodo_entrada: 'whatsapp' | 'manual' | 'qr' | 'auto_momence' | null;
  metodo_salida: 'whatsapp' | 'manual' | 'qr' | 'auto_momence' | null;
  whatsapp_msg_id_entrada: string | null;
  whatsapp_msg_id_salida: string | null;
  timestamp_entrada: string | null;
  timestamp_salida: string | null;

  // Auditoría
  created_at: string;
  updated_at: string;
  editado_por: string | null;
  motivo_edicion: string | null;
}

/**
 * Registro de auditoría (OBLIGATORIO para trazabilidad legal)
 */
export interface FichajeAuditLog {
  id: string;
  fichaje_id: string;
  accion: 'crear' | 'editar' | 'eliminar' | 'cancelar';
  campo_modificado: string | null;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  usuario_id: string | null;
  ip_address: string | null;
  timestamp: string;
}

/**
 * Configuración del sistema de fichaje
 */
export interface ConfiguracionFichaje {
  id: number;
  minutos_antes_clase: number;
  minutos_despues_clase: number;
  umbral_pausa_minutos: number;
  timezone: string;
  notificar_no_fichados: boolean;
  email_admin: string | null;
}

/**
 * Resumen mensual para firma digital (tiempo parcial)
 */
export interface ResumenMensual {
  id: string;
  profesor_id: string;
  mes: string; // YYYY-MM-01

  total_horas: number;
  total_clases: number;
  horas_ordinarias: number;
  horas_complementarias: number;

  firmado: boolean;
  fecha_firma: string | null;
  ip_firma: string | null;
  hash_documento: string | null;
  pdf_url: string | null;

  created_at: string;
}

// ============================================================================
// CRM DE LEADS - TYPES
// ============================================================================

/** Canal de origen del lead */
export type LeadChannel = 'whatsapp' | 'instagram' | 'web' | 'voice' | 'manual';

/** Tier del lead scoring */
export type LeadTierDB = 'hot' | 'warm' | 'cold';

/** Estado del lead en el pipeline */
export type LeadStatus =
  | 'new'
  | 'engaged'
  | 'qualified'
  | 'booked'
  | 'attended'
  | 'converted'
  | 'lost'
  | 'dormant';

/** Estado de membresía Momence */
export type MembershipStatus = 'none' | 'active' | 'expired' | 'frozen' | 'unknown';

/**
 * Lead - Perfil unificado de un potencial alumno
 * Un lead = un teléfono único (E.164), puede venir de múltiples canales
 */
export interface Lead {
  id: string;

  // Identificación
  phone: string;
  name: string | null;
  email: string | null;

  // Origen y canal
  source: string | null;
  source_id: string | null;
  channel: LeadChannel;

  // Lead scoring
  score: number;
  tier: LeadTierDB;
  signals: string[];

  // Pipeline
  status: LeadStatus;

  // Preferencias
  dance_styles: string[];
  level: string | null;
  preferred_schedule: string | null;
  language: string;

  // Seguimiento
  first_contact: string;
  last_contact: string;
  next_followup: string | null;
  followup_count: number;
  assigned_to: string | null;

  // Consentimientos RGPD
  consent_marketing: boolean;
  consent_calls: boolean;
  consent_date: string | null;
  consent_renewed: string | null;
  nurture_opt_out: boolean;

  // Atribución Meta Ads
  meta_fbclid: string | null;
  meta_fbc: string | null;
  meta_fbp: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;

  // Momence
  momence_member_id: number | null;
  membership_status: MembershipStatus;
  membership_name: string | null;

  // Segmentación
  tags: string[];
  notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/** Canal de interacción (incluye email que leads no tiene como canal de origen) */
export type InteractionChannel = 'whatsapp' | 'instagram' | 'voice' | 'web' | 'email' | 'manual';

/** Dirección de la interacción */
export type InteractionDirection = 'inbound' | 'outbound';

/** Tipo de interacción */
export type InteractionType =
  | 'message'
  | 'voice_note'
  | 'image'
  | 'call'
  | 'booking'
  | 'booking_cancel'
  | 'booking_reschedule'
  | 'checkin'
  | 'payment'
  | 'escalation'
  | 'nurture_step'
  | 'note';

/**
 * LeadInteraction - Una interacción individual con un lead
 * Inmutable (insert-only, sin updated_at)
 */
export interface LeadInteraction {
  id: string;
  lead_id: string;

  channel: InteractionChannel;
  direction: InteractionDirection;
  type: InteractionType;

  content: string | null;
  content_summary: string | null;
  metadata: Record<string, unknown>;

  ai_model: string | null;
  sentiment: string | null;
  intent: string | null;

  duration_seconds: number | null;

  created_at: string;
}

/** Tipo de trigger para secuencias de nurturing */
export type NurtureTriggerType =
  | 'new_lead'
  | 'post_trial'
  | 'no_show'
  | 'abandoned'
  | 'dormant'
  | 'manual';

/** Acciones soportadas por el motor de nurturing */
export type NurtureAction =
  | 'send_template' // Enviar template aprobado de WhatsApp (funciona siempre)
  | 'send_text' // Enviar texto libre (solo dentro de ventana 24h)
  | 'send_welcome' // Enviar template lead_descubre_empezar
  | 'update_status' // Cambiar status del lead en el pipeline
  | 'add_signals' // Añadir señales al lead
  | 'wait' // Esperar sin hacer nada (solo delay)
  | 'skip'; // Paso deshabilitado (ej: ai_call sin infra)

/** Paso de una secuencia de nurturing */
export interface NurtureStep {
  step: number;
  delay_hours: number;
  channel: string;
  action: NurtureAction;
  template_name?: string;
  template_params?: string[];
  message_text?: string;
  target_status?: LeadStatus;
  signals?: string[];
  description: string;
}

/**
 * NurtureSequence - Definición de una cadencia de seguimiento automático
 */
export interface NurtureSequence {
  id: string;

  name: string;
  description: string | null;

  trigger_type: NurtureTriggerType;
  trigger_conditions: Record<string, unknown>;
  steps: NurtureStep[];

  active: boolean;
  priority: number;

  total_enrolled: number;
  total_completed: number;
  total_converted: number;

  created_at: string;
  updated_at: string;
}

/** Estado de una ejecución de nurturing */
export type NurtureExecutionStatus =
  | 'active'
  | 'completed'
  | 'converted'
  | 'paused'
  | 'cancelled'
  | 'failed';

/**
 * NurtureExecution - Ejecución de una secuencia para un lead específico
 */
export interface NurtureExecution {
  id: string;
  lead_id: string;
  sequence_id: string;

  step_index: number;
  total_steps: number;
  status: NurtureExecutionStatus;

  scheduled_at: string | null;
  last_executed_at: string | null;
  last_step_result: Record<string, unknown>;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// INSERT TYPES (campos con DEFAULT en SQL son opcionales)
// ============================================================================

/** Insert para leads: solo phone es obligatorio */
export interface LeadInsert {
  phone: string;
  name?: string | null;
  email?: string | null;
  source?: string | null;
  source_id?: string | null;
  channel?: LeadChannel;
  score?: number;
  tier?: LeadTierDB;
  signals?: string[];
  status?: LeadStatus;
  dance_styles?: string[];
  level?: string | null;
  preferred_schedule?: string | null;
  language?: string;
  first_contact?: string;
  last_contact?: string;
  next_followup?: string | null;
  followup_count?: number;
  assigned_to?: string | null;
  consent_marketing?: boolean;
  consent_calls?: boolean;
  consent_date?: string | null;
  consent_renewed?: string | null;
  nurture_opt_out?: boolean;
  meta_fbclid?: string | null;
  meta_fbc?: string | null;
  meta_fbp?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  momence_member_id?: number | null;
  membership_status?: MembershipStatus;
  membership_name?: string | null;
  tags?: string[];
  notes?: string | null;
}

/** Insert para lead_interactions: lead_id, channel, direction, type obligatorios */
export interface LeadInteractionInsert {
  lead_id: string;
  channel: InteractionChannel;
  direction: InteractionDirection;
  type: InteractionType;
  content?: string | null;
  content_summary?: string | null;
  metadata?: Record<string, unknown>;
  ai_model?: string | null;
  sentiment?: string | null;
  intent?: string | null;
  duration_seconds?: number | null;
}

/** Insert para nurture_sequences: name y trigger_type obligatorios */
export interface NurtureSequenceInsert {
  name: string;
  trigger_type: NurtureTriggerType;
  description?: string | null;
  trigger_conditions?: Record<string, unknown>;
  steps?: NurtureStep[];
  active?: boolean;
  priority?: number;
  total_enrolled?: number;
  total_completed?: number;
  total_converted?: number;
}

/** Insert para nurture_executions: lead_id, sequence_id, total_steps obligatorios */
export interface NurtureExecutionInsert {
  lead_id: string;
  sequence_id: string;
  total_steps: number;
  step_index?: number;
  status?: NurtureExecutionStatus;
  scheduled_at?: string | null;
  last_executed_at?: string | null;
  last_step_result?: Record<string, unknown>;
}

// ============================================================================
// DATABASE SCHEMA TYPE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profesores: {
        Row: Profesor;
        Insert: Omit<Profesor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profesor, 'id' | 'created_at'>>;
        Relationships: [];
      };
      fichajes: {
        Row: Fichaje;
        Insert: Omit<Fichaje, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Fichaje, 'id' | 'created_at'>>;
        Relationships: [];
      };
      fichajes_audit_log: {
        Row: FichajeAuditLog;
        Insert: Omit<FichajeAuditLog, 'id' | 'timestamp'>;
        Update: never;
        Relationships: [];
      };
      configuracion_fichaje: {
        Row: ConfiguracionFichaje;
        Insert: Partial<ConfiguracionFichaje>;
        Update: Partial<ConfiguracionFichaje>;
        Relationships: [];
      };
      resumen_mensual: {
        Row: ResumenMensual;
        Insert: Omit<ResumenMensual, 'id' | 'created_at'>;
        Update: Partial<Omit<ResumenMensual, 'id' | 'created_at'>>;
        Relationships: [];
      };
      leads: {
        Row: Lead;
        Insert: LeadInsert;
        Update: Partial<LeadInsert>;
        Relationships: [];
      };
      lead_interactions: {
        Row: LeadInteraction;
        Insert: LeadInteractionInsert;
        Update: never;
        Relationships: [];
      };
      nurture_sequences: {
        Row: NurtureSequence;
        Insert: NurtureSequenceInsert;
        Update: Partial<NurtureSequenceInsert>;
        Relationships: [];
      };
      nurture_executions: {
        Row: NurtureExecution;
        Insert: NurtureExecutionInsert;
        Update: Partial<NurtureExecutionInsert>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
  };
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

// Singleton para reutilizar conexión entre invocaciones
let supabaseInstance: SupabaseClient<Database> | null = null;
let supabaseAdminInstance: SupabaseClient<Database> | null = null;

/**
 * Obtiene el cliente Supabase con clave anónima (para operaciones públicas)
 * Lanza error si las variables de entorno no están configuradas
 */
export function getSupabase(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const url = process.env['SUPABASE_URL'];
  const anonKey = process.env['SUPABASE_ANON_KEY'];

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
    );
  }

  supabaseInstance = createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseInstance;
}

/**
 * Obtiene el cliente Supabase con clave de servicio (para operaciones admin)
 * SOLO usar en backend - nunca exponer al cliente
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const url = process.env['SUPABASE_URL'];
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase admin credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  supabaseAdminInstance = createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminInstance;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calcula minutos trabajados entre entrada y salida
 */
export function calcularMinutosTrabajados(
  horaInicio: string,
  horaFin: string,
  pausaInicio?: string | null,
  pausaFin?: string | null
): number {
  const [hiH = 0, hiM = 0] = horaInicio.split(':').map(Number);
  const [hfH = 0, hfM = 0] = horaFin.split(':').map(Number);

  let minutos = hfH * 60 + hfM - (hiH * 60 + hiM);

  // Restar pausas si existen
  if (pausaInicio && pausaFin) {
    const [piH = 0, piM = 0] = pausaInicio.split(':').map(Number);
    const [pfH = 0, pfM = 0] = pausaFin.split(':').map(Number);
    const pausa = pfH * 60 + pfM - (piH * 60 + piM);
    minutos -= pausa;
  }

  return Math.max(0, minutos);
}

/**
 * Formatea minutos a formato legible (ej: "2h 30min")
 */
export function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  if (horas === 0) return `${mins}min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h ${mins}min`;
}

/**
 * Obtiene la fecha actual en timezone de España
 */
export function getFechaHoyEspana(): string {
  return new Date().toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Madrid',
  });
}

/**
 * Obtiene la hora actual en timezone de España (HH:MM)
 */
export function getHoraAhoraEspana(): string {
  return new Date().toLocaleTimeString('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
