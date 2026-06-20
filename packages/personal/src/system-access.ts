import { SystemCommand, CommandResult } from './types.js';
import { execSync, exec } from 'child_process';
import { accessSync, constants, readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, renameSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export class SystemAccess {
  async executeCommand(cmd: SystemCommand): Promise<CommandResult> {
    const start = Date.now();
    try {
      const result = execSync(cmd.command, {
        cwd: cmd.cwd,
        timeout: cmd.timeout || 30000,
        shell: cmd.shell !== false,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });
      return {
        stdout: result || '',
        stderr: '',
        exitCode: 0,
        duration: Date.now() - start,
      };
    } catch (err: any) {
      return {
        stdout: err.stdout || '',
        stderr: err.stderr || err.message,
        exitCode: err.status || 1,
        duration: Date.now() - start,
      };
    }
  }

  async executeCommandAsync(cmd: SystemCommand, onData?: (data: string) => void): Promise<CommandResult> {
    return new Promise((resolve) => {
      const start = Date.now();
      const child = exec(cmd.command, {
        cwd: cmd.cwd,
        timeout: cmd.timeout || 300000,
        shell: cmd.shell !== false,
        maxBuffer: 10 * 1024 * 1024,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data: string) => {
        stdout += data;
        onData?.(data);
      });
      child.stderr?.on('data', (data: string) => {
        stderr += data;
      });
      child.on('close', (exitCode) => {
        resolve({
          stdout,
          stderr,
          exitCode: exitCode ?? 1,
          duration: Date.now() - start,
        });
      });
      child.on('error', (err) => {
        resolve({
          stdout,
          stderr: err.message,
          exitCode: 1,
          duration: Date.now() - start,
        });
      });
    });
  }

  // File system operations
  readFile(filePath: string): string {
    return readFileSync(filePath, 'utf-8');
  }

  writeFile(filePath: string, content: string): void {
    const dir = join(filePath, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, content, 'utf-8');
  }

  deleteFile(filePath: string): void {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  listFiles(dirPath: string): string[] {
    if (!existsSync(dirPath)) return [];
    return readdirSync(dirPath);
  }

  fileExists(filePath: string): boolean {
    try {
      accessSync(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  getFileInfo(filePath: string) {
    try {
      const stats = statSync(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDir: stats.isDirectory(),
      };
    } catch {
      return null;
    }
  }

  // Git operations
  async gitInit(path: string): Promise<CommandResult> {
    return this.executeCommand({ command: 'git init', cwd: path });
  }

  async gitAdd(path: string, files: string = '.'): Promise<CommandResult> {
    return this.executeCommand({ command: `git add ${files}`, cwd: path });
  }

  async gitCommit(path: string, message: string): Promise<CommandResult> {
    return this.executeCommand({ command: `git commit -m "${message.replace(/"/g, '\\"')}"`, cwd: path });
  }

  async gitPush(path: string, remote: string = 'origin', branch: string = 'main'): Promise<CommandResult> {
    return this.executeCommand({ command: `git push ${remote} ${branch}`, cwd: path });
  }

  async gitPull(path: string, remote: string = 'origin', branch: string = 'main'): Promise<CommandResult> {
    return this.executeCommand({ command: `git pull ${remote} ${branch}`, cwd: path });
  }

  async gitStatus(path: string): Promise<CommandResult> {
    return this.executeCommand({ command: 'git status', cwd: path });
  }

  async gitClone(url: string, targetPath: string): Promise<CommandResult> {
    return this.executeCommand({ command: `git clone ${url}`, cwd: targetPath });
  }
}
