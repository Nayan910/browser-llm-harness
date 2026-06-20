export type NodeType = 'prompt' | 'response' | 'task' | 'tool' | 'agent' | 'condition' | 'loop' | 'branch' | 'webhook' | 'schedule';
export type TriggerType = 'manual' | 'scheduled' | 'event' | 'webhook';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, any>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  condition?: string;
  dataTransform?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: number;
  enabled: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: TriggerType[];
  schedule?: string; // cron expression
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  currentNodeId: string;
  nodeResults: Record<string, NodeResult>;
  startTime: Date;
  endTime?: Date;
  trigger: TriggerType;
  error?: string;
}

export interface NodeResult {
  nodeId: string;
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  input?: any;
  output?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

