#!/usr/bin/env node
import { InstagramClient } from './instagram-client.js';
import { InstagramTool, MCPRequest, MCPResponse } from './types.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load config from .env or config file
function loadConfig() {
  // Try loading from config file in the package
  const configPaths = [
    join(process.cwd(), 'instagram-mcp.env'),
    join(process.cwd(), '.env.instagram'),
    join(__dirname, '..', 'config', 'default.env'),
  ];

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      const content = readFileSync(configPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...vals] = trimmed.split('=');
          const value = vals.join('=');
          if (!process.env[key]) {
            process.env[key] = value.replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  }

  return {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '',
    apiVersion: process.env.INSTAGRAM_API_VERSION || 'v19.0',
    apiBaseUrl: process.env.INSTAGRAM_API_BASE_URL || 'https://graph.facebook.com',
  };
}

// Define all MCP tools
function defineTools(client: InstagramClient): InstagramTool[] {
  return [
    {
      name: 'instagram_get_media',
      description: 'Get details about an Instagram post or reel by ID',
      inputSchema: { type: 'object', properties: { mediaId: { type: 'string', description: 'Instagram media ID' } }, required: ['mediaId'] },
      handler: (params) => client.getMedia(params.mediaId),
    },
    {
      name: 'instagram_list_media',
      description: 'Get recent media posts from the connected business account',
      inputSchema: { type: 'object', properties: { limit: { type: 'number', description: 'Max posts to return (default 25)' } } },
      handler: (params) => client.getMediaList(params.limit || 25),
    },
    {
      name: 'instagram_get_comments',
      description: 'Get comments on an Instagram post',
      inputSchema: { type: 'object', properties: { mediaId: { type: 'string', description: 'Media ID' }, maxComments: { type: 'number', description: 'Max comments (default 50)' } }, required: ['mediaId'] },
      handler: (params) => client.getComments(params.mediaId, params.maxComments || 50),
    },
    {
      name: 'instagram_get_metrics',
      description: 'Get engagement metrics for a post (likes, reach, impressions, saves, shares)',
      inputSchema: { type: 'object', properties: { mediaId: { type: 'string', description: 'Media ID' } }, required: ['mediaId'] },
      handler: (params) => client.getMetrics(params.mediaId),
    },
    {
      name: 'instagram_search_hashtag',
      description: 'Search for recent posts with a specific hashtag',
      inputSchema: { type: 'object', properties: { hashtag: { type: 'string', description: 'Hashtag to search (without #)' }, limit: { type: 'number', description: 'Max results (default 25)' } }, required: ['hashtag'] },
      handler: (params) => client.searchHashtag(params.hashtag, params.limit || 25),
    },
    {
      name: 'instagram_get_profile',
      description: 'Get the connected Instagram business account profile info',
      inputSchema: { type: 'object', properties: {} },
      handler: () => client.getProfile(),
    },
    {
      name: 'instagram_analyze_post_url',
      description: 'Analyze an Instagram post by URL (extracts ID and fetches full data)',
      inputSchema: { type: 'object', properties: { url: { type: 'string', description: 'Full Instagram post/reel URL' } }, required: ['url'] },
      handler: async (params) => {
        const match = params.url.match(/instagram\.com\/(p|reel|tv)\/([^/?]+)/);
        if (!match) throw new Error('Invalid Instagram URL');
        const mediaId = await resolveMediaId(client, match[2]);
        return client.getMedia(mediaId);
      },
    },
  ];
}

async function resolveMediaId(client: InstagramClient, shortcode: string): Promise<string> {
  // If it's already a numeric ID, return it
  if (/^\d+$/.test(shortcode)) return shortcode;
  // Otherwise try to resolve via API (simplified)
  return shortcode;
}

// Main MCP server loop (stdio transport)
async function startServer() {
  const config = loadConfig();
  
  if (!config.accessToken) {
    console.error(JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Instagram API credentials not configured. Set INSTAGRAM_ACCESS_TOKEN in environment or config file.' },
    }));
    process.exit(1);
  }

  const client = new InstagramClient(config);
  const tools = defineTools(client);
  const toolMap = new Map(tools.map(t => [t.name, t]));

  console.error(`[Instagram MCP] Server started with ${tools.length} tools`);
  console.error(`[Instagram MCP] API: ${config.apiBaseUrl}/${config.apiVersion}`);

  // Read JSON-RPC requests from stdin
  const stdin = process.stdin;
  let buffer = '';

  stdin.on('data', async (chunk: Buffer) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const request: MCPRequest = JSON.parse(line);
        const response = await handleRequest(request, toolMap);
        process.stdout.write(JSON.stringify(response) + '\n');
      } catch (err: any) {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error', data: err.message },
        }) + '\n');
      }
    }
  });

  // Send initialize response
  const initResponse: MCPResponse = {
    jsonrpc: '2.0',
    id: 'init',
    result: {
      serverInfo: { name: 'instagram-mcp-server', version: '1.0.0' },
      capabilities: { tools: {} },
    },
  };
  process.stdout.write(JSON.stringify(initResponse) + '\n');
}

async function handleRequest(request: MCPRequest, toolMap: Map<string, InstagramTool>): Promise<MCPResponse> {
  const base: MCPResponse = { jsonrpc: '2.0', id: request.id };

  try {
    switch (request.method) {
      case 'initialize':
        return { ...base, result: { serverInfo: { name: 'instagram-mcp-server', version: '1.0.0' }, capabilities: { tools: {} } } };

      case 'tools/list':
        return { ...base, result: { tools: Array.from(toolMap.values()).map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) } };

      case 'tools/call': {
        const tool = toolMap.get(request.params.name);
        if (!tool) throw new Error(`Unknown tool: ${request.params.name}`);
        const result = await tool.handler(request.params.arguments || {});
        return { ...base, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } };
      }

      default:
        return { ...base, result: null };
    }
  } catch (err: any) {
    return { ...base, error: { code: -32603, message: err.message } };
  }
}

startServer().catch(err => {
  console.error(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: err.message } }));
  process.exit(1);
});
