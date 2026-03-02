/**
 * RAG Module — Barrel exports
 */

export { KNOWLEDGE_CHUNKS, CHUNK_VERSION, type KnowledgeChunk } from './chunks.js';
export { embedText, cosineSimilarity, seedAllChunks, checkVersion } from './embeddings.js';
export { retrieveRelevantChunks, type RetrievedChunk, type RetrievalResult } from './retriever.js';
