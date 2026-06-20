import { UpdatePackage, UpdateFile } from './types.js';
import { existsSync, writeFileSync, readFileSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

export class UpdateEngine {
  private currentVersion = '0.1.0';
  private updateUrl = 'https://raw.githubusercontent.com/Nayan910/browser-llm-harness/main/updates/';

  async checkForUpdates(): Promise<UpdatePackage | null> {
    try {
      const response = await fetch(`${this.updateUrl}latest.json`);
      if (!response.ok) return null;
      const latest = await response.json() as UpdatePackage;
      
      if (this.compareVersions(latest.version, this.currentVersion) > 0) {
        console.log(`[UpdateEngine] Update available: ${this.currentVersion} → ${latest.version}`);
        return latest;
      }
      return null;
    } catch (err) {
      console.error('[UpdateEngine] Check failed:', err);
      return null;
    }
  }

  async applyUpdate(update: UpdatePackage): Promise<boolean> {
    console.log(`[UpdateEngine] Applying update ${update.version}...`);
    
    try {
      // Apply file changes
      for (const file of update.files) {
        await this.applyFileChange(file);
      }

      // Run post-update scripts
      if (update.dependencies) {
        this.installDependencies(update.dependencies);
      }

      this.currentVersion = update.version;
      console.log(`[UpdateEngine] ✅ Updated to ${update.version}`);
      return true;
    } catch (err: any) {
      console.error(`[UpdateEngine] Update failed: ${err.message}`);
      return false;
    }
  }

  async pullFromGit(branch: string = 'main'): Promise<boolean> {
    try {
      execSync(`git pull origin ${branch}`, { cwd: process.cwd(), stdio: 'pipe' });
      console.log('[UpdateEngine] Git pull successful');
      return true;
    } catch (err) {
      console.error('[UpdateEngine] Git pull failed:', err);
      return false;
    }
  }

  private async applyFileChange(file: UpdateFile): Promise<void> {
    const fullPath = join(process.cwd(), file.path);
    
    switch (file.action) {
      case 'create':
      case 'modify': {
        const dir = dirname(fullPath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        writeFileSync(fullPath, file.content, 'utf-8');
        console.log(`[UpdateEngine] ${file.action === 'create' ? 'Created' : 'Updated'}: ${file.path}`);
        break;
      }
      case 'delete':
        if (existsSync(fullPath)) {
          unlinkSync(fullPath);
          console.log(`[UpdateEngine] Deleted: ${file.path}`);
        }
        break;
    }
  }

  private installDependencies(deps: Record<string, string>): void {
    try {
      const packages = Object.entries(deps)
        .map(([name, version]) => `${name}@${version}`)
        .join(' ');
      execSync(`npm install ${packages}`, { cwd: process.cwd(), stdio: 'pipe' });
    } catch (err) {
      console.error('[UpdateEngine] Dependency install failed:', err);
    }
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  private compareVersions(a: string, b: string): number {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const va = pa[i] || 0;
      const vb = pb[i] || 0;
      if (va > vb) return 1;
      if (va < vb) return -1;
    }
    return 0;
  }
}
