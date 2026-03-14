/**
 * Feature Flags System - Safe Deployment Strategy
 *
 * Sistema de feature flags para implementar mejoras sin romper
 * funcionalidades críticas: Booking, Fichajes, Agent Laura, Analytics.
 *
 * Uso:
 * ```typescript
 * import { isFeatureEnabled, FEATURES } from './feature-flags';
 *
 * if (await isFeatureEnabled(FEATURES.CSRF_PROTECTION)) {
 *   // Nueva implementación con CSRF
 * } else {
 *   // Comportamiento legacy
 * }
 * ```
 *
 * @see https://martinfowler.com/articles/feature-toggles.html
 */

import { getRedis } from './redis.js';

// ============================================================================
// FEATURE DEFINITIONS
// ============================================================================

/**
 * Categorías de features por sistema crítico
 */
export const FEATURES = {
  // ─────────────────────────────────────────────────────────────────────────
  // SEGURIDAD (Fase 1 - Crítico)
  // ─────────────────────────────────────────────────────────────────────────
  /** Habilita verificación CSRF en formularios POST */
  CSRF_PROTECTION: 'security.csrf_protection',

  /** Cambia webhooks de AUDIT a ENFORCEMENT mode */
  WEBHOOK_ENFORCEMENT: 'security.webhook_enforcement',

  /** Usa DOMPurify para sanitización robusta */
  ENHANCED_SANITIZATION: 'security.enhanced_sanitization',

  /** Valida MX records en emails */
  MX_VALIDATION: 'security.mx_validation',

  // ─────────────────────────────────────────────────────────────────────────
  // SEO / i18n (Fase 2)
  // ─────────────────────────────────────────────────────────────────────────
  /** Usa Intl.DateTimeFormat para fechas localizadas */
  INTL_DATE_FORMAT: 'i18n.intl_date_format',

  /** Usa Intl.NumberFormat para precios/números */
  INTL_NUMBER_FORMAT: 'i18n.intl_number_format',

  /** Retorna HTTP 404 real para páginas no encontradas */
  REAL_404: 'seo.real_404',

  // ─────────────────────────────────────────────────────────────────────────
  // ARQUITECTURA (Fase 3)
  // ─────────────────────────────────────────────────────────────────────────
  /** Usa nuevo sistema de rutas modular */
  MODULAR_ROUTES: 'arch.modular_routes',

  /** Usa middleware pattern en API */
  API_MIDDLEWARE: 'arch.api_middleware',

  // ─────────────────────────────────────────────────────────────────────────
  // SISTEMAS ESPECÍFICOS - Kill switches de emergencia
  // ─────────────────────────────────────────────────────────────────────────
  /** Kill switch: Deshabilita Booking Widget completamente */
  BOOKING_ENABLED: 'system.booking_enabled',

  /** Kill switch: Deshabilita Fichajes */
  FICHAJE_ENABLED: 'system.fichaje_enabled',

  /** Kill switch: Deshabilita Agent Laura */
  AGENT_LAURA_ENABLED: 'system.agent_laura_enabled',

  /** Kill switch: Deshabilita Analytics tracking */
  ANALYTICS_ENABLED: 'system.analytics_enabled',

  /** Kill switch: Deshabilita Nurture Sequences automáticas */
  NURTURE_ENABLED: 'system.nurture_enabled',
} as const;

export type FeatureFlag = (typeof FEATURES)[keyof typeof FEATURES];

// ============================================================================
// DEFAULT VALUES (Fallback if Redis unavailable)
// ============================================================================

