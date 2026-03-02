/**
 * RAG Seed API
 *
 * POST /api/rag-seed — Embed all knowledge chunks and store vectors in Redis
 * GET  /api/rag-seed — Check current seed status and version
 *
 * Auth: Bearer {ANALYTICS_API_KEY}
 *
 * Run this after deploying content changes to LAURA_PROMPT.md or pricing-data.ts.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisClient } from './lib/redis.js';
import { seedAllChunks, checkVersion } from './lib/ai/rag/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).setHeader('Access-Control-Allow-Origin', '*').end();
    return;
  }

  // Auth
  const authHeader = req.headers.authorization;
  const expectedKey = process.env['ANALYTICS_API_KEY'];

  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const redis = getRedisClient();

    if (req.method === 'GET') {
      // Status check
      const version = await checkVersion(redis);
      res.status(200).json({
        status: version.needsReseed ? 'stale' : 'up_to_date',
        currentVersion: version.current,
        storedVersion: version.stored,
        needsReseed: version.needsReseed,
      });
      return;
    }

    if (req.method === 'POST') {
      // Seed all chunks
      const startTime = Date.now();
      const result = await seedAllChunks(redis);
      const durationMs = Date.now() - startTime;

      res.status(200).json({
        success: true,
        chunksSeeded: result.chunksSeeded,
        version: result.version,
        durationMs,
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed. Use GET (status) or POST (seed).' });
  } catch (error) {
    console.error('[rag-seed] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
