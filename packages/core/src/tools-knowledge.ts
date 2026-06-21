/**
 * TOOLS KNOWLEDGE — What each agent type knows
 * 
 * This file provides agent-specific tool knowledge.
 * Every agent type imports this to know:
 * 1. What tools are available to them
 * 2. When to use each tool
 * 3. Tool usage statistics
 */

export interface ToolKnowledge {
  agentType: string;
  categories: string[];
  primaryTools: string[];
  secondaryTools: string[];
  whenToUse: Record<string, string>;
}

export const AGENT_KNOWLEDGE: Record<string, ToolKnowledge> = {
  'folder-manager': {
    agentType: 'folder-manager',
    categories: ['filesystem', 'git', 'memory'],
    primaryTools: ['mcp-filesystem', 'mcp-github', 'gh'],
    secondaryTools: ['mcp-memory', 'using-git-worktrees', 'finishing-a-development-branch'],
    whenToUse: {
      'mcp-filesystem': 'For every file read/write/delete/list operation',
      'mcp-github': 'For GitHub API operations (issues, PRs, repos)',
      'gh': 'For quick GitHub CLI operations',
      'mcp-memory': 'For persisting folder state across sessions',
    },
  },
  'coordinator': {
    agentType: 'coordinator',
    categories: ['agent-management', 'memory', 'reasoning', 'search'],
    primaryTools: ['mcp-mother-ship', 'mcp-memory', 'mcp-hermes-memory', 'mcp-sequential-thinking'],
    secondaryTools: ['mcp-brave-search', 'mcp-tavily', 'mcp-filesystem'],
    whenToUse: {
      'mcp-mother-ship': 'To find agents, log sessions, navigate ecosystem',
      'mcp-memory': 'To maintain system-wide state graph',
      'mcp-hermes-memory': 'To search past sessions and learnings',
      'mcp-sequential-thinking': 'For complex multi-step coordination decisions',
    },
  },
  'auto-orchestrator': {
    agentType: 'auto-orchestrator',
    categories: ['process', 'search', 'debugging'],
    primaryTools: ['brainstorming', 'writing-plans', 'executing-plans'],
    secondaryTools: ['systematic-debugging', 'verification-before-completion', 'mcp-tavily'],
    whenToUse: {
      'brainstorming': 'Before ANY creative or design work',
      'writing-plans': 'For multi-step complex tasks',
      'executing-plans': 'After planning, before implementation',
      'verification-before-completion': 'Before claiming any task is done',
    },
  },
  'personal-agent': {
    agentType: 'personal-agent',
    categories: ['email', 'calendar', 'filesystem', 'git', 'search'],
    primaryTools: ['mcp-gmail', 'mcp-google-calendar', 'mcp-filesystem', 'mcp-github'],
    secondaryTools: ['gh', 'mcp-brave-search', 'opencode', 'paseo'],
    whenToUse: {
      'mcp-gmail': 'For email reading and drafting',
      'mcp-google-calendar': 'For schedule management',
      'mcp-filesystem': 'For file operations',
      'mcp-github': 'For repo management',
    },
  },
  'workflow-master': {
    agentType: 'workflow-master',
    categories: ['automation', 'process', 'review'],
    primaryTools: ['n8n', 'verification-before-completion'],
    secondaryTools: ['requesting-code-review', 'brainstorming', 'mcp-task-master'],
    whenToUse: {
      'n8n': 'For visual workflow creation and management',
      'verification-before-completion': 'Before finalizing any workflow',
    },
  },
  'web-discovery': {
    agentType: 'web-discovery',
    categories: ['search', 'browser', 'meta'],
    primaryTools: ['mcp-brave-search', 'mcp-tavily', 'agent-browser', 'just-scrape'],
    secondaryTools: ['find-skills', 'mcp-puppeteer', 'mcp-playwright'],
    whenToUse: {
      'mcp-tavily': 'For AI-optimized deep research',
      'agent-browser': 'For web scraping and page interaction',
      'find-skills': 'To discover new skills from ecosystem',
    },
  },
};

export function getAgentKnowledge(agentType: string): ToolKnowledge {
  return AGENT_KNOWLEDGE[agentType] || AGENT_KNOWLEDGE['folder-manager'];
}

export function getToolUsageGuidance(toolName: string): string {
  for (const knowledge of Object.values(AGENT_KNOWLEDGE)) {
    if (knowledge.whenToUse[toolName]) return knowledge.whenToUse[toolName];
  }
  return 'Use when appropriate for the task';
}