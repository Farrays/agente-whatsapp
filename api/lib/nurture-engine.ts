/**
 * Nurture Engine - Motor de secuencias de nurturing automatizadas
 *
 * Ejecuta cadencias de seguimiento por WhatsApp de forma config-driven.
 * Las secuencias se definen en la tabla nurture_sequences (Supabase)
 * y este motor las ejecuta paso a paso.
 *
 * Patrón: Mismo que Generator Landing — la config define qué hacer,
 * el motor genérico lo ejecuta.
 *
 * Principios:
 * - Config-driven: toda la lógica está en nurture_sequences.steps[]
 * - Pause on response: si el lead está hablando con Laura, se pausa
 * - Stop on conversion: si el lead convirtió, se cierra la secuencia
 * - RGPD: opt-out model — envía salvo que nurture_opt_out = true
 * - Business hours: solo ejecuta entre 9-21h Madrid
 * - Idempotente: re-ejecutar no duplica enrollments ni mensajes
 */

import { getSupabaseAdmin } from './supabase.js';
import type {
  NurtureSequence,
  NurtureExecution,
  NurtureExecutionInsert,
  NurtureExecutionStatus,
  NurtureTriggerType,
  NurtureStep,
  NurtureAction,
  Lead,
} from './supabase.js';
import { getRedis } from './redis.js';
import { sendCustomTemplate, sendTextMessage, sendLeadWelcomeWhatsApp } from './whatsapp.js';
import {
  getById,
  getByPhone,
  updateStatus,
  addSignals,
  recordInteraction,
} from './lead-repository.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const BUSINESS_HOUR_START = 9;
const BUSINESS_HOUR_END = 21;
const CONVERSATION_SILENCE_HOURS = 2;
const MAX_EXECUTIONS_PER_RUN = 15;
const ENROLLMENT_LOOKBACK_HOURS = 2; // Solo enrollar leads creados en las últimas 2h

// ============================================================================
// TABLE HELPERS (mismo patrón que lead-repository.ts)
// ============================================================================

function sequencesTable() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseAdmin().from('nurture_sequences') as any;
}

function executionsTable() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseAdmin().from('nurture_executions') as any;
}

function leadsTable() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseAdmin().from('leads') as any;
}

// ============================================================================
// BUSINESS HOURS
// ============================================================================

/**
 * Verifica si estamos en horario de oficina Madrid (9-21h)
 */
export function isBusinessHours(): boolean {
  const madridHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Madrid',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10
  );
  return madridHour >= BUSINESS_HOUR_START && madridHour < BUSINESS_HOUR_END;
}

// ============================================================================
// CONVERSATION ACTIVITY CHECK
// ============================================================================

/**
 * Verifica si el lead está en conversación activa (no interrumpir con nurture).
 * Usa el sorted set conversations:active de human-takeover.ts
 */
export async function isConversationActive(phone: string): Promise<boolean> {
  try {
    const redis = getRedis();
    const score = await redis.zscore('conversations:active', phone);
    if (score === null || score === undefined) return false;

    const lastActivityMs = typeof score === 'string' ? parseInt(score, 10) : Number(score);
    const silenceMs = CONVERSATION_SILENCE_HOURS * 60 * 60 * 1000;
    return Date.now() - lastActivityMs < silenceMs;
  } catch {
    // Si Redis falla, mejor no enviar
    return true;
  }
}

// ============================================================================
// SEQUENCE QUERIES
// ============================================================================

/**
 * Obtiene una secuencia por ID
 */
export async function getSequenceById(id: string): Promise<NurtureSequence | null> {
  const { data, error } = await sequencesTable().select().eq('id', id).single();

  if (error || !data) return null;
  return data as NurtureSequence;
}

/**
 * Obtiene todas las secuencias activas
 */
export async function getActiveSequences(): Promise<NurtureSequence[]> {
  const { data, error } = await sequencesTable()
    .select()
    .eq('active', true)
    .order('priority', { ascending: false });

  if (error || !data) return [];
  return data as NurtureSequence[];
}

