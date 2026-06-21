import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface CacheEntry {
  data: any;
  expiresAt: number;
}

export class InstagramCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlSeconds: number;
  private filePath: string;

  constructor(ttlSeconds: number = 300, storagePath?: string) {
    this.ttlSeconds = ttlSeconds;
    this.filePath = storagePath ? join(storagePath, 'instagram-cache.json') : '';
    this.load();
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttlSeconds * 1000,
    });
    this.save();
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) this.cache.delete(key);
      }
    } else {
      this.cache.clear();
    }
    this.save();
  }

  private load(): void {
    if (!this.filePath || !existsSync(this.filePath)) return;
    try {
      const data = JSON.parse(readFileSync(this.filePath, 'utf-8'));
      for (const [key, entry] of Object.entries(data)) {
        const e = entry as CacheEntry;
        if (Date.now() < e.expiresAt) {
          this.cache.set(key, e);
        }
      }
    } catch {}
  }

  private save(): void {
    if (!this.filePath) return;
    const dir = join(this.filePath, '..');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    try {
      writeFileSync(this.filePath, JSON.stringify(Object.fromEntries(this.cache), null, 2));
    } catch {}
  }

  getStats() { return { size: this.cache.size, ttlSeconds: this.ttlSeconds }; }
}
