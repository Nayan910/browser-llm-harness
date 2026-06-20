import { ToolDefinition, ToolParameter } from './types.js';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private categories: Map<string, ToolDefinition[]> = new Map();

  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
    const cat = this.categories.get(tool.category) || [];
    cat.push(tool);
    this.categories.set(tool.category, cat);
  }

  registerMany(tools: ToolDefinition[]): void {
    for (const tool of tools) this.register(tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  search(query: string): ToolDefinition[] {
    const q = query.toLowerCase();
    return Array.from(this.tools.values()).filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  getByCategory(category: string): ToolDefinition[] {
    return this.categories.get(category) || [];
  }

  getByType(type: ToolDefinition['type']): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(t => t.type === type);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getStats() {
    return {
      total: this.tools.size,
      byType: {
        mcp: this.getByType('mcp').length,
        cli: this.getByType('cli').length,
        plugin: this.getByType('plugin').length,
        hook: this.getByType('hook').length,
        skill: this.getByType('skill').length,
        lsp: this.getByType('lsp').length,
      },
      byCategory: Object.fromEntries(
        Array.from(this.categories.entries()).map(([k, v]) => [k, v.length])
      ),
    };
  }
}
