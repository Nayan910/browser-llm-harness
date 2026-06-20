export interface ToolDefinition {
  name: string;
  type: 'mcp' | 'cli' | 'plugin' | 'hook' | 'skill' | 'lsp';
  description: string;
  usage: string;
  parameters: ToolParameter[];
  source: string;
  version: string;
  category: string;
  installUrl?: string;
  docsUrl?: string;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  default?: any;
}

export interface DiscoverySource {
  name: string;
  url: string;
  type: 'github' | 'npm' | 'pypi' | 'registry' | 'web';
  schedule: 'daily' | 'weekly' | 'manual';
  lastScan?: Date;
}

export interface DiscoveredTool {
  tool: ToolDefinition;
  foundAt: Date;
  source: string;
  confidence: number;
}
