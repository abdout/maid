import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { MaidService } from '../services/maid.service';
import { authMiddleware, requireRole, officeMiddleware } from '../middleware';
import { searchRateLimit } from '../middleware/rate-limit';
import {
  createMaidSchema,
  updateMaidSchema,
  maidFiltersSchema,
} from '../validators/maid.schema';
import { autoTranslateNames, autoTranslateBios } from '../lib/translate';

const maidsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Public: List available maids with filters (rate limited for search)
maidsRoute.get('/', searchRateLimit, zValidator('query', maidFiltersSchema), async (c) => {
  const filters = c.req.valid('query');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const maidService = new MaidService(db);

    const result = await maidService.list(filters);

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('List maids error:', error);
    return c.json({ success: false, error: 'Failed to list maids' }, 500);
  }
});

// Public: Get maid by ID with unlock status
// Uses optional auth to check if user has unlocked the CV
maidsRoute.get('/:id', async (c) => {
  const id = c.req.param('id');

  // Try to get user from optional auth header
  let customerId: string | undefined;
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const { jwtVerify } = await import('jose');
      const secret = new TextEncoder().encode(c.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      customerId = payload.sub as string;
    } catch {
      // Invalid token, continue as unauthenticated
    }
  }

  try {
    const db = createDb(c.env.DATABASE_URL);
    const maidService = new MaidService(db);

    // Use the new method that includes unlock status and masked office info
    const result = await maidService.getByIdWithUnlockStatus(id, customerId);

    if (!result) {
      return c.json({ success: false, error: 'Maid not found' }, 404);
    }

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Get maid error:', error);
    return c.json({ success: false, error: 'Failed to get maid' }, 500);
  }
});

// Office: List office's maids
maidsRoute.get(
  '/office/list',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  zValidator('query', maidFiltersSchema),
  async (c) => {
    const filters = c.req.valid('query');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const maidService = new MaidService(db);

      const result = await maidService.list(filters, officeId);

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('List office maids error:', error);
      return c.json({ success: false, error: 'Failed to list maids' }, 500);
    }
  }
);

// Office: Create maid
maidsRoute.post(
  '/',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  zValidator('json', createMaidSchema),
  async (c) => {
    const data = c.req.valid('json');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const maidService = new MaidService(db);

      // Auto-translate missing name/nameAr and bio/bioAr
      const [names, bios] = await Promise.all([
        autoTranslateNames({ name: data.name, nameAr: data.nameAr }),
        autoTranslateBios({ bio: data.bio, bioAr: data.bioAr }),
      ]);

      const maidData = {
        ...data,
        name: names.name,
        nameAr: names.nameAr,
        bio: bios.bio,
        bioAr: bios.bioAr,
      };

      const maid = await maidService.create(officeId, maidData);

      return c.json({ success: true, data: maid }, 201);
    } catch (error) {
      console.error('Create maid error:', error);
      return c.json({ success: false, error: 'Failed to create maid' }, 500);
    }
  }
);

// Office: Update maid
maidsRoute.put(
  '/:id',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  zValidator('json', updateMaidSchema),
  async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const maidService = new MaidService(db);

      // Auto-translate missing name/nameAr and bio/bioAr if provided
      const translations: Promise<{ name?: string; nameAr?: string } | { bio?: string; bioAr?: string }>[] = [];

      if (data.name !== undefined || data.nameAr !== undefined) {
        translations.push(autoTranslateNames({ name: data.name, nameAr: data.nameAr }));
      }
      if (data.bio !== undefined || data.bioAr !== undefined) {
        translations.push(autoTranslateBios({ bio: data.bio, bioAr: data.bioAr }));
      }

      const results = await Promise.all(translations);

      let maidData = { ...data };
      for (const result of results) {
        maidData = { ...maidData, ...result };
      }

      const maid = await maidService.update(id, officeId, maidData);

      if (!maid) {
        return c.json({ success: false, error: 'Maid not found' }, 404);
      }

      return c.json({ success: true, data: maid });
    } catch (error) {
      console.error('Update maid error:', error);
      return c.json({ success: false, error: 'Failed to update maid' }, 500);
    }
  }
);

// Office: Delete maid
maidsRoute.delete(
  '/:id',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  async (c) => {
    const id = c.req.param('id');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const maidService = new MaidService(db);

      const deleted = await maidService.delete(id, officeId);

      if (!deleted) {
        return c.json({ success: false, error: 'Maid not found' }, 404);
      }

      return c.json({ success: true, message: 'Maid deleted' });
    } catch (error) {
      console.error('Delete maid error:', error);
      return c.json({ success: false, error: 'Failed to delete maid' }, 500);
    }
  }
);

// Office: Update maid status
maidsRoute.patch(
  '/:id/status',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  zValidator('json', z.object({
    status: z.enum(['available', 'busy', 'reserved', 'inactive']),
  })),
  async (c) => {
    const id = c.req.param('id');
    const { status } = c.req.valid('json');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const maidService = new MaidService(db);

      const maid = await maidService.updateStatus(id, officeId, status);

      if (!maid) {
        return c.json({ success: false, error: 'Maid not found' }, 404);
      }

      return c.json({ success: true, data: maid });
    } catch (error) {
      console.error('Update status error:', error);
      return c.json({ success: false, error: 'Failed to update status' }, 500);
    }
  }
);

// Office: Add document to maid
maidsRoute.post(
  '/:id/documents',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  zValidator('json', z.object({
    type: z.string().min(1).max(50),
    url: z.string().url(),
  })),
  async (c) => {
    const maidId = c.req.param('id');
    const { type, url } = c.req.valid('json');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const maidService = new MaidService(db);

      const doc = await maidService.addDocument(maidId, officeId, type, url);

      if (!doc) {
        return c.json({ success: false, error: 'Maid not found' }, 404);
      }

      return c.json({ success: true, data: doc }, 201);
    } catch (error) {
      console.error('Add document error:', error);
      return c.json({ success: false, error: 'Failed to add document' }, 500);
    }
  }
);

// Office: Remove document
maidsRoute.delete(
  '/documents/:documentId',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  async (c) => {
    const documentId = c.req.param('documentId');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const maidService = new MaidService(db);

      const deleted = await maidService.removeDocument(documentId, officeId);

      if (!deleted) {
        return c.json({ success: false, error: 'Document not found' }, 404);
      }

      return c.json({ success: true, message: 'Document deleted' });
    } catch (error) {
      console.error('Remove document error:', error);
      return c.json({ success: false, error: 'Failed to remove document' }, 500);
    }
  }
);

export default maidsRoute;
