import { ToolDefinition, ToolParameter } from './types.js';
import { ALL_TOOLS, AGENT_TOOL_MAP, getToolsByCategory as getToolsByCategoryIndex, searchTools as searchToolsIndex } from './tools-index.js';

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

  registerDefaults_old(): void {
    // Instagram MCP Tools
    const instagramTools = [
      { name: 'instagram-get-media', type: 'mcp' as const, description: 'Get Instagram post details by ID', usage: 'Use when you need specific post/reel data from Instagram', parameters: [{ name: 'mediaId', type: 'string' as const, required: true, description: 'Instagram media ID' }], source: 'instagram-mcp-server', version: '1.0.0', category: 'social' },
      { name: 'instagram-list-media', type: 'mcp' as const, description: 'List recent Instagram posts from business account', usage: 'Use to browse recent Instagram content', parameters: [{ name: 'limit', type: 'number' as const, required: false, description: 'Max posts (default 25)' }], source: 'instagram-mcp-server', version: '1.0.0', category: 'social' },
      { name: 'instagram-get-comments', type: 'mcp' as const, description: 'Get comments on an Instagram post', usage: 'Use to analyze engagement and conversations', parameters: [{ name: 'mediaId', type: 'string' as const, required: true, description: 'Media ID' }, { name: 'maxComments', type: 'number' as const, required: false, description: 'Max comments' }], source: 'instagram-mcp-server', version: '1.0.0', category: 'social' },
      { name: 'instagram-get-metrics', type: 'mcp' as const, description: 'Get engagement metrics for a post', usage: 'Use to track post performance', parameters: [{ name: 'mediaId', type: 'string' as const, required: true, description: 'Media ID' }], source: 'instagram-mcp-server', version: '1.0.0', category: 'social' },
      { name: 'instagram-search-hashtag', type: 'mcp' as const, description: 'Search recent posts by hashtag', usage: 'Use for hashtag research and monitoring', parameters: [{ name: 'hashtag', type: 'string' as const, required: true, description: 'Hashtag without #' }, { name: 'limit', type: 'number' as const, required: false, description: 'Max results' }], source: 'instagram-mcp-server', version: '1.0.0', category: 'social' },
      { name: 'instagram-get-profile', type: 'mcp' as const, description: 'Get Instagram business profile info', usage: 'Use to get account details and follower count', parameters: [], source: 'instagram-mcp-server', version: '1.0.0', category: 'social' },
      { name: 'instagram-analyze-url', type: 'mcp' as const, description: 'Analyze Instagram post from full URL', usage: 'Use when you have an Instagram URL to analyze', parameters: [{ name: 'url', type: 'string' as const, required: true, description: 'Full Instagram post/reel URL' }], source: 'instagram-mcp-server', version: '1.0.0', category: 'social' },
    ];
    this.registerMany(instagramTools);

    // Agent Browser Tools
    const browserTools = [
      { name: 'browser-navigate', type: 'mcp' as const, description: 'Navigate headless browser to a URL', usage: 'Use to load web pages for scraping or testing', parameters: [{ name: 'url', type: 'string' as const, required: true, description: 'Full URL' }], source: 'agent-browser', version: '0.27.0', category: 'browser' },
      { name: 'browser-click', type: 'mcp' as const, description: 'Click element by CSS selector', usage: 'Use to interact with page elements', parameters: [{ name: 'selector', type: 'string' as const, required: true, description: 'CSS selector' }], source: 'agent-browser', version: '0.27.0', category: 'browser' },
      { name: 'browser-type', type: 'mcp' as const, description: 'Type text into input field', usage: 'Use for form filling', parameters: [{ name: 'selector', type: 'string' as const, required: true, description: 'CSS selector' }, { name: 'text', type: 'string' as const, required: true, description: 'Text to type' }], source: 'agent-browser', version: '0.27.0', category: 'browser' },
      { name: 'browser-extract', type: 'mcp' as const, description: 'Extract text from page or element', usage: 'Use to scrape content', parameters: [{ name: 'selector', type: 'string' as const, required: false, description: 'Optional CSS selector' }], source: 'agent-browser', version: '0.27.0', category: 'browser' },
      { name: 'browser-screenshot', type: 'mcp' as const, description: 'Take page screenshot', usage: 'Use to capture visual page state', parameters: [{ name: 'fullPage', type: 'boolean' as const, required: false, description: 'Full page or viewport' }], source: 'agent-browser', version: '0.27.0', category: 'browser' },
      { name: 'browser-session-start', type: 'mcp' as const, description: 'Start a new browser session', usage: 'Use before any browser interaction', parameters: [], source: 'agent-browser', version: '0.27.0', category: 'browser' },
      { name: 'browser-session-end', type: 'mcp' as const, description: 'End current browser session', usage: 'Use to clean up browser resources', parameters: [], source: 'agent-browser', version: '0.27.0', category: 'browser' },
      { name: 'browser-doctor', type: 'mcp' as const, description: 'Verify agent-browser installation', usage: 'Use to check if agent-browser is working', parameters: [], source: 'agent-browser', version: '0.27.0', category: 'browser' },
    ];
    this.registerMany(browserTools);
  }

  registerDefaults(): void {
    // Load ALL tools from the master tools-index, mapping ToolEntry → ToolDefinition
    const mappedTools: ToolDefinition[] = ALL_TOOLS.map(t => ({
      name: t.name,
      type: t.type as ToolDefinition['type'],
      description: t.description,
      usage: t.usage,
      parameters: [],
      source: t.source,
      version: t.version,
      category: t.category,
      docsUrl: t.docsUrl,
    }));
    this.registerMany(mappedTools);
    console.log(`[ToolRegistry] Loaded ${mappedTools.length} tools from master index`);

    // Log stats
    const stats = this.getStats();
    console.log(`[ToolRegistry] ${stats.total} total: ${stats.byType.mcp} MCPs, ${stats.byType.skill} skills, ${stats.byType.cli} CLIs, ${stats.byType.plugin} plugins`);
  }

  getAgentTools(agentType: string): ToolDefinition[] {
    const names = AGENT_TOOL_MAP[agentType] || AGENT_TOOL_MAP['all'] || [];
    return names.map(name => this.get(name)).filter(Boolean) as ToolDefinition[];
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
