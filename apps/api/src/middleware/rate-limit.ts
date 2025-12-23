import type { Context, Next } from 'hono';
import type { Bindings, Variables } from '../types';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
  keyPrefix?: string;
}

// In-memory rate limit store (for development)
// In production, use Cloudflare KV or Durable Objects
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting middleware
 * Uses in-memory store - for production, use Cloudflare KV
 */
export function rateLimiter(config: RateLimitConfig) {
  const { windowMs, max, keyPrefix = 'rl' } = config;

  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    // Get client identifier (IP or user ID if authenticated)
    const user = c.get('user');
    const clientId = user?.sub || c.req.header('cf-connecting-ip') || 'unknown';
    const key = `${keyPrefix}:${clientId}`;

    const now = Date.now();
    const record = rateLimitStore.get(key);

    // Clean up old records periodically
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore) {
        if (v.resetTime < now) {
          rateLimitStore.delete(k);
        }
      }
    }

    if (!record || record.resetTime < now) {
      // New window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
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
      record.count++;
    }

    // Set rate limit headers
    const currentRecord = rateLimitStore.get(key)!;
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - currentRecord.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(currentRecord.resetTime / 1000)));

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
