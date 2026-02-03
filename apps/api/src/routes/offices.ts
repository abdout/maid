import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { OfficeService } from '../services/office.service';
import { authMiddleware, requireRole, officeMiddleware } from '../middleware';
import { autoTranslateNames, autoTranslateAddresses } from '../lib/translate';

const officesRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Register new office
officesRoute.post(
  '/register',
  authMiddleware,
  zValidator('json', z.object({
    name: z.string().max(255).optional(),
    nameAr: z.string().max(255).optional(),
    phone: z.string().min(9).max(20),
    email: z.string().email().optional(),
    address: z.string().max(500).optional(),
    addressAr: z.string().max(500).optional(),
    logoUrl: z.string().url().optional(),
    scopes: z.array(z.enum(['recruitment', 'leasing', 'typing']))
      .min(1, 'At least one scope required')
      .default(['recruitment']),
    licenseNumber: z.string().max(100).optional(),
    licenseExpiry: z.string().optional().transform(val => val ? new Date(val) : undefined),
    licenseImageUrl: z.string().url().optional(),
    managerPhone1: z.string().max(20).optional(),
    managerPhone2: z.string().max(20).optional(),
    googleMapsUrl: z.string().url().optional(),
    emirate: z.string().max(50).optional(),
    website: z.string().max(255).optional(),
  }).refine(
    data => (data.name && data.name.length >= 2) || (data.nameAr && data.nameAr.length >= 2),
    { message: 'Either name or nameAr must have at least 2 characters', path: ['name'] }
  )),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    // Check if user already has an office
    if (user.officeId) {
      return c.json({ success: false, error: 'Already registered with an office' }, 400);
    }

    try {
      const db = createDb(c.env.DATABASE_URL);
      const officeService = new OfficeService(db);

      // Check if phone already registered
      const existing = await officeService.getByPhone(data.phone);
      if (existing) {
        return c.json({ success: false, error: 'Phone already registered' }, 400);
      }

      // Auto-translate missing name/nameAr and address/addressAr
      const [names, addresses] = await Promise.all([
        autoTranslateNames({ name: data.name, nameAr: data.nameAr }),
        autoTranslateAddresses({ address: data.address, addressAr: data.addressAr }),
      ]);

      const officeData = {
        ...data,
        name: names.name,
        nameAr: names.nameAr,
        address: addresses.address,
        addressAr: addresses.addressAr,
      };

      const office = await officeService.create(officeData, user.sub);

      return c.json({ success: true, data: office }, 201);
    } catch (error) {
      console.error('Register office error:', error);
      return c.json({ success: false, error: 'Failed to register office' }, 500);
    }
  }
);

// Get my office
officesRoute.get(
  '/me',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  async (c) => {
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const officeService = new OfficeService(db);

      const office = await officeService.getById(officeId);

      if (!office) {
        return c.json({ success: false, error: 'Office not found' }, 404);
      }

      return c.json({ success: true, data: office });
    } catch (error) {
      console.error('Get office error:', error);
      return c.json({ success: false, error: 'Failed to get office' }, 500);
    }
  }
);

// Update my office
officesRoute.put(
  '/me',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  zValidator('json', z.object({
    name: z.string().min(2).max(255).optional(),
    nameAr: z.string().max(255).optional(),
    email: z.string().email().optional(),
    address: z.string().max(500).optional(),
    addressAr: z.string().max(500).optional(),
    logoUrl: z.string().url().optional(),
  })),
  async (c) => {
    const data = c.req.valid('json');
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const officeService = new OfficeService(db);

      const office = await officeService.update(officeId, data);

      if (!office) {
        return c.json({ success: false, error: 'Office not found' }, 404);
      }

      return c.json({ success: true, data: office });
    } catch (error) {
      console.error('Update office error:', error);
      return c.json({ success: false, error: 'Failed to update office' }, 500);
    }
  }
);

// Get office stats
officesRoute.get(
  '/stats',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  async (c) => {
    const officeId = c.get('officeId')!;

    try {
      const db = createDb(c.env.DATABASE_URL);
      const officeService = new OfficeService(db);

      const stats = await officeService.getStats(officeId);

      return c.json({ success: true, data: stats });
    } catch (error) {
      console.error('Get office stats error:', error);
      return c.json({ success: false, error: 'Failed to get stats' }, 500);
    }
  }
);

// Public: Get office by ID (for customers viewing maid profiles)
officesRoute.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const officeService = new OfficeService(db);

    const office = await officeService.getById(id);

    if (!office) {
      return c.json({ success: false, error: 'Office not found' }, 404);
    }

    // Return limited info for public
    return c.json({
      success: true,
      data: {
        id: office.id,
        name: office.name,
        nameAr: office.nameAr,
        phone: office.phone,
        logoUrl: office.logoUrl,
        isVerified: office.isVerified,
      },
    });
  } catch (error) {
    console.error('Get office error:', error);
    return c.json({ success: false, error: 'Failed to get office' }, 500);
  }
});

export default officesRoute;
