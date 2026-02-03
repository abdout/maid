import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { BusinessService } from '../services/business.service';
import { authMiddleware, requireRole } from '../middleware';
import { searchRateLimit } from '../middleware/rate-limit';
import {
  businessFiltersSchema,
  createBusinessSchema,
  updateBusinessSchema,
} from '../validators/business.schema';

const businessesRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Public: List businesses with filters (rate limited)
businessesRoute.get('/', searchRateLimit, zValidator('query', businessFiltersSchema), async (c) => {
  const filters = c.req.valid('query');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const businessService = new BusinessService(db);

    const result = await businessService.list(filters);

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('List businesses error:', error);
    return c.json({ success: false, error: 'Failed to list businesses' }, 500);
  }
});

// Public: Get business by ID
businessesRoute.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const businessService = new BusinessService(db);

    const result = await businessService.getById(id);

    if (!result) {
      return c.json({ success: false, error: 'Business not found' }, 404);
    }

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Get business error:', error);
    return c.json({ success: false, error: 'Failed to get business' }, 500);
  }
});

// Admin: Create business
businessesRoute.post(
  '/',
  authMiddleware,
  requireRole('super_admin'),
  zValidator('json', createBusinessSchema),
  async (c) => {
    const data = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const businessService = new BusinessService(db);

      const business = await businessService.create(data);

      return c.json({ success: true, data: business }, 201);
    } catch (error) {
      console.error('Create business error:', error);
      return c.json({ success: false, error: 'Failed to create business' }, 500);
    }
  }
);

// Admin: Update business
businessesRoute.put(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  zValidator('json', updateBusinessSchema),
  async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const businessService = new BusinessService(db);

      const business = await businessService.update(id, data);

      if (!business) {
        return c.json({ success: false, error: 'Business not found' }, 404);
      }

      return c.json({ success: true, data: business });
    } catch (error) {
      console.error('Update business error:', error);
      return c.json({ success: false, error: 'Failed to update business' }, 500);
    }
  }
);

// Admin: Delete business (soft delete)
businessesRoute.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  async (c) => {
    const id = c.req.param('id');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const businessService = new BusinessService(db);

      const deleted = await businessService.delete(id);

      if (!deleted) {
        return c.json({ success: false, error: 'Business not found' }, 404);
      }

      return c.json({ success: true, message: 'Business deleted' });
    } catch (error) {
      console.error('Delete business error:', error);
      return c.json({ success: false, error: 'Failed to delete business' }, 500);
    }
  }
);

export default businessesRoute;
