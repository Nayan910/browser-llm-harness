export type AgentId = string;
export type FolderPath = string;
export type ToolName = string;
export type SessionId = string;

export interface LLMConfig {
  provider: "openai" | "anthropic" | "ollama" | "openrouter";
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  type: "folder" | "coordinator" | "personal" | "workflow" | "discovery" | "auto" | "simulator";
  llmConfig: LLMConfig;
  systemPrompt: string;
  folderScope?: FolderPath;
  tools: ToolName[];
  hooks?: AgentHooks;
}

export interface AgentHooks {
  beforeAnswer?: ToolName[];
  afterAnswer?: ToolName[];
  sessionStart?: ToolName[];
  sessionEnd?: ToolName[];
}

export interface AgentMessage {
  id: string;
  from: AgentId;
  to: AgentId;
  type: "task" | "response" | "event" | "log" | "broadcast";
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  sessionId: SessionId;
}

export interface ToolDefinition {
  name: ToolName;
  type: "mcp" | "cli" | "plugin" | "hook" | "skill" | "lsp";
  description: string;
  usage: string;
  parameters: ToolParameter[];
  source: string;
  version: string;
  category: string;
}

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description: string;
}

export interface FolderState {
  path: FolderPath;
  agentId: AgentId;
  files: Record<string, FileInfo>;
  traffic: TrafficEntry[];
  lastScan: Date;
}

export interface FileInfo {
  path: string;
  createdBy: AgentId;
  lastModifiedBy: AgentId;
  createdAt: Date;
  modifiedAt: Date;
  size: number;
  hash: string;
}

export interface TrafficEntry {
  timestamp: Date;
  from: AgentId;
  to: AgentId;
  type: string;
  filePath?: string;
  summary: string;
}

export interface SessionData {
  id: SessionId;
  startTime: Date;
  endTime?: Date;
  messages: AgentMessage[];
  agents: AgentId[];
  tools: ToolName[];
  summary: string;
}

export interface WorkflowNode {
  id: string;
  type: "prompt" | "response" | "task" | "tool" | "agent" | "condition" | "loop" | "branch";
  config: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  condition?: string;
  dataTransform?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: ("manual" | "scheduled" | "event" | "webhook")[];
  enabled: boolean;
  version: number;
}
