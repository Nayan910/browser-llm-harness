import { SessionStore } from './session-store.js';
import { MemoryEntry, CrossSessionContext } from './types.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

export class CrossSessionMemory {
  private memories: MemoryEntry[] = [];
  private storagePath: string;

  constructor(basePath: string = '.memory') {
    this.storagePath = basePath;
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true });
    }
    this.loadMemories();
  }

  // Save a memory entry
  save(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): MemoryEntry {
    const full: MemoryEntry = {
      ...entry,
      id: uuid(),
      timestamp: new Date(),
    };
    this.memories.push(full);
    this.persistMemories();
    return full;
  }

  // Save user preference
  saveUserPreference(key: string, value: any, source: string = 'conversation'): MemoryEntry {
    return this.save({
      key,
      content: value,
      category: 'user-preference',
      tags: ['user-preference', source],
      source,
    });
  }

  // Save technique
  saveTechnique(name: string, description: string, tags: string[] = []): MemoryEntry {
    return this.save({
      key: 'technique:' + name,
      content: description,
      category: 'technique',
      tags: ['technique', ...tags],
      source: 'self-learned',
    });
  }

  // Search memories by key or content
  search(query: string): MemoryEntry[] {
    const q = query.toLowerCase();
    return this.memories.filter(m =>
      m.key.toLowerCase().includes(q) ||
      JSON.stringify(m.content).toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Get memories by category
  getByCategory(category: MemoryEntry['category']): MemoryEntry[] {
    return this.memories.filter(m => m.category === category);
  }

  // Build cross-session context for a new session
  buildContext(sessionStore: SessionStore, recentCount: number = 5): CrossSessionContext {
    const recentSessions = sessionStore.getRecentSessions(recentCount);
    
    // Find all file changes from recent sessions
    const activeFileChanges = recentSessions.flatMap(s => s.fileChanges);
    
    // Get relevant memories (recent user preferences and knowledge)
    const relevantMemories = [
      ...this.getByCategory('user-preference').slice(-10),
      ...this.getByCategory('technique').slice(-5),
      ...this.getByCategory('knowledge').slice(-5),
    ];

    return {
      recentSessions,
      relevantMemories,
      activeFileChanges,
      currentAgentStates: {},
    };
  }

  // Generate a session summary prompt
  generateContextPrompt(sessionStore: SessionStore): string {
    const ctx = this.buildContext(sessionStore);
    
    let prompt = '# Session Context\n\n';
    
    if (ctx.recentSessions.length > 0) {
      prompt += '## Recent Sessions\n';
      for (const s of ctx.recentSessions) {
        prompt += '- **' + s.id + '**: ' + s.summary + ' (' + s.startTime.toLocaleDateString() + ')\n';
        if (s.fileChanges.length > 0) {
          prompt += '  Files: ' + s.fileChanges.map(f => f.path).join(', ') + '\n';
        }
      }
    }

    if (ctx.relevantMemories.length > 0) {
      prompt += '\n## Relevant Memories\n';
      for (const m of ctx.relevantMemories) {
        prompt += '- ' + m.key + ': ' + JSON.stringify(m.content) + '\n';
      }
    }

    if (ctx.activeFileChanges.length > 0) {
      prompt += '\n## Active File Changes\n';
      for (const f of ctx.activeFileChanges.slice(0, 20)) {
        prompt += '- ' + f.type.toUpperCase() + ' ' + f.path + ' (by ' + f.agentId + ')\n';
      }
    }

    return prompt;
  }

  private loadMemories(): void {
    const filePath = join(this.storagePath, 'memories.json');
    try {
      if (existsSync(filePath)) {
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        this.memories = data.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch (err) {
      console.error('[CrossSessionMemory] Load error:', err);
    }
  }

  private persistMemories(): void {
    try {
      writeFileSync(
        join(this.storagePath, 'memories.json'),
        JSON.stringify(this.memories, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('[CrossSessionMemory] Persist error:', err);
    }
  }

  getStats() {
    return {
      totalMemories: this.memories.length,
      byCategory: {
        preferences: this.getByCategory('user-preference').length,
        techniques: this.getByCategory('technique').length,
        knowledge: this.getByCategory('knowledge').length,
        sessions: this.getByCategory('session-summary').length,
        notes: this.getByCategory('agent-note').length,
      },
    };
  }
}
