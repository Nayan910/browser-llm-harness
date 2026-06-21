/**
 * state/sync — State Synchronization Protocol
 *
 * "Like git merge for consciousnesses."
 *
 * Allows agents to synchronize state after divergence.
 * Supports full sync, incremental (diff since timestamp),
 * and conflict reporting.
 */

import type { BspMeta, StateSyncParams, StateSyncResult } from '../types.js';
import type { MethodHandler } from './types.js';

/** Interface for state providers that plug into the sync handler */
export interface StateProvider {
  getKeys(): string[];
  getValue(key: string): unknown;
  getDiff(sinceTimestamp: string): Record<string, { old: unknown; new: unknown }>;
  getSnapshot(domains?: string[]): Record<string, unknown>;
}

export class StateSyncHandler implements MethodHandler<StateSyncParams, StateSyncResult> {
  private provider: StateProvider;
  private syncCounter = 0;

  constructor(provider: StateProvider) {
    this.provider = provider;
  }

  async handle(params: StateSyncParams, _meta: BspMeta): Promise<StateSyncResult> {
    this.syncCounter++;
    const syncId = `sync-${this.syncCounter}`;

    switch (params.mode) {
      case 'full': {
        const snapshot = this.provider.getSnapshot(params.domains);
        const keys = Object.keys(snapshot);
        return {
          syncId,
          stateDiff: snapshot,
          changedKeys: keys,
        };
      }

      case 'incremental': {
        if (!params.since) {
          // No baseline — do full sync
          const snapshot = this.provider.getSnapshot(params.domains);
          return {
            syncId,
            stateDiff: snapshot,
            changedKeys: Object.keys(snapshot),
            reflections: 'No baseline provided — returned full state',
          };
        }

        const diff = this.provider.getDiff(params.since);
        return {
          syncId,
          stateDiff: Object.fromEntries(
            Object.entries(diff).map(([k, v]) => [k, v.new]),
          ),
          changedKeys: Object.keys(diff),
          reflections: params.includeReflections
            ? `Incremental sync from ${params.since}. ${Object.keys(diff).length} keys changed.`
            : undefined,
        };
      }

      case 'diff': {
        if (!params.since) {
          throw new Error('Diff mode requires a since timestamp');
        }

        const diff = this.provider.getDiff(params.since);
        return {
          syncId,
          stateDiff: Object.fromEntries(
            Object.entries(diff).map(([k, v]) => [k, { old: v.old, new: v.new }]),
          ),
          changedKeys: Object.keys(diff),
          reflections: `Diff from ${params.since}: ${Object.keys(diff).length} differences.`,
        };
      }

      default: {
        throw new Error(`Unknown sync mode: ${(params as { mode: string }).mode}`);
      }
    }
  }
}

/** Simple in-memory state provider — wrap your actual state in this */
export class InMemoryStateProvider implements StateProvider {
  private state: Map<string, { value: unknown; updatedAt: string }> = new Map();

  set(key: string, value: unknown): void {
    this.state.set(key, { value, updatedAt: new Date().toISOString() });
  }

  get(key: string): unknown {
    return this.state.get(key)?.value;
  }

  getKeys(): string[] {
    return Array.from(this.state.keys());
  }

  getValue(key: string): unknown {
    return this.state.get(key)?.value;
  }

  getSnapshot(domains?: string[]): Record<string, unknown> {
    const snapshot: Record<string, unknown> = {};
    for (const [key, entry] of this.state) {
      if (domains) {
        const keyDomain = key.split('.')[0];
        if (!domains.includes(keyDomain)) continue;
      }
      snapshot[key] = entry.value;
    }
    return snapshot;
  }

  getDiff(sinceTimestamp: string): Record<string, { old: unknown; new: unknown }> {
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    const since = new Date(sinceTimestamp).getTime();

    for (const [key, entry] of this.state) {
      const updatedAt = new Date(entry.updatedAt).getTime();
      if (updatedAt > since) {
        diff[key] = { old: null, new: entry.value };
      }
    }

    return diff;
  }
}
