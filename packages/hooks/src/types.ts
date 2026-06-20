export interface HookPoint {
  id: string;
  name: string;
  description: string;
  timing: 'before-answer' | 'after-answer' | 'session-start' | 'session-end' | 'tool-call' | 'agent-create';
  required: boolean; // If true, hook must succeed before proceeding
}

export interface HookConfig {
  beforeAnswer: HookDefinition[];
  afterAnswer: HookDefinition[];
  sessionStart: HookDefinition[];
  sessionEnd: HookDefinition[];
  sessionOverride: HookDefinition[]; // Force these regardless of config
}

export interface HookDefinition {
  toolName: string;
  params?: Record<string, any>;
  condition?: string; // Optional condition like "if-tool-used:github"
  required: boolean;
  description: string;
}

export interface HookResult {
  hook: HookDefinition;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  timestamp: Date;
}
