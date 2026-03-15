import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis } from './lib/redis.js';
import { isFeatureEnabled, FEATURES } from './lib/feature-flags.js';
import {
  isBusinessHours,
  getActiveSequences,
  getPendingExecutions,
  findNewLeadsForEnrollment,
  enrollLead,
  executeStep,
  advanceStep,
  resumePausedExecutions,
  hasActiveExecution,
  shouldEnroll,
} from './lib/nurture-engine.js';

/**
 * API Route: /api/cron-nurturing
 *
 * Motor de secuencias de nurturing automatizadas por WhatsApp.
 * Config-driven: las secuencias se definen en nurture_sequences (Supabase),
 * este cron las ejecuta paso a paso.
 *
 * Fases:
 * 0. Resume ejecuciones pausadas (conversación ya no activa)
 * 1. Auto-enrollment: leads nuevos → secuencias matching
 * 2. Execute: pasos pendientes (scheduled_at <= now)
 *
 * Schedule: every 30 minutes (cron: 0,30 * * * *)
 * Guard: Solo 9:00-21:00 Madrid
 * Lock: Distributed Redis lock (10 min TTL)
 *
 * Headers: Authorization: Bearer {CRON_SECRET}
 */

// Rate limit between WhatsApp messages (ms)
const MESSAGE_DELAY_MS = 500;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ── Auth ──────────────────────────────────────────────────────────────
  const cronSecret = process.env['CRON_SECRET'];
  if (cronSecret) {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  // ── Feature flag kill switch ──────────────────────────────────────────
  const nurtureEnabled = await isFeatureEnabled(FEATURES.NURTURE_ENABLED);
  if (!nurtureEnabled) {
    res.status(200).json({ status: 'disabled', reason: 'NURTURE_ENABLED flag is off' });
    return;
  }

  // ── Business hours guard ──────────────────────────────────────────────
  if (!isBusinessHours()) {
    res.status(200).json({ status: 'skipped', reason: 'Outside business hours (9-21h Madrid)' });
    return;
  }

  // ── Distributed lock ──────────────────────────────────────────────────
  const redis = getRedis();
  const now = new Date();
  const halfHour = `${now.toISOString().split('T')[0]}:${now.getUTCHours()}:${now.getUTCMinutes() < 30 ? '0' : '30'}`;
  const lockKey = `nurture:lock:${halfHour}`;

  const lockAcquired = await redis.set(lockKey, '1', { ex: 600, nx: true });
  if (!lockAcquired) {
    res.status(200).json({ status: 'skipped', reason: 'Another instance running' });
    return;
  }

  const results = { enrolled: 0, executed: 0, advanced: 0, resumed: 0, errors: 0 };

  try {
    // ── PHASE 0: Resume paused executions ─────────────────────────────
    try {
      results.resumed = await resumePausedExecutions();
    } catch (err) {
      console.error('[cron-nurture] Phase 0 error:', err);
      results.errors++;
    }

    // ── PHASE 1: Auto-enrollment ──────────────────────────────────────
    try {
      const sequences = await getActiveSequences();
      const newLeadSequences = sequences.filter(s => s.trigger_type === 'new_lead');

      if (newLeadSequences.length > 0) {
        const leads = await findNewLeadsForEnrollment();

        for (const lead of leads) {
          for (const seq of newLeadSequences) {
            try {
              if (!shouldEnroll(lead, seq)) continue;
              if (await hasActiveExecution(lead.id, seq.id)) continue;

              const enrolled = await enrollLead(lead.id, seq.id);
              if (enrolled) results.enrolled++;
            } catch (err) {
              console.error(`[cron-nurture] Enrollment error (lead=${lead.id}):`, err);
              results.errors++;
            }
          }
        }
      }
    } catch (err) {
      console.error('[cron-nurture] Phase 1 error:', err);
      results.errors++;
    }

    // ── PHASE 2: Execute pending steps ────────────────────────────────
    try {
      const pending = await getPendingExecutions();

      for (const exec of pending) {
        try {
          const stepResult = await executeStep(exec);
          if (stepResult.success) {
            results.executed++;
            await advanceStep(exec.id);
            results.advanced++;
          } else {
            // Si el paso falló pero no es un error fatal (ej: ventana 24h expirada),
            // avanzar igualmente al siguiente paso
            const nonFatalErrors = [
              'Conversation active',
              'Lead opted out',
              'Lead converted',
              'Lead lost',
            ];
            const isFatal = nonFatalErrors.some(e => stepResult.error?.includes(e));
            if (!isFatal && stepResult.error) {
              // Paso falló (ej: send_text fuera de ventana) — avanzar
              await advanceStep(exec.id);
              results.advanced++;
            }
          }

          // Rate limit entre mensajes
          if (results.executed > 0) {
            await new Promise(r => setTimeout(r, MESSAGE_DELAY_MS));
          }
        } catch (err) {
          console.error(`[cron-nurture] Execution error (exec=${exec.id}):`, err);
          results.errors++;
        }
      }
    } catch (err) {
      console.error('[cron-nurture] Phase 2 error:', err);
      results.errors++;
    }

    // ── Metrics ───────────────────────────────────────────────────────
    const today = now.toISOString().split('T')[0];
    const metricsKey = `nurture:stats:${today}`;
    await redis.hincrby(metricsKey, 'enrolled', results.enrolled);
    await redis.hincrby(metricsKey, 'executed', results.executed);
    await redis.hincrby(metricsKey, 'resumed', results.resumed);
    await redis.hincrby(metricsKey, 'errors', results.errors);
    await redis.expire(metricsKey, 90 * 24 * 3600);

    console.log(
      `[cron-nurture] Done: enrolled=${results.enrolled}, executed=${results.executed}, ` +
        `advanced=${results.advanced}, resumed=${results.resumed}, errors=${results.errors}`
    );

    res.status(200).json({ status: 'completed', results });
  } catch (err) {
    console.error('[cron-nurture] Fatal error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  } finally {
    // Release lock early if we finish before TTL
    await redis.del(lockKey).catch(() => {});
  }
}
