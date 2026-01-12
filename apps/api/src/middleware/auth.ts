import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import type { Bindings, Variables, JwtPayload } from '../types';

// Token blacklist in-memory fallback (shared with auth service)
const memoryBlacklist = new Map<string, number>();

/**
 * Check if a token is blacklisted
 */
async function isTokenBlacklisted(
  jti: string,
  kv?: Bindings['TOKEN_BLACKLIST_KV']
): Promise<boolean> {
  if (kv) {
    const result = await kv.get(`bl:${jti}`);
    return result !== null;
  }
  const expiresAt = memoryBlacklist.get(jti);
  if (!expiresAt) return false;
  return expiresAt > Math.floor(Date.now() / 1000);
}

/**
 * Auth middleware - verifies JWT and sets user in context
 * Validates:
 * - Token signature and expiration
 * - Token type (must be 'access')
 * - Token not blacklisted
 */
export async function authMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Validate token type
    if (payload.type !== 'access') {
      return c.json({ success: false, error: 'Invalid token type' }, 401);
    }

    // Check if token is blacklisted
    const jti = payload.jti as string;
    if (jti && await isTokenBlacklisted(jti, c.env.TOKEN_BLACKLIST_KV)) {
      return c.json({ success: false, error: 'Token has been revoked' }, 401);
    }

    const user: JwtPayload = {
      sub: payload.sub as string,
      jti: payload.jti as string,
      phone: payload.phone as string,
      email: payload.email as string | null | undefined,
      role: payload.role as JwtPayload['role'],
      officeId: payload.officeId as string | null,
      iat: payload.iat as number,
      exp: payload.exp as number,
      type: payload.type as 'access' | 'refresh',
    };

    c.set('user', user);
    c.set('officeId', user.officeId);

    await next();
  } catch (error) {
    // Differentiate between expired and invalid tokens
    if (error instanceof Error && error.message.includes('expired')) {
      return c.json({ success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' }, 401);
    }
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
}

/**
 * Optional auth middleware - doesn't fail if no token present
 * Useful for endpoints that work both authenticated and anonymous
 */
export async function optionalAuthMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Continue without authentication
    await next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Validate token type
    if (payload.type !== 'access') {
      await next();
      return;
    }

    // Check if token is blacklisted
    const jti = payload.jti as string;
    if (jti && await isTokenBlacklisted(jti, c.env.TOKEN_BLACKLIST_KV)) {
      await next();
      return;
    }

    const user: JwtPayload = {
      sub: payload.sub as string,
      jti: payload.jti as string,
      phone: payload.phone as string,
      email: payload.email as string | null | undefined,
      role: payload.role as JwtPayload['role'],
      officeId: payload.officeId as string | null,
      iat: payload.iat as number,
      exp: payload.exp as number,
      type: payload.type as 'access' | 'refresh',
    };

    c.set('user', user);
    c.set('officeId', user.officeId);
  } catch {
    // Silently continue without authentication
  }

  await next();
}

/**
 * Role-based access control middleware
 * Must be used after authMiddleware
 */
export function requireRole(...roles: JwtPayload['role'][]) {
  return async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    if (!roles.includes(user.role)) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }

    await next();
  };
}

/**
 * Office membership middleware
 * Ensures user belongs to an office
 * Must be used after authMiddleware
 */
export async function officeMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const user = c.get('user');

  if (!user?.officeId) {
    return c.json(
      { success: false, error: 'Office membership required' },
      403
    );
  }

  await next();
}

/**
 * Super admin middleware
 * Restricts access to super_admin role only
 * Must be used after authMiddleware
 */
export async function superAdminMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const user = c.get('user');

  if (!user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  if (user.role !== 'super_admin') {
    return c.json({ success: false, error: 'Forbidden: Super admin access required' }, 403);
  }

  await next();
}
