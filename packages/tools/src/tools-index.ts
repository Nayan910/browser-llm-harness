/**
 * TOOLS INDEX — Master Knowledge Base
 * 
 * This is THE definitive registry of all tools, MCPs, skills, 
 * CLI tools, plugins, hooks, and LSPs available in the system.
 * 
 * ALL agents (folder manager, coordinator, auto-loop, personal, 
 * workflow master) MUST import this to know what tools exist
 * and when/how to use them.
 */

export interface ToolEntry {
  name: string;
  type: 'mcp' | 'cli' | 'skill' | 'plugin' | 'hook' | 'lsp' | 'api' | 'sdk' | 'framework';
  description: string;
  usage: string;
  category: string;
  installs?: string;
  source: string;
  version: string;
  installCmd?: string;
  docsUrl?: string;
  relatedTools?: string[];
  whenToUse: string;
  whenNotToUse: string;
}

// ============================================================
// MCP SERVERS (26)
// ============================================================
export const MCP_SERVERS: ToolEntry[] = [
  { name: 'mcp-filesystem', type: 'mcp', description: 'Read/write/list/delete files on local filesystem', usage: 'npx @modelcontextprotocol/server-filesystem <path>', category: 'filesystem', source: 'modelcontextprotocol', version: '1.0', installCmd: 'npm i @modelcontextprotocol/server-filesystem', whenToUse: 'Any file operation the agent needs to do', whenNotToUse: 'When you have native file tools' },
  { name: 'mcp-github', type: 'mcp', description: 'GitHub API: repos, issues, PRs, commits, search', usage: 'npx @modelcontextprotocol/server-github', category: 'git', source: 'modelcontextprotocol', version: '1.0', installCmd: 'npm i @modelcontextprotocol/server-github', whenToUse: 'Any GitHub operation', whenNotToUse: 'Simple git operations best done via CLI' },
  { name: 'mcp-memory', type: 'mcp', description: 'Persistent knowledge graph with entities and relations', usage: 'npx @modelcontextprotocol/server-memory', category: 'memory', source: 'modelcontextprotocol', version: '1.0', installCmd: 'npm i @modelcontextprotocol/server-memory', whenToUse: 'Cross-session memory, user preferences', whenNotToUse: 'When using built-in Hermes memory' },
  { name: 'mcp-brave-search', type: 'mcp', description: 'Web and local search via Brave Search API', usage: 'npx @anthropic/server-brave-search', category: 'search', source: 'anthropic', version: '1.0', whenToUse: 'Need real-time web search results', whenNotToUse: 'Simple knowledge queries' },
  { name: 'mcp-tavily', type: 'mcp', description: 'AI-optimized web search (Tavily API)', usage: 'npx tavily-mcp@latest', category: 'search', source: 'tavily', version: 'latest', installCmd: 'npx tavily-mcp@latest --env TAVILY_API_KEY=xxx', whenToUse: 'Deep web research for agents', whenNotToUse: 'Simple lookups' },
  { name: 'mcp-context7', type: 'mcp', description: 'LLM-optimized library docs (Context7)', usage: 'npx @upstash/context7-mcp', category: 'docs', source: 'upstash', version: 'latest', whenToUse: 'Need up-to-date library docs', whenNotToUse: 'General programming knowledge' },
  { name: 'mcp-sequential-thinking', type: 'mcp', description: 'Structured step-by-step reasoning', usage: 'npx @anthropic/server-sequential-thinking', category: 'reasoning', source: 'anthropic', version: '1.0', whenToUse: 'Complex multi-step problems', whenNotToUse: 'Simple tasks' },
  { name: 'mcp-puppeteer', type: 'mcp', description: 'Browser automation via Puppeteer', usage: 'npx @anthropic/server-puppeteer', category: 'browser', source: 'anthropic', version: '1.0', whenToUse: 'Web scraping, screenshots, form filling', whenNotToUse: 'Simple HTTP requests' },
  { name: 'mcp-playwright', type: 'mcp', description: 'Browser automation via Playwright', usage: 'npx @playwright/mcp-server', category: 'browser', source: 'microsoft', version: 'latest', whenToUse: 'Cross-browser testing', whenNotToUse: 'Simple page loads' },
  { name: 'mcp-notion', type: 'mcp', description: 'Notion workspace: pages, databases, blocks', usage: 'npx notion-mcp-server', category: 'productivity', source: 'community', version: '1.0', whenToUse: 'Notion document management', whenNotToUse: 'When Notion API quota is exhausted' },
  { name: 'mcp-slack', type: 'mcp', description: 'Slack workspace: channels, messages, users', usage: 'npx slack-mcp-server', category: 'communication', source: 'community', version: '1.0', whenToUse: 'Slack messaging, channel management', whenNotToUse: 'Real-time events (use webhooks)' },
  { name: 'mcp-discord', type: 'mcp', description: 'Discord: guilds, channels, messages, bots', usage: 'npx discord-mcp-server', category: 'communication', source: 'community', version: '1.0', whenToUse: 'Discord bot automation', whenNotToUse: 'High-traffic guild monitoring' },
  { name: 'mcp-twitter', type: 'mcp', description: 'Twitter/X API: tweets, users, search', usage: 'npx twitter-mcp-server', category: 'social', source: 'community', version: '1.0', whenToUse: 'Twitter posting, search, analytics', whenNotToUse: 'When rate limited by Twitter' },
  { name: 'mcp-instagram', type: 'mcp', description: 'Instagram Graph API: media, comments, metrics, hashtags', usage: 'instagram-mcp start', category: 'social', source: '@browser-llm/instagram-mcp', version: '1.0', whenToUse: 'Instagram business account management', whenNotToUse: 'Personal Instagram accounts' },
  { name: 'mcp-gmail', type: 'mcp', description: 'Gmail: read, search, send, labels', usage: 'gmail-mcp-server', category: 'email', source: 'community', version: '1.0', whenToUse: 'Email automation and search', whenNotToUse: 'Sending bulk emails' },
  { name: 'mcp-google-calendar', type: 'mcp', description: 'Google Calendar: events, scheduling, availability', usage: 'google-calendar-mcp-server', category: 'calendar', source: 'community', version: '1.0', whenToUse: 'Schedule management', whenNotToUse: 'Complex recurring events' },
  { name: 'mcp-google-drive', type: 'mcp', description: 'Google Drive: files, folders, sharing', usage: 'google-drive-mcp-server', category: 'filesystem', source: 'community', version: '1.0', whenToUse: 'Cloud file management', whenNotToUse: 'Large file transfers' },
  { name: 'mcp-postgres', type: 'mcp', description: 'PostgreSQL: query, schema, migrations', usage: 'npx postgres-mcp-server', category: 'database', source: 'community', version: '1.0', whenToUse: 'Database operations', whenNotToUse: 'Production schema changes' },
  { name: 'mcp-sqlite', type: 'mcp', description: 'SQLite: local database operations', usage: 'npx sqlite-mcp-server', category: 'database', source: 'community', version: '1.0', whenToUse: 'Local DB prototyping', whenNotToUse: 'High-concurrency writes' },
  { name: 'mcp-redis', type: 'mcp', description: 'Redis: cache, pub/sub, data structures', usage: 'npx redis-mcp-server', category: 'cache', source: 'community', version: '1.0', whenToUse: 'Caching, pub/sub', whenNotToUse: 'When Redis is not available' },
  { name: 'mcp-docker', type: 'mcp', description: 'Docker: containers, images, volumes, networks', usage: 'npx docker-mcp-server', category: 'devops', source: 'community', version: '1.0', whenToUse: 'Container management', whenNotToUse: 'Production orchestration' },
  { name: 'mcp-kubernetes', type: 'mcp', description: 'Kubernetes: pods, services, deployments', usage: 'npx kubernetes-mcp-server', category: 'devops', source: 'community', version: '1.0', whenToUse: 'K8s cluster management', whenNotToUse: 'Simple Docker tasks' },
  { name: 'mcp-task-master', type: 'mcp', description: 'Project management: tasks, milestones, boards', usage: 'npx task-master-ai', category: 'project-management', source: 'community', version: 'latest', whenToUse: 'Task tracking in projects', whenNotToUse: 'Simple todo lists' },
  { name: 'mcp-hermes-memory', type: 'mcp', description: 'FTS5 search across sessions, skills, memories', usage: 'hermes-memory-mcp', category: 'memory', source: '@browser-llm/hermes', version: '1.0', whenToUse: 'Recall past learnings', whenNotToUse: 'Real-time search (use SQLite FTS directly)' },
  { name: 'mcp-mother-ship', type: 'mcp', description: 'Agent ecosystem navigation and session logging', usage: 'mother-ship-mcp', category: 'agent-management', source: '@browser-llm/mother-ship', version: '1.0', whenToUse: 'Find agents, log sessions', whenNotToUse: 'For non-agent tasks' },
  { name: 'mcp-agent-browser', type: 'mcp', description: 'agent-browser v0.27: headless Chromium for scraping, screenshots, form filling', usage: 'agent-browser --headless', category: 'browser', source: 'vercel-labs/agent-browser', version: '0.27', installCmd: 'npx skills add vercel-labs/agent-browser', whenToUse: 'Web automation and scraping', whenNotToUse: 'Simple content fetch (use webfetch)' },
];

