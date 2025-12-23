import { Context, Next } from 'hono';
import type { Bindings, Variables } from '../types';

export async function superAdminMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const user = c.get('user');

  if (!user) {
    return c.json({ success: false, error: 'Authentication required' }, 401);
  }

  if (user.role !== 'super_admin') {
    return c.json({ success: false, error: 'Admin access required' }, 403);
  }

  await next();
}
