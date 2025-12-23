import type { Context, Next } from 'hono';
import type { Bindings, Variables } from '../types';

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
  error?: string;
}

/**
 * Request logging middleware
 * Logs request details and response times
 */
export async function requestLogger(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const start = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);

  // Add request ID to response headers
  c.header('X-Request-ID', requestId);

  // Get request info
  const method = c.req.method;
  const path = new URL(c.req.url).pathname;
  const userAgent = c.req.header('user-agent');
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for');

  let error: string | undefined;

  try {
    await next();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
    throw e;
  } finally {
    const duration = Date.now() - start;
    const status = c.res.status;
    const user = c.get('user');

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method,
      path,
      status,
      duration,
      userId: user?.sub,
      userAgent: userAgent?.slice(0, 100), // Truncate user agent
      ip,
      error,
    };

    // Log based on status
    const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    const emoji = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';

    console[logLevel](
      `${emoji} [${requestId}] ${method} ${path} ${status} ${duration}ms`,
      user?.sub ? `user:${user.sub}` : ''
    );

    // Log detailed info for errors
    if (status >= 400) {
      console[logLevel]('Request details:', JSON.stringify(logEntry, null, 2));
    }
  }
}

/**
 * Error logging middleware
 * Catches and logs unhandled errors
 */
export async function errorLogger(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  try {
    await next();
  } catch (error) {
    const requestId = c.res.headers.get('X-Request-ID') || 'unknown';

    console.error(`💥 [${requestId}] Unhandled error:`, error);

    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }

    // Return generic error response
    return c.json(
      {
        success: false,
        error: 'Internal server error',
        requestId,
      },
      500
    );
  }
}

/**
 * Request timing middleware
 * Adds Server-Timing header for performance monitoring
 */
export async function serverTiming(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const start = performance.now();

  await next();

  const duration = performance.now() - start;
  c.header('Server-Timing', `total;dur=${duration.toFixed(2)}`);
}

/**
 * Check if origin matches a pattern (supports wildcards)
 */
function originMatchesPattern(origin: string, pattern: string): boolean {
  // Exact match
  if (pattern === origin) return true;

  // Wildcard pattern (e.g., https://*.vercel.app)
  if (pattern.includes('*')) {
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .replace(/\*/g, '.*'); // Convert * to .*
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(origin);
  }

  return false;
}

/**
 * CORS middleware with proper configuration
 */
export function corsMiddleware(allowedOrigins: string[] = ['*']) {
  return async (c: Context, next: Next) => {
    const origin = c.req.header('Origin');

    // Check if origin is allowed (supports wildcard patterns)
    const isAllowed =
      allowedOrigins.includes('*') ||
      (origin && allowedOrigins.some(pattern => originMatchesPattern(origin, pattern)));

    const corsHeaders: Record<string, string> = {};

    if (isAllowed) {
      corsHeaders['Access-Control-Allow-Origin'] = origin || '*';
      corsHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
      corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Request-ID';
      corsHeaders['Access-Control-Max-Age'] = '86400'; // 24 hours
      corsHeaders['Access-Control-Expose-Headers'] = 'X-Request-ID, X-RateLimit-Limit, X-RateLimit-Remaining';

      // Set headers on context
      Object.entries(corsHeaders).forEach(([key, value]) => {
        c.header(key, value);
      });
    }

    // Handle preflight requests
    if (c.req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    await next();
  };
}
