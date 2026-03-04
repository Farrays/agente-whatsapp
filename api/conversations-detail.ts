/**
 * GET /api/conversations-detail?phone=34XXXXXXXXX
 *
 * Obtiene el detalle completo de una conversación:
 * historial de mensajes, estado de takeover, info de miembro.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisClient } from './lib/redis.js';
import {
  getConversationHistory,
  getTakeoverInfo,
  markConversationRead,
} from './lib/ai/human-takeover.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse | void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const phone = req.query['phone'] as string;
  if (!phone) {
    return res.status(400).json({ error: 'Missing phone parameter' });
  }

  try {
    const redis = getRedisClient();

    const [messages, takeover, , contactNameRaw] = await Promise.all([
      getConversationHistory(redis, phone),
      getTakeoverInfo(redis, phone),
      markConversationRead(redis, phone),
      redis.get(`contact:name:${phone}`).catch(() => null),
    ]);

    const contactName =
      contactNameRaw && typeof contactNameRaw === 'string' ? contactNameRaw : undefined;

    return res.status(200).json({
      phone,
      contactName,
      messages,
      takeover: takeover || { active: false },
      _v: '2026-03-04a',
    });
  } catch (error) {
    console.error('[conversations-detail] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
