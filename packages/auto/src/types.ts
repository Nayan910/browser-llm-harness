export interface AutoTask {
  id: string;
  prompt: string;
  status: 'pending' | 'planning' | 'executing' | 'verifying' | 'done' | 'failed';
  plan?: TaskPlan;
  result?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskPlan {
  id: string;
  steps: TaskStep[];
  estimatedComplexity: 'simple' | 'medium' | 'complex';
}

export interface TaskStep {
  id: string;
  description: string;
  agentType: string;
  action: string;
  dependsOn: string[];
  status: 'pending' | 'running' | 'done' | 'failed';
  result?: string;
}

export interface AutoConfig {
  maxRetries: number;
  verifyAfterEach: boolean;
  parallelSteps: boolean;
  timeout: number; // ms
}
