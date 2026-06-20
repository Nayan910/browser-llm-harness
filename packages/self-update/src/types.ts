export interface UpdatePackage {
  id: string;
  version: string;
  description: string;
  changes: string[];
  files: UpdateFile[];
  dependencies?: Record<string, string>;
  minVersion?: string;
  publishedAt: Date;
}

export interface UpdateFile {
  path: string;
  content: string;
  action: 'create' | 'modify' | 'delete';
}

export interface FeedbackEntry {
  id: string;
  type: 'correction' | 'undo' | 'reaction' | 'explicit';
  context: string;
  userInput: string;
  systemOutput: string;
  correctOutput?: string;
  timestamp: Date;
  source: string;
  severity: 'minor' | 'major' | 'critical';
}

export interface LearningSignal {
  id: string;
  type: 'tool-preference' | 'response-style' | 'workflow-change' | 'new-pattern';
  confidence: number;
  signal: string;
  applied: boolean;
  timestamp: Date;
}