/**
 * Obtiene secuencias activas por trigger type
 */
export async function getActiveSequencesByTrigger(
  triggerType: NurtureTriggerType
): Promise<NurtureSequence[]> {
  const { data, error } = await sequencesTable()
    .select()
    .eq('active', true)
    .eq('trigger_type', triggerType)
    .order('priority', { ascending: false });

  if (error || !data) return [];
  return data as NurtureSequence[];
}

// ============================================================================
// EXECUTION QUERIES
// ============================================================================

/**
 * Verifica si un lead ya tiene una ejecución activa para una secuencia
 */
export async function hasActiveExecution(leadId: string, sequenceId: string): Promise<boolean> {
  const { count } = await executionsTable()
    .select('*', { count: 'exact', head: true })
    .eq('lead_id', leadId)
    .eq('sequence_id', sequenceId)
    .eq('status', 'active');

  return (count ?? 0) > 0;
}

/**
 * Obtiene ejecuciones pendientes (scheduled_at <= now)
 */
export async function getPendingExecutions(
  limit: number = MAX_EXECUTIONS_PER_RUN
): Promise<NurtureExecution[]> {
  const { data, error } = await executionsTable()
    .select()
    .eq('status', 'active')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data as NurtureExecution[];
}

/**
 * Obtiene ejecuciones pausadas
 */
async function getPausedExecutions(): Promise<NurtureExecution[]> {
  const { data, error } = await executionsTable().select().eq('status', 'paused').limit(20);

  if (error || !data) return [];
  return data as NurtureExecution[];
}

// ============================================================================
// ENROLLMENT
// ============================================================================

/**
 * Verifica si un lead debe ser enrollado en una secuencia
 */
export function shouldEnroll(lead: Lead, sequence: NurtureSequence): boolean {
  // RGPD opt-out: si el lead ha pedido no recibir marketing, respetar
  if (lead.nurture_opt_out) return false;

  // No enrollar leads convertidos o perdidos
  if (lead.status === 'converted' || lead.status === 'lost') return false;

  // No enrollar miembros activos en secuencias de captación
  if (lead.membership_status === 'active') return false;

  // Secuencia debe estar activa
  if (!sequence.active) return false;

  // Verificar condiciones del trigger si existen
  const conditions = sequence.trigger_conditions;
  if (conditions) {
    // Filtro por canal
    if (conditions['channel'] && conditions['channel'] !== lead.channel) return false;
    if (Array.isArray(conditions['channels']) && !conditions['channels'].includes(lead.channel))
      return false;

    // Filtro por score mínimo
    if (typeof conditions['min_score'] === 'number' && lead.score < conditions['min_score'])
      return false;
  }

  return true;
}

/**
 * Enrolla un lead en una secuencia.
 * Idempotente: si ya está enrollado, retorna null.
 */
export async function enrollLead(
  leadId: string,
  sequenceId: string
): Promise<NurtureExecution | null> {
  const sequence = await getSequenceById(sequenceId);
  if (!sequence || !sequence.active || sequence.steps.length === 0) return null;

  const lead = await getById(leadId);
  if (!lead || !shouldEnroll(lead, sequence)) return null;

  // Guard: ya enrollado
  if (await hasActiveExecution(leadId, sequenceId)) return null;

  const firstStep = sequence.steps[0] as NurtureStep;
  const scheduledAt = new Date(Date.now() + firstStep.delay_hours * 3600_000);

  const insert: NurtureExecutionInsert = {
    lead_id: leadId,
    sequence_id: sequenceId,
    total_steps: sequence.steps.length,
    step_index: 0,
    status: 'active',
    scheduled_at: scheduledAt.toISOString(),
  };

  const { data, error } = await executionsTable()
    .insert(insert as unknown as Record<string, unknown>)
    .select()
    .single();

  if (error) {
    // 23505 = unique violation — ya enrollado (race condition safe)
    if (error.code === '23505') return null;
    throw new Error(`[nurture] Error enrolling lead: ${error.message}`);
  }

  // Incrementar contador
  await sequencesTable()
    .update({ total_enrolled: sequence.total_enrolled + 1 })
    .eq('id', sequenceId);

  console.log(
    `[nurture] Enrolled lead ${leadId} in "${sequence.name}" (seq ${sequenceId}), ` +
      `first step at ${scheduledAt.toISOString()}`
  );

  return data as NurtureExecution;
}

