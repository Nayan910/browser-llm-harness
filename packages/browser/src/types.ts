export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  agentId?: string;
  agentName?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentStatus {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'busy' | 'error' | 'thinking';
  folderScope?: string;
  lastActivity?: Date;
  messageCount: number;
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  chatFontSize: 'small' | 'medium' | 'large';
  showTimestamps: boolean;
  autoScroll: boolean;
  agentTreeView: boolean;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}
