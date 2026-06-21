export interface BrowserConfig {
  headed: boolean;
  profile: string;
  userAgent: string;
  hideScrollbars: boolean;
  ignoreHttpsErrors: boolean;
  maxOutput: number;
  defaultTimeout: number;
  viewport?: { width: number; height: number };
}

export interface BrowserPage {
  url: string;
  title: string;
  content: string;
  screenshot?: string;
  cookies?: any[];
  headers?: Record<string, string>;
  statusCode?: number;
}

export interface BrowserAction {
  type: "navigate" | "click" | "type" | "screenshot" | "extract" | "wait" | "scroll" | "evaluate";
  selector?: string;
  value?: string;
  script?: string;
  timeout?: number;
}

export interface BrowserSession {
  id: string;
  startTime: Date;
  currentUrl: string;
  pageCount: number;
  actions: BrowserAction[];
}

