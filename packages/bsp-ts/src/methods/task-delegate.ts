/**
 * task/delegate — Task Delegation Protocol
 *
 * "Hey Bill, can you handle this?"
 *
 * The single most useful primitive in BSP. One agent delegates
 * a task to another with full context, requirements, and acceptance criteria.
 * The executing agent reports progress and completion.
 */

import type {
  BspMeta,
  TaskCompleteParams,
  TaskDelegateParams,
  TaskDelegateResult,
  TaskDelegationStatus,
  TaskProgressParams,
} from '../types.js';
import type { MethodHandler } from './types.js';
import { generateTaskId } from '../protocol.js';

// ─── Types ────────────────────────────────────────────────────────────

export interface TaskRecord {
  taskId: string;
  parentTaskId?: string;
  description: string;
  type: string;
  priority: number;
  status: 'pending' | 'accepted' | 'in-progress' | 'blocked' | 'completed' | 'failed' | 'cancelled';
  delegateAgent: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  progress?: number;
  result?: TaskCompleteParams['result'];
  tokenCost?: number;
  duration?: number;
  error?: string;
  reflections?: string;
}

export interface TaskDelegateOptions {
  /** Maximum concurrent tasks this handler will accept */
  maxConcurrent?: number;
  /** Whether to auto-accept tasks (vs. manual review) */
  autoAccept?: boolean;
  /** Agent name for attribution */
  agentName: string;
}

// ─── Handler ──────────────────────────────────────────────────────────

export class TaskDelegateHandler {
  private tasks: Map<string, TaskRecord> = new Map();
  private options: TaskDelegateOptions;

  /** Callback when a task is delegated — returns whether to accept */
  onTaskDelegated?: (params: TaskDelegateParams, meta: BspMeta) => Promise<TaskDelegationStatus | TaskDelegateResult>;

  /** Callback when progress is reported */
  onTaskProgress?: (params: TaskProgressParams, meta: BspMeta) => void;

  /** Callback when a task completes */
  onTaskCompleted?: (params: TaskCompleteParams, meta: BspMeta) => void;

  constructor(options: TaskDelegateOptions) {
    this.options = options;
  }

  /** Handle task/delegate request */
  async handleDelegate(params: TaskDelegateParams, meta: BspMeta): Promise<TaskDelegateResult> {
    // Check concurrent task limit
    const activeCount = Array.from(this.tasks.values()).filter(
      t => t.status === 'in-progress' || t.status === 'accepted',
    ).length;

    if (activeCount >= (this.options.maxConcurrent ?? 10)) {
      return {
        status: 'rejected',
        reason: `Max concurrent tasks reached (${this.options.maxConcurrent})`,
      };
    }

    // Allow custom delegation logic
    if (this.onTaskDelegated) {
      const result = await this.onTaskDelegated(params, meta);
      if (typeof result === 'object') {
        if (result.status === 'accepted') {
          this.registerTask(params, meta);
        }
        return result;
      }
      if (result === 'rejected') {
        return { status: 'rejected', reason: 'Task declined by custom handler' };
      }
    }

    // Auto-accept if configured
    if (this.options.autoAccept) {
      this.registerTask(params, meta);
      return {
        status: 'accepted',
        estimatedCompletion: new Date(Date.now() + 3600_000).toISOString(),
        contract: `contract-${params.taskId}`,
      };
    }

    // Default: accept if we can
    this.registerTask(params, meta);
    return {
      status: 'accepted',
      contract: `contract-${params.taskId}`,
    };
  }

  /** Handle task/progress notification */
  handleProgress(params: TaskProgressParams, _meta: BspMeta): void {
    const task = this.tasks.get(params.taskId);
    if (task) {
      task.status = params.status === 'in-progress' ? 'in-progress'
        : params.status === 'blocked' ? 'blocked'
        : params.status === 'cancelled' ? 'cancelled'
        : task.status;
      task.progress = params.percentComplete;
    }

    this.onTaskProgress?.(params, _meta);
  }

  /** Handle task/complete notification */
  handleComplete(params: TaskCompleteParams, _meta: BspMeta): void {
    const task = this.tasks.get(params.taskId);
    if (task) {
      task.status = params.status === 'success' ? 'completed'
        : params.status === 'failure' ? 'failed'
        : 'completed'; // partial
      task.completedAt = new Date().toISOString();
      task.result = params.result;
      task.tokenCost = params.tokenCost;
      task.duration = params.duration;
      task.error = params.error;
      task.reflections = params.reflections;
    }

    this.onTaskCompleted?.(params, _meta);
  }

  /** Get task status */
  getTask(taskId: string): TaskRecord | undefined {
    return this.tasks.get(taskId);
  }

  /** Get all active tasks */
  getActiveTasks(): TaskRecord[] {
    return Array.from(this.tasks.values()).filter(
      t => t.status === 'accepted' || t.status === 'in-progress',
    );
  }

  /** Get all tasks */
  getAllTasks(): TaskRecord[] {
    return Array.from(this.tasks.values());
  }

  private registerTask(params: TaskDelegateParams, meta: BspMeta): void {
    const task: TaskRecord = {
      taskId: params.taskId,
      parentTaskId: params.parentTaskId,
      description: params.description,
      type: params.type,
      priority: params.priority ?? 0.5,
      status: 'accepted',
      delegateAgent: meta.sender,
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(params.taskId, task);
  }
}
