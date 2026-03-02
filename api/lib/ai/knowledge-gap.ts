/**
 * Knowledge Gap Detection & Logging
 *
 * Detects when Laura couldn't answer confidently or hallucinated data,
 * logs gaps to Redis for analysis, and provides query functions for the admin API.
 *
 * Gap signals detected:
 * - price_hallucination: validatePrices replaced a hallucinated price
 * - url_hallucination: sanitizeUrls replaced a fabricated URL
 * - no_answer: Laura used phrases like "tendría que confirmarlo"
 * - uncertain_response: Laura used hedging language ("creo que", "probablemente")
 *
 * Redis keys:
 * - gaps:log (Sorted Set, score=timestamp) — recent gap entries (capped at 500)
 * - gaps:topics (Hash, field="topic:signal", value=count) — frequency by topic+signal
 * - gaps:stats:{YYYY-MM-DD} (Hash) — daily aggregates (90-day TTL)
 */

import type { Redis } from '@upstash/redis';

// ============================================================================
// TYPES
// ============================================================================

export type GapSignal =
  | 'price_hallucination'
  | 'url_hallucination'
  | 'no_answer'
  | 'uncertain_response';

export type GapTopic =
  | 'precios'
  | 'horarios'
  | 'reservas'
  | 'estilos'
  | 'profesores'
  | 'membresia'
  | 'cancelacion'
  | 'nivel'
  | 'prueba'
  | 'otro';

export interface KnowledgeGap {
  id: string;
  userMessage: string;
  lauraResponse: string;
  signal: GapSignal;
  topic: GapTopic;
  language: string;
  phone: string; // last 4 digits only (privacy)
  timestamp: number;
}

// ============================================================================
// DETECTION PHRASES
// ============================================================================

// Phrases from Laura's response indicating she couldn't answer
// (sourced from LAURA_PROMPT.md fallback phrases + escalation-service.ts ESCALATION_TRIGGERS)
const NO_ANSWER_PHRASES = [
  // ES (from LAURA_PROMPT.md: "Tendría que confirmarlo, contacta en info@farrayscenter.com")
  'tendría que confirmarlo',
  'tendria que confirmarlo',
  'tendría que confirmártelo',
  'tendria que confirmartelo',
  'no tengo esa información',
  'no tengo esa informacion',
  'no estoy 100% segura',
  'no estoy segura de esto',
  // CA
  'hauria de confirmar-ho',
  "m'ho hauria de confirmar",
  'no tinc aquesta informació',
  'no estic 100% segura',
  // EN
  'i would need to confirm',
  'would need to check with',
  "i don't have that information",
  "i'm not 100% sure",
  "i'm not sure about this",
  // FR
  'je devrais confirmer',
  'il faudrait confirmer',
  "je n'ai pas cette information",
  'je ne suis pas sûre',
];

// Hedging language — less severe than no_answer but indicates uncertainty
const UNCERTAIN_PHRASES = [
  // ES
  'creo que es',
  'creo que son',
  'creo que está',
  'creo que hay',
  'probablemente',
  'si no me equivoco',
  'no sabría decirte',
  'no sabria decirte',
  // EN
  "i think it's",
  'i believe it',
  'probably',
  "i'm not sure if",
  // CA
  'crec que és',
  'probablement',
  // FR
  'je pense que',
  'peut-être',
  'probablement',
];

// ============================================================================
// TOPIC CLASSIFICATION (keyword-based, from user message)
// ============================================================================

