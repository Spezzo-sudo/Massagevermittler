/**
 * Rate limiting middleware using in-memory store
 * For production, use Redis or similar distributed cache
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  constructor(private maxRequests: number = 100, private windowMs: number = 60000) {} // 100 requests per minute

  /**
   * Check if request is within rate limit
   */
  isLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset existing one
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      return true;
    }

    return false;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string): number {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get reset time for a key
   */
  getResetTime(key: string): number {
    const entry = this.store.get(key);
    if (!entry) {
      return Date.now() + this.windowMs;
    }
    return entry.resetTime;
  }

  /**
   * Reset a specific key
   */
  reset(key: string) {
    this.store.delete(key);
  }

  /**
   * Clear all entries
   */
  clear() {
    this.store.clear();
  }
}

// Create rate limiters for different endpoints
const apiLimiter = new RateLimiter(100, 60000); // 100 req/min
const authLimiter = new RateLimiter(5, 900000); // 5 req/15min (prevent brute force)
const bookingLimiter = new RateLimiter(10, 60000); // 10 req/min

/**
 * Generic rate limit middleware
 */
export function createRateLimitMiddleware(limiter: RateLimiter, keyExtractor: (req: Request) => string) {
  return (request: Request) => {
    const key = keyExtractor(request);
    const isLimited = limiter.isLimited(key);

    const remaining = limiter.getRemaining(key);
    const resetTime = limiter.getResetTime(key);

    const headers = new Headers({
      'X-RateLimit-Limit': String(100),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
    });

    if (isLimited) {
      return {
        blocked: true,
        response: new Response('Too Many Requests', { status: 429, headers }),
      };
    }

    return {
      blocked: false,
      headers,
    };
  };
}

/**
 * Rate limit by IP address
 */
export function getRateLimitedResponse(request: Request, limiter: RateLimiter = apiLimiter): Response | null {

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown';
  const isLimited = limiter.isLimited(ip);

  const remaining = limiter.getRemaining(ip);
  const resetTime = limiter.getResetTime(ip);

  const headers = new Headers({
    'X-RateLimit-Limit': String(100),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
  });

  if (isLimited) {
    console.warn('[RateLimit] Request blocked', { ip, remaining });
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
  }

  return null;
}

/**
 * Rate limit by user ID (for authenticated requests)
 */
export function getRateLimitedResponseByUser(
  userId: string,
  request: Request,
  limiter: RateLimiter = apiLimiter
): Response | null {
  const isLimited = limiter.isLimited(`user:${userId}`);

  const remaining = limiter.getRemaining(`user:${userId}`);
  const resetTime = limiter.getResetTime(`user:${userId}`);

  const headers = new Headers({
    'X-RateLimit-Limit': String(100),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
  });

  if (isLimited) {
    console.warn('[RateLimit] User request blocked', { userId, remaining });
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
  }

  return null;
}

/**
 * Predefined rate limiters
 */
export { apiLimiter, authLimiter, bookingLimiter };