// ============================================================
// POPULAR SKILLS (from skills.sh leaderboard)
// ============================================================
export const SKILLS: ToolEntry[] = [
  { name: 'find-skills', type: 'skill', description: 'Discover and install skills from ecosystem', usage: 'npx skills find <query>; npx skills add <package>', category: 'meta', installs: '2.1M', source: 'vercel-labs/skills', version: 'latest', whenToUse: 'Need to extend agent capabilities', whenNotToUse: 'When you know exactly what you need' },
  { name: 'frontend-design', type: 'skill', description: 'Production-grade frontend design patterns and best practices', usage: 'Automatically loaded for UI tasks', category: 'design', installs: '571K', source: 'anthropics/skills', version: 'latest', whenToUse: 'Building web UIs', whenNotToUse: 'Backend or CLI tasks' },
  { name: 'vercel-react-best-practices', type: 'skill', description: 'React and Next.js performance optimization', usage: 'Automatically loaded for React tasks', category: 'frontend', installs: '491K', source: 'vercel-labs/agent-skills', version: 'latest', whenToUse: 'React/Next.js development', whenNotToUse: 'Non-React projects' },
  { name: 'agent-browser', type: 'skill', description: 'Headless browser automation with agent-browser', usage: 'npx skills add vercel-labs/agent-browser', category: 'browser', installs: '468K', source: 'vercel-labs/agent-browser', version: '0.27', whenToUse: 'Web automation and scraping', whenNotToUse: 'Simple API calls' },
  { name: 'grill-me', type: 'skill', description: 'Rigorous code review that challenges every decision', usage: '@grill-me review this code', category: 'review', installs: '357K', source: 'mattpocock/skills', version: 'latest', whenToUse: 'Before merging critical code', whenNotToUse: 'Quick fixes' },
  { name: 'improve-codebase-architecture', type: 'skill', description: 'Structural refactoring suggestions', usage: '@improve-codebase-architecture', category: 'architecture', installs: '293K', source: 'mattpocock/skills', version: 'latest', whenToUse: 'Architecture review', whenNotToUse: 'Minor changes' },
  { name: 'skill-creator', type: 'skill', description: 'Guide for creating effective skills', usage: '@skill-creator', category: 'meta', installs: '279K', source: 'anthropics/skills', version: 'latest', whenToUse: 'Creating new skills', whenNotToUse: 'Using existing skills' },
  { name: 'tdd', type: 'skill', description: 'Test-Driven Development workflow', usage: '@tdd implement feature X', category: 'testing', installs: '276K', source: 'mattpocock/skills', version: 'latest', whenToUse: 'New feature development', whenNotToUse: 'Quick bug fixes' },
  { name: 'brainstorming', type: 'skill', description: 'Structured brainstorming before implementation', usage: 'Load before any creative work', category: 'process', installs: '234K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Before any creative/design work', whenNotToUse: 'Simple copy-paste tasks' },
  { name: 'ui-ux-pro-max', type: 'skill', description: '67 UI styles, 161 palettes, design intelligence', usage: '@ui-ux-pro-max design a landing page', category: 'design', installs: '227K', source: 'nextlevelbuilder', version: 'latest', whenToUse: 'UI/UX design tasks', whenNotToUse: 'Backend/CLI work' },
  { name: 'supabase-postgres-best-practices', type: 'skill', description: 'Supabase/PostgreSQL optimization', usage: '@supabase-postgres-best-practices', category: 'database', installs: '243K', source: 'supabase/agent-skills', version: 'latest', whenToUse: 'Supabase/PostgreSQL projects', whenNotToUse: 'Other databases' },
  { name: 'systematic-debugging', type: 'skill', description: 'RED→GREEN→REFACTOR debug workflow', usage: 'Load when encountering any bug', category: 'debugging', installs: '152K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Any bug or unexpected behavior', whenNotToUse: 'Feature requests' },
  { name: 'pptx', type: 'skill', description: 'Create and edit PowerPoint presentations', usage: '@pptx create presentation', category: 'office', installs: '152K', source: 'anthropics/skills', version: 'latest', whenToUse: 'Creating presentations', whenNotToUse: 'Non-PPTX formats' },
  { name: 'writing-plans', type: 'skill', description: 'Multi-step implementation planning', usage: 'Use before touching code for multi-step tasks', category: 'process', installs: '151K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Multi-step features', whenNotToUse: 'Single file changes' },
  { name: 'executing-plans', type: 'skill', description: 'Execute written plans with review checkpoints', usage: 'Use after writing-plans', category: 'process', installs: '124K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Following a written plan', whenNotToUse: 'Exploratory work' },
  { name: 'requesting-code-review', type: 'skill', description: 'Formal code review request workflow', usage: 'Use when completing tasks before merging', category: 'review', installs: '136K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Before merging or claiming completion', whenNotToUse: 'Draft/WIP code' },
  { name: 'subagent-driven-development', type: 'skill', description: 'Execute plans with parallel subagents', usage: 'Use for independent parallel tasks', category: 'process', installs: '117K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Parallelizable tasks', whenNotToUse: 'Sequential dependencies' },
  { name: 'verification-before-completion', type: 'skill', description: 'Verify work before claiming it done', usage: 'Use before claiming work is complete', category: 'process', installs: '116K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Every completion claim', whenNotToUse: 'Never skip this' },
  { name: 'test-driven-development', type: 'skill', description: 'Full TDD cycle: RED→GREEN→REFACTOR', usage: 'Use before writing implementation code', category: 'testing', installs: '135K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Feature implementation', whenNotToUse: 'Documentation/README' },
  { name: 'dispatching-parallel-agents', type: 'skill', description: 'Dispatch 2+ independent tasks to parallel agents', usage: 'Use for independent parallel work', category: 'process', installs: '108K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Multiple independent tasks', whenNotToUse: 'Sequential work' },
  { name: 'using-git-worktrees', type: 'skill', description: 'Isolated git worktrees for feature development', usage: 'Use for isolated feature branches', category: 'git', installs: '108K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Feature isolation needed', whenNotToUse: 'Simple branches' },
  { name: 'finishing-a-development-branch', type: 'skill', description: 'Merge, PR, or cleanup after feature completion', usage: 'Use when implementation is done', category: 'git', installs: '106K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Feature completion', whenNotToUse: 'Mid-development' },
  { name: 'receiving-code-review', type: 'skill', description: 'Process and respond to code review feedback', usage: 'Use when receiving review feedback', category: 'review', installs: '111K', source: 'obra/superpowers', version: 'latest', whenToUse: 'After receiving review', whenNotToUse: 'Self-review' },
  { name: 'writing-skills', type: 'skill', description: 'Create and edit skills within the ecosystem', usage: 'Use when creating new skills', category: 'meta', installs: '110K', source: 'obra/superpowers', version: 'latest', whenToUse: 'Skill creation', whenNotToUse: 'Skill usage' },
  { name: 'seo-audit', type: 'skill', description: 'SEO analysis and optimization', usage: '@seo-audit analyze page', category: 'marketing', installs: '142K', source: 'coreyhaines31/marketingskills', version: 'latest', whenToUse: 'SEO optimization', whenNotToUse: 'Non-web content' },
  { name: 'just-scrape', type: 'skill', description: 'Web scraping made simple', usage: '@just-scrape url', category: 'web', installs: '211K', source: 'scrapegraphai/just-scrape', version: 'latest', whenToUse: 'Web data extraction', whenNotToUse: 'API-available data' },
  { name: 'ppt-creator', type: 'skill', description: 'NotebookLM-style presentation generation', usage: 'Create presentation from document', category: 'office', installs: '100K', source: 'community', version: 'latest', whenToUse: 'Presentations from content', whenNotToUse: 'Simple text documents' },
  { name: 'instagram-analysis', type: 'skill', description: 'Analyze Instagram posts, reels, profiles', usage: 'python scripts/instagram-analyze.py <url>', category: 'social', source: '@browser-llm/skills', version: '1.0', whenToUse: 'Instagram content analysis', whenNotToUse: 'Private accounts' },
];

