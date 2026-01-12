import type { Context, Next } from 'hono';
import type { Bindings, Variables } from '../types';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
  keyPrefix?: string;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory fallback for local development (when KV is not available)
const memoryStore = new Map<string, RateLimitRecord>();

/**
 * Get rate limit record from KV or memory
 */
async function getRecord(
  key: string,
  kv?: Bindings['RATE_LIMIT_KV']
): Promise<RateLimitRecord | null> {
  if (kv) {
    const record = await kv.get<RateLimitRecord>(key, 'json');
    return record;
  }
  return memoryStore.get(key) || null;
}

/**
 * Set rate limit record in KV or memory
 */
async function setRecord(
  key: string,
  record: RateLimitRecord,
  windowMs: number,
  kv?: Bindings['RATE_LIMIT_KV']
): Promise<void> {
  if (kv) {
    // KV TTL is in seconds, add buffer to ensure cleanup
    const ttlSeconds = Math.ceil(windowMs / 1000) + 60;
    await kv.put(key, JSON.stringify(record), { expirationTtl: ttlSeconds });
  } else {
    memoryStore.set(key, record);
    // Clean up old records in memory periodically
    if (memoryStore.size > 10000) {
      const now = Date.now();
      Array.from(memoryStore.entries()).forEach(([k, v]) => {
        if (v.resetTime < now) {
          memoryStore.delete(k);
        }
      });
    }
  }
}

/**
 * Rate limiting middleware with Cloudflare KV support
 * Falls back to in-memory store for local development
 */
export function rateLimiter(config: RateLimitConfig) {
  const { windowMs, max, keyPrefix = 'rl' } = config;

  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    // Get client identifier (IP or user ID if authenticated)
    const user = c.get('user');
    const clientId = user?.sub || c.req.header('cf-connecting-ip') || 'unknown';
    const key = `${keyPrefix}:${clientId}`;

    const now = Date.now();
    const kv = c.env.RATE_LIMIT_KV;
    const record = await getRecord(key, kv);

    if (!record || record.resetTime < now) {
      // New window
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + windowMs,
      };
      await setRecord(key, newRecord, windowMs, kv);

      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', String(max - 1));
      c.header('X-RateLimit-Reset', String(Math.ceil(newRecord.resetTime / 1000)));
    } else if (record.count >= max) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));
      c.header('Retry-After', String(retryAfter));

      return c.json(
        {
          success: false,
          error: 'Too many requests',
          retryAfter,
        },
        429
      );
    } else {
      // Increment counter
      const updatedRecord: RateLimitRecord = {
        count: record.count + 1,
        resetTime: record.resetTime,
      };
      await setRecord(key, updatedRecord, windowMs, kv);

      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', String(Math.max(0, max - updatedRecord.count)));
      c.header('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));
    }

    await next();
  };
}

// Preset rate limiters
export const standardRateLimit = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 requests per minute
  keyPrefix: 'std',
});

export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 auth attempts per 15 minutes
  keyPrefix: 'auth',
});

export const otpRateLimit = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 3,              // 3 OTP requests per minute
  keyPrefix: 'otp',
});

export const uploadRateLimit = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 uploads per minute
  keyPrefix: 'upload',
});

export const searchRateLimit = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 searches per minute
  keyPrefix: 'search',
});
