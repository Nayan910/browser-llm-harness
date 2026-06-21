export class RateLimiter {
  private requests: number[] = [];
  private config: {
    requestsPerHour: number;
    postsPerDay: number;
    enableBackoff: boolean;
  };

  constructor(config?: Partial<{ requestsPerHour: number; postsPerDay: number; enableBackoff: boolean }>) {
    this.config = {
      requestsPerHour: config?.requestsPerHour || 200,
      postsPerDay: config?.postsPerDay || 25,
      enableBackoff: config?.enableBackoff ?? true,
    };
  }

  async checkLimit(type: 'api' | 'post'): Promise<boolean> {
    const now = Date.now();
    const windowMs = type === 'post' ? 86400000 : 3600000;
    const maxRequests = type === 'post' ? this.config.postsPerDay : this.config.requestsPerHour;

    // Clean old entries
    this.requests = this.requests.filter(t => now - t < windowMs);

    if (this.requests.length >= maxRequests) {
      if (this.config.enableBackoff) {
        const oldest = this.requests[0];
        const waitMs = windowMs - (now - oldest);
        console.log(`[RateLimiter] Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s`);
        await new Promise(resolve => setTimeout(resolve, Math.min(waitMs, 30000)));
        return this.checkLimit(type);
      }
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getStats() {
    const now = Date.now();
    return {
      apiCallsLastHour: this.requests.filter(t => now - t < 3600000).length,
      apiLimit: this.config.requestsPerHour,
      postsToday: this.requests.filter(t => now - t < 86400000).length,
      postLimit: this.config.postsPerDay,
    };
  }
}
