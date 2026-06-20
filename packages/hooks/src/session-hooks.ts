import { HookEngine } from './hook-engine.js';

export class SessionHooksManager {
  constructor(private engine: HookEngine) {}

  async onSessionStart(context: Record<string, any> = {}): Promise<void> {
    console.log('[SessionHooks] Running session-start hooks...');
    const results = await this.engine.runHooks('session-start', {
      ...context,
      hookType: 'session-start',
      timestamp: new Date().toISOString(),
    });
    
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.warn(`[SessionHooks] ${failed.length} session-start hook(s) failed`);
    }
  }

  async onSessionEnd(context: Record<string, any> = {}): Promise<void> {
    console.log('[SessionHooks] Running session-end hooks...');
    const results = await this.engine.runHooks('session-end', {
      ...context,
      hookType: 'session-end',
      timestamp: new Date().toISOString(),
    });
  }

  async onBeforeAnswer(context: Record<string, any> = {}): Promise<void> {
    const results = await this.engine.runHooks('before-answer', {
      ...context,
      hookType: 'before-answer',
    });
  }

  async onAfterAnswer(context: Record<string, any> = {}): Promise<void> {
    const results = await this.engine.runHooks('after-answer', {
      ...context,
      hookType: 'after-answer',
    });
  }
}
