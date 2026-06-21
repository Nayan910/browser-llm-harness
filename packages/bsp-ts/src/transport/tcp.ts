/**
 * BSP TCP Transport
 *
 * Network transport for same-system or LAN communication.
 * When stdio isn't enough and SCUT is too much.
 */

import * as net from 'node:net';
import { type BspMessage, type BspNotification, type TransportConfig } from '../types.js';
import { Transport } from './index.js';
import { MAX_MESSAGE_SIZE } from '../protocol.js';

// ─── Protocol: Length-prefixed JSON messages ──────────────────────────
// Simple: 4 bytes (Uint32BE message length) + JSON payload
// No HTTP overhead. No headers. Just bytes.

export class TcpTransport extends Transport {
  readonly type = 'tcp' as const;
  readonly config: TransportConfig;

  private server: net.Server | null = null;
  private client: net.Socket | null = null;
  private connected = false;
  private buffer = Buffer.alloc(0);
  private expectedLength: number | null = null;
  private isServer: boolean;

  constructor(config: TransportConfig) {
    super();
    this.config = {
      encoding: 'json',
      ...config,
    };
    this.isServer = !config.address?.includes(':');
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    const port = this.config.port || 8742;
    const host = this.config.address || '0.0.0.0';

    if (this.isServer) {
      await this.startServer(port, host);
    } else {
      await this.connectToPeer(port, host);
    }
  }

  private startServer(port: number, host: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket: net.Socket) => {
        this.handleSocket(socket);
      });

      this.server.on('error', (err: Error) => {
        this.emit('error', err);
        reject(err);
      });

      this.server.listen(port, host, () => {
        this.connected = true;
        this.emit('open');
        resolve();
      });
    });
  }

  private connectToPeer(port: number, host: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();

      client.on('connect', () => {
        this.connected = true;
        this.client = client;
        this.emit('open');
        resolve();
      });

      client.on('error', (err: Error) => {
        this.emit('error', err);
        reject(err);
      });

      client.on('close', () => {
        this.connected = false;
        this.emit('close');
      });

      client.on('data', (data: Buffer) => {
        this.handleData(data);
      });

      client.connect(port, host);
    });
  }

  private handleSocket(socket: net.Socket): void {
    this.client = socket;

    socket.on('data', (data: Buffer) => {
      this.handleData(data);
    });

    socket.on('close', () => {
      this.connected = false;
      this.client = null;
      this.emit('close');
    });

    socket.on('error', (err: Error) => {
      this.emit('error', err);
    });
  }

  private handleData(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data]);

    while (this.buffer.length >= 4) {
      if (this.expectedLength === null) {
        // Read 4-byte length prefix (Uint32BE)
        this.expectedLength = this.buffer.readUInt32BE(0);
      }

      const totalNeeded = 4 + this.expectedLength;

      if (this.buffer.length < totalNeeded) {
        break; // Wait for more data
      }

      // Extract the message payload
      const payload = this.buffer.slice(4, totalNeeded);
      this.buffer = this.buffer.slice(totalNeeded);
      this.expectedLength = null;

      if (payload.length > MAX_MESSAGE_SIZE) {
        this.emit('error', new Error(`Message exceeds max size: ${payload.length} > ${MAX_MESSAGE_SIZE}`));
        continue;
      }

      try {
        const msg = JSON.parse(payload.toString('utf-8')) as BspMessage | BspNotification;
        if ('id' in msg && msg.id) {
          this.emit('message', msg as BspMessage);
        } else {
          this.emit('notification', msg as BspNotification);
        }
      } catch (err) {
        this.emit('error', new Error(`Failed to parse message: ${(err as Error).message}`));
      }
    }
  }

  async disconnect(): Promise<void> {
    this.client?.destroy();
    this.client = null;

    if (this.server) {
      await new Promise<void>((resolve) => this.server?.close(() => resolve()));
      this.server = null;
    }

    this.connected = false;
    this.buffer = Buffer.alloc(0);
    this.expectedLength = null;
    this.emit('close');
  }

  async send(message: BspMessage | BspNotification): Promise<void> {
    if (!this.connected || !this.client) {
      throw new Error('TCP transport not connected');
    }

    const json = JSON.stringify(message);
    const payload = Buffer.from(json, 'utf-8');
    const lengthPrefix = Buffer.alloc(4);
    lengthPrefix.writeUInt32BE(payload.length);

    this.client.write(Buffer.concat([lengthPrefix, payload]));
  }

  isConnected(): boolean {
    return this.connected;
  }

  getAddress(): string {
    const addr = this.config.address || '0.0.0.0';
    const port = this.config.port || 8742;
    return `tcp://${addr}:${port}`;
  }
}
