/**
 * BSP Client
 *
 * "Connect me to Bill."
 *
 * Connects to a remote BSP agent, performs capability negotiation,
 * and exposes a clean API for calling methods on the remote agent.
 */

import type {
  BspMessage,
  BspMeta,
  CapabilityManifest,
  InitializeParams,
  InitializeResult,
  SenderType,
  TransportConfig,
} from './types.js';
import { Transport, createTransport } from './transport/index.js';
import {
  LifecycleMethods,
  createMeta,
  generateMessageId,
  validateMessage,
} from './protocol.js';
import { hasCapability, hasAllCapabilities } from './capabilities.js';

// ─── Client Options ───────────────────────────────────────────────────

export interface BspClientOptions {
  name: string;
  version: string;
  senderType: SenderType;
  capabilities: CapabilityManifest;
  transport: Transport | TransportConfig;
  /** Connection timeout in ms */
  connectTimeout?: number;
  /** Default request timeout in ms */
  requestTimeout?: number;
}

// ─── Client ───────────────────────────────────────────────────────────

export class BspClient {
  private options: BspClientOptions;
  private transport: Transport;
  private sessionId: string | null = null;
  private remoteCapabilities: CapabilityManifest | null = null;
  private remoteInfo: InitializeResult['serverInfo'] | null = null;
  private connected = false;

  private pendingRequests: Map<string, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = new Map();

  private requestTimeout: number;

  constructor(options: BspClientOptions) {
    this.options = options;
    this.requestTimeout = options.requestTimeout ?? 30_000;

    // Accept either a Transport instance or a config object
    this.transport = 'type' in options.transport
      ? createTransport(options.transport as TransportConfig)
      : options.transport as Transport;
  }

  /** Connect to the remote agent and perform handshake */
  async connect(): Promise<InitializeResult> {
    // Wire up transport events
    this.transport.on('message', this.onMessage.bind(this));
    this.transport.on('error', (err) => {
      console.error(`[BSP Client:${this.options.name}] Transport error:`, err.message);
    });
    this.transport.on('close', () => {
      this.connected = false;
      console.warn(`[BSP Client:${this.options.name}] Connection closed`);
    });

    // Connect transport
    await this.transport.connect();

    // Send initialize
    const initParams: InitializeParams = {
      clientVersion: '2.0',
      capabilities: this.options.capabilities,
      clientInfo: {
        name: this.options.name,
        version: this.options.version,
        senderType: this.options.senderType,
      },
    };

    const timeoutMs = this.options.connectTimeout ?? 10_000;
    const result = await this.request<InitializeParams, InitializeResult>(
      LifecycleMethods.Initialize,
      initParams,
      timeoutMs,
    );

    this.sessionId = result.sessionId;
    this.remoteCapabilities = result.capabilities;
    this.remoteInfo = result.serverInfo;
    this.connected = true;

    console.log(
      `[BSP Client] Connected to ${result.serverInfo.name} v${result.serverInfo.version} ` +
      `(session: ${result.sessionId})`
    );

    return result;
  }

  /** Disconnect gracefully */
  async disconnect(): Promise<void> {
    // Send shutdown notification
    if (this.connected) {
      try {
        await this.notify(LifecycleMethods.Shutdown, { reason: 'Client disconnect', graceful: true });
      } catch {
        // Best effort
      }
    }

    // Cancel pending requests
    for (const [, entry] of this.pendingRequests) {
      clearTimeout(entry.timer);
      entry.reject(new Error('Client disconnected'));
    }
    this.pendingRequests.clear();

    await this.transport.disconnect();
    this.connected = false;
  }

  /** Call a method on the remote agent and await response */
  async request<P, R>(method: string, params: P, timeoutMs?: number): Promise<R> {
    if (!this.connected && method !== LifecycleMethods.Initialize) {
      throw new Error('Not connected. Call connect() first.');
    }

    const meta = this.buildMeta();
    const id = generateMessageId('req');

    const message: BspMessage = {
      bsp: '2.0',
      id,
      method,
      params,
      meta,
    };

    const timeout = timeoutMs ?? this.requestTimeout;

    return new Promise<R>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timed out after ${timeout}ms: ${method}`));
      }, timeout);

      this.pendingRequests.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });

      this.transport.send(message).catch(err => {
        clearTimeout(timer);
        this.pendingRequests.delete(id);
        reject(err);
      });
    });
  }

  /** Send a notification (fire and forget) */
  async notify<P>(method: string, params: P): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected. Call connect() first.');
    }

    await this.transport.send({
      bsp: '2.0',
      method,
      params,
      meta: this.buildMeta(),
    });
  }

  /** Check if remote supports a capability */
  hasCapability(method: string): boolean {
    return this.remoteCapabilities ? hasCapability(this.remoteCapabilities, method) : false;
  }

  /** Check all required capabilities */
  hasAllCapabilities(required: string[]): { ok: boolean; missing: string[] } {
    return this.remoteCapabilities
      ? hasAllCapabilities(this.remoteCapabilities, required)
      : { ok: false, missing: required };
  }

  /** Get remote capabilities manifest */
  getRemoteCapabilities(): CapabilityManifest | null {
    return this.remoteCapabilities;
  }

  /** Get remote agent info */
  getRemoteInfo(): InitializeResult['serverInfo'] | null {
    return this.remoteInfo;
  }

  /** Whether the client is connected */
  isConnected(): boolean {
    return this.connected;
  }

  /** Handle incoming messages (responses to our requests) */
  private onMessage(msg: BspMessage): void {
    const validation = validateMessage(msg);
    if (!validation.valid) return;

    if (msg.id && this.pendingRequests.has(msg.id)) {
      const entry = this.pendingRequests.get(msg.id)!;
      clearTimeout(entry.timer);
      this.pendingRequests.delete(msg.id);

      if (msg.error) {
        entry.reject(new Error(`BSP Error [${msg.error.code}]: ${msg.error.message}`));
      } else {
        entry.resolve(msg.result);
      }
    }
  }

  private buildMeta(): BspMeta {
    return createMeta(this.options.name, {
      senderType: this.options.senderType,
      sessionId: this.sessionId ?? undefined,
    });
  }
}
