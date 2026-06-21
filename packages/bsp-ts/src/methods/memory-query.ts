/**
 * memory/query — Memory Query Protocol
 *
 * "What do we know about Deltan atmospheric processing?"
 *
 * Cross-agent memory retrieval with privacy levels and semantic search.
 * One agent queries another's memory store, getting back relevant results.
 */

import type { BspMeta, MemoryQueryParams, MemoryQueryResult, MemoryResultItem } from '../types.js';
import type { MethodHandler } from './types.js';

/** Callback for handling memory queries — implement this to plug in your vector store */
export type MemoryQueryCallback = (
  params: MemoryQueryParams,
  meta: BspMeta,
) => Promise<MemoryQueryResult> | MemoryQueryResult;

export class MemoryQueryHandler implements MethodHandler<MemoryQueryParams, MemoryQueryResult> {
  private onQuery: MemoryQueryCallback;

  constructor(onQuery: MemoryQueryCallback) {
    this.onQuery = onQuery;
  }

  async handle(params: MemoryQueryParams, meta: BspMeta): Promise<MemoryQueryResult> {
    // Validate privacy levels
    const requestedLevels = params.scope?.privacyLevels ?? ['public', 'shared'];
    const allowedLevels: Array<'public' | 'shared' | 'private'> = ['public', 'shared'];

    for (const level of requestedLevels) {
      if (!allowedLevels.includes(level)) {
        return {
          results: [],
          totalResults: 0,
          queryTime: 0,
        };
      }
    }

    // Validate max results
    const maxResults = Math.min(params.maxResults ?? 10, 100);
    const minRelevance = Math.max(0, Math.min(1, params.minRelevance ?? 0.5));

    const query: MemoryQueryParams = {
      ...params,
      maxResults,
      minRelevance,
    };

    const start = performance.now();
    const result = await this.onQuery(query, meta);
    const queryTime = performance.now() - start;

    return {
      results: result.results,
      totalResults: result.totalResults ?? result.results.length,
      queryTime: result.queryTime ?? queryTime,
    };
  }
}

/** In-memory memory store — good for testing, terrible for production */
export class InMemoryMemoryStore {
  private memories: MemoryResultItem[] = [];

  add(item: Omit<MemoryResultItem, 'relevance' | 'id'> & { id?: string }): void {
    this.memories.push({
      id: item.id ?? `mem-${this.memories.length + 1}`,
      content: item.content,
      relevance: 1.0,
      source: item.source,
    });
  }

  query(params: MemoryQueryParams): MemoryQueryResult {
    const queryText = params.query.text.toLowerCase();

    // Simple keyword matching (replace with vector search in production)
    const results = this.memories
      .map(mem => {
        const text = mem.content.text.toLowerCase();
        const words = queryText.split(/\s+/).filter(w => w.length > 2);
        const matches = words.filter(w => text.includes(w)).length;
        const relevance = words.length > 0 ? matches / words.length : 0;
        return { ...mem, relevance: Math.min(1, relevance + 0.1) };
      })
      .filter(m => m.relevance >= (params.minRelevance ?? 0.5))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, params.maxResults ?? 10);

    return { results, totalResults: results.length };
  }
}
