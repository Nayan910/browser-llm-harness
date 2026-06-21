/**
 * BSP Protocol Constants and Utilities
 *
 * "JSON-RPC is boring — and that's why it wins."
 * BSP follows the same philosophy. Boring transport, powerful semantics.
 */

import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import type { BspMessage, BspMeta, BspNotification, BspVersion } from './types.js';

// ─── Protocol Constants ───────────────────────────────────────────────

export const BSP_VERSION: BspVersion = '2.0';
export const DEFAULT_TTL = 300; // 5 minutes
export const MAX_MESSAGE_SIZE = 1024 * 1024 * 100; // 100 MB
export const DEFAULT_HEARTBEAT_INTERVAL = 30_000; // 30 seconds

/** Standard lifecycle method names */
export const LifecycleMethods = {
  Initialize: 'bsp/initialize',
  Initialized: 'bsp/initialized',
  Shutdown: 'bsp/shutdown',
  Exit: 'bsp/exit',
  Capabilities: 'bsp/capabilities',
  Heartbeat: 'bsp/heartbeat',
  Error: 'bsp/error',
} as const;

/** Standard task methods */
export const TaskMethods = {
  Delegate: 'task/delegate',
  Progress: 'task/progress',
  Complete: 'task/complete',
  Cancel: 'task/cancel',
  Query: 'task/query',
} as const;

/** Standard memory methods */
export const MemoryMethods = {
  Query: 'memory/query',
  Store: 'memory/store',
  Delete: 'memory/delete',
  Search: 'memory/search',
} as const;

/** Standard state sync methods */
export const StateSyncMethods = {
  Sync: 'state/sync',
  Status: 'state/status',
} as const;

/** Standard consciousness methods */
export const ConsciousnessMethods = {
  Transfer: 'consciousness/transfer',
  TransferChunk: 'consciousness/transfer-chunk',
  Ready: 'consciousness/ready',
  Merge: 'consciousness/merge',
} as const;

/** Standard auth methods */
export const AuthMethods = {
  Challenge: 'auth/challenge',
  Authenticate: 'auth/authenticate',
  Token: 'auth/token',
} as const;

// ─── Message Builders ─────────────────────────────────────────────────

let messageCounter = 0;

/** Generate a unique message ID */
export function generateMessageId(prefix = 'msg'): string {
  const id = uuidv7();
  messageCounter++;
  return `${prefix}-${id}`;
}

/** Generate a unique task ID */
export function generateTaskId(): string {
  return `task-${uuidv7()}`;
}

/** Generate a unique session ID */
export function generateSessionId(): string {
  return `session-${uuidv4()}`;
}

/** Create metadata envelope */
export function createMeta(
  sender: string,
  overrides?: Partial<BspMeta>,
): BspMeta {
  return {
    sender,
    senderType: 'ai-assistant',
    timestamp: new Date().toISOString(),
    ttl: DEFAULT_TTL,
    trace: [sender],
    priority: 0.5,
    ...overrides,
  };
}

/** Build a request message */
export function buildRequest<P = unknown>(
  method: string,
  params: P,
  sender: string,
  metaOverrides?: Partial<BspMeta>,
): BspMessage<P> {
  return {
    bsp: BSP_VERSION,
    id: generateMessageId(),
    method,
    params,
    meta: createMeta(sender, metaOverrides),
  };
}

/** Build a success response */
export function buildSuccessResponse<R = unknown>(
  id: string,
  result: R,
  meta: BspMeta,
): BspMessage<never, R> {
  return {
    bsp: BSP_VERSION,
    id,
    result,
    meta,
  };
}

/** Build a notification (no response expected) */
export function buildNotification<P = unknown>(
  method: string,
  params: P,
  sender: string,
): BspNotification<P> {
  return {
    bsp: BSP_VERSION,
    method,
    params,
    meta: createMeta(sender),
  };
}

/** Build an error response */
export function buildErrorResponse(
  id: string,
  code: number,
  message: string,
  meta: BspMeta,
  data?: Record<string, unknown>,
): BspMessage {
  return {
    bsp: BSP_VERSION,
    id,
    error: { code, message, data },
    meta,
  };
}

// ─── Validation ───────────────────────────────────────────────────────

/** Validate a raw message conforms to BSP basics */
export function validateMessage(raw: unknown): { valid: boolean; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Message must be an object' };
  }

  const msg = raw as Record<string, unknown>;

  if (!msg.bsp) {
    return { valid: false, error: 'Missing bsp version field' };
  }

  if (typeof msg.bsp !== 'string' || !msg.bsp.match(/^\d+\.\d+$/)) {
    return { valid: false, error: 'bsp version must be a semver string (e.g., "2.0")' };
  }

  // Notifications don't need id
  if (msg.id !== undefined && typeof msg.id !== 'string') {
    return { valid: false, error: 'id must be a string' };
  }

  if (!msg.method || typeof msg.method !== 'string') {
    return { valid: false, error: 'method must be a string' };
  }

  // Must have exactly one of: params, result, error
  const hasParams = 'params' in msg;
  const hasResult = 'result' in msg;
  const hasError = 'error' in msg;

  if (!hasParams && !hasResult && !hasError) {
    return { valid: false, error: 'Message must have params, result, or error' };
  }

  return { valid: true };
}