// ============================================================
// CLI TOOLS
// ============================================================
export const CLI_TOOLS: ToolEntry[] = [
  { name: 'agent-browser', type: 'cli', description: 'Headless Chromium browser for agents v0.27', usage: 'agent-browser navigate <url>', category: 'browser', source: 'vercel-labs', version: '0.27', installCmd: 'npm i -g agent-browser', whenToUse: 'Web automation', whenNotToUse: 'Simple fetch' },
  { name: 'npx-skills', type: 'cli', description: 'Agent skills package manager', usage: 'npx skills find/add/check', category: 'meta', source: 'skills.sh', version: 'latest', whenToUse: 'Managing skills', whenNotToUse: 'Running skills (use the skill instead)' },
  { name: 'paseo', type: 'cli', description: 'Agent ecosystem manager: worktrees, loops, committees', usage: 'paseo loop run "<prompt>"', category: 'agent-management', source: 'paseo-cli', version: 'latest', whenToUse: 'Running agent loops', whenNotToUse: 'Simple single-agent tasks' },
  { name: 'opencode', type: 'cli', description: 'Open-source terminal AI with local model support', usage: 'opencode "prompt"', category: 'ai-cli', source: 'opencode-ai', version: 'latest', whenToUse: 'Terminal AI tasks', whenNotToUse: 'Browser-based interactions' },
  { name: 'gh', type: 'cli', description: 'GitHub CLI: issues, PRs, repos, workflows', usage: 'gh pr create; gh issue list', category: 'git', source: 'github', version: 'latest', whenToUse: 'GitHub operations', whenNotToUse: 'Non-GitHub repos' },
  { name: 'n8n', type: 'cli', description: 'Visual workflow automation platform', usage: 'n8n start; n8n import-workflow', category: 'automation', source: 'n8n', version: 'latest', whenToUse: 'Building automation workflows', whenNotToUse: 'Simple scripting' },
  { name: 'instaloader', type: 'cli', description: 'Instagram scraping and analysis', usage: 'instaloader <profile>', category: 'social', source: 'instaloader', version: 'latest', installCmd: 'pip install instaloader', whenToUse: 'Instagram data extraction', whenNotToUse: 'When Instagram MCP is available' },
];