export const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  // Seguridad: OFF por defecto (activar gradualmente)
  [FEATURES.CSRF_PROTECTION]: false,
  [FEATURES.WEBHOOK_ENFORCEMENT]: false,
  [FEATURES.ENHANCED_SANITIZATION]: false,
  [FEATURES.MX_VALIDATION]: false,

  // i18n/SEO: OFF por defecto
  [FEATURES.INTL_DATE_FORMAT]: false,
  [FEATURES.INTL_NUMBER_FORMAT]: false,
  [FEATURES.REAL_404]: false,

  // Arquitectura: OFF por defecto
  [FEATURES.MODULAR_ROUTES]: false,
  [FEATURES.API_MIDDLEWARE]: false,

  // Kill switches: ON por defecto (sistemas funcionando)
  [FEATURES.BOOKING_ENABLED]: true,
  [FEATURES.FICHAJE_ENABLED]: true,
  [FEATURES.AGENT_LAURA_ENABLED]: true,
  [FEATURES.ANALYTICS_ENABLED]: true,
  [FEATURES.NURTURE_ENABLED]: true,
};

// ============================================================================
// REDIS KEYS
// ============================================================================

const REDIS_PREFIX = 'ff:'; // feature flag prefix
const REDIS_KEY = (flag: FeatureFlag) => `${REDIS_PREFIX}${flag}`;

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Verifica si un feature flag está habilitado
 *
 * @param flag - Feature flag a verificar
 * @returns true si está habilitado, false si no
 *
 * @example
 * ```typescript
 * if (await isFeatureEnabled(FEATURES.CSRF_PROTECTION)) {
 *   validateCsrfToken(req);
 * }
 * ```
 */
export async function isFeatureEnabled(flag: FeatureFlag): Promise<boolean> {
  try {
    const redis = getRedis();
    const value = await redis.get<string>(REDIS_KEY(flag));

    if (value === null) {
      // No hay valor en Redis, usar default
      return DEFAULT_FLAGS[flag] ?? false;
    }

    return value === 'true' || value === '1';
  } catch (error) {
    // Si Redis falla, usar defaults seguros
    console.warn(`[FeatureFlags] Redis error for ${flag}, using default:`, error);
    return DEFAULT_FLAGS[flag] ?? false;
  }
}

/**
 * Habilita un feature flag
 */
export async function enableFeature(flag: FeatureFlag): Promise<void> {
  const redis = getRedis();
  await redis.set(REDIS_KEY(flag), 'true');
  console.log(`[FeatureFlags] ENABLED: ${flag}`);
}

/**
 * Deshabilita un feature flag
 */
export async function disableFeature(flag: FeatureFlag): Promise<void> {
  const redis = getRedis();
  await redis.set(REDIS_KEY(flag), 'false');
  console.log(`[FeatureFlags] DISABLED: ${flag}`);
}

/**
 * Obtiene el estado de todos los feature flags
 */
export async function getAllFlags(): Promise<Record<FeatureFlag, boolean>> {
  const result: Record<string, boolean> = {};

  for (const flag of Object.values(FEATURES)) {
    result[flag] = await isFeatureEnabled(flag);
  }

  return result as Record<FeatureFlag, boolean>;
}

/**
 * Resetea un flag a su valor por defecto
 */
export async function resetFeature(flag: FeatureFlag): Promise<void> {
  const redis = getRedis();
  await redis.del(REDIS_KEY(flag));
  console.log(`[FeatureFlags] RESET to default: ${flag} = ${DEFAULT_FLAGS[flag]}`);
}

/**
 * Resetea TODOS los flags a sus valores por defecto
 * PELIGROSO: Usar solo en emergencias
 */
export async function resetAllFeatures(): Promise<void> {
  const redis = getRedis();

  for (const flag of Object.values(FEATURES)) {
    await redis.del(REDIS_KEY(flag));
  }

  console.warn('[FeatureFlags] ALL FLAGS RESET TO DEFAULTS');
}

// ============================================================================
// ROLLBACK HELPERS
// ============================================================================

/**
 * Snapshot de flags actual para rollback
 */
export async function snapshotFlags(): Promise<Record<FeatureFlag, boolean>> {
  const snapshot = await getAllFlags();
  const redis = getRedis();

  // Guardar snapshot con timestamp
  const key = `ff:snapshot:${Date.now()}`;
  await redis.setex(key, 7 * 24 * 60 * 60, JSON.stringify(snapshot)); // 7 días

  console.log(`[FeatureFlags] Snapshot saved: ${key}`);
  return snapshot;
}

/**
 * Restaura flags desde un snapshot
 */
