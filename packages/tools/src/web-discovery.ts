import { ToolRegistry } from './tool-registry.js';
import { ToolDefinition, DiscoverySource, DiscoveredTool } from './types.js';

export class WebDiscoveryAgent {
  private sources: DiscoverySource[] = [
    { name: 'GitHub Trending', url: 'https://api.github.com/search/repositories?q=ai-agent-tool&sort=stars', type: 'github', schedule: 'daily' },
    { name: 'npm Registry', url: 'https://registry.npmjs.org/-/v1/search?text=keywords:mcp,tool,agent&size=50', type: 'npm', schedule: 'daily' },
    { name: 'OpenCode Community', url: 'https://raw.githubusercontent.com/opencode-ai/community-tools/main/index.json', type: 'registry', schedule: 'weekly' },
  ];

  private discovered: DiscoveredTool[] = [];

  constructor(private registry: ToolRegistry) {}

  async discoverNewTools(): Promise<DiscoveredTool[]> {
    const allDiscovered: DiscoveredTool[] = [];

    for (const source of this.sources) {
      try {
        const tools = await this.scanSource(source);
        allDiscovered.push(...tools);
      } catch (err) {
        console.error(\[WebDiscovery] Failed to scan \: \\);
      }
    }

    // Auto-register new tools
    for (const dt of allDiscovered) {
      if (!this.registry.get(dt.tool.name)) {
        this.registry.register(dt.tool);
        this.discovered.push(dt);
        console.log(\[WebDiscovery] New tool discovered: \ (\)\);
      }
    }

    return allDiscovered;
  }

  private async scanSource(source: DiscoverySource): Promise<DiscoveredTool[]> {
    const response = await fetch(source.url, {
      headers: { 'User-Agent': 'Browser-LLM-Harness/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) return [];
    const data = await response.json();
    return this.parseSourceResults(source, data);
  }

  private parseSourceResults(source: DiscoverySource, data: any): DiscoveredTool[] {
    const tools: DiscoveredTool[] = [];

    switch (source.type) {
      case 'github':
        if (data.items) {
          for (const item of data.items.slice(0, 20)) {
            tools.push({
              tool: {
                name: item.name,
                type: this.inferType(item),
                description: item.description || '',
                usage: \Check \\,
                parameters: [],
                source: item.html_url,
                version: 'latest',
                category: this.inferCategory(item),
                installUrl: item.html_url,
              },
              foundAt: new Date(),
              source: source.name,
              confidence: item.stargazers_count > 100 ? 0.8 : 0.5,
            });
          }
        }
        break;

      case 'npm':
        if (data.objects) {
          for (const obj of data.objects.slice(0, 20)) {
            const pkg = obj.package;
            tools.push({
              tool: {
                name: pkg.name,
                type: 'plugin',
                description: pkg.description || '',
                usage: \
pm install \\,
                parameters: [],
                source: pkg.links?.npm || '',
                version: pkg.version,
                category: 'npm-package',
                installUrl: \
pm install \\,
              },
              foundAt: new Date(),
              source: source.name,
              confidence: 0.6,
            });
          }
        }
        break;

      case 'registry':
        if (Array.isArray(data)) {
          for (const item of data) {
            tools.push({
              tool: {
                name: item.name,
                type: item.type || 'plugin',
                description: item.description || '',
                usage: item.usage || '',
                parameters: item.parameters || [],
                source: item.source || source.name,
                version: item.version || '1.0.0',
                category: item.category || 'general',
              },
              foundAt: new Date(),
              source: source.name,
              confidence: 0.7,
            });
          }
        }
        break;
    }

    return tools;
  }

  private inferType(item: any): ToolDefinition['type'] {
    const topics = (item.topics || []).map((t: string) => t.toLowerCase());
    if (topics.includes('mcp') || topics.includes('modelcontextprotocol')) return 'mcp';
    if (topics.includes('cli')) return 'cli';
    if (topics.includes('plugin')) return 'plugin';
    if (topics.includes('hook')) return 'hook';
    if (topics.includes('skill')) return 'skill';
    if (topics.includes('lsp')) return 'lsp';
    return 'plugin';
  }

  private inferCategory(item: any): string {
    const topics = (item.topics || []).map((t: string) => t.toLowerCase());
    if (topics.includes('ai') || topics.includes('llm')) return 'ai';
    if (topics.includes('developer-tools') || topics.includes('devtools')) return 'developer-tools';
    if (topics.includes('automation')) return 'automation';
    return 'general';
  }

  getDiscovered(): DiscoveredTool[] {
    return [...this.discovered];
  }

  addSource(source: DiscoverySource): void {
    this.sources.push(source);
  }
}
