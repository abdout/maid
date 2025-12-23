import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { AdminService } from '../services/admin.service';
import { NotificationService } from '../services/notification.service';
import { authMiddleware } from '../middleware';
import { superAdminMiddleware } from '../middleware/admin';

const adminRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply auth and admin middleware to all routes
adminRoute.use('*', authMiddleware, superAdminMiddleware);

// Helper to create admin service
const createAdminService = (db: ReturnType<typeof createDb>) => {
  return new AdminService(db);
};

// Get platform stats
adminRoute.get('/stats', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const adminService = createAdminService(db);
    const stats = await adminService.getPlatformStats();
    return c.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ success: false, error: 'Failed to get stats' }, 500);
  }
});

// List all maids
adminRoute.get(
  '/maids',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      search: z.string().optional(),
      status: z.enum(['available', 'inactive', 'busy', 'reserved']).optional(),
      officeId: z.string().uuid().optional(),
    })
  ),
  async (c) => {
    const { page, pageSize, search, status, officeId } = c.req.valid('query');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.listMaids({
        page,
        pageSize,
        search,
        status,
        officeId,
      });
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('List maids error:', error);
      return c.json({ success: false, error: 'Failed to list maids' }, 500);
    }
  }
);

// Update maid status (publish/unpublish)
adminRoute.patch(
  '/maids/:id/status',
  zValidator(
    'json',
    z.object({
      status: z.enum(['available', 'inactive', 'busy', 'reserved']),
    })
  ),
  async (c) => {
    const maidId = c.req.param('id');
    const { status } = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.updateMaidStatus(maidId, status);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Update maid status error:', error);
      return c.json({ success: false, error: 'Failed to update status' }, 500);
    }
  }
);

// Bulk update maid status
adminRoute.patch(
  '/maids/bulk-status',
  zValidator(
    'json',
    z.object({
      ids: z.array(z.string().uuid()).min(1),
      status: z.enum(['available', 'inactive', 'busy', 'reserved']),
    })
  ),
  async (c) => {
    const { ids, status } = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.bulkUpdateMaidStatus(ids, status);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Bulk update status error:', error);
      return c.json({ success: false, error: 'Failed to bulk update' }, 500);
    }
  }
);

// List all offices
adminRoute.get(
  '/offices',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      search: z.string().optional(),
      isVerified: z
        .string()
        .optional()
        .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
    })
  ),
  async (c) => {
    const { page, pageSize, search, isVerified } = c.req.valid('query');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.listOffices({
        page,
        pageSize,
        search,
        isVerified,
      });
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('List offices error:', error);
      return c.json({ success: false, error: 'Failed to list offices' }, 500);
    }
  }
);

// Update office (verify)
adminRoute.patch(
  '/offices/:id',
  zValidator(
    'json',
    z.object({
      isVerified: z.boolean().optional(),
    })
  ),
  async (c) => {
    const officeId = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.updateOffice(officeId, data);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Update office error:', error);
      return c.json({ success: false, error: 'Failed to update office' }, 500);
    }
  }
);

// List all users
adminRoute.get(
  '/users',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      search: z.string().optional(),
      role: z.enum(['customer', 'office_admin', 'super_admin']).optional(),
    })
  ),
  async (c) => {
    const { page, pageSize, search, role } = c.req.valid('query');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.listUsers({
        page,
        pageSize,
        search,
        role,
      });
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('List users error:', error);
      return c.json({ success: false, error: 'Failed to list users' }, 500);
    }
  }
);

// Send mass notification
adminRoute.post(
  '/notifications/send',
  zValidator(
    'json',
    z.object({
      title: z.string().min(1).max(100),
      body: z.string().min(1).max(500),
      titleAr: z.string().max(100).optional(),
      bodyAr: z.string().max(500).optional(),
      targetRole: z.enum(['customer', 'office_admin']).optional(),
    })
  ),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    const { title, body, titleAr, bodyAr, targetRole } = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const notificationService = new NotificationService(db);
      const result = await notificationService.sendMassNotification(
        user.sub,
        title,
        body,
        titleAr,
        bodyAr,
        targetRole
      );
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Send notification error:', error);
      return c.json({ success: false, error: 'Failed to send notification' }, 500);
    }
  }
);

// Get notification history
adminRoute.get(
  '/notifications/history',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
    })
  ),
  async (c) => {
    const { page, pageSize } = c.req.valid('query');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const notificationService = new NotificationService(db);
      const result = await notificationService.getNotificationHistory(page, pageSize);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Get notification history error:', error);
      return c.json({ success: false, error: 'Failed to get notification history' }, 500);
    }
  }
);

export default adminRoute;
