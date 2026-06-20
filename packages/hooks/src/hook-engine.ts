import { HookConfig, HookDefinition, HookResult } from './types.js';

export class HookEngine {
  private config: HookConfig;

  constructor(config?: Partial<HookConfig>) {
    this.config = {
      beforeAnswer: config?.beforeAnswer || [],
      afterAnswer: config?.afterAnswer || [],
      sessionStart: config?.sessionStart || [],
      sessionEnd: config?.sessionEnd || [],
      sessionOverride: config?.sessionOverride || [],
    };
  }

  async runHooks(
    timing: 'before-answer' | 'after-answer' | 'session-start' | 'session-end',
    context: Record<string, any> = {}
  ): Promise<HookResult[]> {
    const hooks = [
      ...this.config[timing],
      ...this.config.sessionOverride.filter(h => 
        !h.condition || this.evaluateCondition(h.condition, context)
      ),
    ];

    const results: HookResult[] = [];
    for (const hook of hooks) {
      const start = Date.now();
      try {
        // Execute the hook tool
        const output = await this.executeHook(hook, context);
        results.push({
          hook,
          success: true,
          output,
          duration: Date.now() - start,
          timestamp: new Date(),
        });
        console.log(`[HookEngine] ✅ ${hook.toolName} (${timing})`);
      } catch (err: any) {
        const result: HookResult = {
          hook,
          success: false,
          error: err.message,
          duration: Date.now() - start,
          timestamp: new Date(),
        };
        results.push(result);
        console.error(`[HookEngine] ❌ ${hook.toolName} (${timing}): ${err.message}`);
        
        if (hook.required) {
          throw new Error(`Required hook failed: ${hook.toolName} - ${err.message}`);
        }
      }
    }

    return results;
  }

  private async executeHook(hook: HookDefinition, context: Record<string, any>): Promise<string> {
    // In real implementation, this would dispatch to ToolExecutor
    // For now, simulate hook execution
    return `Hook ${hook.toolName} executed with params: ${JSON.stringify(hook.params)}, context keys: ${Object.keys(context).join(', ')}`;
  }

  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    try {
      // Simple condition evaluation
      // Format: "if-tool-used:toolName" or "if-agent:agentId"
      const [type, value] = condition.split(':');
      switch (type) {
        case 'if-tool-used':
          return context.lastTool === value;
        case 'if-agent':
          return context.currentAgent === value;
        case 'if-file-changed':
          return context.changedFiles?.includes(value);
        default:
          return true;
      }
    } catch {
      return true;
    }
  }

  updateConfig(config: Partial<HookConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): HookConfig {
    return { ...this.config };
  }
}
