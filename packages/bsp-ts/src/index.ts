/**
 * BSP — Bobiverse Standard Protocol
 *
 * TypeScript SDK for agent-to-agent communication.
 *
 * "If it's good, they'll come. That's the Bob way."
 *
 * ─── Quick Start ───────────────────────────────────────────────────────
 *
 * ```typescript
 * // Create a BSP server
 * import { BspServer, capabilities, StdioTransport } from 'bsp-ts';
 *
 * const server = new BspServer({
 *   name: 'bob-47',
 *   version: '1.0.0',
 *   senderType: 'digital-consciousness',
 *   capabilities: capabilities()
 *     .withLifecycle()
 *     .withTaskDelegation()
 *     .withCompute({ supportsStreaming: true })
 *     .build(),
 *   transport: new StdioTransport(),
 * });
 *
 * await server.start();
 * ```
 *
 * ```typescript
 * // Connect as a client
 * import { BspClient, capabilities } from 'bsp-ts';
 *
 * const client = new BspClient({
 *   name: 'guppi-12',
 *   version: '1.0.0',
 *   senderType: 'ai-assistant',
 *   capabilities: basicAgentCapabilities('guppi-12'),
 *   transport: { type: 'tcp', port: 8742 },
 * });
 *
 * await client.connect();
 * const result = await client.request('task/delegate', { ... });
 * ```
 */

// ─── Core Types ───────────────────────────────────────────────────────

export {
  BspErrorCode,
  bspError,
  BspErrors,
} from './types.js';
export type {
  BspMessage,
  BspNotification,
  BspError,
  BspMeta,
  BspVersion,
  SenderType,
  CapabilityManifest,
  ComputeCapabilities,
  ToolCapability,
  MemoryCapabilities,
  ConsciousnessCapabilities,
  SecurityCapabilities,
  InitializeParams,
  InitializeResult,
  TaskDelegateParams,
  TaskDelegateResult,
  TaskProgressParams,
  TaskCompleteParams,
  TaskResultData,
  TaskType,
  TaskDelegationStatus,
  TaskProgressStatus,
  TaskFinalStatus,
  MemoryQueryParams,
  MemoryQueryResult,
  MemoryResultItem,
  StateSyncParams,
  StateSyncResult,
  TransportConfig,
  TransportType,
  HeartbeatParams,
} from './types.js';

// ─── Protocol ─────────────────────────────────────────────────────────

export {
  BSP_VERSION,
  DEFAULT_TTL,
  LifecycleMethods,
  TaskMethods,
  MemoryMethods,
  StateSyncMethods,
  ConsciousnessMethods,
  AuthMethods,
  generateMessageId,
  generateTaskId,
  generateSessionId,
  createMeta,
  buildRequest,
  buildSuccessResponse,
  buildNotification,
  buildErrorResponse,
  validateMessage,
} from './protocol.js';

// ─── Capabilities ─────────────────────────────────────────────────────

export {
  CapabilityBuilder,
  capabilities,
  hasCapability,
  hasAllCapabilities,
  mergeCapabilities,
  basicAgentCapabilities,
  bobCapabilities,
} from './capabilities.js';

// ─── Transport ────────────────────────────────────────────────────────

export { Transport } from './transport/index.js';
export { StdioTransport } from './transport/stdio.js';
export { TcpTransport } from './transport/tcp.js';
export { createTransport } from './transport/index.js';
export type { TransportEvents, TransportEventListener } from './transport/index.js';

// ─── Server ───────────────────────────────────────────────────────────

export { BspServer } from './server.js';
export type { BspServerOptions } from './server.js';

// ─── Client ───────────────────────────────────────────────────────────

export { BspClient } from './client.js';
export type { BspClientOptions } from './client.js';

// ─── Methods ──────────────────────────────────────────────────────────

export {
  TaskDelegateHandler,
  MemoryQueryHandler,
  InMemoryMemoryStore,
  StateSyncHandler,
  InMemoryStateProvider,
  InitializeHandler,
} from './methods/index.js';
export type {
  TaskRecord,
  TaskDelegateOptions,
  MemoryQueryCallback,
  StateProvider,
  InitializeOptions,
  MethodHandler,
  MethodHandlers,
} from './methods/index.js';

// ─── Bridges ──────────────────────────────────────────────────────────

export { LspBridge } from './bridges/index.js';
export type { LspBridgeOptions } from './bridges/lsp-bridge.js';
