/**
 * RAG Retriever — Query embedding + chunk retrieval orchestrator
 *
 * Flow:
 * 1. Embed user query via OpenAI (text-embedding-3-small, 512 dims)
 * 2. MGET all chunk vectors from Redis (single round-trip)
 * 3. Compute cosine similarity for each chunk
 * 4. Apply keyword boost (+0.15) if query matches chunk keywords
 * 5. Filter by threshold, take top-K
 * 6. Load chunk texts for selected chunks
 * 7. Return ordered results (or fallback signal)
 */

import type { Redis } from '@upstash/redis';
import {
  embedText,
  cosineSimilarity,
  loadAllVectors,
  loadChunkTexts,
  KNOWLEDGE_CHUNKS,
} from './embeddings.js';

// ============================================================================
// TYPES
// ============================================================================

export interface RetrievedChunk {
  id: string;
  content: string;
  score: number;
  boosted: boolean;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  fallback: boolean;
  latencyMs: number;
}

interface RetrievalOptions {
  topK?: number;
  threshold?: number;
  boostKeywords?: boolean;
}

// ============================================================================
// KEYWORD BOOST
// ============================================================================

const KEYWORD_BOOST = 0.15;

/** Build a lookup: chunkId → keywords array (cached at module level) */
const chunkKeywordsMap = new Map<string, string[]>();
for (const chunk of KNOWLEDGE_CHUNKS) {
  chunkKeywordsMap.set(chunk.id, chunk.keywords);
}

/**
 * Check if the query text matches any keyword for a given chunk.
 */
function queryMatchesChunkKeywords(query: string, chunkId: string): boolean {
  const keywords = chunkKeywordsMap.get(chunkId);
  if (!keywords) return false;
  const lowerQuery = query.toLowerCase();
  return keywords.some(kw => lowerQuery.includes(kw));
}

// ============================================================================
// MAIN RETRIEVER
// ============================================================================

/**
 * Retrieve the most relevant knowledge chunks for a user query.
 *
 * Returns { chunks, fallback, latencyMs }.
 * If fallback=true, the caller should use the full system prompt instead.
 */
export async function retrieveRelevantChunks(
  redis: Redis,
  query: string,
  options?: RetrievalOptions
): Promise<RetrievalResult> {
  const startTime = Date.now();
  const topK = options?.topK ?? 3;
  const threshold = options?.threshold ?? 0.25;
  const boostKeywords = options?.boostKeywords ?? true;

  try {
    // 1. Load all stored chunk vectors from Redis
    const allVectors = await loadAllVectors(redis);
    if (!allVectors) {
      console.warn('[rag-retriever] No chunk vectors in Redis (not seeded?)');
      return { chunks: [], fallback: true, latencyMs: Date.now() - startTime };
    }

    // 2. Embed the user query
    const queryVector = await embedText(query);

    // 3. Score each chunk
    const scored: { id: string; rawScore: number; finalScore: number; boosted: boolean }[] = [];

    for (const [chunkId, chunkVector] of allVectors) {
      const rawScore = cosineSimilarity(queryVector, chunkVector);
      let finalScore = rawScore;
      let boosted = false;

      // 4. Keyword boost
      if (boostKeywords && queryMatchesChunkKeywords(query, chunkId)) {
        finalScore += KEYWORD_BOOST;
        boosted = true;
      }

      scored.push({ id: chunkId, rawScore, finalScore, boosted });
    }

    // 5. Sort by final score (desc), filter by threshold, take top-K
    const selected = scored
      .filter(s => s.finalScore >= threshold)
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, topK);

    if (selected.length === 0) {
      console.log('[rag-retriever] No chunks above threshold — fallback to full prompt');
      return { chunks: [], fallback: true, latencyMs: Date.now() - startTime };
    }

    // 6. Load texts for selected chunks
    const selectedIds = selected.map(s => s.id);
    const texts = await loadChunkTexts(redis, selectedIds);

    // 7. Build result
    const chunks: RetrievedChunk[] = selected
      .map(s => {
        const content = texts.get(s.id);
        if (!content) return null;
        return {
          id: s.id,
          content,
          score: Math.round(s.finalScore * 1000) / 1000,
          boosted: s.boosted,
        };
      })
      .filter((c): c is RetrievedChunk => c !== null);

    const latencyMs = Date.now() - startTime;
    console.log(
      `[rag-retriever] Retrieved ${chunks.length} chunks in ${latencyMs}ms: [${chunks.map(c => `${c.id}(${c.score})`).join(', ')}]`
    );

    return { chunks, fallback: false, latencyMs };
  } catch (error) {
    console.error('[rag-retriever] Error — fallback to full prompt:', error);
    return { chunks: [], fallback: true, latencyMs: Date.now() - startTime };
  }
}
