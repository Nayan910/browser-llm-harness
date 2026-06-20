import { HookEngine } from './hook-engine.js';
import { HookDefinition } from './types.js';

export class ForceToolManager {
  private forcedTools: Map<string, HookDefinition[]> = new Map();

  constructor(private engine: HookEngine) {}

  forceBeforeAnswer(toolName: string, params?: Record<string, any>): void {
    const hook: HookDefinition = {
      toolName,
      params,
      required: true,
      description: `Force tool: ${toolName} before answer`,
    };
    const existing = this.forcedTools.get('before-answer') || [];
    existing.push(hook);
    this.forcedTools.set('before-answer', existing);
    
    this.engine.updateConfig({
      sessionOverride: [
        ...this.engine.getConfig().sessionOverride,
        hook,
      ],
    });
  }

  forceAfterAnswer(toolName: string, params?: Record<string, any>): void {
    const hook: HookDefinition = {
      toolName,
      params,
      required: true,
      description: `Force tool: ${toolName} after answer`,
    };
    const existing = this.forcedTools.get('after-answer') || [];
    existing.push(hook);
    this.forcedTools.set('after-answer', existing);
  }

  forceSessionStart(toolName: string, params?: Record<string, any>): void {
    const hook: HookDefinition = {
      toolName,
      params,
      required: true,
      description: `Force tool: ${toolName} at session start`,
    };
    const existing = this.forcedTools.get('session-start') || [];
    existing.push(hook);
    this.forcedTools.set('session-start', existing);
  }

  forceSessionEnd(toolName: string, params?: Record<string, any>): void {
    const hook: HookDefinition = {
      toolName,
      params,
      required: true,
      description: `Force tool: ${toolName} at session end`,
    };
    const existing = this.forcedTools.get('session-end') || [];
    existing.push(hook);
    this.forcedTools.set('session-end', existing);
  }

  removeForce(timing: string, toolName: string): void {
    const existing = this.forcedTools.get(timing) || [];
    this.forcedTools.set(
      timing,
      existing.filter(h => h.toolName !== toolName)
    );
  }

  getForcedTools(timing?: string): Map<string, HookDefinition[]> | HookDefinition[] {
    if (timing) return this.forcedTools.get(timing) || [];
    return this.forcedTools;
  }

  clearAllForced(): void {
    this.forcedTools.clear();
  }
}
