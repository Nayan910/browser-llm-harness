import { EventEmitter } from "events";
import { AgentMessage, AgentId } from "./types.js";

export class MessageBus {
  private emitter = new EventEmitter();
  
  send(msg: AgentMessage): void {
    this.emitter.emit(msg.to, msg);
    this.emitter.emit("*", msg);
    if (msg.type === "broadcast") {
      this.emitter.emit("broadcast", msg);
    }
  }

  subscribe(agentId: AgentId | "*", handler: (msg: AgentMessage) => void): () => void {
    this.emitter.on(agentId, handler);
    return () => this.emitter.off(agentId, handler);
  }

  subscribeToBroadcast(handler: (msg: AgentMessage) => void): () => void {
    this.emitter.on("broadcast", handler);
    return () => this.emitter.off("broadcast", handler);
  }
}
