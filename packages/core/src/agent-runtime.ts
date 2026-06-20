import { AgentConfig, AgentMessage, ToolDefinition } from "./types.js";
import { MessageBus } from "./message-bus.js";
import { LLMProvider } from "./llm-provider.js";
import { v4 as uuid } from "uuid";

export class AgentRuntime {
  protected provider: LLMProvider;
  protected messageHistory: { role: "system" | "user" | "assistant"; content: string }[] = [];

  constructor(
    public config: AgentConfig,
    protected bus: MessageBus,
    protected tools: Map<string, ToolDefinition> = new Map()
  ) {
    this.provider = new LLMProvider(config.llmConfig);
    this.messageHistory.push({ role: "system", content: config.systemPrompt });

    // Subscribe to messages addressed to this agent
    this.bus.subscribe(config.id, this.handleMessage.bind(this));
  }

  private async handleMessage(msg: AgentMessage): Promise<void> {
    this.messageHistory.push({ role: "user", content: msg.content });

    // Run before-answer hooks
    if (this.config.hooks?.beforeAnswer) {
      for (const toolName of this.config.hooks.beforeAnswer) {
        await this.runToolHook(toolName, msg);
      }
    }

    const response = await this.provider.chat(this.messageHistory);
    this.messageHistory.push({ role: "assistant", content: response });

    // Run after-answer hooks
    if (this.config.hooks?.afterAnswer) {
      for (const toolName of this.config.hooks.afterAnswer) {
        await this.runToolHook(toolName, msg);
      }
    }

    // Send response back
    this.bus.send({
      id: uuid(),
      from: this.config.id,
      to: msg.from,
      type: "response",
      content: response,
      timestamp: new Date(),
      sessionId: msg.sessionId,
    });
  }

  private async runToolHook(toolName: string, context: AgentMessage): Promise<void> {
    console.log(`[${this.config.id}] Running hook: ${toolName}`);
    // Tool execution logic would go here
  }

  async send(to: string, content: string, sessionId: string): Promise<void> {
    this.bus.send({
      id: uuid(),
      from: this.config.id,
      to,
      type: "task",
      content,
      timestamp: new Date(),
      sessionId,
    });
  }

  async broadcast(content: string, sessionId: string): Promise<void> {
    this.bus.send({
      id: uuid(),
      from: this.config.id,
      to: "*",
      type: "broadcast",
      content,
      timestamp: new Date(),
      sessionId,
    });
  }

  getMessageHistory() {
    return [...this.messageHistory];
  }
}
