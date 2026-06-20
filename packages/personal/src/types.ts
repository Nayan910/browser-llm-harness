export interface UserPreferences {
  preferredModel: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSave: boolean;
  gitAutoPush: boolean;
  sessionMemory: number; // number of previous sessions to remember
  hooks: {
    beforeAnswer: string[];
    afterAnswer: string[];
    sessionStart: string[];
    sessionEnd: string[];
  };
  favoriteTools: string[];
  customCommands: Record<string, string>;
}

export interface SystemCommand {
  command: string;
  args: string[];
  cwd?: string;
  timeout?: number;
  shell?: boolean;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface PersonalContext {
  currentProject: string;
  lastTask: string;
  activeFiles: string[];
  preferences: UserPreferences;
  recentCommands: CommandResult[];
}