// ============================================================
// SDKs & FRAMEWORKS
// ============================================================
export const SDKS_FRAMEWORKS: ToolEntry[] = [
  { name: 'vercel-ai-sdk', type: 'sdk', description: 'AI SDK for TypeScript: streaming, agents, tools', usage: 'import { generateText } from "ai"', category: 'ai', source: 'vercel', version: 'latest', whenToUse: 'Building AI applications in TypeScript', whenNotToUse: 'Python AI projects' },
  { name: 'langchain', type: 'framework', description: 'LLM application framework: chains, agents, RAG', usage: 'npm i langchain', category: 'ai', source: 'langchain', version: 'latest', whenToUse: 'Complex LLM pipelines', whenNotToUse: 'Simple LLM calls' },
  { name: 'crewai', type: 'framework', description: 'Multi-agent orchestration framework', usage: 'pip install crewai', category: 'ai', source: 'crewai', version: 'latest', whenToUse: 'Multi-agent systems', whenNotToUse: 'Single-agent tasks' },
  { name: 'autogen', type: 'framework', description: 'Microsoft multi-agent conversation framework', usage: 'pip install autogen', category: 'ai', source: 'microsoft', version: 'latest', whenToUse: 'Multi-agent conversations', whenNotToUse: 'Simple chat' },
  { name: 'nextjs', type: 'framework', description: 'React framework with App Router, SSR, API routes', usage: 'npx create-next-app@latest', category: 'frontend', source: 'vercel', version: '15', whenToUse: 'Building web applications', whenNotToUse: 'CLI tools or mobile apps' },
  { name: 'react-flow', type: 'sdk', description: 'React library for node-based UIs (workflow editors)', usage: 'npm i reactflow', category: 'frontend', source: 'xyflow', version: 'latest', whenToUse: 'Building visual workflow editors', whenNotToUse: 'Standard forms' },
  { name: 'shadcn-ui', type: 'sdk', description: 'Beautiful UI components for React', usage: 'npx shadcn-ui@latest add', category: 'frontend', source: 'shadcn', version: 'latest', whenToUse: 'Building React UIs', whenNotToUse: 'Vanilla HTML/CSS' },
  { name: 'drizzle-orm', type: 'sdk', description: 'TypeScript ORM with SQL-like API', usage: 'npm i drizzle-orm', category: 'database', source: 'drizzle-team', version: 'latest', whenToUse: 'TypeScript DB operations', whenNotToUse: 'Python projects' },
  { name: 'zustand', type: 'sdk', description: 'Lightweight React state management', usage: 'npm i zustand', category: 'state', source: 'pmndrs', version: 'latest', whenToUse: 'React state management', whenNotToUse: 'Server-side state' },
  { name: 'commander', type: 'sdk', description: 'Node.js CLI framework', usage: 'npm i commander', category: 'cli', source: 'tj', version: 'latest', whenToUse: 'Building CLIs', whenNotToUse: 'GUI apps' },
];

