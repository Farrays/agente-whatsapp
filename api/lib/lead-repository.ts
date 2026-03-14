/**
 * Lead Repository - Capa de persistencia para el CRM de leads
 *
 * Todas las operaciones de leads pasan por aquí.
 * Usa Supabase (service_role) como fuente de verdad.
 *
 * Principios:
 * - Phone (E.164 sin +) es la clave natural de dedup
 * - Upsert por phone: si existe actualiza, si no crea
 * - Interacciones son inmutables (insert-only)
 * - Score/tier se recalculan desde signals (nunca se setean directamente)
 *
 * NOTA: Las operaciones insert/update usan type assertions porque
 * la versión actual de @supabase/supabase-js (2.93) no resuelve
 * correctamente los tipos genéricos del Database interface.
 * Los tipos Row/Insert/Update están definidos para documentación y exports.
 */

import { getSupabaseAdmin } from './supabase.js';
import type {
  Lead,
  LeadInsert,
  LeadInteraction,
  LeadInteractionInsert,
  LeadChannel,
  LeadStatus,
  LeadTierDB,
  InteractionChannel,
  InteractionDirection,
  InteractionType,
} from './supabase.js';
import { normalizePhone } from './phone-utils.js';
import { calculateScore, getTierFromScore } from './ai/lead-scorer.js';

// ============================================================================
// TYPES
// ============================================================================

/** Datos para crear o actualizar un lead (upsert) */
export interface UpsertLeadData {
  phone: string;
  name?: string | null;
  email?: string | null;
  channel?: LeadChannel;
  source?: string | null;
  source_id?: string | null;
  language?: string;
  dance_styles?: string[];
  level?: string | null;
  preferred_schedule?: string | null;
  assigned_to?: string | null;

  // Meta attribution
  meta_fbclid?: string | null;
  meta_fbc?: string | null;
  meta_fbp?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
}

/** Datos para registrar una interacción */
export interface RecordInteractionData {
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

/** Filtros para listar leads */
export interface ListLeadsFilters {
  status?: LeadStatus;
  tier?: LeadTierDB;
  channel?: LeadChannel;
  search?: string;
  has_followup?: boolean;
  limit?: number;
  offset?: number;
  order_by?: 'last_contact' | 'created_at' | 'score' | 'next_followup';
  order_dir?: 'asc' | 'desc';
}

/** Resultado paginado */
export interface PaginatedLeads {
  data: Lead[];
  total: number;
  limit: number;
  offset: number;
}

/** Estadísticas para KPI cards */
export interface LeadStats {
  total: number;
  by_tier: { hot: number; warm: number; cold: number };
  by_status: Record<string, number>;
  by_channel: Record<string, number>;
  pending_followups: number;
}

// Re-export types consumers need
export type { Lead, LeadInteraction, LeadChannel, LeadStatus, LeadTierDB };

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/** Helper tipado para queries a la tabla leads */
function leadsTable() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseAdmin().from('leads') as any;
}

/** Helper tipado para queries a la tabla lead_interactions */
function interactionsTable() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseAdmin().from('lead_interactions') as any;
}

// ============================================================================
// UPSERT & CORE OPERATIONS
// ============================================================================

/**
 * Crea o actualiza un lead por teléfono.
 *
 * Estrategia: INSERT optimista + catch UNIQUE violation.
 * - INSERT: crea lead nuevo con todos los datos proporcionados
 * - Si falla por phone duplicado (23505): enriquece el lead existente
 *   sin sobreescribir datos que ya tiene (merge inteligente)
 *
 * Race-safe: dos mensajes simultáneos del mismo phone → uno crea,
 * el otro enriquece. Peor caso: dos enrichments idempotentes.
 */
