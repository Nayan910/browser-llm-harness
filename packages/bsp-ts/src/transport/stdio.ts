/**
 * BSP Stdio Transport
 *
 * "stdio is everywhere — zero dependency transport."
 * Standard input/output for process-based communication.
 * Same pattern as LSP — if it's good enough for language servers, it's good enough for Bobs.
 */

import { createInterface, type Interface as ReadlineInterface } from 'node:readline';
import { type BspMessage, type BspNotification, type TransportConfig } from '../types.js';
import { Transport } from './index.js';

export class StdioTransport extends Transport {
  readonly type = 'stdio' as const;
  readonly config: TransportConfig;

  private rl: ReadlineInterface | null = null;
  private connected = false;
  private buffer = '';

  constructor(config?: Partial<TransportConfig>) {
    super();
    this.config = {
      type: 'stdio',
      encoding: 'json',
      ...config,
    };
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
      crlfDelay: Infinity,
    });

    // Read messages line by line (JSONL format)
    this.rl.on('line', (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      try {
        const parsed = JSON.parse(trimmed) as BspMessage | BspNotification;
        this.handleIncoming(parsed);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to parse message');
        this.emit('error', error);
      }
    });

    this.rl.on('close', () => {
      this.connected = false;
      this.emit('close');
    });

    // Handle stdin errors
    process.stdin.on('error', (err: Error) => {
      this.emit('error', err);
    });

    this.connected = true;
    this.emit('open');
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    this.rl?.close();
    this.rl = null;
    this.connected = false;
    this.emit('close');
  }

  async send(message: BspMessage | BspNotification): Promise<void> {
    if (!this.connected) {
      throw new Error('Stdio transport not connected');
    }

    const json = JSON.stringify(message);
    // Content-Length header format (LSP compatible)
    const header = `Content-Length: ${Buffer.byteLength(json, 'utf-8')}\r\n\r\n`;
    process.stdout.write(header + json);
  }

  isConnected(): boolean {
    return this.connected;
  }

  getAddress(): string {
    return 'stdio://local';
  }

  private handleIncoming(msg: BspMessage | BspNotification): void {
    if ('id' in msg && msg.id) {
      this.emit('message', msg as BspMessage);
    } else {
      this.emit('notification', msg as BspNotification);
    }
  }
}
