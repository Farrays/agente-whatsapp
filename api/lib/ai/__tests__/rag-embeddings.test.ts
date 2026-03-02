/**
 * RAG Embeddings Tests
 *
 * Tests cosine similarity and chunk definitions.
 * Run with: npm test -- rag-embeddings.test.ts
 */

import { describe, it, expect } from 'vitest';
import { cosineSimilarity } from '../rag/embeddings';
import { KNOWLEDGE_CHUNKS, CHUNK_VERSION } from '../rag/chunks';

describe('cosineSimilarity', () => {
  it('should return 1 for identical vectors', () => {
    const v = [1, 2, 3, 4, 5];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
  });

  it('should return 0 for orthogonal vectors', () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0, 5);
  });

  it('should return -1 for opposite vectors', () => {
    const a = [1, 2, 3];
    const b = [-1, -2, -3];
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 5);
  });

  it('should return 0 for zero vector', () => {
    const a = [1, 2, 3];
    const b = [0, 0, 0];
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it('should handle normalized vectors correctly', () => {
    const a = [0.6, 0.8]; // normalized
    const b = [0.8, 0.6]; // normalized
    const expected = 0.6 * 0.8 + 0.8 * 0.6; // 0.96
    expect(cosineSimilarity(a, b)).toBeCloseTo(expected, 5);
  });

  it('should be symmetric', () => {
    const a = [1, 3, 5, 7];
    const b = [2, 4, 6, 8];
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a), 10);
  });

  it('should handle single-element vectors', () => {
    expect(cosineSimilarity([5], [5])).toBeCloseTo(1, 5);
    expect(cosineSimilarity([5], [-5])).toBeCloseTo(-1, 5);
  });
});

describe('KNOWLEDGE_CHUNKS', () => {
  it('should have exactly 10 chunks', () => {
    expect(KNOWLEDGE_CHUNKS).toHaveLength(10);
  });

  it('should have unique IDs', () => {
    const ids = KNOWLEDGE_CHUNKS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have all expected chunk IDs', () => {
    const ids = KNOWLEDGE_CHUNKS.map(c => c.id);
    expect(ids).toContain('center-info');
    expect(ids).toContain('prices-monthly');
    expect(ids).toContain('prices-packages');
    expect(ids).toContain('dance-styles');
    expect(ids).toContain('teachers');
    expect(ids).toContain('levels');
    expect(ids).toContain('trial-classes');
    expect(ids).toContain('policies');
    expect(ids).toContain('faqs');
    expect(ids).toContain('urls-links');
  });

  it('each chunk should have required fields', () => {
    for (const chunk of KNOWLEDGE_CHUNKS) {
      expect(chunk.id).toBeTruthy();
      expect(chunk.section).toBeTruthy();
      expect(chunk.keywords).toBeInstanceOf(Array);
      expect(chunk.keywords.length).toBeGreaterThan(0);
      expect(chunk.content).toBeTruthy();
      expect(chunk.content.length).toBeGreaterThan(50);
      expect(chunk.tokenEstimate).toBeGreaterThan(0);
    }
  });

  it('pricing chunks should contain actual prices from pricing-data.ts', () => {
    const monthlyChunk = KNOWLEDGE_CHUNKS.find(c => c.id === 'prices-monthly');
    expect(monthlyChunk).toBeDefined();
    // Must contain actual prices (e.g., 55euro for Plan 1 Actividad)
    expect(monthlyChunk?.content).toMatch(/\d+euro/);

    const packagesChunk = KNOWLEDGE_CHUNKS.find(c => c.id === 'prices-packages');
    expect(packagesChunk).toBeDefined();
    expect(packagesChunk?.content).toMatch(/\d+euro/);
  });

  it('keywords should all be lowercase', () => {
    for (const chunk of KNOWLEDGE_CHUNKS) {
      for (const kw of chunk.keywords) {
        expect(kw).toBe(kw.toLowerCase());
      }
    }
  });
});

describe('CHUNK_VERSION', () => {
  it('should be a valid semver string', () => {
    expect(CHUNK_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
