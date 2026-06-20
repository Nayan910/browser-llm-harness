import { SystemAccess } from './system-access.js';
import { UserPreferences, PersonalContext, CommandResult } from './types.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export class PersonalAgent {
  private access: SystemAccess;
  private preferences: UserPreferences;
  private recentCommands: CommandResult[] = [];
  private context: PersonalContext;

  constructor() {
    this.access = new SystemAccess();
    this.preferences = this.loadPreferences();
    this.context = {
      currentProject: '',
      lastTask: '',
      activeFiles: [],
      preferences: this.preferences,
      recentCommands: [],
    };
  }

  async executeUserCommand(command: string): Promise<CommandResult> {
    console.log(`[PersonalAgent] Executing: ${command}`);
    const result = await this.access.executeCommand({
      command,
      shell: true,
      timeout: 60000,
    });
    
    this.recentCommands.push(result);
    if (this.recentCommands.length > 50) {
      this.recentCommands.shift();
    }
    this.context.recentCommands = this.recentCommands.slice(-10);

    return result;
  }

  async executeSystemCommand(cmd: { command: string; cwd?: string }): Promise<CommandResult> {
    return this.access.executeCommand({
      command: cmd.command,
      cwd: cmd.cwd,
      shell: true,
      timeout: 60000,
    });
  }

  async manageFiles(action: 'read' | 'write' | 'delete' | 'list', path: string, content?: string) {
    switch (action) {
      case 'read': return this.access.readFile(path);
      case 'write': {
        if (!content) throw new Error('Content required for write');
        this.access.writeFile(path, content);
        return `Written: ${path}`;
      }
      case 'delete': {
        this.access.deleteFile(path);
        return `Deleted: ${path}`;
      }
      case 'list': return this.access.listFiles(path);
    }
  }

  async manageGit(action: string, path: string, message?: string) {
    switch (action) {
      case 'init': return this.access.gitInit(path);
      case 'add': return this.access.gitAdd(path);
      case 'commit': {
        if (!message) throw new Error('Commit message required');
        return this.access.gitCommit(path, message);
      }
      case 'push': return this.access.gitPush(path);
      case 'pull': return this.access.gitPull(path);
      case 'status': return this.access.gitStatus(path);
      default: throw new Error(`Unknown git action: ${action}`);
    }
  }

  setPreference(key: keyof UserPreferences, value: any): void {
    (this.preferences as any)[key] = value;
    this.savePreferences();
  }

  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  getContext(): PersonalContext {
    return { ...this.context };
  }

  setCurrentProject(project: string): void {
    this.context.currentProject = project;
  }

  setActiveFiles(files: string[]): void {
    this.context.activeFiles = files;
  }

  private loadPreferences(): UserPreferences {
    const defaultPrefs: UserPreferences = {
      preferredModel: 'ollama/qwen2.5',
      theme: 'dark',
      language: 'en',
      autoSave: true,
      gitAutoPush: false,
      sessionMemory: 10,
      hooks: {
        beforeAnswer: ['context-load', 'memory-check'],
        afterAnswer: ['self-review', 'memory-save'],
        sessionStart: ['git-pull', 'tool-update'],
        sessionEnd: ['git-push', 'backup'],
      },
      favoriteTools: [],
      customCommands: {},
    };

    try {
      if (existsSync('.personal-preferences.json')) {
        const data = JSON.parse(readFileSync('.personal-preferences.json', 'utf-8'));
        return { ...defaultPrefs, ...data };
      }
    } catch {}
    
    return defaultPrefs;
  }

  private savePreferences(): void {
    try {
      writeFileSync('.personal-preferences.json', JSON.stringify(this.preferences, null, 2), 'utf-8');
    } catch (err) {
      console.error('[PersonalAgent] Failed to save preferences:', err);
    }
  }
}
