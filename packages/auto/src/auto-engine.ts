import { AutoTask, AutoConfig, TaskStep } from './types.js';
import { TaskPlanner } from './planner.js';
import { v4 as uuid } from 'uuid';

export class AutoEngine {
  private tasks: Map<string, AutoTask> = new Map();
  private running = false;

  constructor(
    private planner: TaskPlanner,
    private config: AutoConfig = {
      maxRetries: 3,
      verifyAfterEach: true,
      parallelSteps: false,
      timeout: 300000,
    }
  ) {}

  async execute(prompt: string): Promise<AutoTask> {
    const task: AutoTask = {
      id: uuid(),
      prompt,
      status: 'planning',
      createdAt: new Date(),
    };
    this.tasks.set(task.id, task);

    console.log(`[AutoEngine] Planning: "${prompt.slice(0, 80)}..."`);
    
    // Plan
    task.plan = this.planner.plan(task);
    task.status = 'executing';
    
    // Execute steps sequentially
    for (const step of task.plan.steps) {
      step.status = 'running';
      console.log(`[AutoEngine] Step: ${step.description} (${step.agentType})`);
      
      try {
        const result = await this.executeStep(step, task);
        step.status = 'done';
        step.result = result;
      } catch (err: any) {
        step.status = 'failed';
        task.status = 'failed';
        task.error = `Step ${step.id} failed: ${err.message}`;
        return task;
      }
    }

    task.status = 'done';
    task.completedAt = new Date();
    task.result = task.plan.steps
      .filter(s => s.result)
      .map(s => `[${s.id}] ${s.description}:\n${s.result}`)
      .join('\n\n');
    
    console.log(`[AutoEngine] ✅ Task complete: ${task.id}`);
    return task;
  }

  private async executeStep(step: TaskStep, task: AutoTask): Promise<string> {
    // In production, this would dispatch to actual agents
    // For now, simulate agent execution
    return `Executed: ${step.action} via ${step.agentType}`;
  }

  async executeWithRetry(prompt: string, maxRetries?: number): Promise<AutoTask> {
    const retries = maxRetries ?? this.config.maxRetries;
    
    for (let i = 0; i < retries; i++) {
      const result = await this.execute(prompt);
      if (result.status === 'done') return result;
      console.log(`[AutoEngine] Retry ${i + 1}/${retries}...`);
    }
    
    throw new Error(`Task failed after ${retries} retries`);
  }

  getTask(id: string): AutoTask | undefined {
    return this.tasks.get(id);
  }

  getActiveTasks(): AutoTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status !== 'done' && t.status !== 'failed');
  }

  getHistory(): AutoTask[] {
    return Array.from(this.tasks.values());
  }
}
