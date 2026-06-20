export async function runAgent(prompt: string, options: { agent: string; loop?: string }) {
  console.log(`\n🤖 Running agent: ${options.agent}`);
  console.log(`   Prompt: ${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}`);

  if (options.loop) {
    const iterations = parseInt(options.loop) || 3;
    console.log(`   Loop mode: ${iterations} iterations\n`);
    
    for (let i = 1; i <= iterations; i++) {
      console.log(`\n[Iteration ${i}/${iterations}]`);
      console.log(`[${options.agent}] Step ${i}: Working...`);
      console.log(`[${options.agent}] Result: Completed iteration ${i}\n`);
    }
    console.log('✅ Loop complete');
  } else {
    console.log(`\n[${options.agent}] Processing...`);
    console.log(`[${options.agent}] Done. (Simulated response)\n`);
  }
}
