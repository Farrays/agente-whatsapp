/**
 * RAG Embeddings — OpenAI text-embedding-3-small + Redis vector storage
 *
 * Uses 512 dimensions (vs 1536 default) for 3x less storage while
 * retaining 96%+ accuracy for this small knowledge base.
 *
 * Redis key patterns:
 * - rag:chunk:{id}:text  → chunk content text
 * - rag:chunk:{id}:vec   → JSON array of 512 floats
 * - rag:chunks:ids       → SET of all chunk IDs
 * - rag:chunks:version   → version string for re-seed detection
 */

import type { Redis } from '@upstash/redis';
import { getOpenAIClient } from '../openai-client.js';
import { KNOWLEDGE_CHUNKS, CHUNK_VERSION, type KnowledgeChunk } from './chunks.js';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 512;

// Redis key helpers
const KEYS = {
  chunkText: (id: string): string => `rag:chunk:${id}:text`,
  chunkVec: (id: string): string => `rag:chunk:${id}:vec`,
  chunksIds: 'rag:chunks:ids',
  chunksVersion: 'rag:chunks:version',
};

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

/**
 * Generate an embedding vector for the given text using OpenAI.
 */
export async function embedText(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return response.data[0]!.embedding;
}

// ============================================================================
// COSINE SIMILARITY
// ============================================================================

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical, 0 = orthogonal).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dotProduct += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

// ============================================================================
// REDIS STORAGE
// ============================================================================

/**
 * Store a chunk's text and embedding vector in Redis.
 */
export async function storeChunkEmbedding(
  redis: Redis,
  chunkId: string,
  text: string,
  vector: number[]
): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.set(KEYS.chunkText(chunkId), text);
  pipeline.set(KEYS.chunkVec(chunkId), JSON.stringify(vector));
  pipeline.sadd(KEYS.chunksIds, chunkId);
  await pipeline.exec();
}

/**
 * Load all chunk vectors from Redis in a single round-trip.
 * Returns a Map of chunkId → vector, or null if no chunks are stored.
 */
export async function loadAllVectors(redis: Redis): Promise<Map<string, number[]> | null> {
  // Get all stored chunk IDs
  const ids = await redis.smembers(KEYS.chunksIds);
  if (!ids || ids.length === 0) return null;

  // MGET all vectors in one round-trip
  const vecKeys = (ids as string[]).map(id => KEYS.chunkVec(id));
  const rawVectors = await redis.mget<(string | null)[]>(...vecKeys);

  const result = new Map<string, number[]>();
  for (let i = 0; i < ids.length; i++) {
    const raw = rawVectors[i];
    if (raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      result.set(ids[i] as string, parsed as number[]);
    }
  }

  return result.size > 0 ? result : null;
}

/**
 * Load chunk texts from Redis for the given IDs.
 */
export async function loadChunkTexts(
  redis: Redis,
  chunkIds: string[]
): Promise<Map<string, string>> {
  if (chunkIds.length === 0) return new Map();

  const textKeys = chunkIds.map(id => KEYS.chunkText(id));
  const rawTexts = await redis.mget<(string | null)[]>(...textKeys);

  const result = new Map<string, string>();
  for (let i = 0; i < chunkIds.length; i++) {
    const text = rawTexts[i];
    if (text) {
      result.set(chunkIds[i] ?? '', text);
    }
  }
  return result;
}

// ============================================================================
// SEEDING
// ============================================================================

/**
 * Embed all knowledge chunks and store in Redis.
 * Called via POST /api/rag-seed after content changes.
 */
export async function seedAllChunks(
  redis: Redis
): Promise<{ chunksSeeded: number; version: string }> {
  let seeded = 0;

  for (const chunk of KNOWLEDGE_CHUNKS) {
    const vector = await embedText(chunk.content);
    await storeChunkEmbedding(redis, chunk.id, chunk.content, vector);
    seeded++;
    console.log(`[rag-seed] Embedded chunk: ${chunk.id} (${chunk.tokenEstimate} tokens est.)`);
  }

  // Store version
  await redis.set(KEYS.chunksVersion, CHUNK_VERSION);

  console.log(`[rag-seed] Seeded ${seeded} chunks, version ${CHUNK_VERSION}`);
  return { chunksSeeded: seeded, version: CHUNK_VERSION };
}

/**
 * Check if stored embeddings match the current chunk version.
 */
export async function checkVersion(
  redis: Redis
): Promise<{ current: string; stored: string | null; needsReseed: boolean }> {
  const stored = await redis.get<string>(KEYS.chunksVersion);
  return {
    current: CHUNK_VERSION,
    stored,
    needsReseed: stored !== CHUNK_VERSION,
  };
}

// Re-export for convenience
export { KNOWLEDGE_CHUNKS, CHUNK_VERSION, type KnowledgeChunk, KEYS };
