/* global Buffer */
/**
 * Momence Webhook Handler
 *
 * Handles events from Momence booking system:
 * - booking.created: Add member to class WhatsApp group
 * - booking.cancelled: Remove member from class WhatsApp group
 * - subscription.created: Mark as active member
 * - subscription.cancelled: Handle membership cancellation
 *
 * Webhook URL to configure in Momence:
 * https://farrayscenter.com/api/webhook-momence
 *
 * @see AGENTE.md - Webhook para eventos de Momence
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getRedisClient } from './lib/redis.js';
import { getGroupsManager } from './lib/whapi/groups.js';
import { getLabelsManager } from './lib/whapi/labels.js';
import { normalizePhone } from './lib/phone-utils.js';
import { isFeatureEnabled, FEATURES } from './lib/feature-flags.js';

// ============================================================================
// TYPES
// ============================================================================

interface MomenceWebhookPayload {
  event: MomenceEventType;
  data: MomenceEventData;
  timestamp: string;
}

type MomenceEventType =
  | 'booking.created'
  | 'booking.cancelled'
  | 'booking.noshow'
  | 'booking.checkin'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'subscription.renewed'
  | 'member.created'
  | 'member.updated';

interface MomenceEventData {
  // Member info
  memberId?: number;
  memberEmail?: string;
  memberPhone?: string;
  memberName?: string;

  // Booking info
  bookingId?: number;
  sessionId?: number;
  sessionName?: string;
  sessionDate?: string;
  sessionTime?: string;
  sessionStyle?: string;
  isRecurring?: boolean;

  // Subscription info
  subscriptionId?: number;
  subscriptionName?: string;
  subscriptionType?: string;
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // ============================================================================
  // VERIFICACIÓN DE FIRMA - Modo controlado por Feature Flag
  // Flag OFF (default): AUDIT mode - solo log, no bloquea
  // Flag ON: ENFORCEMENT mode - bloquea requests sin firma válida
  // ============================================================================

  const enforcementMode = await isFeatureEnabled(FEATURES.WEBHOOK_ENFORCEMENT);
  let signatureValid = false;

  // Método 1: Header secreto simple (x-momence-secret)
  const webhookSecret = process.env['MOMENCE_WEBHOOK_SECRET'];
  const providedSecret = req.headers['x-momence-secret'];

  if (webhookSecret) {
    if (providedSecret === webhookSecret) {
      console.log('[webhook-momence] ✅ Secret header verified');
      signatureValid = true;
    } else {
      console.warn(
        `[webhook-momence] ⚠️ Secret header mismatch (got: ${providedSecret ? 'present' : 'missing'})`
      );
    }
  } else {
    console.warn('[webhook-momence] ⚠️ MOMENCE_WEBHOOK_SECRET not configured');
  }

  // Método 2: HMAC signature (x-momence-signature) - si Momence lo soporta
  if (!signatureValid) {
    const signatureResult = verifyMomenceSignature(req);
    if (signatureResult.valid) {
      console.log(`[webhook-momence] ✅ HMAC signature verified`);
      signatureValid = true;
    } else if (signatureResult.reason !== 'No signature header (not configured by Momence)') {
      console.warn(`[webhook-momence] ⚠️ Signature verification: ${signatureResult.reason}`);
    }
  }

  // ENFORCEMENT MODE: Bloquear si la firma no es válida
  if (enforcementMode && !signatureValid) {
    console.error('[webhook-momence] 🚫 ENFORCEMENT: Request blocked - invalid signature');
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid webhook signature',
    });
    return;
  }

  try {
    const payload = req.body as MomenceWebhookPayload;

    if (!payload.event || !payload.data) {
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }

    console.log(`[webhook-momence] Received event: ${payload.event}`);

    // Process the event
    const result = await processEvent(payload);

    res.status(200).json({
      success: true,
      event: payload.event,
      result,
    });
  } catch (error) {
    console.error('[webhook-momence] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================================================
// EVENT PROCESSING
// ============================================================================

async function processEvent(
  payload: MomenceWebhookPayload
): Promise<{ action: string; details?: string }> {
  const { event, data } = payload;
  const redis = getRedisClient();

  switch (event) {
    case 'booking.created':
      return handleBookingCreated(data, redis);

    case 'booking.cancelled':
      return handleBookingCancelled(data, redis);

    case 'booking.checkin':
      return handleBookingCheckin(data, redis);

    case 'subscription.created':
      return handleSubscriptionCreated(data, redis);

    case 'subscription.cancelled':
      return handleSubscriptionCancelled(data, redis);

    case 'member.created':
      return handleMemberCreated(data, redis);

    default:
      console.log(`[webhook-momence] Unhandled event: ${event}`);
      return { action: 'ignored', details: `Event ${event} not handled` };
  }
}

// --------------------------------------------------------------------------
// BOOKING EVENTS
// --------------------------------------------------------------------------

async function handleBookingCreated(
  data: MomenceEventData,
  redis: ReturnType<typeof getRedisClient>
): Promise<{ action: string; details?: string }> {
  const { memberPhone, sessionStyle, isRecurring } = data;

  if (!memberPhone) {
    return { action: 'skipped', details: 'No phone number' };
  }

  const phone = normalizePhone(memberPhone);

  // Only add to group for recurring bookings
  if (!isRecurring) {
    console.log('[webhook-momence] Non-recurring booking, skipping group add');
    return { action: 'skipped', details: 'Non-recurring booking' };
  }

  // Get the day of week from session date
  const dayOfWeek = data.sessionDate
    ? new Date(data.sessionDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    : null;

  if (!sessionStyle || !dayOfWeek) {
    return { action: 'skipped', details: 'Missing style or day info' };
  }

  // Add member to the class group
  const groupsManager = getGroupsManager(redis);
  const result = await groupsManager.addMemberForBooking(phone, sessionStyle, dayOfWeek);

  if (result.success) {
    // Also mark as active member
    const labelsManager = getLabelsManager(redis);
    await labelsManager.markActiveMember(phone);
    await labelsManager.markConverted(phone);

    return {
      action: 'added_to_group',
      details: `Added to ${sessionStyle}/${dayOfWeek} group`,
    };
  }

  return {
    action: 'group_add_failed',
    details: result.error?.message,
  };
}

async function handleBookingCancelled(
  data: MomenceEventData,
  redis: ReturnType<typeof getRedisClient>
): Promise<{ action: string; details?: string }> {
  const { memberPhone, sessionStyle, isRecurring } = data;

  if (!memberPhone || !isRecurring) {
    return { action: 'skipped', details: 'Non-recurring or no phone' };
  }

  const phone = normalizePhone(memberPhone);

  const dayOfWeek = data.sessionDate
    ? new Date(data.sessionDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    : null;

  if (!sessionStyle || !dayOfWeek) {
    return { action: 'skipped', details: 'Missing style or day info' };
  }

  // Remove member from the class group
  const groupsManager = getGroupsManager(redis);
  const result = await groupsManager.removeMemberForBooking(phone, sessionStyle, dayOfWeek);

  if (result.success) {
    return {
      action: 'removed_from_group',
      details: `Removed from ${sessionStyle}/${dayOfWeek} group`,
    };
  }

  return {
    action: 'group_remove_failed',
    details: result.error?.message,
  };
}

async function handleBookingCheckin(
  data: MomenceEventData,
  redis: ReturnType<typeof getRedisClient>
): Promise<{ action: string; details?: string }> {
  const { memberPhone } = data;

  if (!memberPhone) {
    return { action: 'skipped', details: 'No phone number' };
  }

  const phone = normalizePhone(memberPhone);

  // Mark as active member on check-in
  const labelsManager = getLabelsManager(redis);
  await labelsManager.markActiveMember(phone);

  // Log attendance in Redis
  const today = new Date().toISOString().split('T')[0];
  await redis?.hincrby(`attendance:${today}`, 'checkins', 1);

  return { action: 'checkin_recorded' };
}

// --------------------------------------------------------------------------
// SUBSCRIPTION EVENTS
// --------------------------------------------------------------------------

async function handleSubscriptionCreated(
  data: MomenceEventData,
  redis: ReturnType<typeof getRedisClient>
): Promise<{ action: string; details?: string }> {
  const { memberPhone, subscriptionName } = data;

  if (!memberPhone) {
    return { action: 'skipped', details: 'No phone number' };
  }

  const phone = normalizePhone(memberPhone);
  const labelsManager = getLabelsManager(redis);

  // Mark as active member
  await labelsManager.markActiveMember(phone);
  await labelsManager.markConverted(phone);

  // CRM: Cancel nurture sequences + advance status (fire-and-forget)
  import('./lib/lead-repository.js')
    .then(async ({ getByPhone, progressStatus }) => {
      const lead = await getByPhone(phone);
      if (!lead) return;
      await progressStatus(lead.id, 'payment_made');
      const { cancelExecutionsForLead } = await import('./lib/nurture-engine.js');
      await cancelExecutionsForLead(lead.id, 'converted');
    })
    .catch(err => console.error('[webhook-momence] CRM nurture cancel failed:', err));

  // Check if VIP subscription
  const isVip =
    subscriptionName?.toLowerCase().includes('ilimitado') ||
    subscriptionName?.toLowerCase().includes('unlimited');

  if (isVip) {
    const labels = await labelsManager.getPredefinedLabels();
    if (labels?.vip) {
      await labelsManager.assignLabel(phone, labels.vip);
    }
  }

  console.log(`[webhook-momence] New subscription: ${subscriptionName} for ${phone.slice(-4)}`);

  return {
    action: 'subscription_processed',
    details: `Subscription: ${subscriptionName}`,
  };
}

async function handleSubscriptionCancelled(
  data: MomenceEventData,
  redis: ReturnType<typeof getRedisClient>
): Promise<{ action: string; details?: string }> {
  const { memberPhone } = data;

  if (!memberPhone) {
    return { action: 'skipped', details: 'No phone number' };
  }

  const phone = normalizePhone(memberPhone);
  const labelsManager = getLabelsManager(redis);

  // Mark as inactive
  await labelsManager.markInactiveMember(phone);

  // Remove VIP label if present
  const labels = await labelsManager.getPredefinedLabels();
  if (labels?.vip) {
    await labelsManager.removeLabel(phone, labels.vip);
  }

  console.log(`[webhook-momence] Subscription cancelled for ${phone.slice(-4)}`);

  return { action: 'subscription_cancelled_processed' };
}

// --------------------------------------------------------------------------
// MEMBER EVENTS
// --------------------------------------------------------------------------

async function handleMemberCreated(
  data: MomenceEventData,
  redis: ReturnType<typeof getRedisClient>
): Promise<{ action: string; details?: string }> {
  const { memberPhone, memberEmail, memberName } = data;

  if (!memberPhone) {
    return { action: 'skipped', details: 'No phone number' };
  }

  const phone = normalizePhone(memberPhone);

  // Store member info in Redis for quick lookup
  if (redis) {
    const memberKey = `member:${phone}`;
    await redis.hset(memberKey, {
      phone,
      email: memberEmail || '',
      name: memberName || '',
      createdAt: new Date().toISOString(),
    });
    await redis.expire(memberKey, 365 * 24 * 60 * 60); // 1 year
  }

  console.log(`[webhook-momence] New member created: ${memberName} (${phone.slice(-4)})`);

  return {
    action: 'member_created',
    details: memberName,
  };
}

// ============================================================================
// VERIFICACIÓN DE FIRMA HMAC (Modo Audit - Solo logging, no bloquea)
// ============================================================================

interface SignatureVerificationResult {
  valid: boolean;
  reason: string;
}

/**
 * Verifica la firma HMAC del webhook de Momence
 * MODO AUDIT: Retorna resultado detallado para logging, pero NO bloquea
 *
 * Momence puede enviar firma en headers como:
 * - x-momence-signature
 * - x-webhook-signature
 * - x-signature
 */
function verifyMomenceSignature(req: VercelRequest): SignatureVerificationResult {
  const webhookSecret = process.env['MOMENCE_WEBHOOK_SECRET'];

  if (!webhookSecret) {
    return {
      valid: false,
      reason: 'MOMENCE_WEBHOOK_SECRET not configured',
    };
  }

  // Buscar firma en headers comunes
  const signature =
    (req.headers['x-momence-signature'] as string) ||
    (req.headers['x-webhook-signature'] as string) ||
    (req.headers['x-signature'] as string);

  if (!signature) {
    return {
      valid: false,
      reason: 'No signature header (not configured by Momence)',
    };
  }

  try {
    // Calcular HMAC esperado
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

    // Comparar (con o sin prefijo sha256=)
    const providedSig = signature.replace(/^sha256=/, '');

    if (providedSig.length !== expectedSignature.length) {
      return {
        valid: false,
        reason: `Signature length mismatch`,
      };
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(providedSig),
      Buffer.from(expectedSignature)
    );

    if (isValid) {
      return { valid: true, reason: 'Signature matches' };
    } else {
      return { valid: false, reason: 'Signature mismatch (HMAC does not match)' };
    }
  } catch (error) {
    return {
      valid: false,
      reason: `Verification error: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}
