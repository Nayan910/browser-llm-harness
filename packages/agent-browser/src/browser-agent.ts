import { BrowserConfig, BrowserPage, BrowserAction, BrowserSession } from './types.js';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export class BrowserAgent {
  private config: BrowserConfig;
  private session: BrowserSession | null = null;
  private browserProcess: any = null;

  constructor(config?: Partial<BrowserConfig>) {
    this.config = {
      headed: config?.headed ?? false,
      profile: config?.profile || './browser-data',
      userAgent: config?.userAgent || 'agent-browser/1.0',
      hideScrollbars: config?.hideScrollbars ?? true,
      ignoreHttpsErrors: config?.ignoreHttpsErrors ?? true,
      maxOutput: config?.maxOutput || 50000,
      defaultTimeout: config?.defaultTimeout || 25000,
      viewport: config?.viewport || { width: 1280, height: 720 },
    };
  }

  async startSession(): Promise<BrowserSession> {
    this.session = {
      id: generateId(),
      startTime: new Date(),
      currentUrl: 'about:blank',
      pageCount: 0,
      actions: [],
    };
    console.log(`[BrowserAgent] Session started: ${this.session.id}`);
    return this.session;
  }

  async navigate(url: string): Promise<BrowserPage> {
    this.ensureSession();
    console.log(`[BrowserAgent] Navigating to: ${url}`);

    // In production, this uses agent-browser's actual browser
    // For now, simulate a page load
    const page: BrowserPage = {
      url,
      title: `Page: ${url}`,
      content: `Simulated content for ${url}`,
      statusCode: 200,
    };

    if (this.session) {
      this.session.currentUrl = url;
      this.session.pageCount++;
      this.session.actions.push({ type: 'navigate', value: url });
    }

    return page;
  }

  async click(selector: string): Promise<void> {
    this.ensureSession();
    console.log(`[BrowserAgent] Click: ${selector}`);
    this.session?.actions.push({ type: 'click', selector });
  }

  async type(selector: string, text: string): Promise<void> {
    this.ensureSession();
    console.log(`[BrowserAgent] Type: "${text}" into ${selector}`);
    this.session?.actions.push({ type: 'type', selector, value: text });
  }

  async screenshot(fullPage: boolean = false): Promise<string> {
    this.ensureSession();
    console.log(`[BrowserAgent] Screenshot (fullPage: ${fullPage})`);
    this.session?.actions.push({ type: 'screenshot' });
    return 'data:image/png;base64,...'; // Placeholder
  }

  async extractText(selector?: string): Promise<string> {
    this.ensureSession();
    const content = selector
      ? `Extracted text from ${selector}`
      : 'Extracted page text';
    this.session?.actions.push({ type: 'extract', selector });
    return content;
  }

  async wait(ms: number): Promise<void> {
    this.ensureSession();
    await new Promise(resolve => setTimeout(resolve, Math.min(ms, 5000)));
    this.session?.actions.push({ type: 'wait', value: String(ms) });
  }

  async evaluate(script: string): Promise<any> {
    this.ensureSession();
    console.log(`[BrowserAgent] Evaluate JS`);
    this.session?.actions.push({ type: 'evaluate', script });
    return null;
  }

  async executeActions(actions: BrowserAction[]): Promise<any[]> {
    const results = [];
    for (const action of actions) {
      switch (action.type) {
        case 'navigate':
          results.push(await this.navigate(action.value || ''));
          break;
        case 'click':
          results.push(await this.click(action.selector || ''));
          break;
        case 'type':
          results.push(await this.type(action.selector || '', action.value || ''));
          break;
        case 'screenshot':
          results.push(await this.screenshot());
          break;
        case 'extract':
          results.push(await this.extractText(action.selector));
          break;
        case 'wait':
          results.push(await this.wait(parseInt(action.value || '1000')));
          break;
        case 'scroll':
          results.push(`Scrolled`);
          break;
      }
    }
    return results;
  }

  async endSession(): Promise<void> {
    if (this.session) {
      console.log(`[BrowserAgent] Session ended: ${this.session.id}`);
      console.log(`[BrowserAgent] Actions performed: ${this.session.actions.length}`);
      this.session = null;
    }
  }

  getConfig(): BrowserConfig {
    return { ...this.config };
  }

  getSession(): BrowserSession | null {
    return this.session ? { ...this.session } : null;
  }

  private ensureSession(): void {
    if (!this.session) {
      throw new Error('No active browser session. Call startSession() first.');
    }
  }
}
