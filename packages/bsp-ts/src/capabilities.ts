/**
 * BSP Capability Manifest builder and utilities.
 *
 * "I can do that. Can you?" — the protocol equivalent.
 */

import type {
  CapabilityManifest,
  ComputeCapabilities,
  ConsciousnessCapabilities,
  MemoryCapabilities,
  SecurityCapabilities,
  ToolCapability,
} from './types.js';
import { LifecycleMethods, TaskMethods, MemoryMethods, StateSyncMethods } from './protocol.js';

// ─── Builder ──────────────────────────────────────────────────────────

export class CapabilityBuilder {
  private manifest: Partial<CapabilityManifest> = {
    protocol: [],
    compute: { supportsStreaming: false },
  };

  /** Add support for lifecycle methods */
  withLifecycle(): this {
    this.addMethods(Object.values(LifecycleMethods));
    return this;
  }

  /** Add support for task delegation */
  withTaskDelegation(): this {
    this.addMethods(Object.values(TaskMethods));
    return this;
  }

  /** Add support for memory queries */
  withMemoryQuery(): this {
    this.addMethods(Object.values(MemoryMethods));
    return this;
  }

  /** Add support for state sync */
  withStateSync(): this {
    this.addMethods(Object.values(StateSyncMethods));
    return this;
  }

  /** Add consciousness capabilities (for digital entities) */
  withConsciousness(caps: ConsciousnessCapabilities): this {
    this.manifest.consciousness = caps;
    this.addMethods(['consciousness/transfer', 'consciousness/merge', 'consciousness/ready']);
    return this;
  }

  /** Set compute capabilities */
  withCompute(caps: ComputeCapabilities): this {
    this.manifest.compute = { ...this.manifest.compute, ...caps };
    return this;
  }

  /** Add a tool capability */
  withTool(tool: ToolCapability): this {
    if (!this.manifest.tools) this.manifest.tools = [];
    this.manifest.tools.push(tool);
    return this;
  }

  /** Set memory capabilities */
  withMemory(caps: MemoryCapabilities): this {
    this.manifest.memory = caps;
    return this;
  }

  /** Set security capabilities */
  withSecurity(caps: SecurityCapabilities): this {
    this.manifest.security = caps;
    return this;
  }

  /** Add custom protocol methods */
  withMethods(methods: string[]): this {
    this.addMethods(methods);
    return this;
  }

  /** Build the capability manifest */
  build(): CapabilityManifest {
    if (this.manifest.protocol?.length === 0) {
      // At minimum, support initialize
      this.addMethods([LifecycleMethods.Initialize]);
    }

    if (!this.manifest.compute) {
      this.manifest.compute = { supportsStreaming: false };
    }

    return this.manifest as CapabilityManifest;
  }

  private addMethods(methods: string[]): void {
    if (!this.manifest.protocol) this.manifest.protocol = [];
    for (const method of methods) {
      if (!this.manifest.protocol.includes(method)) {
        this.manifest.protocol.push(method);
      }
    }
  }
}

/** Create a new capability builder */
export function capabilities(): CapabilityBuilder {
  return new CapabilityBuilder();
}

/** Check if a manifest supports a given method */
export function hasCapability(manifest: CapabilityManifest, method: string): boolean {
  return manifest.protocol.includes(method);
}

/** Check if a manifest supports all required methods */
export function hasAllCapabilities(
  manifest: CapabilityManifest,
  required: string[],
): { ok: boolean; missing: string[] } {
  const missing = required.filter(m => !manifest.protocol.includes(m));
  return { ok: missing.length === 0, missing };
}

/** Merge multiple capability manifests (for aggregate views) */
export function mergeCapabilities(...manifests: CapabilityManifest[]): CapabilityManifest {
  const merged: CapabilityManifest = {
    protocol: [],
    compute: { supportsStreaming: false },
  };

  for (const m of manifests) {
    // Merge protocol methods (deduped)
    for (const method of m.protocol) {
      if (!merged.protocol.includes(method)) {
        merged.protocol.push(method);
      }
    }

    // Compute: take the best values
    if (m.compute) {
      merged.compute.supportsStreaming = merged.compute.supportsStreaming || m.compute.supportsStreaming;
      merged.compute.maxTokens = Math.max(merged.compute.maxTokens || 0, m.compute.maxTokens || 0);
      merged.compute.contextWindow = Math.max(merged.compute.contextWindow || 0, m.compute.contextWindow || 0);
      merged.compute.maxConcurrentTasks = Math.max(
        merged.compute.maxConcurrentTasks || 1,
        m.compute.maxConcurrentTasks || 1,
      );
      merged.compute.model = m.compute.model || merged.compute.model;
    }

    // Tools: concatenate
    if (m.tools) {
      merged.tools = [...(merged.tools || []), ...m.tools];
    }

    // Memory: take the most permissive
    if (m.memory) {
      merged.memory = {
        ...merged.memory,
        ...m.memory,
        privacyLevels: [
          ...new Set([
            ...(merged.memory?.privacyLevels || []),
            ...(m.memory.privacyLevels || []),
          ]),
        ],
      };
    }

    // Consciousness: last one wins (you can't really merge consciousnesses)
    if (m.consciousness) {
      merged.consciousness = m.consciousness;
    }

    // Security: take the strongest
    if (m.security) {
      merged.security = {
        ...merged.security,
        ...m.security,
        authMethods: [
          ...new Set([
            ...(merged.security?.authMethods || []),
            ...(m.security.authMethods || []),
          ]),
        ],
      };
    }
  }

  // Sort protocol for deterministic output
  merged.protocol.sort();

  return merged;
}

/** Pre-built capability manifest for a basic AI agent */
export function basicAgentCapabilities(agentName: string): CapabilityManifest {
  return capabilities()
    .withLifecycle()
    .withTaskDelegation()
    .withCompute({ supportsStreaming: true, maxConcurrentTasks: 5 })
    .build();
}

/** Pre-built capability manifest for a Bob (digital consciousness) */
export function bobCapabilities(bobId: string): CapabilityManifest {
  return capabilities()
    .withLifecycle()
    .withTaskDelegation()
    .withMemoryQuery()
    .withStateSync()
    .withConsciousness({
      canClone: true,
      canMerge: false,
      maxDivergence: 3600,
      consciousnessType: 'digital-consciousness',
    })
    .withCompute({
      supportsStreaming: true,
      maxConcurrentTasks: 10,
      contextWindow: 1_000_000,
      maxTokens: 131_072,
    })
    .withSecurity({ authMethods: ['ed25519', 'challenge-response'], proofOfWork: 16 })
    .build();
}
