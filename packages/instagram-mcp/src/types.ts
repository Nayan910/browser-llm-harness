export interface InstagramConfig {
  accessToken: string;
  appId: string;
  appSecret: string;
  businessAccountId: string;
  apiVersion: string;
  apiBaseUrl: string;
}

export interface InstagramPost {
  id: string;
  caption?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl?: string;
  permalink: string;
  thumbnailUrl?: string;
  timestamp: string;
  username: string;
  likeCount?: number;
  commentsCount?: number;
  hashtags?: string[];
  mentions?: string[];
  videoDuration?: number;
  isSponsored?: boolean;
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  likeCount: number;
  replies?: InstagramComment[];
}

export interface InstagramMetrics {
  engagement: number;
  reach: number;
  impressions: number;
  saves: number;
  shares: number;
  profileVisits: number;
  followerCount: number;
  dateRange: { start: string; end: string };
}

export interface MCPRequest {
  method: string;
  params: Record<string, any>;
  id: string;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string;
  result?: any;
  error?: { code: number; message: string; data?: any };
}

export interface InstagramTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any) => Promise<any>;
}