// ============================================================================
// STEP EXECUTION
// ============================================================================

/**
 * Interpola variables en texto de mensaje.
 * {{firstName}} → lead.name || "amigo/a"
 */
function interpolateText(template: string, lead: Lead): string {
  const firstName = lead.name?.split(' ')[0] || 'amigo/a';
  return template
    .replace(/\{\{firstName\}\}/g, () => firstName)
    .replace(/\{\{name\}\}/g, () => lead.name || 'amigo/a')
    .replace(/\{\{phone\}\}/g, () => lead.phone);
}

/**
 * Ejecuta un paso de la secuencia.
 * Verifica RGPD, conversación activa, y status del lead antes de enviar.
 */
export async function executeStep(
  execution: NurtureExecution
): Promise<{ success: boolean; error?: string }> {
  const sequence = await getSequenceById(execution.sequence_id);
  if (!sequence) return { success: false, error: 'Sequence not found' };

  const step: NurtureStep | undefined = sequence.steps[execution.step_index];
  if (!step) return { success: false, error: 'Step not found' };

  const lead = await getById(execution.lead_id);
  if (!lead) return { success: false, error: 'Lead not found' };

  // ── Guards ──────────────────────────────────────────────────────────────

  // Lead convertido o perdido → cerrar secuencia
  if (lead.status === 'converted') {
    await completeExecution(execution.id, 'converted', execution.sequence_id);
    return { success: false, error: 'Lead converted — sequence completed' };
  }
  if (lead.status === 'lost') {
    await completeExecution(execution.id, 'cancelled', execution.sequence_id);
    return { success: false, error: 'Lead lost — sequence cancelled' };
  }

  // Acciones que envían mensajes — respetar opt-out
  const messageActions: NurtureAction[] = ['send_template', 'send_text', 'send_welcome'];
  if (messageActions.includes(step.action) && lead.nurture_opt_out) {
    await completeExecution(execution.id, 'cancelled', execution.sequence_id);
    return { success: false, error: 'Lead opted out — cancelled' };
  }

  // Conversación activa → pausar (no interrumpir a Laura)
  if (messageActions.includes(step.action) && (await isConversationActive(lead.phone))) {
    await pauseExecution(execution.id);
    return { success: false, error: 'Conversation active — paused' };
  }

  // ── Execute action ─────────────────────────────────────────────────────

  let result: { success: boolean; messageId?: string; error?: string };

  switch (step.action) {
    case 'send_template': {
      if (!step.template_name) {
        result = { success: false, error: 'Missing template_name' };
        break;
      }
      const params = step.template_params?.map(p => interpolateText(p, lead));
      result = await sendCustomTemplate(step.template_name, lead.phone, 'es_ES', params);
      break;
    }

    case 'send_text': {
      if (!step.message_text) {
        result = { success: false, error: 'Missing message_text' };
        break;
      }
      result = await sendTextMessage(lead.phone, interpolateText(step.message_text, lead));
      // Si la ventana de 24h expiró, Meta devuelve error 131047
      // No es un error fatal — el paso falla pero la secuencia continúa
      break;
    }

    case 'send_welcome': {
      const firstName = lead.name?.split(' ')[0] || 'amigo/a';
      result = await sendLeadWelcomeWhatsApp({ to: lead.phone, firstName });
      break;
    }

    case 'update_status': {
      if (!step.target_status) {
        result = { success: false, error: 'Missing target_status' };
        break;
      }
      await updateStatus(lead.id, step.target_status);
      result = { success: true };
      break;
    }

    case 'add_signals': {
      if (!step.signals || step.signals.length === 0) {
        result = { success: false, error: 'Missing signals' };
        break;
      }
      await addSignals(lead.id, step.signals);
      result = { success: true };
      break;
    }

    case 'wait':
    case 'skip':
      result = { success: true };
      break;

    default:
      result = { success: false, error: `Unknown action: ${step.action}` };
  }

  // ── Record interaction for message actions ─────────────────────────────

  if (messageActions.includes(step.action) && result.success) {
    recordInteraction({
      lead_id: lead.id,
      channel: 'whatsapp',
      direction: 'outbound',
      type: 'nurture_step',
      content: step.message_text ? interpolateText(step.message_text, lead) : undefined,
      content_summary: step.description,
      metadata: {
        sequence_id: execution.sequence_id,
        sequence_name: sequence.name,
        step_index: execution.step_index,
        template_name: step.template_name,
        action: step.action,
      },
    }).catch(err => console.error('[nurture] Interaction recording failed:', err));
  }

  // ── Update execution state ─────────────────────────────────────────────

  await executionsTable()
    .update({
      last_executed_at: new Date().toISOString(),
      last_step_result: result as Record<string, unknown>,
    })
    .eq('id', execution.id);

  console.log(
    `[nurture] Step ${execution.step_index}/${execution.total_steps} ` +
      `(${step.action}) for lead ${execution.lead_id}: ` +
      `${result.success ? 'OK' : result.error}`
  );

  return result;
}

