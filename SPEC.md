# Browser LLM Harness — The Ultimate Open-Source AI Agent Platform

> **Status: Alpha** — An OpenCode-like LLM harness that lives in your browser,
> with autonomous agent orchestration, folder-scoped AI agents, n8n-style
> workflow management, self-improvement, full system access, and more.

---

## Vision

A **browser-native, autonomous AI agent platform** where:

- Every folder has its own dedicated LLM agent that tracks what was created,
  who created it, and all traffic flowing through it.
- A **Central Coordinator LLM** communicates with all Folder Manager LLMs
  whenever anything changes, logging everything.
- All popular **tools** (MCPs, CLI tools, hooks, plugins, skills, LSPs) are
  indexed and known by every agent.
- A **Web Discovery Agent** constantly searches for new tools and integrates them.
- An **Auto Button** — give it one prompt, and it figures everything out
  autonomously.
- **Force-Tool Hooks** — user can force specific tools at session start/end.
- **Self-Update** — learns from user reactions, pushes updates.
- **Looping Simulator** — one agent pretends to be the user, looping through
  other agents N times.
- **n8n-Style Workflow Manager** — visual or programmatic workflow engine with a
  Master Agent overseeing it all.
- **Personal Agent** — your 24/7 copilot with full computer access.
- **Session Continuity** — every session knows what happened before.

---

## Architecture

```
browser-llm-harness/
├── packages/
│   ├── core/          # Agent runtime, folder agents, coordinator
│   ├── browser/       # React-based browser UI
│   ├── tools/         # Tool registry & web discovery
│   ├── workflows/     # n8n-style workflow engine
│   ├── memory/        # Cross-session memory & continuity
│   ├── agents/        # Agent definitions & catalog
│   ├── auto/          # Auto-orchestration engine
│   ├── hooks/         # Force-tool & session hooks
│   ├── self-update/   # Self-update & feedback learning
│   ├── personal/      # Personal assistant agent
│   ├── cli/           # CLI harness (OpenCode-compatible)
├── apps/
│   └── web/           # Next.js web application
```

---

## Components

### 1. Core Agent Runtime (`packages/core`)

The backbone — manages agent lifecycle, message routing, LLM connections.

**Folder Agents**: Each directory on the filesystem gets a spawned agent that
tracks:
- What files/artifacts were created in that folder and by which agent
- Traffic patterns — what data flows in and out
- Dependency graphs between files

**Central Coordinator**: A higher-level LLM that:
- Receives change events from Folder Agents
- Maintains a system-wide state graph
- Mediates between Folder Agents when conflicts arise

### 2. Tool Registry (`packages/tools`)

Every agent has full knowledge of every available tool:
- **Built-in**: MCP servers, CLI tools, shell commands, git, file ops
- **Plugins**: OpenCode plugins, custom agent skills
- **Web-Discovered**: The Discovery Agent scans GitHub, npm, PyPI, and tool
  directories daily for new MCPs, CLI tools, hooks, plugins, skills, LSPs

**Tool Schema**: Every tool is described by:
```json
{
  "name": "github-create-repo",
  "type": "mcp|cli|plugin|hook|skill|lsp",
  "description": "Creates a GitHub repository",
  "usage": "Use when...",
  "parameters": [...],
  "source": "github-mcp",
  "version": "1.0.0"
}
```

### 3. Auto-Orchestration Engine (`packages/auto`)

The **Auto Button**:
1. User provides a single high-level prompt
2. Engine breaks it into sub-tasks using a Planner Agent
3. Dispatches to the right agents sequentially or in parallel
4. Verifies each step
5. Reports results

### 4. Force-Tool & Session Hooks (`packages/hooks`)

**Force-Tool Mechanism**: Users can configure:
- `force-before-answer`: A tool that MUST run before every LLM response
- `force-after-answer`: A tool that MUST run after every LLM response  
- `force-session-start`: Runs at every session start
- `force-session-end`: Runs at every session end

Example:
```yaml
hooks:
  before-answer: ["memory-check", "context-load"]
  after-answer: ["self-review", "memory-save"]
  session-start: ["git-pull", "tool-update"]
  session-end: ["git-push", "backup"]
```

### 5. Self-Update System (`packages/self-update`)

- **Reaction Learning**: Analyzes user corrections, undo actions, and feedback
  to update prompts, tool choices, and agent behavior
- **Update Push**: Git-based update mechanism — pull updates from remote,
  auto-merge config changes
- **Behavior Evolution**: Over time, the system adapts to user preferences

### 6. Looping Simulator (`packages/core/loop`)

An agent that pretends to be a user, generating tasks for other agents:
```
Agent(SimulatedUser) → Agent(Planner) → Agent(Coder) → Agent(Reviewer) → Loop N times
```
Configurable: loop count, agent chain, task generation rules.

### 7. n8n-Style Workflow Manager (`packages/workflows`)

A full workflow engine:
- **Nodes**: Prompt, Response, Task, Tool, Agent, Condition, Loop, Branch
- **Edges**: Data flow between nodes
- **Master Agent**: A meta-agent that monitors all workflows, optimizes them,
  and suggests new ones
- **Triggers**: Manual, scheduled, event-based, webhook

### 8. Personal Agent (`packages/personal`)

A persistent agent the user talks to directly:
- Full CLI/system access (file ops, git, npm, docker, etc.)
- Can invoke any tool or agent on the user's behalf
- Maintains user preferences, style, common tasks
- Runs in background, always available

### 9. Session Continuity (`packages/memory`)

- Every session writes to a session graph
- On session start, loads context from last N sessions
- File-level granularity — knows what changed in each file
- Cross-session task tracking

### 10. Browser UI (`packages/browser`)

A full-featured web interface:
- Chat interface with multiple agent conversations
- Real-time agent activity visualization
- Workflow editor (graph-based, drag & drop)
- File explorer with agent annotations
- Settings & tool management dashboard

### 11. CLI Harness (`packages/cli`)

An OpenCode-compatible CLI:
- Supports all OpenCode plugins and MCPs
- Extends with custom commands
- WebSocket connection to browser UI

---

## Development Roadmap

### Phase 1 — Foundation (Current)
- [x] Project structure
- [ ] Core agent runtime
- [ ] Basic LLM integration (OpenAI, Anthropic, Ollama)
- [ ] Tool registry

### Phase 2 — Intelligence
- [ ] Folder agents & coordinator
- [ ] Web discovery agent
- [ ] Auto-orchestration engine

### Phase 3 — Autonomy
- [ ] Force-tool hooks
- [ ] Self-update system
- [ ] Looping simulator

### Phase 4 — Workflows
- [ ] n8n-style workflow engine
- [ ] Master agent
- [ ] Visual workflow editor

### Phase 5 — Complete System
- [ ] Personal agent
- [ ] Session continuity
- [ ] Browser UI with full visualization
- [ ] CLI harness

---

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Monorepo**: Turborepo
- **Web App**: Next.js 14+ (App Router)
- **Browser UI**: React 18+ with Tailwind CSS + Shadcn/ui
- **Workflows**: React Flow (for visual editor)
- **Memory**: SQLite (via better-sqlite3) + JSON files
- **CLI**: Commander.js + Ink (React-based CLI)
- **LLM SDK**: Vercel AI SDK (for multi-provider support)
- **State**: Zustand
- **Persistence**: Drizzle ORM

---

## License

MIT — Build freely.
