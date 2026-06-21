import { InstagramConfig, InstagramPost, InstagramComment, InstagramMetrics } from './types.js';
import { RateLimiter } from './rate-limiter.js';
import { InstagramCache } from './cache.js';

export class InstagramClient {
  private config: InstagramConfig;
  private rateLimiter: RateLimiter;
  private cache: InstagramCache;

  constructor(config: InstagramConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter();
    this.cache = new InstagramCache(300);
  }

  private async request(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    await this.rateLimiter.checkLimit('api');

    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const url = new URL(`${this.config.apiBaseUrl}/${this.config.apiVersion}/${endpoint}`);
    url.searchParams.set('access_token', this.config.accessToken);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Instagram API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    this.cache.set(cacheKey, data);
    return data;
  }

  // Get media (post/reel) by ID
  async getMedia(mediaId: string): Promise<InstagramPost> {
    const data = await this.request(mediaId, {
      fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count',
    });
    return this.parsePost(data);
  }

  // Get media list for business account
  async getMediaList(limit: number = 25): Promise<InstagramPost[]> {
    const data = await this.request(`${this.config.businessAccountId}/media`, {
      fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count',
      limit: String(limit),
    });
    return (data.data || []).map(this.parsePost);
  }

  // Get comments for a media
  async getComments(mediaId: string, maxComments: number = 50): Promise<InstagramComment[]> {
    const data = await this.request(`${mediaId}/comments`, {
      fields: 'id,text,username,timestamp,like_count',
      limit: String(maxComments),
    });
    return (data.data || []).map((c: any) => ({
      id: c.id,
      text: c.text,
      username: c.username,
      timestamp: c.timestamp,
      likeCount: c.like_count || 0,
    }));
  }

  // Get insights/metrics
  async getMetrics(mediaId: string): Promise<InstagramMetrics> {
    const data = await this.request(`${mediaId}/insights`, {
      metric: 'engagement,reach,impressions,saves,shares',
      period: 'lifetime',
    });
    const metrics: any = {};
    for (const m of data.data || []) {
      metrics[m.name?.toLowerCase()] = m.values?.[0]?.value || 0;
    }
    return {
      engagement: metrics.engagement || 0,
      reach: metrics.reach || 0,
      impressions: metrics.impressions || 0,
      saves: metrics.saves || 0,
      shares: metrics.shares || 0,
      profileVisits: 0,
      followerCount: 0,
      dateRange: { start: '', end: '' },
    };
  }

  // Search hashtags
  async searchHashtag(hashtag: string, limit: number = 25): Promise<InstagramPost[]> {
    const data = await this.request('ig_hashtag_search', { user_id: this.config.businessAccountId, q: hashtag });
    const tagId = data.data?.[0]?.id;
    if (!tagId) return [];
    
    const media = await this.request(`${tagId}/recent_media`, {
      fields: 'id,caption,media_type,media_url,permalink,timestamp,username,like_count,comments_count',
      limit: String(limit),
    });
    return (media.data || []).map(this.parsePost);
  }

  // Post a comment reply (requires business account)
  async replyToComment(commentId: string, message: string): Promise<any> {
    return this.request(`${commentId}/replies`, { message }, 'POST');
  }

  // Get user profile
  async getProfile(): Promise<any> {
    return this.request(this.config.businessAccountId, {
      fields: 'id,username,name,profile_picture_url,followers_count,follows_count,media_count',
    });
  }

  private parsePost(data: any): InstagramPost {
    const caption = data.caption || '';
    const hashtags = caption.match(/#[\w]+/g) || [];
    const mentions = caption.match(/@[\w.]+/g) || [];
    
    return {
      id: data.id,
      caption: data.caption || '',
      mediaType: data.media_type || 'IMAGE',
      mediaUrl: data.media_url,
      permalink: data.permalink,
      thumbnailUrl: data.thumbnail_url,
      timestamp: data.timestamp,
      username: data.username || '',
      likeCount: data.like_count,
      commentsCount: data.comments_count,
      hashtags,
      mentions,
      isSponsored: false,
    };
  }

  getRateLimiter() { return this.rateLimiter; }
  getCache() { return this.cache; }
}