export async function restoreFromSnapshot(snapshotKey: string): Promise<void> {
  const redis = getRedis();
  const data = await redis.get<string>(snapshotKey);

  if (!data) {
    throw new Error(`Snapshot not found: ${snapshotKey}`);
  }

  const snapshot = typeof data === 'string' ? JSON.parse(data) : data;

  for (const [flag, enabled] of Object.entries(snapshot)) {
    if (enabled) {
      await enableFeature(flag as FeatureFlag);
    } else {
      await disableFeature(flag as FeatureFlag);
    }
  }

  console.log(`[FeatureFlags] Restored from snapshot: ${snapshotKey}`);
}

// ============================================================================
// EMERGENCY KILL SWITCHES
// ============================================================================

/**
 * EMERGENCIA: Deshabilita un sistema crítico inmediatamente
 */
export async function emergencyDisable(
  system: 'booking' | 'fichaje' | 'agent' | 'analytics'
): Promise<void> {
  const flagMap = {
    booking: FEATURES.BOOKING_ENABLED,
    fichaje: FEATURES.FICHAJE_ENABLED,
    agent: FEATURES.AGENT_LAURA_ENABLED,
    analytics: FEATURES.ANALYTICS_ENABLED,
  };

  await disableFeature(flagMap[system]);
  console.error(`[FeatureFlags] EMERGENCY DISABLE: ${system}`);
}

/**
 * Restaura un sistema después de emergencia
 */
export async function emergencyRestore(
  system: 'booking' | 'fichaje' | 'agent' | 'analytics'
): Promise<void> {
  const flagMap = {
    booking: FEATURES.BOOKING_ENABLED,
    fichaje: FEATURES.FICHAJE_ENABLED,
    agent: FEATURES.AGENT_LAURA_ENABLED,
    analytics: FEATURES.ANALYTICS_ENABLED,
  };

  await enableFeature(flagMap[system]);
  console.log(`[FeatureFlags] EMERGENCY RESTORE: ${system}`);
}

// ============================================================================
// GRADUAL ROLLOUT (Percentage-based)
// ============================================================================

/**
 * Rollout gradual basado en porcentaje
 *
 * @param flag - Feature flag
 * @param userId - ID único del usuario (email, phone, etc.)
 * @param percentage - Porcentaje de usuarios que verán el feature (0-100)
 */
export async function isEnabledForUser(
  flag: FeatureFlag,
  userId: string,
  percentage: number
): Promise<boolean> {
  // Primero verificar si el flag está habilitado globalmente
  const globalEnabled = await isFeatureEnabled(flag);
  if (!globalEnabled) return false;

  // Hash del userId para distribución consistente
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convertir a porcentaje (0-99)
  const userPercentile = Math.abs(hash) % 100;

  return userPercentile < percentage;
}

// ============================================================================
// MONITORING & LOGGING
// ============================================================================

/**
 * Log de cambios de feature flags para auditoría
 */
export async function logFlagChange(
  flag: FeatureFlag,
  newValue: boolean,
  reason: string,
  changedBy: string
): Promise<void> {
  const redis = getRedis();
  const logEntry = {
    flag,
    newValue,
    reason,
    changedBy,
    timestamp: new Date().toISOString(),
  };

  // Append to audit log
  const logKey = 'ff:audit_log';
  await redis.lpush(logKey, JSON.stringify(logEntry));
  await redis.ltrim(logKey, 0, 999); // Keep last 1000 entries

  console.log(`[FeatureFlags] CHANGE: ${flag} = ${newValue} by ${changedBy}: ${reason}`);
}

/**
 * Obtiene el historial de cambios
 */
export async function getAuditLog(
  limit: number = 100
): Promise<
  Array<{ flag: string; newValue: boolean; reason: string; changedBy: string; timestamp: string }>
> {
  const redis = getRedis();
  const entries = await redis.lrange('ff:audit_log', 0, limit - 1);

  return entries.map(entry => {
    if (typeof entry === 'string') {
      return JSON.parse(entry);
    }
    return entry;
  });
}