// ============================================================
// LSPs
// ============================================================
export const LSPS: ToolEntry[] = [
  { name: 'typescript-lsp', type: 'lsp', description: 'TypeScript/JavaScript language server', usage: 'npm i -g typescript-language-server', category: 'language', source: 'microsoft', version: 'latest', whenToUse: 'TypeScript/JS development', whenNotToUse: 'Other languages' },
  { name: 'pyright', type: 'lsp', description: 'Fast Python type checker and LSP', usage: 'pip install pyright', category: 'language', source: 'microsoft', version: 'latest', whenToUse: 'Python development', whenNotToUse: 'TypeScript development' },
  { name: 'rust-analyzer', type: 'lsp', description: 'Rust language server', usage: 'rustup component add rust-analyzer', category: 'language', source: 'rust-lang', version: 'latest', whenToUse: 'Rust development', whenNotToUse: 'Other languages' },
  { name: 'eslint-lsp', type: 'lsp', description: 'ESLint language server for linting', usage: 'npm i -g eslint', category: 'linter', source: 'eslint', version: 'latest', whenToUse: 'JS/TS linting', whenNotToUse: 'Non-JS projects' },
  { name: 'prettier-lsp', type: 'lsp', description: 'Prettier formatter LSP', usage: 'npm i -g prettier', category: 'formatter', source: 'prettier', version: 'latest', whenToUse: 'Code formatting', whenNotToUse: 'When ESLint formatting is sufficient' },
];

