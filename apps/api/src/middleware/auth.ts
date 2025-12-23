import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import type { Bindings, Variables, JwtPayload } from '../types';

// Auth middleware - verifies JWT and sets user in context
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

    const user: JwtPayload = {
      sub: payload.sub as string,
      phone: payload.phone as string,
      role: payload.role as JwtPayload['role'],
      officeId: payload.officeId as string | null,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };

    c.set('user', user);
    c.set('officeId', user.officeId);

    await next();
  } catch {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
}

// Role-based access control middleware
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

// Office admin middleware - ensures user belongs to an office
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
