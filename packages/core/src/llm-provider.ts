import { LLMConfig } from "./types.js";

export class LLMProvider {
  constructor(private config: LLMConfig) {}

  async chat(messages: { role: "system" | "user" | "assistant"; content: string }[]): Promise<string> {
    const baseUrl = this.config.baseUrl || this.getDefaultBaseUrl();
    
    const body = JSON.stringify({
      model: this.config.model,
      messages,
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 4096,
    });

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey || ""}`,
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`LLM error ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as any;
    return data.choices?.[0]?.message?.content || "";
  }

  async *stream(
    messages: { role: "system" | "user" | "assistant"; content: string }[]
  ): AsyncIterable<string> {
    const baseUrl = this.config.baseUrl || this.getDefaultBaseUrl();
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey || ""}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM stream error ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            const content =
              parsed.choices?.[0]?.delta?.content ||
              parsed.choices?.[0]?.text ||
              "";
            if (content) yield content;
          } catch {}
        }
      }
    }
  }

  private getDefaultBaseUrl(): string {
    switch (this.config.provider) {
      case "openai":
        return "https://api.openai.com/v1";
      case "anthropic":
        return "https://api.anthropic.com/v1";
      case "ollama":
        return "http://localhost:11434/v1";
      case "openrouter":
        return "https://openrouter.ai/api/v1";
      default:
        return "http://localhost:11434/v1";
    }
  }
}
