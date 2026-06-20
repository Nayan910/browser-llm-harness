export interface SessionRecord {
  id: string;
  startTime: Date;
  endTime?: Date;
  summary: string;
  agentIds: string[];
  toolNames: string[];
  fileChanges: FileChange[];
  keyDecisions: string[];
  tokenUsage: { input: number; output: number };
  tags: string[];
}

export interface FileChange {
  path: string;
  type: 'create' | 'modify' | 'delete';
  agentId: string;
  timestamp: Date;
  summary: string;
}

export interface MemoryEntry {
  id: string;
  key: string;
  content: any;
  category: 'user-preference' | 'technique' | 'knowledge' | 'session-summary' | 'agent-note';
  tags: string[];
  timestamp: Date;
  source: string;
}

export interface CrossSessionContext {
  recentSessions: SessionRecord[];
  relevantMemories: MemoryEntry[];
  activeFileChanges: FileChange[];
  currentAgentStates: Record<string, any>;
}
