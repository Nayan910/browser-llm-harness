import { createInterface } from 'readline';

export async function startChat(options: { agent: string; session?: string }) {
  console.log(`\n🤖 Browser LLM Harness — Chat Mode`);
  console.log(`   Agent: ${options.agent}`);
  if (options.session) console.log(`   Session: ${options.session}`);
  console.log(`   Type 'exit' to quit, '/help' for commands\n`);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question(`[${options.agent}] > `, async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }
      if (input.startsWith('/')) {
        handleCommand(input);
        ask();
        return;
      }
      console.log(`\n[${options.agent}] Processing...`);
      console.log(`[${options.agent}] Response: Simulated response for: "${input.slice(0, 60)}..."\n`);
      ask();
    });
  };

  ask();
}

function handleCommand(cmd: string) {
  switch (cmd.toLowerCase()) {
    case '/help':
      console.log('\nCommands: /help, /agents, /tools, /clear, /exit\n');
      break;
    case '/agents':
      console.log('\nAvailable Agents: coordinator, personal, discovery, auto, workflow-master\n');
      break;
    case '/tools':
      console.log('\nTools: github, web-search, file-read, file-write, git, npm, docker\n');
      break;
    case '/clear':
      console.clear();
      break;
    default:
      console.log(`Unknown command: ${cmd}`);
  }
}
