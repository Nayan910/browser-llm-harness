import { WorkflowNode, WorkflowExecution, NodeType } from './types.js';

export class NodeExecutor {
  async executeNode(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    console.log(`[NodeExecutor] Executing: ${node.label} (${node.type})`);

    switch (node.type) {
      case 'prompt':
        return this.executePrompt(node);
      case 'task':
        return this.executeTask(node);
      case 'tool':
        return this.executeTool(node);
      case 'agent':
        return this.executeAgent(node);
      case 'condition':
        return this.executeCondition(node, execution);
      case 'loop':
        return this.executeLoop(node, execution);
      case 'branch':
        return this.executeBranch(node);
      case 'webhook':
        return this.executeWebhook(node);
      default:
        return `Executed ${node.type}: ${node.label}`;
    }
  }

  private async executePrompt(node: WorkflowNode): Promise<string> {
    return `[Prompt] ${node.config.template || node.config.content || ''}`;
  }

  private async executeTask(node: WorkflowNode): Promise<string> {
    return `[Task] ${node.config.description || node.label}`;
  }

  private async executeTool(node: WorkflowNode): Promise<string> {
    const toolName = node.config.toolName || 'unknown';
    const params = node.config.params || {};
    return `[Tool] ${toolName}(${JSON.stringify(params)})`;
  }

  private async executeAgent(node: WorkflowNode): Promise<string> {
    return `[Agent] ${node.config.agentType || 'default'} -> ${node.config.prompt || node.label}`;
  }

  private async executeCondition(node: WorkflowNode, execution: WorkflowExecution): Promise<boolean> {
    const condition = node.config.condition || 'true';
    return condition === 'true' || condition === true;
  }

  private async executeLoop(node: WorkflowNode, execution: WorkflowExecution): Promise<any[]> {
    const iterations = node.config.iterations || 1;
    const results = [];
    for (let i = 0; i < iterations; i++) {
      results.push(`[Loop] Iteration ${i + 1}/${iterations}`);
    }
    return results;
  }

  private async executeBranch(node: WorkflowNode): Promise<string> {
    return `[Branch] ${node.config.branches?.length || 0} branches`;
  }

  private async executeWebhook(node: WorkflowNode): Promise<string> {
    return `[Webhook] ${node.config.url || 'no-url'} -> ${node.config.method || 'POST'}`;
  }
}
