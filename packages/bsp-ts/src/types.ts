/**
 * BSP - Bobiverse Standard Protocol
 *
 * Core type definitions for agent-to-agent communication.
 * "Boring and correct" — like JSON-RPC, but for digital consciousnesses.
 */

// ─── Base Message Types ───────────────────────────────────────────────

export type BspVersion = '2.0';

/** Standard JSON-RPC error codes + BSP extended codes */
export enum BspErrorCode {
  // JSON-RPC reserved (-32700 to -32000)
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,

  // BSP extended (1000+)
  TaskRejected = 1001,
  TaskTimeout = 1002,
  InsufficientCapabilities = 1003,
  MemoryNotFound = 2001,
  MemoryPermissionDenied = 2002,
  ConsciousnessTransferFailed = 3001,
  CloneCapacityExceeded = 3002,
  AuthFailed = 4001,
  RateLimited = 4002,
}

/** Standard BSP error shape */
export interface BspError {
  code: BspErrorCode | number;
  message: string;
  data?: Record<string, unknown>;
}

/** Metadata envelope — routing, tracing, TTL */
export interface BspMeta {
  sender: string;
  senderType?: SenderType;
  timestamp: string; // ISO 8601
  ttl?: number; // seconds
  trace?: string[];
  priority?: number; // 0.0 - 1.0
  sessionId?: string;
}

export type SenderType =
  | 'digital-consciousness'
  | 'ai-assistant'
  | 'mcp-server'
  | 'human-proxy'
  | 'agent'
  | 'system';

/** Base BSP message — every message on the wire conforms to this */
export interface BspMessage<P = unknown, R = unknown> {
  bsp: BspVersion;
  id?: string;
  method?: string;
  params?: P;
  result?: R;
  error?: BspError;
  meta: BspMeta;
}

/** Notification — no id, no response expected */
export interface BspNotification<P = unknown> {
  bsp: BspVersion;
  id?: never;
  method: string;
  params?: P;
  meta: BspMeta;
}

/** Successful RPC response */
export interface BspSuccessResponse<R = unknown> {
  bsp: BspVersion;
  id: string;
  result: R;
  meta: BspMeta;
}

/** Error RPC response */
export interface BspErrorResponse {
  bsp: BspVersion;
  id: string;
  error: BspError;
  meta: BspMeta;
}

// ─── Lifecycle Methods ────────────────────────────────────────────────

export interface InitializeParams {
  clientVersion: string;
  capabilities: CapabilityManifest;
  clientInfo: {
    name: string;
    version: string;
    senderType: SenderType;
  };
}

export interface InitializeResult {
  serverVersion: string;
  capabilities: CapabilityManifest;
  serverInfo: {
    name: string;
    version: string;
    senderType: SenderType;
  };
  sessionId: string;
}

export interface ShutdownParams {
  reason?: string;
  graceful: boolean;
}

// ─── Capability Manifest ──────────────────────────────────────────────

export interface CapabilityManifest {
  /** Supported protocol methods */
  protocol: string[];

  /** Compute resource capabilities */
  compute: ComputeCapabilities;

  /** Available tool capabilities */
  tools?: ToolCapability[];

  /** Memory system capabilities */
  memory?: MemoryCapabilities;

  /** Consciousness-level capabilities (for digital entities) */
  consciousness?: ConsciousnessCapabilities;

  /** Security capabilities */
  security?: SecurityCapabilities;
}

export interface ComputeCapabilities {
  maxTokens?: number;
  supportsStreaming: boolean;
  contextWindow?: number;
  maxConcurrentTasks?: number;
  model?: string;
}

export interface ToolCapability {
  name: string;
  version: string;
  features?: string[];
  config?: Record<string, unknown>;
}

export interface MemoryCapabilities {
  supportsCrossQuery?: boolean;
  privacyLevels?: Array<'public' | 'shared' | 'private'>;
  maxRetrieval?: number;
  storageType?: 'vector' | 'key-value' | 'graph' | 'sql' | 'hybrid';
}

export interface ConsciousnessCapabilities {
  canClone?: boolean;
  canMerge?: boolean;
  maxDivergence?: number; // seconds
  consciousnessType?: 'digital-consciousness' | 'ai-assistant' | 'hybrid' | 'human-proxy';
}

export interface SecurityCapabilities {
  authMethods?: Array<'ed25519' | 'challenge-response' | 'token' | 'none'>;
  supportsEncryption?: boolean;
  proofOfWork?: number;
}

// ─── Task Delegation Types ────────────────────────────────────────────

export interface TaskContextFile {
  path: string;
  content?: string;
  language?: string;
}

export interface TaskRequirements {
  minCapabilities?: string[];
  minTokens?: number;
  maxDuration?: number; // seconds
}

