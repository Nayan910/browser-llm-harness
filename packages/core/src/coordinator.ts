import { AgentRuntime } from "./agent-runtime.js";
import { AgentConfig } from "./types.js";
import { MessageBus } from "./message-bus.js";

export class Coordinator extends AgentRuntime {
  private folderAgents: Map<string, AgentRuntime> = new Map();
  private stateGraph: Record<string, any> = {};

  constructor(config: AgentConfig, bus: MessageBus) {
    super(config, bus);
    // Subscribe to all broadcasts
    bus.subscribeToBroadcast(this.handleBroadcast.bind(this));
  }

  registerFolderAgent(folder: string, agent: AgentRuntime): void {
    this.folderAgents.set(folder, agent);
  }

  private async handleBroadcast(msg: any): Promise<void> {
    try {
      const data = typeof msg.content === "string" ? JSON.parse(msg.content) : msg.content;

      if (data.type === "folder-change") {
        await this.processFolderChange(data);
      }
    } catch {
      // Non-JSON broadcast, ignore
    }
  }

  private async processFolderChange(data: any): Promise<void> {
    // Update system state graph
    this.stateGraph[`${data.folder}:${data.file}`] = {
      ...data,
      processedAt: new Date(),
    };

    console.log(`[Coordinator] Change detected: ${data.folder}/${data.file} (${data.event})`);

    // Notify relevant folder agents
    for (const [folder, agent] of this.folderAgents) {
      if (folder !== data.folder) {
        // Cross-folder notification
        agent.send(
          this.config.id,
          JSON.stringify({
            type: "cross-folder-change",
            sourceFolder: data.folder,
            file: data.file,
            event: data.event,
          }),
          "system"
        );
      }
    }
  }

  getStateGraph(): Record<string, any> {
    return { ...this.stateGraph };
  }

  getSystemStatus(): Record<string, any> {
    return {
      coordinatorId: this.config.id,
      managedFolders: Array.from(this.folderAgents.keys()),
      trackedChanges: Object.keys(this.stateGraph).length,
      lastUpdate: new Date(),
    };
  }
}
