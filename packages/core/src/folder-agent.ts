import { AgentRuntime } from "./agent-runtime.js";
import { AgentConfig, FolderState, FileInfo, TrafficEntry } from "./types.js";
import { MessageBus } from "./message-bus.js";
import { watch } from "fs";
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

export class FolderAgent extends AgentRuntime {
  public folderState: FolderState;
  private watcher: ReturnType<typeof watch> | null = null;

  constructor(
    config: AgentConfig,
    bus: MessageBus,
    tools: Map<string, any>
  ) {
    super(config, bus, tools);
    this.folderState = {
      path: config.folderScope || ".",
      agentId: config.id,
      files: {},
      traffic: [],
      lastScan: new Date(),
    };
  }

  async startMonitoring(): Promise<void> {
    await this.scanFolder();
    this.watcher = watch(this.folderState.path, { recursive: true }, (event, filename) => {
      if (filename) {
        this.handleFileChange(event, filename.toString());
      }
    });
    console.log(`[FolderAgent:${this.config.name}] Monitoring ${this.folderState.path}`);
  }

  stopMonitoring(): void {
    this.watcher?.close();
  }

  private async scanFolder(): Promise<void> {
    try {
      const files = readdirSync(this.folderState.path, { recursive: true }) as string[];
      for (const file of files) {
        const fullPath = join(this.folderState.path, file);
        try {
          const stats = statSync(fullPath);
          if (stats.isFile()) {
            this.folderState.files[file] = {
              path: file,
              createdBy: this.config.id,
              lastModifiedBy: this.config.id,
              createdAt: stats.birthtime,
              modifiedAt: stats.mtime,
              size: stats.size,
              hash: this.computeHash(fullPath),
            };
          }
        } catch {}
      }
      this.folderState.lastScan = new Date();
    } catch (err) {
      console.error(`[FolderAgent] Scan error: ${err}`);
    }
  }

  private handleFileChange(event: string, filename: string): void {
    const fullPath = join(this.folderState.path, filename);
    const entry: TrafficEntry = {
      timestamp: new Date(),
      from: "filesystem",
      to: this.config.id,
      type: event === "change" ? "modify" : "create",
      filePath: filename,
      summary: `File ${event}: ${filename}`,
    };
    this.folderState.traffic.push(entry);

    // Broadcast change to coordinator
    this.broadcast(
      JSON.stringify({
        type: "folder-change",
        agentId: this.config.id,
        folder: this.folderState.path,
        event,
        file: filename,
        timestamp: entry.timestamp,
      }),
      "system"
    );

    // Update file info
    try {
      const stats = statSync(fullPath);
      this.folderState.files[filename] = {
        path: filename,
        createdBy: this.folderState.files[filename]?.createdBy || this.config.id,
        lastModifiedBy: this.config.id,
        createdAt: this.folderState.files[filename]?.createdAt || stats.birthtime,
        modifiedAt: stats.mtime,
        size: stats.size,
        hash: this.computeHash(fullPath),
      };
    } catch {}
  }

  private computeHash(filePath: string): string {
    try {
      const content = readFileSync(filePath);
      return createHash("sha256").update(content).digest("hex").slice(0, 16);
    } catch {
      return "unknown";
    }
  }

  getTrafficLog(): TrafficEntry[] {
    return [...this.folderState.traffic];
  }

  getFileInfo(filePath: string): FileInfo | undefined {
    return this.folderState.files[filePath];
  }
}
