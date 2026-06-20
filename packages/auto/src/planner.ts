import { TaskPlan, TaskStep, AutoTask } from './types.js';
import { v4 as uuid } from 'uuid';

export class TaskPlanner {
  plan(task: AutoTask): TaskPlan {
    const prompt = task.prompt.toLowerCase();
    const steps: TaskStep[] = [];
    
    // Analyze prompt and break into steps
    const analysis = this.analyzePrompt(prompt);
    
    // Create plan structure
    steps.push(this.makeStep('analyze', 'Analyze the request and gather context', 'agent_MiniMax-M2.5_analyst', 'analyze'));
    
    if (analysis.needsSearch) {
      steps.push(this.makeStep('research', 'Research relevant information', 'agent_MiniMax-M2.5_researcher', 'research', ['analyze']));
    }
    
    if (analysis.needsDesign) {
      steps.push(this.makeStep('design', 'Design the solution architecture', 'agent_MiniMax-M2.5_architect', 'design', analysis.needsSearch ? ['research'] : ['analyze']));
    }
    
    if (analysis.needsCode) {
      steps.push(this.makeStep('implement', 'Implement the solution', 'agent_MiniMax-M2.5_coder', 'implement', ['design']));
    }
    
    if (analysis.needsTest) {
      steps.push(this.makeStep('test', 'Test the implementation', 'agent_MiniMax-M2.5_debugger', 'test', ['implement']));
    }
    
    const verifyStep = this.makeStep('verify', 'Verify and review the result', 'agent_superpower-verifier', 'verify', analysis.needsTest ? ['test'] : ['implement']);
    if (!analysis.needsCode) {
      verifyStep.dependsOn = analysis.needsDesign ? ['design'] : analysis.needsSearch ? ['research'] : ['analyze'];
    }
    steps.push(verifyStep);
    
    return {
      id: uuid(),
      steps,
      estimatedComplexity: steps.length > 5 ? 'complex' : steps.length > 3 ? 'medium' : 'simple',
    };
  }

  private analyzePrompt(prompt: string) {
    const codeKeywords = ['create', 'build', 'implement', 'code', 'function', 'class', 'api', 'app', 'fix', 'bug', 'feature'];
    const searchKeywords = ['find', 'search', 'research', 'what is', 'how to', 'latest', 'compare', 'alternatives'];
    const designKeywords = ['design', 'architecture', 'plan', 'structure', 'system', 'workflow', 'schema'];
    const testKeywords = ['test', 'debug', 'verify', 'validate', 'check', 'lint'];

    return {
      needsCode: codeKeywords.some(k => prompt.includes(k)),
      needsSearch: searchKeywords.some(k => prompt.includes(k)),
      needsDesign: designKeywords.some(k => prompt.includes(k)),
      needsTest: testKeywords.some(k => prompt.includes(k)),
    };
  }

  private makeStep(id: string, description: string, agentType: string, action: string, dependsOn: string[] = []): TaskStep {
    return { id, description, agentType, action, dependsOn, status: 'pending' };
  }
}
