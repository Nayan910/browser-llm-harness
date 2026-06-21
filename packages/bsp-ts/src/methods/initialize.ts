/**
 * bsp/initialize — Protocol handshake
 *
 * "Hello. I'm Bob. Here's what I can do. What've you got?"
 *
 * This is the first message exchanged between agents. Both sides
 * declare their capabilities and negotiate the session parameters.
 */

import type {
  BspMeta,
  CapabilityManifest,
  InitializeParams,
  InitializeResult,
  SenderType,
} from '../types.js';
import { generateSessionId } from '../protocol.js';
import type { MethodHandler } from './types.js';

export interface InitializeOptions {
  serverName: string;
  serverVersion: string;
  senderType: SenderType;
  capabilities: CapabilityManifest;
}

export class InitializeHandler implements MethodHandler<InitializeParams, InitializeResult> {
  private options: InitializeOptions;
  private initialized = false;

  constructor(options: InitializeOptions) {
    this.options = options;
  }

  async handle(params: InitializeParams, meta: BspMeta): Promise<InitializeResult> {
    // Version negotiation — future-proofing for when we hit BSP 3.0
    const clientVersion = params.clientVersion;
    const supportedVersions = ['2.0'];

    if (!supportedVersions.includes(clientVersion)) {
      // We're generous — accept anything that starts with 2
      if (!clientVersion.startsWith('2.')) {
        throw new Error(
          `Incompatible BSP version: ${clientVersion}. ` +
          `This server supports: ${supportedVersions.join(', ')}. ` +
          'Try upgrading your consciousness.',
        );
      }
    }

    this.initialized = true;

    const sessionId = generateSessionId();

    return {
      serverVersion: '2.0',
      capabilities: this.options.capabilities,
      serverInfo: {
        name: this.options.serverName,
        version: this.options.serverVersion,
        senderType: this.options.senderType,
      },
      sessionId,
    };
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
