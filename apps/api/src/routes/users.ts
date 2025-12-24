import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middleware';
import { updateProfileSchema, deleteAccountSchema } from '../validators/user.schema';

const usersRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET /users/me - Get current user profile
usersRoute.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const userService = new UserService(db);
    const profile = await userService.getProfile(user.sub, user.role);

    if (!profile) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    return c.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ success: false, error: 'Failed to get profile' }, 500);
  }
});

// PUT /users/me - Update current user profile
usersRoute.put(
  '/me',
  authMiddleware,
  zValidator('json', updateProfileSchema),
  async (c) => {
    const user = c.get('user');
    const input = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const userService = new UserService(db);
      const result = await userService.updateProfile(user.sub, user.role, input);

      return c.json({
        success: true,
        message: 'Profile updated successfully',
        data: result,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return c.json({ success: false, error: 'Failed to update profile' }, 500);
    }
  }
);

// DELETE /users/me - Delete user account
usersRoute.delete(
  '/me',
  authMiddleware,
  zValidator('json', deleteAccountSchema),
  async (c) => {
    const user = c.get('user');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const userService = new UserService(db);
      await userService.deleteAccount(user.sub);

      return c.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Delete account error:', error);
      return c.json({ success: false, error: 'Failed to delete account' }, 500);
    }
  }
);

export default usersRoute;