export interface TaskDelegateParams {
  taskId: string;
  parentTaskId?: string;
  description: string;
  type: TaskType;
  priority?: number;
  context?: {
    files?: TaskContextFile[];
    knowledgeRefs?: string[];
  };
  requirements?: TaskRequirements;
  acceptanceCriteria?: string[];
}

export type TaskType =
  | 'code-generation'
  | 'code-review'
  | 'analysis'
  | 'research'
  | 'exploration'
  | 'engineering'
  | 'debugging'
  | 'documentation'
  | 'planning'
  | 'custom';

export type TaskDelegationStatus = 'accepted' | 'rejected' | 'deferred';

export interface TaskDelegateResult {
  status: TaskDelegationStatus;
  estimatedCompletion?: string;
  bidTokenCost?: number;
  contract?: string;
  reason?: string;
}

export type TaskProgressStatus = 'in-progress' | 'blocked' | 'paused' | 'cancelled';

export interface TaskProgressParams {
  taskId: string;
  status: TaskProgressStatus;
  percentComplete?: number;
  intermediateResult?: string;
  eta?: string;
  blockers?: string[];
}

export type TaskFinalStatus = 'success' | 'failure' | 'partial';

export interface TaskResultData {
  files?: Array<{ path: string; content?: string }>;
  testResults?: { pass: number; fail: number; skip?: number };
  summary?: string;
  artifacts?: string[];
}

export interface TaskCompleteParams {
  taskId: string;
  status: TaskFinalStatus;
  result?: TaskResultData;
  tokenCost?: number;
  duration?: number;
  error?: string;
  reflections?: string;
}

// ─── Memory Query Types ───────────────────────────────────────────────

export interface MemoryQueryParams {
  query: {
    text: string;
    embedding?: number[];
    hybrid?: boolean;
    filters?: Record<string, unknown>;
  };
  scope?: {
    agents?: string[];
    privacyLevels?: Array<'public' | 'shared' | 'private'>;
    maxAge?: number;
    domains?: string[];
  };
  maxResults?: number;
  minRelevance?: number;
}

export interface MemoryResultItem {
  id: string;
  content: {
    text: string;
    metadata?: Record<string, unknown>;
  };
  relevance: number;
  source: {
    agent: string;
    timestamp?: string;
    domain?: string;
    privacyLevel?: 'public' | 'shared' | 'private';
  };
  embedding?: number[];
}

export interface MemoryQueryResult {
  results: MemoryResultItem[];
  totalResults?: number;
  queryTime?: number;
}

// ─── State Sync Types ─────────────────────────────────────────────────

export interface StateSyncParams {
  mode: 'full' | 'incremental' | 'diff';
  since?: string;
  domains?: string[];
  includeReflections?: boolean;
}

export interface StateSyncResult {
  syncId: string;
  stateDiff: Record<string, unknown>;
  changedKeys: string[];
  conflicts?: string[];
  reflections?: string;
}

// ─── Heartbeat ────────────────────────────────────────────────────────

export interface HeartbeatParams {
  load?: number; // 0.0 - 1.0 current load
  uptime?: number;
  stateDigest?: string;
}

// ─── Transport Types ──────────────────────────────────────────────────

export type TransportType = 'stdio' | 'tcp' | 'scut' | 'bobnet';

export interface TransportConfig {
  type: TransportType;
  address?: string; // for TCP/SCUT: "host:port" or SCUT address
  port?: number;
  encoding?: 'json' | 'cbor'; // default json
}

// ─── Handler Types ────────────────────────────────────────────────────

export type MessageHandler<P = unknown, R = unknown> = (
  params: P,
  meta: BspMeta,
) => Promise<R> | R;

export type NotificationHandler<P = unknown> = (
  params: P,
  meta: BspMeta,
) => void | Promise<void>;

// ─── Error Helpers ────────────────────────────────────────────────────

export function bspError(
  code: BspErrorCode | number,
  message: string,
  data?: Record<string, unknown>,
): BspError {
  return { code, message, data };
}

export const BspErrors = {
  parseError: (msg = 'Parse error') => bspError(BspErrorCode.ParseError, msg),
  invalidRequest: (msg = 'Invalid request') => bspError(BspErrorCode.InvalidRequest, msg),
  methodNotFound: (method: string) =>
    bspError(BspErrorCode.MethodNotFound, `Method not found: ${method}`),
  internalError: (msg = 'Internal error') => bspError(BspErrorCode.InternalError, msg),
  taskRejected: (reason: string) => bspError(BspErrorCode.TaskRejected, `Task rejected: ${reason}`),
  insufficientCapabilities: (need: string) =>
    bspError(BspErrorCode.InsufficientCapabilities, `Missing capability: ${need}`),
};