// ============================================================
// ALL TOOLS COMBINED
// ============================================================
export const ALL_TOOLS: ToolEntry[] = [
  ...MCP_SERVERS,
  ...SKILLS,
  ...CLI_TOOLS,
  ...SDKS_FRAMEWORKS,
  ...LSPS,
];

// ============================================================
// CATEGORY MAPPING (which tools to use for what)
// ============================================================
export const CATEGORY_MAP: Record<string, string[]> = {
  'filesystem': ['mcp-filesystem', 'mcp-google-drive'],
  'git': ['mcp-github', 'gh', 'using-git-worktrees', 'finishing-a-development-branch'],
  'search': ['mcp-brave-search', 'mcp-tavily'],
  'browser': ['mcp-puppeteer', 'mcp-playwright', 'mcp-agent-browser', 'agent-browser', 'just-scrape'],
  'social': ['mcp-twitter', 'mcp-instagram', 'instagram-analysis', 'instaloader'],
  'communication': ['mcp-slack', 'mcp-discord'],
  'email': ['mcp-gmail'],
  'calendar': ['mcp-google-calendar'],
  'database': ['mcp-postgres', 'mcp-sqlite', 'supabase-postgres-best-practices', 'drizzle-orm'],
  'devops': ['mcp-docker', 'mcp-kubernetes'],
  'design': ['frontend-design', 'ui-ux-pro-max', 'shadcn-ui'],
  'review': ['grill-me', 'requesting-code-review', 'receiving-code-review'],
  'testing': ['tdd', 'test-driven-development', 'verification-before-completion'],
  'process': ['brainstorming', 'writing-plans', 'executing-plans', 'dispatching-parallel-agents', 'subagent-driven-development'],
  'memory': ['mcp-memory', 'mcp-hermes-memory'],
  'agent-management': ['mcp-mother-ship', 'paseo', 'opencode'],
  'debugging': ['systematic-debugging'],
  'meta': ['find-skills', 'skill-creator', 'writing-skills', 'npx-skills'],
  'office': ['pptx', 'ppt-creator'],
  'marketing': ['seo-audit'],
  'ai': ['vercel-ai-sdk', 'langchain', 'crewai', 'autogen'],
  'frontend': ['vercel-react-best-practices', 'nextjs', 'react-flow', 'shadcn-ui', 'zustand'],
  'state': ['zustand'],
};

