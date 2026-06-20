import { SessionRecord, FileChange } from './types.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class SessionStore {
  private sessions: SessionRecord[] = [];
  private storagePath: string;

  constructor(basePath: string = '.memory') {
    this.storagePath = basePath;
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true });
    }
    this.load();
  }

  saveSession(session: SessionRecord): void {
    const existing = this.sessions.findIndex(s => s.id === session.id);
    if (existing >= 0) {
      this.sessions[existing] = session;
    } else {
      this.sessions.push(session);
    }
    this.persist();
  }

  getSession(id: string): SessionRecord | undefined {
    return this.sessions.find(s => s.id === id);
  }

  getRecentSessions(count: number = 10): SessionRecord[] {
    return this.sessions
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, count);
  }

  searchSessions(query: string): SessionRecord[] {
    const q = query.toLowerCase();
    return this.sessions.filter(s =>
      s.summary.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q)) ||
      s.agentIds.some(a => a.toLowerCase().includes(q))
    );
  }

  getSessionsByAgent(agentId: string): SessionRecord[] {
    return this.sessions.filter(s => s.agentIds.includes(agentId));
  }

  getFileHistory(filePath: string): FileChange[] {
    return this.sessions
      .flatMap(s => s.fileChanges)
      .filter(f => f.path === filePath)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private load(): void {
    const filePath = join(this.storagePath, 'sessions.json');
    try {
      if (existsSync(filePath)) {
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        this.sessions = data.map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined,
          fileChanges: s.fileChanges?.map((f: any) => ({ ...f, timestamp: new Date(f.timestamp) })) || [],
        }));
      }
    } catch (err) {
      console.error('[SessionStore] Load error:', err);
    }
  }

  private persist(): void {
    try {
      writeFileSync(
        join(this.storagePath, 'sessions.json'),
        JSON.stringify(this.sessions, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('[SessionStore] Persist error:', err);
    }
  }

  getStats() {
    return {
      totalSessions: this.sessions.length,
      totalFileChanges: this.sessions.reduce((s, r) => s + r.fileChanges.length, 0),
      uniqueAgents: new Set(this.sessions.flatMap(s => s.agentIds)).size,
      lastSession: this.sessions[this.sessions.length - 1]?.startTime,
    };
  }
}
