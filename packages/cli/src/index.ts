#!/usr/bin/env node
import { Command } from 'commander';
import { startChat } from './commands/chat.js';
import { runAgent } from './commands/agent.js';
import { manageTools } from './commands/tools.js';
import { manageWorkflows } from './commands/workflow.js';
import { manageSession } from './commands/session.js';
import { runAuto } from './commands/auto.js';

const program = new Command();

program
  .name('bllm')
  .description('Browser LLM Harness CLI — OpenCode-compatible agent platform')
  .version('0.1.0');

program
  .command('chat')
  .description('Start an interactive chat session')
  .option('-a, --agent <id>', 'Agent to chat with', 'personal')
  .option('-s, --session <id>', 'Resume a session')
  .action(startChat);

program
  .command('run')
  .description('Run a task through an agent')
  .argument('<prompt>', 'The task to execute')
  .option('-a, --agent <id>', 'Agent to use', 'auto')
  .option('--loop [n]', 'Run in loop mode N times')
  .action(runAgent);

program
  .command('auto')
  .description('Auto mode — give one prompt, everything happens automatically')
  .argument('<prompt>', 'The high-level task description')
  .option('--retries <n>', 'Number of retries on failure', '3')
  .action(runAuto);

program
  .command('tools')
  .description('Manage the tool registry')
  .option('-l, --list', 'List all registered tools')
  .option('-s, --search <query>', 'Search tools')
  .option('-d, --discover', 'Run web discovery for new tools')
  .option('-r, --run <name>', 'Run a specific tool')
  .action(manageTools);

program
  .command('workflow')
  .description('Manage workflows')
  .option('-l, --list', 'List workflows')
  .option('-r, --run <id>', 'Execute a workflow')
  .option('--analyze', 'Have the Master Agent analyze workflows')
  .action(manageWorkflows);

program
  .command('session')
  .description('Session management')
  .option('-l, --list', 'List recent sessions')
  .option('-s, --show <id>', 'Show session details')
  .option('--stats', 'Show session statistics')
  .action(manageSession);

program.parse(process.argv);