// ============================================================================
// STEP ADVANCEMENT
// ============================================================================

/**
 * Avanza al siguiente paso o completa la secuencia
 */
export async function advanceStep(executionId: string): Promise<void> {
  const { data: exec } = await executionsTable().select().eq('id', executionId).single();

  if (!exec || exec.status !== 'active') return;

  const nextIndex = exec.step_index + 1;

  if (nextIndex >= exec.total_steps) {
    await completeExecution(executionId, 'completed', exec.sequence_id);
    return;
  }

  const sequence = await getSequenceById(exec.sequence_id);
  if (!sequence) return;

  const nextStep = sequence.steps[nextIndex];
  if (!nextStep) {
    await completeExecution(executionId, 'completed', exec.sequence_id);
    return;
  }

  const scheduledAt = new Date(Date.now() + nextStep.delay_hours * 3600_000);

  await executionsTable()
    .update({
      step_index: nextIndex,
      scheduled_at: scheduledAt.toISOString(),
    })
    .eq('id', executionId);
}

// ============================================================================
// EXECUTION STATE MANAGEMENT
// ============================================================================

/**
 * Completa una ejecución (completed, converted, cancelled, failed)
 */
async function completeExecution(
  executionId: string,
  status: NurtureExecutionStatus,
  sequenceId?: string
): Promise<void> {
  await executionsTable().update({ status, scheduled_at: null }).eq('id', executionId);

  // Actualizar contadores de la secuencia
  if (sequenceId && (status === 'completed' || status === 'converted')) {
    const field = status === 'converted' ? 'total_converted' : 'total_completed';
    const { data: seq } = await sequencesTable().select(field).eq('id', sequenceId).single();

    if (seq) {
      await sequencesTable()
        .update({ [field]: ((seq as Record<string, number>)[field] ?? 0) + 1 })
        .eq('id', sequenceId);
    }
  }

  console.log(`[nurture] Execution ${executionId} → ${status}`);
}

/**
 * Pausa una ejecución (conversación activa)
 */
async function pauseExecution(executionId: string): Promise<void> {
  await executionsTable()
    .update({ status: 'paused' as NurtureExecutionStatus })
    .eq('id', executionId);

  console.log(`[nurture] Execution ${executionId} → paused (conversation active)`);
}

/**
 * Resume ejecuciones pausadas donde la conversación ya no está activa.
 * Retorna el número de ejecuciones resumidas.
 */