const TOPIC_KEYWORDS: Record<Exclude<GapTopic, 'otro'>, string[]> = {
  precios: [
    'precio',
    'cuanto',
    'cuánto',
    'cuesta',
    'coste',
    'pagar',
    'tarifa',
    'bono',
    'cuota',
    'price',
    'cost',
    'how much',
    'prix',
    'coût',
  ],
  horarios: [
    'horario',
    'hora',
    'cuando',
    'cuándo',
    'lunes',
    'martes',
    'miércoles',
    'miercoles',
    'jueves',
    'viernes',
    'sábado',
    'sabado',
    'domingo',
    'mañana',
    'tarde',
    'noche',
    'schedule',
    'when',
    'time',
    'horaire',
  ],
  reservas: ['reserva', 'reservar', 'booking', 'book', 'apuntar', 'inscribir', 'réserver'],
  estilos: [
    'bachata',
    'salsa',
    'kizomba',
    'hip hop',
    'ballet',
    'twerk',
    'dancehall',
    'heels',
    'femmology',
    'contempor',
    'afro',
    'reggaeton',
    'k-pop',
    'kpop',
    'jazz',
    'estilo',
    'style',
    'timba',
    'folklore',
    'stretching',
  ],
  profesores: [
    'profesor',
    'profe',
    'teacher',
    'yunaisy',
    'mathias',
    'eugenia',
    'sandra',
    'marcos',
    'charlie',
    'daniel',
    'alejandro',
    'lia',
    'iroel',
    'yasmina',
    'crisag',
    'grechén',
    'grechen',
    'professeur',
  ],
  membresia: [
    'membresía',
    'membresia',
    'socio',
    'socia',
    'alta',
    'darme de alta',
    'membership',
    'member',
    'suscripción',
    'suscripcion',
    'abonnement',
  ],
  cancelacion: [
    'cancelar',
    'cancel',
    'baja',
    'darme de baja',
    'devolver',
    'reembolso',
    'refund',
    'annuler',
  ],
  nivel: [
    'nivel',
    'level',
    'principiante',
    'beginner',
    'básico',
    'basico',
    'intermedio',
    'avanzado',
    'advanced',
    'niveau',
    'débutant',
  ],
  prueba: ['prueba', 'probar', 'trial', 'gratis', 'free', 'primera clase', 'essai', 'gratuit'],
};

function classifyTopic(userMessage: string): GapTopic {
  const lower = userMessage.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return topic as Exclude<GapTopic, 'otro'>;
    }
  }
  return 'otro';
}

// ============================================================================
// GAP SIGNAL DETECTION
// ============================================================================

function matchesAnyPhrase(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some(phrase => lower.includes(phrase));
}

/**
 * Detects gap signals by comparing raw vs validated response + phrase matching.
 */
export function detectGapSignals(params: {
  rawResponse: string;
  afterUrlSanitization: string;
  afterPriceValidation: string;
}): GapSignal[] {
  const signals: GapSignal[] = [];

  // 1. URL hallucination: sanitizeUrls changed the response
  if (params.rawResponse !== params.afterUrlSanitization) {
    signals.push('url_hallucination');
  }

  // 2. Price hallucination: validatePrices changed the response
  if (params.afterUrlSanitization !== params.afterPriceValidation) {
    signals.push('price_hallucination');
  }

  // 3. No answer: Laura explicitly says she can't answer
  if (matchesAnyPhrase(params.afterPriceValidation, NO_ANSWER_PHRASES)) {
    signals.push('no_answer');
  }

  // 4. Uncertain response: Laura uses hedging language
  if (matchesAnyPhrase(params.afterPriceValidation, UNCERTAIN_PHRASES)) {
    signals.push('uncertain_response');
  }

  return signals;
}

// ============================================================================
// REDIS STORAGE
// ============================================================================

const REDIS_KEYS = {
  LOG: 'gaps:log',
  TOPICS: 'gaps:topics',
  stats: (date: string) => `gaps:stats:${date}`,
};

const MAX_LOG_ENTRIES = 500;
const TTL_90_DAYS = 90 * 24 * 60 * 60;

/**
 * Detects and logs knowledge gaps to Redis. Fire-and-forget from the caller.
 * Only writes to Redis if gaps are detected (no-op for normal responses).
 */
