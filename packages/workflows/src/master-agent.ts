import { WorkflowEngine } from './workflow-engine.js';
import { WorkflowDefinition, WorkflowExecution } from './types.js';

export class MasterAgent {
  private suggestions: string[] = [];

  constructor(private engine: WorkflowEngine) {}

  async analyze(): Promise<string[]> {
    const workflows = this.engine.getAllWorkflows();
    const suggestions: string[] = [];

    for (const wf of workflows) {
      // Analyze for optimization opportunities
      if (wf.nodes.length > 10) {
        suggestions.push(`[MasterAgent] Consider splitting "${wf.name}" - it has ${wf.nodes.length} nodes`);
      }

      // Check for unused triggers
      if (wf.triggers.length === 1 && wf.triggers[0] === 'manual') {
        suggestions.push(`[MasterAgent] "${wf.name}" has no automated triggers. Consider adding schedule or webhook triggers`);
      }

      // Check for missing descriptions
      for (const node of wf.nodes) {
        if (!node.config.description && node.type !== 'condition') {
          suggestions.push(`[MasterAgent] Node "${node.label}" in "${wf.name}" has no description`);
        }
      }
    }

    if (workflows.length === 0) {
      suggestions.push('[MasterAgent] No workflows defined yet. Create your first workflow using the workflow editor.');
    }

    this.suggestions = suggestions;
    return suggestions;
  }

  async suggestNewWorkflow(context: string): Promise<WorkflowDefinition> {
    // In production, this would use an LLM to generate workflow suggestions
    const suggestion: WorkflowDefinition = {
      id: '',
      name: `Suggested: ${context.slice(0, 40)}`,
      description: `Auto-generated workflow for: ${context}`,
      version: 1,
      enabled: false,
      nodes: [
        { id: 'node-1', type: 'prompt', label: 'Input', config: { template: context } },
        { id: 'node-2', type: 'task', label: 'Process', config: { description: `Process: ${context}` } },
        { id: 'node-3', type: 'response', label: 'Output', config: {} },
      ],
      edges: [
        { id: 'edge-1', from: 'node-1', to: 'node-2' },
        { id: 'edge-2', from: 'node-2', to: 'node-3' },
      ],
      triggers: ['manual'],
      tags: ['auto-suggested'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return suggestion;
  }

  getSuggestions(): string[] {
    return [...this.suggestions];
  }

  async monitorExecution(execution: WorkflowExecution): Promise<void> {
    console.log(`[MasterAgent] Monitoring execution ${execution.id}: ${execution.status}`);
    if (execution.status === 'failed') {
      console.log(`[MasterAgent] Execution failed: ${execution.error}`);
    }
  }
}