export async function upsertLead(data: UpsertLeadData): Promise<Lead> {
  const phone = normalizePhone(data.phone);

  // 1. Intentar INSERT (optimista: la mayoría de llamadas son leads nuevos)
  const insertData: LeadInsert = {
    phone,
    name: data.name ?? null,
    email: data.email ?? null,
    channel: data.channel ?? 'whatsapp',
    source: data.source ?? null,
    source_id: data.source_id ?? null,
    language: data.language ?? 'es',
    dance_styles: data.dance_styles ?? [],
    level: data.level ?? null,
    preferred_schedule: data.preferred_schedule ?? null,
    assigned_to: data.assigned_to ?? 'laura',
    meta_fbclid: data.meta_fbclid ?? null,
    meta_fbc: data.meta_fbc ?? null,
    meta_fbp: data.meta_fbp ?? null,
    utm_source: data.utm_source ?? null,
    utm_medium: data.utm_medium ?? null,
    utm_campaign: data.utm_campaign ?? null,
    utm_term: data.utm_term ?? null,
    utm_content: data.utm_content ?? null,
  };

  const { data: created, error: insertErr } = await leadsTable()
    .insert(insertData)
    .select()
    .single();

  // INSERT OK → lead nuevo creado
  if (!insertErr) return created as Lead;

  // Error que NO es unique violation → error real
  if (insertErr.code !== '23505') {
    throw new Error(`Error creating lead: ${insertErr.message}`);
  }

  // 2. UNIQUE violation → lead ya existe, enriquecer sin sobreescribir
  const existing = await getByPhone(phone);
  if (!existing) throw new Error(`Lead not found after unique violation: ${phone}`);

  const enrichments: Partial<LeadInsert> = {
    last_contact: new Date().toISOString(),
  };
  let needsEnrich = false;

  // Solo llenar campos vacíos (no sobreescribir datos existentes)
  if (data.name != null && !existing.name) {
    enrichments.name = data.name;
    needsEnrich = true;
  }
  if (data.email != null && !existing.email) {
    enrichments.email = data.email;
    needsEnrich = true;
  }
  if (data.source != null && !existing.source) {
    enrichments.source = data.source;
    needsEnrich = true;
  }
  if (data.source_id != null && !existing.source_id) {
    enrichments.source_id = data.source_id;
    needsEnrich = true;
  }
  if (data.level != null && !existing.level) {
    enrichments.level = data.level;
    needsEnrich = true;
  }

  // Dance styles: merge arrays (no duplicar)
  if (data.dance_styles?.length && existing.dance_styles) {
    const merged = [...new Set([...existing.dance_styles, ...data.dance_styles])];
    if (merged.length > existing.dance_styles.length) {
      enrichments.dance_styles = merged;
      needsEnrich = true;
    }
  }

  // Meta attribution: first-touch (no sobreescribir)
  if (data.meta_fbclid && !existing.meta_fbclid) {
    enrichments.meta_fbclid = data.meta_fbclid;
    needsEnrich = true;
  }
  if (data.meta_fbc && !existing.meta_fbc) {
    enrichments.meta_fbc = data.meta_fbc;
    needsEnrich = true;
  }
  if (data.meta_fbp && !existing.meta_fbp) {
    enrichments.meta_fbp = data.meta_fbp;
    needsEnrich = true;
  }
  if (data.utm_source && !existing.utm_source) {
    enrichments.utm_source = data.utm_source;
    needsEnrich = true;
  }
  if (data.utm_medium && !existing.utm_medium) {
    enrichments.utm_medium = data.utm_medium;
    needsEnrich = true;
  }
  if (data.utm_campaign && !existing.utm_campaign) {
    enrichments.utm_campaign = data.utm_campaign;
    needsEnrich = true;
  }
  if (data.utm_term && !existing.utm_term) {
    enrichments.utm_term = data.utm_term;
    needsEnrich = true;
  }
  if (data.utm_content && !existing.utm_content) {
    enrichments.utm_content = data.utm_content;
    needsEnrich = true;
  }

  if (!needsEnrich) {
    // Solo actualizar last_contact
    await leadsTable().update({ last_contact: enrichments.last_contact }).eq('id', existing.id);
    return { ...existing, last_contact: enrichments.last_contact as string };
  }

  const { data: enriched, error: enrichErr } = await leadsTable()
    .update(enrichments)
    .eq('id', existing.id)
    .select()
    .single();

  if (enrichErr) throw new Error(`Error enriching lead: ${enrichErr.message}`);
  return enriched as Lead;
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/** Buscar lead por teléfono (normalizado) */
export async function getByPhone(phone: string): Promise<Lead | null> {
  const normalized = normalizePhone(phone);

  const { data, error } = await leadsTable().select().eq('phone', normalized).maybeSingle();

  if (error) throw new Error(`Error fetching lead by phone: ${error.message}`);
  return data as Lead | null;
}

/** Buscar lead por email */
export async function getByEmail(email: string): Promise<Lead | null> {
  const { data, error } = await leadsTable()
    .select()
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) throw new Error(`Error fetching lead by email: ${error.message}`);
  return data as Lead | null;
}

