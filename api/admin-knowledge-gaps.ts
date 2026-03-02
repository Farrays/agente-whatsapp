/**
 * Knowledge Gaps API
 *
 * GET /api/admin-knowledge-gaps?action=summary
 *   → Top gap topics + today's stats + 7-day trend
 *
 * GET /api/admin-knowledge-gaps?action=stats&date=2026-02-28
 *   → Daily gap stats for a specific date
 *
 * GET /api/admin-knowledge-gaps?action=topics&limit=20
 *   → Top gap topics sorted by frequency (all time)
 *
 * GET /api/admin-knowledge-gaps?action=recent&limit=50
 *   → Most recent gap log entries
 *
 * GET /api/admin-knowledge-gaps?action=trend&days=7
 *   → Multi-day stats for trend analysis
 *
 * Auth: Bearer {ANALYTICS_API_KEY}
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisClient } from './lib/redis.js';
import {
  getGapStats,
  getTopGapTopics,
  getRecentGaps,
  getGapStatsTrend,
} from './lib/ai/knowledge-gap.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).setHeader('Access-Control-Allow-Origin', '*').end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Auth (same as agent-analytics)
  const authHeader = req.headers.authorization;
  const expectedKey = process.env['ANALYTICS_API_KEY'];

  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const redis = getRedisClient();
    const action = (req.query['action'] as string) || 'summary';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');

    switch (action) {
      case 'summary': {
        const [topics, todayStats, trend] = await Promise.all([
          getTopGapTopics(redis, 15),
          getGapStats(redis),
          getGapStatsTrend(redis, 7),
        ]);
        res.status(200).json({ topics, todayStats, trend });
        return;
      }

      case 'stats': {
        const date = req.query['date'] as string | undefined;
        const stats = await getGapStats(redis, date);
        res.status(200).json({ date: date || new Date().toISOString().split('T')[0], stats });
        return;
      }

      case 'topics': {
        const limit = parseInt(req.query['limit'] as string, 10) || 20;
        const topics = await getTopGapTopics(redis, limit);
        res.status(200).json({ topics });
        return;
      }

      case 'recent': {
        const limit = parseInt(req.query['limit'] as string, 10) || 50;
        const gaps = await getRecentGaps(redis, limit);
        res.status(200).json({ gaps });
        return;
      }

      case 'trend': {
        const days = parseInt(req.query['days'] as string, 10) || 7;
        const trend = await getGapStatsTrend(redis, Math.min(days, 90));
        res.status(200).json({ trend });
        return;
      }

      default:
        res.status(400).json({
          error: `Unknown action: ${action}`,
          valid: ['summary', 'stats', 'topics', 'recent', 'trend'],
        });
    }
  } catch (error) {
    console.error('[admin-knowledge-gaps] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
