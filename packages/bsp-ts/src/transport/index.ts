/**
 * BSP Transport Layer
 *
 * Abstract transport interface that lets agents communicate over
 * stdio, TCP, SCUT, or BobNet — same protocol, different wires.
 *
 * "stdio is everywhere — zero dependency transport."
 */

import { type BspMessage, type BspNotification, type TransportConfig, type TransportType } from '../types.js';

// ─── Transport Events ─────────────────────────────────────────────────

export interface TransportEvents {
  message: (message: BspMessage) => void;
  notification: (notification: BspNotification) => void;
  error: (error: Error) => void;
  close: () => void;
  open: () => void;
}

export type TransportEventListener<K extends keyof TransportEvents> = TransportEvents[K];

// ─── Abstract Transport ───────────────────────────────────────────────

export abstract class Transport {
  public abstract readonly type: TransportType;
  public abstract readonly config: TransportConfig;

  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  /** Connect / open the transport */
  abstract connect(): Promise<void>;

  /** Disconnect / close the transport */
  abstract disconnect(): Promise<void>;

  /** Send a message through the transport */
  abstract send(message: BspMessage | BspNotification): Promise<void>;

  /** Whether the transport is currently connected */
  abstract isConnected(): boolean;

  /** Get the transport address (for display/routing) */
  abstract getAddress(): string;

  // ─── Event Emitter ────────────────────────────────────────────────

  on<K extends keyof TransportEvents>(event: K, listener: TransportEvents[K]): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as (...args: unknown[]) => void);
    return this;
  }

  off<K extends keyof TransportEvents>(event: K, listener: TransportEvents[K]): this {
    this.listeners.get(event)?.delete(listener as (...args: unknown[]) => void);
    return this;
  }

  protected emit<K extends keyof TransportEvents>(
    event: K,
    ...args: Parameters<TransportEvents[K]>
  ): void {
    this.listeners.get(event)?.forEach(listener => {
      try {
        (listener as (...args: unknown[]) => void)(...args);
      } catch (err) {
        console.error(`[BSP Transport] Error in ${event} listener:`, err);
      }
    });
  }

  /** Remove all listeners */
  removeAllListeners(): void {
    this.listeners.clear();
  }

  /** Get count of listeners for an event */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

// ─── Transport Factory ────────────────────────────────────────────────

export type { StdioTransport } from './stdio.js';
export type { TcpTransport } from './tcp.js';

export function createTransport(config: TransportConfig): Transport {
  switch (config.type) {
    case 'stdio': {
      // Dynamic import to avoid circular deps
      const { StdioTransport } = require('./stdio.js');
      return new StdioTransport(config);
    }
    case 'tcp': {
      const { TcpTransport } = require('./tcp.js');
      return new TcpTransport(config);
    }
    case 'scut':
    case 'bobnet':
      throw new Error(`Transport type '${config.type}' not yet implemented. Patience. It's a long-range protocol.`);
    default:
      throw new Error(`Unknown transport type: ${config.type}`);
  }
}
