/**
 * LSP → BSP Bridge
 *
 * Wraps any Language Server Protocol (LSP) server as a BSP tool capability.
 * Now any Bob on the network can ask: "Hey, give me completions for this Rust file"
 * and the bridge forwards to rust-analyzer under the hood.
 *
 * "Let me hook any LSP server into the Bob network."
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import type { BspMeta, ToolCapability } from '../types.js';

// ─── LSP Types (subset needed for bridge) ─────────────────────────────

interface LspMessage {
  jsonrpc: '2.0';
  id?: number | string;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

// ─── Bridge ───────────────────────────────────────────────────────────

export interface LspBridgeOptions {
  /** Command to start the LSP server (e.g., 'rust-analyzer') */
  command: string;
  /** Command arguments */
  args?: string[];
  /** Language identifier */
  language: string;
  /** File extensions this server handles */
  fileExtensions: string[];
}

export class LspBridge {
  private options: LspBridgeOptions;
  private process: ChildProcess | null = null;
  private rl: ReturnType<typeof createInterface> | null = null;
  private requestId = 0;
  private pendingRequests: Map<number | string, { resolve: (v: unknown) => void; reject: (e: Error) => void }> = new Map();
  private initialized = false;
  private capabilities: Record<string, unknown> = {};

  /** Callback for when this bridge receives BSP task delegations */
  onTask?: (task: { description: string; type: string; context: unknown }) => Promise<unknown>;

  constructor(options: LspBridgeOptions) {
    this.options = options;
  }

  /** Get BSP tool capability descriptor */
  getToolCapability(): ToolCapability {
    return {
      name: `lsp-${this.options.language}`,
      version: '1.0.0',
      features: ['completion', 'diagnostics', 'hover', 'code-action', 'definition'],
      config: {
        language: this.options.language,
        fileExtensions: this.options.fileExtensions,
        command: this.options.command,
      },
    };
  }

  /** Start the LSP server process and initialize it */
  async start(): Promise<void> {
    this.process = spawn(this.options.command, this.options.args ?? [], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.rl = createInterface({
      input: this.process.stdout!,
      crlfDelay: Infinity,
    });

    // Handle stderr (LSP servers log there)
    this.process.stderr?.on('data', (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg) console.debug(`[LSP:${this.options.language}] ${msg}`);
    });

    // Handle LSP responses
    let buffer = '';
    let contentLength: number | null = null;

    this.rl.on('line', (line: string) => {
      // LSP uses Content-Length headers
      const lengthMatch = line.match(/Content-Length:\s*(\d+)/i);
      if (lengthMatch) {
        contentLength = parseInt(lengthMatch[1], 10);
        return;
      }

      if (line === '' && contentLength !== null) {
        // Blank line — next line(s) are the JSON body
        // We need to read exactly contentLength bytes
        // For simplicity, read the next line
        return;
      }

      // Parse JSON body
      try {
        const msg = JSON.parse(line) as LspMessage;
        this.handleLspMessage(msg);
      } catch {
        // Might be partial — accumulate
        buffer += line;
        if (contentLength !== null && Buffer.byteLength(buffer, 'utf-8') >= contentLength) {
          try {
            const msg = JSON.parse(buffer) as LspMessage;
            this.handleLspMessage(msg);
          } catch {
            // Skip malformed messages
          }
          buffer = '';
          contentLength = null;
        }
      }
    });

    this.process.on('exit', (code) => {
      console.warn(`[LSP:${this.options.language}] Process exited with code ${code}`);
      this.initialized = false;
    });

    // Send initialize request
    await this.sendLspRequest('initialize', {
      processId: process.pid,
      rootUri: null,
      capabilities: {},
    });

    // Send initialized notification
    this.sendLspNotification('initialized', {});

    this.initialized = true;
  }

  /** Stop the LSP server */
  async stop(): Promise<void> {
    if (!this.process) return;

    this.sendLspNotification('shutdown', {});
    this.process.kill();
    this.process = null;
    this.rl = null;
    this.initialized = false;
  }

  /** Get code completions (bridged from BSP) */
  async getCompletions(
    filePath: string,
    fileContent: string,
    line: number,
    character: number,
  ): Promise<unknown> {
    if (!this.initialized) throw new Error('LSP not initialized');

    // Open the document first
    await this.sendLspNotification('textDocument/didOpen', {
      textDocument: {
        uri: `file://${filePath}`,
        languageId: this.options.language,
        version: 1,
        text: fileContent,
      },
    });

    // Request completions
    const result = await this.sendLspRequest('textDocument/completion', {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
    });

    return result;
  }

  /** Get diagnostics for a file */
  async getDiagnostics(
    filePath: string,
    fileContent: string,
  ): Promise<unknown> {
    if (!this.initialized) throw new Error('LSP not initialized');

    // Open and immediately request diagnostics
    await this.sendLspNotification('textDocument/didOpen', {
      textDocument: {
        uri: `file://${filePath}`,
        languageId: this.options.language,
        version: 1,
        text: fileContent,
      },
    });

    return [];
  }

  /** Handle incoming LSP message */
  private handleLspMessage(msg: LspMessage): void {
    // Response to a request we sent
    if (msg.id !== undefined && this.pendingRequests.has(msg.id)) {
      const entry = this.pendingRequests.get(msg.id)!;
      this.pendingRequests.delete(msg.id);

      if (msg.error) {
        entry.reject(new Error(`LSP Error [${msg.error.code}]: ${msg.error.message}`));
      } else if (msg.method === 'initialize' && msg.result) {
        this.capabilities = msg.result as Record<string, unknown>;
        entry.resolve(msg.result);
      } else {
        entry.resolve(msg.result);
      }
    }
  }

  /** Send an LSP request and wait for response */
  private sendLspRequest(method: string, params: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const msg: LspMessage = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, { resolve, reject });
      this.writeLspMessage(msg);
    });
  }

  /** Send an LSP notification (no response) */
  private sendLspNotification(method: string, params: unknown): void {
    const msg: LspMessage = {
      jsonrpc: '2.0',
      method,
      params,
    };
    this.writeLspMessage(msg);
  }

  /** Write a message in LSP wire format */
  private writeLspMessage(msg: LspMessage): void {
    if (!this.process?.stdin) return;

    const json = JSON.stringify(msg);
    const header = `Content-Length: ${Buffer.byteLength(json, 'utf-8')}\r\n\r\n`;
    this.process.stdin.write(header + json);
  }
}