export async function logGaps(
  redis: Redis,
  params: {
    userMessage: string;
    rawResponse: string;
    afterUrlSanitization: string;
    afterPriceValidation: string;
    language: string;
    phone: string;
  }
): Promise<void> {
  const signals = detectGapSignals(params);

  if (signals.length === 0) return;

  const now = Date.now();
  const date = new Date(now).toISOString().split('T')[0] ?? '';
  const topic = classifyTopic(params.userMessage);
  const phoneSuffix = params.phone.slice(-4);

  const pipeline = redis.pipeline();

  for (const signal of signals) {
    const gap: KnowledgeGap = {
      id: `gap-${now}-${Math.random().toString(36).slice(2, 6)}`,
      userMessage: params.userMessage.slice(0, 200),
      lauraResponse: params.rawResponse.slice(0, 300),
      signal,
      topic,
      language: params.language,
      phone: phoneSuffix,
      timestamp: now,
    };

    // Add to log (sorted set, score = timestamp)
    pipeline.zadd(REDIS_KEYS.LOG, { score: now, member: JSON.stringify(gap) });

    // Increment topic:signal counter
    pipeline.hincrby(REDIS_KEYS.TOPICS, `${topic}:${signal}`, 1);

    // Increment daily stats
    pipeline.hincrby(REDIS_KEYS.stats(date), 'total', 1);
    pipeline.hincrby(REDIS_KEYS.stats(date), signal, 1);
    pipeline.hincrby(REDIS_KEYS.stats(date), `topic:${topic}`, 1);
  }

  // Set TTL on daily stats
  pipeline.expire(REDIS_KEYS.stats(date), TTL_90_DAYS);

  await pipeline.exec();

  // Trim log to MAX_LOG_ENTRIES (keep most recent, remove oldest)
  const logSize = await redis.zcard(REDIS_KEYS.LOG);
  if (logSize > MAX_LOG_ENTRIES) {
    await redis.zremrangebyrank(REDIS_KEYS.LOG, 0, logSize - MAX_LOG_ENTRIES - 1);
  }

  console.log(
    `[knowledge-gap] Logged ${signals.length} gap(s): ${signals.join(', ')} | topic=${topic} | phone=...${phoneSuffix}`
  );
}

// ============================================================================
// QUERY FUNCTIONS (for admin API)
// ============================================================================

/**
 * Daily gap stats for a given date.
 */
export async function getGapStats(redis: Redis, date?: string): Promise<Record<string, number>> {
  const targetDate = date || (new Date().toISOString().split('T')[0] ?? '');
  const raw = await redis.hgetall(REDIS_KEYS.stats(targetDate));
  if (!raw) return {};

  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    result[key] = typeof value === 'number' ? value : parseInt(value as string, 10) || 0;
  }
  return result;
}

/**
 * Top gap topics sorted by frequency (across all time).
 */
export async function getTopGapTopics(
  redis: Redis,
  limit = 20
): Promise<{ topic: string; signal: string; count: number }[]> {
  const raw = await redis.hgetall(REDIS_KEYS.TOPICS);
  if (!raw) return [];

  return Object.entries(raw)
    .map(([key, count]) => {
      const parts = key.split(':');
      return {
        topic: parts[0] || 'otro',
        signal: parts[1] || 'unknown',
        count: typeof count === 'number' ? count : parseInt(count as string, 10) || 0,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Most recent gap log entries.
 */
export async function getRecentGaps(redis: Redis, limit = 50): Promise<KnowledgeGap[]> {
  // ZRANGE with REV returns highest scores first (most recent)
  const entries = await redis.zrange(REDIS_KEYS.LOG, 0, limit - 1, { rev: true });
  if (!entries || entries.length === 0) return [];

  return (entries as (string | KnowledgeGap)[]).map(entry => {
    if (typeof entry === 'string') return JSON.parse(entry) as KnowledgeGap;
    return entry;
  });
}

/**
 * Multi-day stats for trend analysis.
 */
export async function getGapStatsTrend(
  redis: Redis,
  days = 7
): Promise<{ date: string; stats: Record<string, number> }[]> {
  const results: { date: string; stats: Record<string, number> }[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0] ?? '';
    const stats = await getGapStats(redis, dateStr);
    if (Object.keys(stats).length > 0) {
      results.push({ date: dateStr, stats });
    }
  }

  return results;
}