export async function resumePausedExecutions(): Promise<number> {
  const paused = await getPausedExecutions();
  let resumed = 0;

  for (const exec of paused) {
    const lead = await getById(exec.lead_id);
    if (!lead) continue;

    // Si la conversación ya no está activa, reanudar
    const stillActive = await isConversationActive(lead.phone);
    if (!stillActive) {
      await executionsTable()
        .update({
          status: 'active' as NurtureExecutionStatus,
          scheduled_at: new Date().toISOString(), // Ejecutar en el próximo ciclo
        })
        .eq('id', exec.id);

      resumed++;
      console.log(`[nurture] Execution ${exec.id} → resumed`);
    }
  }

  return resumed;
}

/**
 * Cancela todas las ejecuciones activas de un lead.
 * Llamar cuando el lead convierte o hace opt-out.
 */
export async function cancelExecutionsForLead(
  leadId: string,
  reason: string = 'manual'
): Promise<void> {
  const { data: active } = await executionsTable()
    .select('id, sequence_id')
    .eq('lead_id', leadId)
    .in('status', ['active', 'paused']);

  if (!active || active.length === 0) return;

  for (const exec of active) {
    const finalStatus: NurtureExecutionStatus = reason === 'converted' ? 'converted' : 'cancelled';
    await completeExecution(exec.id, finalStatus, exec.sequence_id);
  }

  console.log(`[nurture] Cancelled ${active.length} executions for lead ${leadId} (${reason})`);
}

// ============================================================================
// ENROLLMENT HELPERS (para usar desde webhooks/crons)
// ============================================================================

/**
 * Intenta enrollar un lead nuevo en secuencias new_lead.
 * Fire-and-forget — no bloquea el webhook.
 */
export async function tryEnrollNewLead(lead: Lead): Promise<void> {
  const sequences = await getActiveSequencesByTrigger('new_lead');

  for (const seq of sequences) {
    try {
      await enrollLead(lead.id, seq.id);
    } catch (err) {
      console.error(`[nurture] Failed to enroll lead ${lead.id} in ${seq.name}:`, err);
    }
  }
}

/**
 * Intenta enrollar un lead por trigger type (no_show, post_trial, etc).
 * Busca el lead por teléfono y lo enrolla en todas las secuencias matching.
 */
export async function tryEnrollByTrigger(
  phone: string,
  triggerType: NurtureTriggerType
): Promise<void> {
  const lead = await getByPhone(phone);
  if (!lead) return;

  const sequences = await getActiveSequencesByTrigger(triggerType);

  for (const seq of sequences) {
    try {
      await enrollLead(lead.id, seq.id);
    } catch (err) {
      console.error(
        `[nurture] Failed to enroll lead ${lead.id} in ${seq.name} (${triggerType}):`,
        err
      );
    }
  }
}

// ============================================================================
// AUTO-ENROLLMENT: Find new leads matching sequences
// ============================================================================

/**
 * Busca leads recientes que podrían ser enrollados en secuencias new_lead.
 * Solo busca leads creados en las últimas ENROLLMENT_LOOKBACK_HOURS.
 */
export async function findNewLeadsForEnrollment(): Promise<Lead[]> {
  const lookbackTime = new Date(Date.now() - ENROLLMENT_LOOKBACK_HOURS * 3600_000).toISOString();

  const { data, error } = await leadsTable()
    .select()
    .gte('created_at', lookbackTime)
    .not('status', 'in', '("converted","lost")')
    .neq('nurture_opt_out', true)
    .neq('membership_status', 'active')
    .limit(20);

  if (error || !data) return [];
  return data as Lead[];
}

// ============================================================================
// EXPORTS SUMMARY
// ============================================================================
// Query:      getActiveSequences, getPendingExecutions
// Enrollment: enrollLead, tryEnrollNewLead, tryEnrollByTrigger, findNewLeadsForEnrollment
// Execution:  executeStep, advanceStep
// Lifecycle:  resumePausedExecutions, cancelExecutionsForLead
// Guards:     isBusinessHours, isConversationActive, shouldEnroll
