import { BrowserAgent } from './browser-agent.js';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: { type: string; properties: Record<string, any>; required?: string[] };
  handler: (params: any) => Promise<any>;
}

export function createBrowserTools(browser: BrowserAgent): MCPTool[] {
  return [
    {
      name: 'browser_navigate',
      description: 'Navigate to a URL in the headless browser',
      inputSchema: { type: 'object', properties: { url: { type: 'string', description: 'Full URL to navigate to' } }, required: ['url'] },
      handler: (params) => browser.navigate(params.url),
    },
    {
      name: 'browser_click',
      description: 'Click an element on the page by CSS selector',
      inputSchema: { type: 'object', properties: { selector: { type: 'string', description: 'CSS selector for element to click' } }, required: ['selector'] },
      handler: (params) => browser.click(params.selector),
    },
    {
      name: 'browser_type',
      description: 'Type text into an input field',
      inputSchema: { type: 'object', properties: { selector: { type: 'string', description: 'CSS selector for input' }, text: { type: 'string', description: 'Text to type' } }, required: ['selector', 'text'] },
      handler: (params) => browser.type(params.selector, params.text),
    },
    {
      name: 'browser_extract',
      description: 'Extract text content from a page or element',
      inputSchema: { type: 'object', properties: { selector: { type: 'string', description: 'Optional CSS selector (extracts all text if empty)' } } },
      handler: (params) => browser.extractText(params.selector),
    },
    {
      name: 'browser_screenshot',
      description: 'Take a screenshot of the current page',
      inputSchema: { type: 'object', properties: { fullPage: { type: 'boolean', description: 'Capture full page or viewport only' } } },
      handler: (params) => browser.screenshot(params.fullPage),
    },
    {
      name: 'browser_session_start',
      description: 'Start a new browser session',
      inputSchema: { type: 'object', properties: {} },
      handler: () => browser.startSession(),
    },
    {
      name: 'browser_session_end',
      description: 'End the current browser session',
      inputSchema: { type: 'object', properties: {} },
      handler: () => browser.endSession(),
    },
    {
      name: 'browser_doctor',
      description: 'Run agent-browser doctor to verify installation',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => {
        const { execSync } = await import('child_process');
        try {
          const result = execSync('agent-browser doctor', { timeout: 30000, encoding: 'utf-8' });
          return { status: 'ok', output: result };
        } catch (err: any) {
          return { status: 'error', output: err.message };
        }
      },
    },
  ];
}

