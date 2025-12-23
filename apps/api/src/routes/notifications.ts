import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { NotificationService } from '../services/notification.service';
import { authMiddleware } from '../middleware';

const notificationsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply auth middleware to all routes
notificationsRoute.use('*', authMiddleware);

// Helper to create notification service
const createNotificationService = (db: ReturnType<typeof createDb>) => {
  return new NotificationService(db);
};

// Register push token
notificationsRoute.post(
  '/push-token',
  zValidator(
    'json',
    z.object({
      token: z.string().min(1),
      platform: z.enum(['ios', 'android']),
    })
  ),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    const { token, platform } = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const notificationService = createNotificationService(db);
      const result = await notificationService.savePushToken(user.sub, token, platform);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Save push token error:', error);
      return c.json({ success: false, error: 'Failed to save push token' }, 500);
    }
  }
);

// Remove push token
notificationsRoute.delete(
  '/push-token',
  zValidator(
    'json',
    z
      .object({
        token: z.string().optional(),
      })
      .optional()
  ),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    const body = c.req.valid('json');
    const token = body?.token;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const notificationService = createNotificationService(db);
      await notificationService.removePushToken(user.sub, token);
      return c.json({ success: true, data: { removed: true } });
    } catch (error) {
      console.error('Remove push token error:', error);
      return c.json({ success: false, error: 'Failed to remove push token' }, 500);
    }
  }
);

export default notificationsRoute;
