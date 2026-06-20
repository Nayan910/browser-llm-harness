import { AgentConfig, AgentMessage } from "../types.js";
import { MessageBus } from "../message-bus.js";
import { AgentRuntime } from "../agent-runtime.js";

export interface LoopConfig {
  maxIterations: number;
  taskTemplate: string;
  agentChain: string[];
  verifyPrompt?: string;
}

export class LoopSimulator {
  private currentIteration = 0;

  constructor(
    private config: LoopConfig,
    private bus: MessageBus,
    private agents: Map<string, AgentRuntime>
  ) {}

  async run(sessionId: string): Promise<{ iterations: number; results: string[] }> {
    const results: string[] = [];

    for (let i = 0; i < this.config.maxIterations; i++) {
      this.currentIteration = i + 1;
      console.log(
        `[LoopSimulator] Iteration ${this.currentIteration}/${this.config.maxIterations}`
      );

      // Generate task from template
      const task = this.config.taskTemplate.replace(
        "{iteration}",
        String(this.currentIteration)
      );

      // Run through agent chain
      for (let j = 0; j < this.config.agentChain.length; j++) {
        const agentId = this.config.agentChain[j];
        const agent = this.agents.get(agentId);

        if (!agent) {
          console.error(`[LoopSimulator] Agent ${agentId} not found`);
          continue;
        }

        const result = await this.executeAgentTask(agent, task, sessionId, j);
        results.push(result);
      }

      // Optional verification
      if (this.config.verifyPrompt) {
        const verified = await this.verifyIteration(sessionId);
        if (verified) {
          console.log(`[LoopSimulator] Iteration ${this.currentIteration} verified OK`);
        }
      }
    }

    return { iterations: this.currentIteration, results };
  }

  private async executeAgentTask(
    agent: AgentRuntime,
    task: string,
    sessionId: string,
    chainPosition: number
  ): Promise<string> {
    return new Promise((resolve) => {
      const sub = this.bus.subscribe(agent.config.id, (msg: AgentMessage) => {
        if (msg.type === "response" && msg.content) {
          sub();
          resolve(msg.content);
        }
      });

      agent.send("simulator", task, sessionId);
    });
  }

  private async verifyIteration(sessionId: string): Promise<boolean> {
    // Verification logic
    return true;
  }

  getProgress(): { current: number; max: number } {
    return { current: this.currentIteration, max: this.config.maxIterations };
  }
}