/** Buscar lead por ID */
export async function getById(id: string): Promise<Lead | null> {
  const { data, error } = await leadsTable().select().eq('id', id).maybeSingle();

  if (error) throw new Error(`Error fetching lead by id: ${error.message}`);
  return data as Lead | null;
}

/** Listar leads con filtros y paginación */
export async function listLeads(filters: ListLeadsFilters = {}): Promise<PaginatedLeads> {
  const {
    status,
    tier,
    channel,
    search,
    has_followup,
    limit = 50,
    offset = 0,
    order_by = 'last_contact',
    order_dir = 'desc',
  } = filters;

  let query = leadsTable().select('*', { count: 'exact' });

  if (status) query = query.eq('status', status);
  if (tier) query = query.eq('tier', tier);
  if (channel) query = query.eq('channel', channel);

  if (search) {
    // Sanitizar: escapar caracteres especiales de PostgREST filter syntax
    const sanitized = search.replace(/[%_(),."'\\]/g, '');
    if (sanitized.length > 0) {
      query = query.or(
        `phone.ilike.%${sanitized}%,name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`
      );
    }
  }

  if (has_followup === true) {
    query = query.not('next_followup', 'is', null);
  } else if (has_followup === false) {
    query = query.is('next_followup', null);
  }

  query = query
    .order(order_by, { ascending: order_dir === 'asc' })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Error listing leads: ${error.message}`);

  return {
    data: (data as Lead[] | null) ?? [],
    total: (count as number | null) ?? 0,
    limit,
    offset,
  };
}

// ============================================================================
// SCORE & STATUS
// ============================================================================

/**
 * Actualiza score y tier de un lead a partir de sus signals.
 * Recalcula score desde las signals (fuente de verdad).
 */
export async function updateScore(
  leadId: string,
  signals: string[]
): Promise<{ score: number; tier: LeadTierDB }> {
  const score = Math.min(100, calculateScore(signals));
  const tier = getTierFromScore(score);

  const { error } = await leadsTable().update({ score, tier, signals }).eq('id', leadId);

  if (error) throw new Error(`Error updating lead score: ${error.message}`);
  return { score, tier };
}

/**
 * Añade signals al lead y recalcula score.
 * No duplica signals existentes.
 */
export async function addSignals(
  leadId: string,
  newSignals: string[]
): Promise<{ score: number; tier: LeadTierDB }> {
  const lead = await getById(leadId);
  if (!lead) throw new Error(`Lead not found: ${leadId}`);

  const merged = [...new Set([...lead.signals, ...newSignals])];
  return updateScore(leadId, merged);
}

/** Actualizar estado del lead en el pipeline */
export async function updateStatus(leadId: string, status: LeadStatus): Promise<void> {
  const { error } = await leadsTable().update({ status }).eq('id', leadId);

  if (error) throw new Error(`Error updating lead status: ${error.message}`);
}

/** Programar próximo followup */
export async function scheduleFollowup(leadId: string, scheduledAt: Date): Promise<void> {
  const lead = await getById(leadId);
  if (!lead) throw new Error(`Lead not found: ${leadId}`);

  const { error } = await leadsTable()
    .update({
      next_followup: scheduledAt.toISOString(),
      followup_count: lead.followup_count + 1,
    })
    .eq('id', leadId);

  if (error) throw new Error(`Error scheduling followup: ${error.message}`);
}

/** Actualizar datos de Momence (membresía) */
export async function updateMomenceData(
  leadId: string,
  data: {
    momence_member_id?: number | null;
    membership_status?: Lead['membership_status'];
    membership_name?: string | null;
  }
): Promise<void> {
  const { error } = await leadsTable().update(data).eq('id', leadId);

  if (error) throw new Error(`Error updating Momence data: ${error.message}`);
}

/** Registrar consentimiento RGPD */
export async function updateConsent(
  leadId: string,
  consent: { marketing?: boolean; calls?: boolean }
): Promise<void> {
  const now = new Date().toISOString();
  const updates: Partial<LeadInsert> = { consent_date: now };
  if (consent.marketing !== undefined) updates.consent_marketing = consent.marketing;
  if (consent.calls !== undefined) updates.consent_calls = consent.calls;

  const { error } = await leadsTable().update(updates).eq('id', leadId);

  if (error) throw new Error(`Error updating consent: ${error.message}`);
}

// ============================================================================
// INTERACTIONS
// ============================================================================

/** Registrar una interacción (inmutable, insert-only) */
export async function recordInteraction(data: RecordInteractionData): Promise<LeadInteraction> {
  const insertData: LeadInteractionInsert = {
    lead_id: data.lead_id,
    channel: data.channel,
    direction: data.direction,
    type: data.type,
    content: data.content ?? null,
    content_summary: data.content_summary ?? null,
    metadata: data.metadata ?? {},
    ai_model: data.ai_model ?? null,
    sentiment: data.sentiment ?? null,
    intent: data.intent ?? null,
    duration_seconds: data.duration_seconds ?? null,
  };

  const { data: interaction, error } = await interactionsTable()
    .insert(insertData)
    .select()
    .single();

  if (error) throw new Error(`Error recording interaction: ${error.message}`);
  return interaction as LeadInteraction;
}

/** Obtener timeline de interacciones de un lead */
export async function getInteractions(
  leadId: string,
  options: { limit?: number; offset?: number; channel?: InteractionChannel } = {}
): Promise<{ data: LeadInteraction[]; total: number }> {
  const { limit = 50, offset = 0, channel } = options;

  let query = interactionsTable().select('*', { count: 'exact' }).eq('lead_id', leadId);

  if (channel) query = query.eq('channel', channel);

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Error fetching interactions: ${error.message}`);

  return {
    data: (data as LeadInteraction[] | null) ?? [],
    total: (count as number | null) ?? 0,
  };
}

// ============================================================================
// ANALYTICS / STATS
// ============================================================================

/** Estadísticas globales para el dashboard (queries en paralelo) */
export async function getStats(): Promise<LeadStats> {
  const countQuery = (filter?: { col: string; val: string }) => {
    let q = leadsTable().select('*', { count: 'exact', head: true });
    if (filter) q = q.eq(filter.col, filter.val);
    return q;
  };

  // Lanzar todas las queries en paralelo (5 groups)
  const [totalResult, tierResults, statusResults, channelResults, followupResult] =
    await Promise.all([
      // Total
      countQuery(),
      // By tier (3 queries)
      Promise.all(
        (['hot', 'warm', 'cold'] as const).map(t =>
          countQuery({ col: 'tier', val: t }).then(
            (r: { count: number | null }) => [t, r.count ?? 0] as const
          )
        )
      ),
      // By status (8 queries)
      Promise.all(
        (
          [
            'new',
            'engaged',
            'qualified',
            'booked',
            'attended',
            'converted',
            'lost',
            'dormant',
          ] as const
        ).map(s =>
          countQuery({ col: 'status', val: s }).then(
            (r: { count: number | null }) => [s, r.count ?? 0] as const
          )
        )
      ),
      // By channel (5 queries)
      Promise.all(
        (['whatsapp', 'instagram', 'web', 'voice', 'manual'] as const).map(c =>
          countQuery({ col: 'channel', val: c }).then(
            (r: { count: number | null }) => [c, r.count ?? 0] as const
          )
        )
      ),
      // Pending followups
      leadsTable()
        .select('*', { count: 'exact', head: true })
        .not('next_followup', 'is', null)
        .lte('next_followup', new Date().toISOString()),
    ]);

  if (totalResult.error) throw new Error(`Error fetching lead stats: ${totalResult.error.message}`);

  const tierCounts: { hot: number; warm: number; cold: number } = { hot: 0, warm: 0, cold: 0 };
  for (const [tier, count] of tierResults)
    tierCounts[tier as keyof typeof tierCounts] = count as number;

  const statusCounts: Record<string, number> = {};
  for (const [status, count] of statusResults) {
    if ((count as number) > 0) statusCounts[status] = count as number;
  }

  const channelCounts: Record<string, number> = {};
  for (const [channel, count] of channelResults) {
    if ((count as number) > 0) channelCounts[channel] = count as number;
  }

  return {
    total: (totalResult.count as number | null) ?? 0,
    by_tier: tierCounts,
    by_status: statusCounts,
    by_channel: channelCounts,
    pending_followups: (followupResult.count as number | null) ?? 0,
  };
}

/**
 * Obtener leads que necesitan followup (para cron de nurturing).
 * Devuelve leads cuyo next_followup ya pasó y están en estado activo.
 */
export async function getLeadsPendingFollowup(limit = 20): Promise<Lead[]> {
  const { data, error } = await leadsTable()
    .select()
    .not('next_followup', 'is', null)
    .lte('next_followup', new Date().toISOString())
    .not('status', 'in', '("converted","lost")')
    .order('next_followup', { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Error fetching pending followups: ${error.message}`);
  return (data as Lead[] | null) ?? [];
}

// ============================================================================
// AUTOMATIC STATUS PROGRESSION
// ============================================================================

type LeadEvent =
  | 'first_reply' // Lead respondió por primera vez
  | 'score_qualified' // Score alcanzó warm+ (≥40)
  | 'booking_created' // Reservó clase de prueba
  | 'booking_attended' // Asistió a la clase
  | 'payment_made'; // Pagó / se hizo miembro

/**
 * Progresa el status del lead automáticamente basado en eventos.
 * Solo avanza "hacia adelante" en el pipeline — nunca retrocede.
 *
 * Transiciones válidas:
 * - first_reply:      new → engaged
 * - score_qualified:  new/engaged → qualified
 * - booking_created:  new/engaged/qualified → booked
 * - booking_attended: booked → attended
 * - payment_made:     cualquier estado activo → converted
 */
export async function progressStatus(leadId: string, event: LeadEvent): Promise<LeadStatus | null> {
  const lead = await getById(leadId);
  if (!lead) return null;

  // Mapa de transiciones: event → { from: estados válidos, to: nuevo estado }
  const transitions: Record<LeadEvent, { from: LeadStatus[]; to: LeadStatus }> = {
    first_reply: {
      from: ['new'],
      to: 'engaged',
    },
    score_qualified: {
      from: ['new', 'engaged'],
      to: 'qualified',
    },
    booking_created: {
      from: ['new', 'engaged', 'qualified'],
      to: 'booked',
    },
    booking_attended: {
      from: ['booked'],
      to: 'attended',
    },
    payment_made: {
      from: ['new', 'engaged', 'qualified', 'booked', 'attended'],
      to: 'converted',
    },
  };

  const transition = transitions[event];
  if (!transition) return null;

  // Solo transicionar si el estado actual está en la lista de "from"
  if (!transition.from.includes(lead.status)) return null;

  await updateStatus(leadId, transition.to);
  console.log(`[lead-repository] Status progression: ${lead.status} → ${transition.to} (${event})`);
  return transition.to;
}
