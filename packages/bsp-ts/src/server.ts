/**
 * BSP Server
 *
 * "I'm listening. Talk to me."
 *
 * Handles incoming BSP connections, dispatches method calls to registered handlers,
 * manages the protocol lifecycle (initialize → handle → shutdown).
 */

import { type BspMessage, type BspMeta, type CapabilityManifest, type SenderType } from './types.js';
import { type Transport } from './transport/index.js';
import { BspErrorCode, BspErrors, type InitializeParams } from './types.js';
import {
  LifecycleMethods,
  buildErrorResponse,
  buildSuccessResponse,
  validateMessage,
} from './protocol.js';
import { type MethodHandler, type MethodFunction, type MethodHandlers } from './methods/types.js';
import { InitializeHandler, type InitializeOptions } from './methods/initialize.js';

// ─── Server Options ───────────────────────────────────────────────────

export interface BspServerOptions {
  name: string;
  version: string;
  senderType: SenderType;
  capabilities: CapabilityManifest;
  transport: Transport;
  /** Additional method handlers keyed by method name */
  handlers?: MethodHandlers;
}

// ─── Server ───────────────────────────────────────────────────────────

export class BspServer {
  private options: BspServerOptions;
  private transport: Transport;
  private handlers: Map<string, MethodHandler | MethodFunction> = new Map();
  private initializeHandler: InitializeHandler;
  private initialized = false;
  private pendingRequests: Map<string, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = new Map();

  constructor(options: BspServerOptions) {
    this.options = options;
    this.transport = options.transport;

    // Register initialize handler
    this.initializeHandler = new InitializeHandler({
      serverName: options.name,
      serverVersion: options.version,
      senderType: options.senderType,
      capabilities: options.capabilities,
    });

    // Register lifecycle methods
    const initHandler: MethodFunction = async (params, meta) =>
      this.initializeHandler.handle(params as InitializeParams, meta);
    this.registerMethod(LifecycleMethods.Initialize, initHandler);

    // Register user-provided handlers
    if (options.handlers) {
      for (const [method, handler] of Object.entries(options.handlers)) {
        this.registerMethod(method, handler);
      }
    }
  }

  /** Register a method handler */
  registerMethod(method: string, handler: MethodHandler | MethodFunction): void {
    this.handlers.set(method, handler);
  }

  /** Start the server — connects transport and begins listening */
  async start(): Promise<void> {
    // Wire up transport events
    this.transport.on('message', this.onMessage.bind(this));
    this.transport.on('error', (err) => {
      console.error(`[BSP:${this.options.name}] Transport error:`, err.message);
    });
    this.transport.on('close', () => {
      console.warn(`[BSP:${this.options.name}] Transport closed`);
    });

    await this.transport.connect();
    console.log(`[BSP:${this.options.name}] Server listening on ${this.transport.getAddress()}`);
  }

  /** Stop the server gracefully */
  async stop(): Promise<void> {
    // Cancel all pending requests
    for (const [, entry] of this.pendingRequests) {
      clearTimeout(entry.timer);
      entry.reject(new Error('Server shutting down'));
    }
    this.pendingRequests.clear();

    await this.transport.disconnect();
  }

  /** Send a request and wait for response */
  async request<P, R>(method: string, params: P, meta: BspMeta, timeoutMs = 30_000): Promise<R> {
    const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const message: BspMessage = {
      bsp: '2.0',
      id,
      method,
      params,
      meta,
    };

    return new Promise<R>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timed out after ${timeoutMs}ms: ${method}`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });

      this.transport.send(message).catch(err => {
        clearTimeout(timer);
        this.pendingRequests.delete(id);
        reject(err);
      });
    });
  }

  /** Send a notification (fire and forget) */
  async notify<P>(method: string, params: P, meta: BspMeta): Promise<void> {
    await this.transport.send({
      bsp: '2.0',
      method,
      params,
      meta,
    });
  }

  /** Handle an incoming message */
  private async onMessage(msg: BspMessage): Promise<void> {
    // Validate
    const validation = validateMessage(msg);
    if (!validation.valid) {
      if (msg.id) {
        await this.sendError(msg.id, BspErrors.parseError(validation.error!), msg.meta);
      }
      return;
    }

    // If this is a response to a pending request
    if (msg.id && this.pendingRequests.has(msg.id)) {
      const entry = this.pendingRequests.get(msg.id)!;
      clearTimeout(entry.timer);
      this.pendingRequests.delete(msg.id);

      if (msg.error) {
        entry.reject(new Error(`BSP Error [${msg.error.code}]: ${msg.error.message}`));
      } else {
        entry.resolve(msg.result);
      }
      return;
    }

    // It's a new method call — dispatch to handler
    try {
      await this.dispatchMethod(msg);
    } catch (err) {
      console.error(`[BSP:${this.options.name}] Error dispatching ${msg.method ?? 'unknown'}:`, err);
      if (msg.id) {
        await this.sendError(
          msg.id,
          BspErrors.internalError((err as Error).message),
          msg.meta,
        );
      }
    }
  }

  /** Dispatch a method call to its handler */
  private async dispatchMethod(msg: BspMessage): Promise<void> {
    const method = msg.method!;
    const params = msg.params;
    const meta = msg.meta;
    const id = msg.id;

    // Check initialization requirement (except for initialize itself)
    if (method !== LifecycleMethods.Initialize && method !== LifecycleMethods.Heartbeat) {
      if (!this.initializeHandler.isInitialized()) {
        if (id) {
          await this.sendError(
            id,
            {
              code: BspErrorCode.InvalidRequest,
              message: 'Server not initialized. Send bsp/initialize first.',
            },
            meta,
          );
        }
        return;
      }
    }

    // Find handler
    const handler = this.handlers.get(method);
    if (!handler) {
      if (id) {
        await this.sendError(id, BspErrors.methodNotFound(method), meta);
      }
      return;
    }

    // Execute handler — supports both object handlers (with .handle()) and plain functions
    let result: unknown;
    if (typeof handler === 'function') {
      result = await (handler as MethodFunction)(params, meta);
    } else {
      result = await (handler as MethodHandler).handle(params, meta);
    }

    // Send response if this is a request (has id)
    if (id) {
      await this.sendSuccess(id, result, meta);
    }
  }

  private async sendSuccess(id: string, result: unknown, meta: BspMeta): Promise<void> {
    const response = buildSuccessResponse(id, result, meta);
    await this.transport.send(response);
  }

  private async sendError(id: string, error: { code: number; message: string }, meta: BspMeta): Promise<void> {
    const response = buildErrorResponse(id, error.code, error.message, meta);
    await this.transport.send(response);
  }
}
