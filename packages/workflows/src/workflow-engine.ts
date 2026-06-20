import { WorkflowDefinition, WorkflowExecution, WorkflowNode, WorkflowEdge, NodeResult } from './types.js';
import { NodeExecutor } from './node-executor.js';
import { v4 as uuid } from 'uuid';

export class WorkflowEngine {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private executor: NodeExecutor;

  constructor() {
    this.executor = new NodeExecutor();
  }

  register(workflow: WorkflowDefinition): void {
    workflow.id = workflow.id || uuid();
    workflow.createdAt = new Date();
    workflow.updatedAt = new Date();
    this.workflows.set(workflow.id, workflow);
    console.log(`[WorkflowEngine] Registered: ${workflow.name} (${workflow.id})`);
  }

  unregister(id: string): void {
    this.workflows.delete(id);
  }

  async execute(workflowId: string, trigger: WorkflowExecution['trigger'] = 'manual'): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    if (!workflow.enabled) throw new Error(`Workflow is disabled: ${workflow.name}`);

    const execution: WorkflowExecution = {
      id: uuid(),
      workflowId,
      status: 'running',
      currentNodeId: workflow.nodes[0]?.id || '',
      nodeResults: {},
      startTime: new Date(),
      trigger,
    };
    this.executions.set(execution.id, execution);

    try {
      await this.executeGraph(workflow, execution);
      execution.status = 'completed';
      execution.endTime = new Date();
      console.log(`[WorkflowEngine] \u2705 ${workflow.name} completed`);
    } catch (err: any) {
      execution.status = 'failed';
      execution.error = err.message;
      execution.endTime = new Date();
      console.error(`[WorkflowEngine] \u274c ${workflow.name} failed: ${err.message}`);
    }

    return execution;
  }

  private async executeGraph(workflow: WorkflowDefinition, execution: WorkflowExecution): Promise<void> {
    const nodeMap = new Map(workflow.nodes.map(n => [n.id, n]));
    const edgeMap = new Map<string, WorkflowEdge[]>();
    
    // Build adjacency list
    for (const edge of workflow.edges) {
      const list = edgeMap.get(edge.from) || [];
      list.push(edge);
      edgeMap.set(edge.from, list);
    }

    // Execute starting from root nodes (no incoming edges)
    const rootNodes = workflow.nodes.filter(n => 
      !workflow.edges.some(e => e.to === n.id)
    );

    for (const node of rootNodes) {
      await this.executeNode(node, nodeMap, edgeMap, execution, new Set());
    }
  }

  private async executeNode(
    node: WorkflowNode,
    nodeMap: Map<string, WorkflowNode>,
    edgeMap: Map<string, WorkflowEdge[]>,
    execution: WorkflowExecution,
    visited: Set<string>
  ): Promise<any> {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    const result: NodeResult = {
      nodeId: node.id,
      status: 'running',
      startTime: new Date(),
    };
    execution.nodeResults[node.id] = result;
    execution.currentNodeId = node.id;

    try {
      const output = await this.executor.executeNode(node, execution);
      result.status = 'done';
      result.output = output;
      result.endTime = new Date();

      // Execute downstream nodes
      const edges = edgeMap.get(node.id) || [];
      for (const edge of edges) {
        if (edge.condition) {
          const conditionMet = this.evaluateCondition(edge.condition, output);
          if (!conditionMet) continue;
        }

        const nextNode = nodeMap.get(edge.to);
        if (nextNode) {
          const transformedOutput = edge.dataTransform 
            ? this.transformData(edge.dataTransform, output)
            : output;
          await this.executeNode(nextNode, nodeMap, edgeMap, execution, visited);
        }
      }
    } catch (err: any) {
      result.status = 'failed';
      result.error = err.message;
      result.endTime = new Date();
      throw err;
    }
  }

  private evaluateCondition(condition: string, output: any): boolean {
    try {
      return eval(condition.replace(/output/g, JSON.stringify(output)));
    } catch {
      return true;
    }
  }

  private transformData(transform: string, data: any): any {
    try {
      return eval(transform.replace(/data/g, JSON.stringify(data)));
    } catch {
      return data;
    }
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id);
  }

  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }
}
