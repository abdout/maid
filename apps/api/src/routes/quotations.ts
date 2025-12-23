import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { QuotationService } from '../services/quotation.service';
import { authMiddleware, requireRole, officeMiddleware } from '../middleware';

const quotationsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Customer: Request quotation
quotationsRoute.post(
  '/',
  authMiddleware,
  zValidator('json', z.object({
    maidId: z.string().uuid(),
    notes: z.string().max(500).optional(),
  })),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const quotationService = new QuotationService(db);

      const quotation = await quotationService.create(user.sub, data);

      return c.json({ success: true, data: quotation }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create quotation';
      console.error('Create quotation error:', error);
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Customer: List my quotations
quotationsRoute.get('/my', authMiddleware, async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('pageSize') || '20');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const quotationService = new QuotationService(db);

    const quotations = await quotationService.listForCustomer(user.sub, page, pageSize);

    return c.json({ success: true, data: quotations });
  } catch (error) {
    console.error('List customer quotations error:', error);
    return c.json({ success: false, error: 'Failed to list quotations' }, 500);
  }
});

// Office: List office quotations
quotationsRoute.get(
  '/office',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  async (c) => {
    const officeId = c.get('officeId')!;
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('pageSize') || '20');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const quotationService = new QuotationService(db);

      const quotations = await quotationService.listForOffice(officeId, page, pageSize);

      return c.json({ success: true, data: quotations });
    } catch (error) {
      console.error('List office quotations error:', error);
      return c.json({ success: false, error: 'Failed to list quotations' }, 500);
    }
  }
);

// Get quotation by ID
quotationsRoute.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const quotationService = new QuotationService(db);

    const quotation = await quotationService.getById(id);

    if (!quotation) {
      return c.json({ success: false, error: 'Quotation not found' }, 404);
    }

    // Check access
    const isCustomer = quotation.customerId === user.sub;
    const isOffice = user.officeId === quotation.officeId;

    if (!isCustomer && !isOffice) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }

    return c.json({ success: true, data: quotation });
  } catch (error) {
    console.error('Get quotation error:', error);
    return c.json({ success: false, error: 'Failed to get quotation' }, 500);
  }
});

// Office: Update quotation status
quotationsRoute.patch(
  '/:id/status',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  zValidator('json', z.object({
    status: z.enum(['sent', 'accepted', 'rejected']),
  })),
  async (c) => {
    const id = c.req.param('id');
    const { status } = c.req.valid('json');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const quotationService = new QuotationService(db);

      const quotation = await quotationService.updateStatus(id, officeId, status);

      if (!quotation) {
        return c.json({ success: false, error: 'Quotation not found' }, 404);
      }

      return c.json({ success: true, data: quotation });
    } catch (error) {
      console.error('Update quotation status error:', error);
      return c.json({ success: false, error: 'Failed to update status' }, 500);
    }
  }
);

// Office: Update quotation details
quotationsRoute.put(
  '/:id',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  zValidator('json', z.object({
    salary: z.number().positive().optional(),
    contractMonths: z.number().int().min(1).max(36).optional(),
    notes: z.string().max(1000).optional(),
  })),
  async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const quotationService = new QuotationService(db);

      const quotation = await quotationService.updateQuotation(id, officeId, data);

      if (!quotation) {
        return c.json({ success: false, error: 'Quotation not found' }, 404);
      }

      return c.json({ success: true, data: quotation });
    } catch (error) {
      console.error('Update quotation error:', error);
      return c.json({ success: false, error: 'Failed to update quotation' }, 500);
    }
  }
);

export default quotationsRoute;