// ============================================================
// AGENT TOOL ASSIGNMENTS (which tools each agent type knows about)
// ============================================================
export const AGENT_TOOL_MAP: Record<string, string[]> = {
  'folder-manager': ['mcp-filesystem', 'mcp-google-drive', 'using-git-worktrees'],
  'coordinator': ['mcp-mother-ship', 'mcp-memory', 'mcp-hermes-memory', 'mcp-sequential-thinking'],
  'auto-orchestrator': ['brainstorming', 'writing-plans', 'executing-plans', 'dispatching-parallel-agents', 'subagent-driven-development'],
  'personal-agent': ['mcp-gmail', 'mcp-google-calendar', 'mcp-filesystem', 'mcp-github', 'gh'],
  'workflow-master': ['n8n', 'task-master', 'verification-before-completion'],
  'web-discovery': ['mcp-brave-search', 'mcp-tavily', 'find-skills', 'just-scrape', 'agent-browser'],
  'code-review': ['grill-me', 'requesting-code-review', 'receiving-code-review'],
  'debugger': ['systematic-debugging'],
  'tester': ['tdd', 'test-driven-development', 'verification-before-completion'],
  'designer': ['frontend-design', 'ui-ux-pro-max', 'shadcn-ui'],
  'frontend-dev': ['vercel-react-best-practices', 'nextjs', 'react-flow', 'zustand'],
  'backend-dev': ['drizzle-orm', 'mcp-postgres', 'mcp-sqlite', 'supabase-postgres-best-practices'],
  'devops': ['mcp-docker', 'mcp-kubernetes'],
  'social-manager': ['mcp-twitter', 'mcp-instagram', 'instagram-analysis'],
  'all': ALL_TOOLS.map(t => t.name),
};

// Utility functions
export function getToolsByCategory(cat: string): ToolEntry[] {
  const names = CATEGORY_MAP[cat] || [];
  return ALL_TOOLS.filter(t => names.includes(t.name));
}

export function getToolsByType(type: string): ToolEntry[] {
  return ALL_TOOLS.filter(t => t.type === type);
}

export function getAgentTools(agentType: string): ToolEntry[] {
  const names = AGENT_TOOL_MAP[agentType] || AGENT_TOOL_MAP['all'] || [];
  return ALL_TOOLS.filter(t => names.includes(t.name));
}

export function searchTools(query: string): ToolEntry[] {
  const q = query.toLowerCase();
  return ALL_TOOLS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.whenToUse.toLowerCase().includes(q)
  );
}

export function getToolStats() {
  return {
    total: ALL_TOOLS.length,
    mcp: MCP_SERVERS.length,
    skills: SKILLS.length,
    cli: CLI_TOOLS.length,
    sdks: SDKS_FRAMEWORKS.length,
    lsps: LSPS.length,
    categories: Object.keys(CATEGORY_MAP).length,
    agentTypes: Object.keys(AGENT_TOOL_MAP).length,
  };
}