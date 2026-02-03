import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { AdminService } from '../services/admin.service';
import { NotificationService } from '../services/notification.service';
import { BulkImportService, type RawImportRow, type ValidatedRow } from '../services/bulk-import.service';
import { authMiddleware } from '../middleware';
import { superAdminMiddleware } from '../middleware/admin';
import {
  createOfficeWithAdminSchema,
  approveOfficeSchema,
  resetOfficePasswordSchema,
  createMaidForOfficeSchema,
} from '../validators/admin.schema';

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

// Update office (verify/suspend)
adminRoute.patch(
  '/offices/:id',
  zValidator(
    'json',
    z.object({
      isVerified: z.boolean().optional(),
      isSuspended: z.boolean().optional(),
    })
  ),
  async (c) => {
    const officeId = c.req.param('id');
    const data = c.req.valid('json');
    const user = c.get('user');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.updateOffice(officeId, data);

      // Log audit action for suspension changes
      if (user && data.isSuspended !== undefined) {
        await adminService.logAuditAction(
          user.sub,
          data.isSuspended ? 'suspend_office' : 'resume_office',
          'office',
          officeId,
          JSON.stringify({ isSuspended: data.isSuspended })
        );
      }

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Update office error:', error);
      return c.json({ success: false, error: 'Failed to update office' }, 500);
    }
  }
);

// Suspend/resume office
adminRoute.patch(
  '/offices/:id/suspend',
  zValidator(
    'json',
    z.object({
      suspended: z.boolean(),
    })
  ),
  async (c) => {
    const officeId = c.req.param('id');
    const { suspended } = c.req.valid('json');
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.suspendOffice(officeId, suspended);

      // Log audit action
      await adminService.logAuditAction(
        user.sub,
        suspended ? 'suspend_office' : 'resume_office',
        'office',
        officeId,
        JSON.stringify({ suspended })
      );

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Suspend office error:', error);
      const message = error instanceof Error ? error.message : 'Failed to update office';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Delete office
adminRoute.delete('/offices/:id', async (c) => {
  const officeId = c.req.param('id');
  const user = c.get('user');

  if (!user) {
    return c.json({ success: false, error: 'Authentication required' }, 401);
  }

  try {
    const db = createDb(c.env.DATABASE_URL);
    const adminService = createAdminService(db);

    // Get office details before deletion for audit log
    const office = await adminService.getOfficeDetails(officeId);
    if (!office) {
      return c.json({ success: false, error: 'Office not found' }, 404);
    }

    await adminService.deleteOffice(officeId);

    // Log audit action
    await adminService.logAuditAction(
      user.sub,
      'delete_office',
      'office',
      officeId,
      JSON.stringify({ name: office.name, maidCount: office.stats.totalMaids })
    );

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete office error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete office';
    return c.json({ success: false, error: message }, 400);
  }
});

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

// List payments
adminRoute.get(
  '/payments',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded']).optional(),
      type: z.enum(['cv_unlock', 'subscription', 'business_subscription']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  ),
  async (c) => {
    const query = c.req.valid('query');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.listPayments(query);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('List payments error:', error);
      return c.json({ success: false, error: 'Failed to list payments' }, 500);
    }
  }
);

// Get payment stats
adminRoute.get('/payments/stats', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const adminService = createAdminService(db);
    const stats = await adminService.getPaymentStats();
    return c.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get payment stats error:', error);
    return c.json({ success: false, error: 'Failed to get payment stats' }, 500);
  }
});

// List CV unlocks
adminRoute.get(
  '/cv-unlocks',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  ),
  async (c) => {
    const query = c.req.valid('query');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.listCvUnlocks(query);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('List CV unlocks error:', error);
      return c.json({ success: false, error: 'Failed to list CV unlocks' }, 500);
    }
  }
);

// Get CV unlock stats
adminRoute.get('/cv-unlocks/stats', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const adminService = createAdminService(db);
    const stats = await adminService.getCvUnlockStats();
    return c.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get CV unlock stats error:', error);
    return c.json({ success: false, error: 'Failed to get CV unlock stats' }, 500);
  }
});

// List audit logs
adminRoute.get(
  '/audit-logs',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      action: z.string().optional(),
      targetType: z.string().optional(),
      adminId: z.string().uuid().optional(),
    })
  ),
  async (c) => {
    const query = c.req.valid('query');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.listAuditLogs(query);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('List audit logs error:', error);
      return c.json({ success: false, error: 'Failed to list audit logs' }, 500);
    }
  }
);

// List quotations
adminRoute.get(
  '/quotations',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      status: z.enum(['pending', 'sent', 'accepted', 'rejected', 'expired']).optional(),
      officeId: z.string().uuid().optional(),
    })
  ),
  async (c) => {
    const query = c.req.valid('query');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.listQuotations(query);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('List quotations error:', error);
      return c.json({ success: false, error: 'Failed to list quotations' }, 500);
    }
  }
);

// Update quotation status
adminRoute.patch(
  '/quotations/:id/status',
  zValidator(
    'json',
    z.object({
      status: z.enum(['pending', 'sent', 'accepted', 'rejected', 'expired']),
    })
  ),
  async (c) => {
    const quotationId = c.req.param('id');
    const { status } = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.updateQuotationStatus(quotationId, status);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Update quotation status error:', error);
      return c.json({ success: false, error: 'Failed to update quotation status' }, 500);
    }
  }
);

// Get maid details
adminRoute.get('/maids/:id', async (c) => {
  const maidId = c.req.param('id');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const adminService = createAdminService(db);
    const maid = await adminService.getMaid(maidId);

    if (!maid) {
      return c.json({ success: false, error: 'Maid not found' }, 404);
    }

    return c.json({ success: true, data: maid });
  } catch (error) {
    console.error('Get maid error:', error);
    return c.json({ success: false, error: 'Failed to get maid' }, 500);
  }
});

// Create maid
adminRoute.post(
  '/maids',
  zValidator(
    'json',
    z.object({
      officeId: z.string().uuid(),
      name: z.string().min(1).max(255),
      nameAr: z.string().max(255).optional(),
      nationalityId: z.string().uuid(),
      dateOfBirth: z.string(),
      maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
      religion: z.enum(['muslim', 'non_muslim']),
      experienceYears: z.number().int().min(0).optional(),
      salary: z.string(),
      photoUrl: z.string().optional(),
      status: z.enum(['available', 'inactive', 'busy', 'reserved']).optional(),
      serviceType: z.string().optional(),
      bio: z.string().optional(),
      bioAr: z.string().optional(),
      sex: z.enum(['male', 'female']).optional(),
      educationLevel: z.string().optional(),
      hasChildren: z.boolean().optional(),
      jobType: z.string().optional(),
      packageType: z.string().optional(),
      hasExperience: z.boolean().optional(),
      experienceDetails: z.string().max(70).optional(),
      skillsDetails: z.string().max(70).optional(),
      cookingSkills: z.string().optional(),
      babySitter: z.boolean().optional(),
      officeFees: z.string().optional(),
      availability: z.string().optional(),
      whatsappNumber: z.string().max(20).optional(),
      contactNumber: z.string().max(20).optional(),
      cvReference: z.string().max(50).optional(),
      languageIds: z.array(z.string().uuid()).optional(),
    })
  ),
  async (c) => {
    const data = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const maid = await adminService.createMaid(data);

      // Log audit action
      const user = c.get('user');
      if (user) {
        await adminService.logAuditAction(
          user.sub,
          'create_maid',
          'maid',
          maid.id,
          JSON.stringify({ name: data.name, officeId: data.officeId })
        );
      }

      return c.json({ success: true, data: maid }, 201);
    } catch (error) {
      console.error('Create maid error:', error);
      return c.json({ success: false, error: 'Failed to create maid' }, 500);
    }
  }
);

// Update maid
adminRoute.put(
  '/maids/:id',
  zValidator(
    'json',
    z.object({
      officeId: z.string().uuid().optional(),
      name: z.string().min(1).max(255).optional(),
      nameAr: z.string().max(255).optional(),
      nationalityId: z.string().uuid().optional(),
      dateOfBirth: z.string().optional(),
      maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
      religion: z.enum(['muslim', 'non_muslim']).optional(),
      experienceYears: z.number().int().min(0).optional(),
      salary: z.string().optional(),
      photoUrl: z.string().optional(),
      status: z.enum(['available', 'inactive', 'busy', 'reserved']).optional(),
      serviceType: z.string().optional(),
      bio: z.string().optional(),
      bioAr: z.string().optional(),
      sex: z.enum(['male', 'female']).optional(),
      educationLevel: z.string().optional(),
      hasChildren: z.boolean().optional(),
      jobType: z.string().optional(),
      packageType: z.string().optional(),
      hasExperience: z.boolean().optional(),
      experienceDetails: z.string().max(70).optional(),
      skillsDetails: z.string().max(70).optional(),
      cookingSkills: z.string().optional(),
      babySitter: z.boolean().optional(),
      officeFees: z.string().optional(),
      availability: z.string().optional(),
      whatsappNumber: z.string().max(20).optional(),
      contactNumber: z.string().max(20).optional(),
      cvReference: z.string().max(50).optional(),
      languageIds: z.array(z.string().uuid()).optional(),
    })
  ),
  async (c) => {
    const maidId = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const maid = await adminService.updateMaid(maidId, data);

      // Log audit action
      const user = c.get('user');
      if (user) {
        await adminService.logAuditAction(
          user.sub,
          'update_maid',
          'maid',
          maidId,
          JSON.stringify(data)
        );
      }

      return c.json({ success: true, data: maid });
    } catch (error) {
      console.error('Update maid error:', error);
      return c.json({ success: false, error: 'Failed to update maid' }, 500);
    }
  }
);

// Delete maid
adminRoute.delete('/maids/:id', async (c) => {
  const maidId = c.req.param('id');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const adminService = createAdminService(db);

    // Get maid details before deletion for audit log
    const maid = await adminService.getMaid(maidId);
    if (!maid) {
      return c.json({ success: false, error: 'Maid not found' }, 404);
    }

    await adminService.deleteMaid(maidId);

    // Log audit action
    const user = c.get('user');
    if (user) {
      await adminService.logAuditAction(
        user.sub,
        'delete_maid',
        'maid',
        maidId,
        JSON.stringify({ name: maid.name, officeId: maid.officeId })
      );
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete maid error:', error);
    return c.json({ success: false, error: 'Failed to delete maid' }, 500);
  }
});

// Add maid document
adminRoute.post(
  '/maids/:id/documents',
  zValidator(
    'json',
    z.object({
      type: z.string().min(1).max(50),
      url: z.string().url(),
    })
  ),
  async (c) => {
    const maidId = c.req.param('id');
    const { type, url } = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const doc = await adminService.addMaidDocument(maidId, type, url);
      return c.json({ success: true, data: doc }, 201);
    } catch (error) {
      console.error('Add maid document error:', error);
      return c.json({ success: false, error: 'Failed to add document' }, 500);
    }
  }
);

// Delete maid document
adminRoute.delete('/maids/documents/:documentId', async (c) => {
  const documentId = c.req.param('documentId');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const adminService = createAdminService(db);
    await adminService.deleteMaidDocument(documentId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete maid document error:', error);
    return c.json({ success: false, error: 'Failed to delete document' }, 500);
  }
});

// List nationalities
adminRoute.get('/nationalities', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const adminService = createAdminService(db);
    const nationalities = await adminService.listNationalities();
    return c.json({ success: true, data: nationalities });
  } catch (error) {
    console.error('List nationalities error:', error);
    return c.json({ success: false, error: 'Failed to list nationalities' }, 500);
  }
});

// List languages
adminRoute.get('/languages', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const adminService = createAdminService(db);
    const languages = await adminService.listLanguages();
    return c.json({ success: true, data: languages });
  } catch (error) {
    console.error('List languages error:', error);
    return c.json({ success: false, error: 'Failed to list languages' }, 500);
  }
});

// ==========================================
// BULK IMPORT ENDPOINTS
// ==========================================

// Get bulk import template columns
adminRoute.get('/maids/bulk-import/template', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const bulkImportService = new BulkImportService(db);
    const columns = bulkImportService.getTemplateColumns();
    return c.json({ success: true, data: { columns } });
  } catch (error) {
    console.error('Get template error:', error);
    return c.json({ success: false, error: 'Failed to get template' }, 500);
  }
});

// Get lookup maps for bulk import (nationalities, languages, offices)
adminRoute.get('/maids/bulk-import/lookups', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const bulkImportService = new BulkImportService(db);
    const lookups = await bulkImportService.getLookupMaps();
    return c.json({ success: true, data: lookups });
  } catch (error) {
    console.error('Get lookups error:', error);
    return c.json({ success: false, error: 'Failed to get lookups' }, 500);
  }
});

// Validate bulk import rows
adminRoute.post(
  '/maids/bulk-import/validate',
  zValidator(
    'json',
    z.object({
      rows: z.array(
        z.object({
          row_number: z.number(),
          office_name: z.string(),
          name: z.string(),
          name_ar: z.string().optional(),
          nationality: z.string(),
          date_of_birth: z.string(),
          marital_status: z.string(),
          religion: z.string(),
          salary: z.string(),
          experience_years: z.string().optional(),
          service_type: z.string().optional(),
          languages: z.string().optional(),
          whatsapp_number: z.string().optional(),
          contact_number: z.string().optional(),
          cv_reference: z.string().optional(),
          sex: z.string().optional(),
          education_level: z.string().optional(),
          has_children: z.string().optional(),
          job_type: z.string().optional(),
          package_type: z.string().optional(),
          cooking_skills: z.string().optional(),
          baby_sitter: z.string().optional(),
          office_fees: z.string().optional(),
          availability: z.string().optional(),
          bio: z.string().optional(),
          bio_ar: z.string().optional(),
        })
      ).min(1).max(500),
    })
  ),
  async (c) => {
    const { rows } = c.req.valid('json');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const bulkImportService = new BulkImportService(db);
      const validation = await bulkImportService.validateRows(rows as RawImportRow[]);
      return c.json({ success: true, data: validation });
    } catch (error) {
      console.error('Validate rows error:', error);
      return c.json({ success: false, error: 'Failed to validate rows' }, 500);
    }
  }
);

// Execute bulk import
adminRoute.post(
  '/maids/bulk-import',
  zValidator(
    'json',
    z.object({
      rows: z.array(
        z.object({
          officeId: z.string().uuid(),
          name: z.string().min(1).max(255),
          nameAr: z.string().max(255).optional(),
          nationalityId: z.string().uuid(),
          dateOfBirth: z.string(),
          maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
          religion: z.enum(['muslim', 'non_muslim']),
          salary: z.string(),
          experienceYears: z.number().int().min(0).max(50),
          serviceType: z.enum(['individual', 'business', 'cleaning', 'cooking', 'babysitter', 'elderly', 'driver']),
          languageIds: z.array(z.string().uuid()),
          whatsappNumber: z.string().max(20).optional(),
          contactNumber: z.string().max(20).optional(),
          cvReference: z.string().max(50).optional(),
          sex: z.enum(['male', 'female']).optional(),
          educationLevel: z.enum(['college', 'high_school', 'primary', 'none']).optional(),
          hasChildren: z.boolean().optional(),
          jobType: z.enum(['domestic_worker', 'nurse_caregiver', 'driver']).optional(),
          packageType: z.enum(['traditional', 'flexible', 'hourly']).optional(),
          cookingSkills: z.enum(['good', 'average', 'willing_to_learn', 'none']).optional(),
          babySitter: z.boolean().optional(),
          officeFees: z.string().optional(),
          availability: z.enum(['inside_uae', 'outside_uae']).optional(),
          bio: z.string().max(1000).optional(),
          bioAr: z.string().max(1000).optional(),
        })
      ).min(1).max(500),
    })
  ),
  async (c) => {
    const { rows } = c.req.valid('json');
    const user = c.get('user');

    try {
      const db = createDb(c.env.DATABASE_URL);
      const bulkImportService = new BulkImportService(db);
      const adminService = createAdminService(db);

      const result = await bulkImportService.createMaids(rows as ValidatedRow[]);

      // Log audit action
      if (user) {
        await adminService.logAuditAction(
          user.sub,
          'bulk_import_maids',
          'maid',
          'bulk',
          JSON.stringify({
            attempted: rows.length,
            created: result.created,
            failed: result.failed,
          })
        );
      }

      return c.json({ success: true, data: result }, 201);
    } catch (error) {
      console.error('Bulk import error:', error);
      return c.json({ success: false, error: 'Failed to import maids' }, 500);
    }
  }
);

// ==========================================
// OFFICE MANAGEMENT ENDPOINTS
// ==========================================

// Create office with admin account
adminRoute.post(
  '/offices',
  zValidator('json', createOfficeWithAdminSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.createOfficeWithAdmin(data, user.sub);

      // Log audit action
      await adminService.logAuditAction(
        user.sub,
        'create_office',
        'office',
        result.office.id,
        JSON.stringify({
          officeName: data.office.name,
          adminEmail: data.admin.email,
          autoVerify: data.autoVerify,
        })
      );

      return c.json({ success: true, data: result }, 201);
    } catch (error) {
      console.error('Create office error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create office';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Get office details
adminRoute.get('/offices/:id', async (c) => {
  const officeId = c.req.param('id');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const adminService = createAdminService(db);
    const office = await adminService.getOfficeDetails(officeId);

    if (!office) {
      return c.json({ success: false, error: 'Office not found' }, 404);
    }

    return c.json({ success: true, data: office });
  } catch (error) {
    console.error('Get office details error:', error);
    return c.json({ success: false, error: 'Failed to get office details' }, 500);
  }
});

// Approve or reject office
adminRoute.post(
  '/offices/:id/approve',
  zValidator('json', approveOfficeSchema),
  async (c) => {
    const officeId = c.req.param('id');
    const data = c.req.valid('json');
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.approveOffice(officeId, data);

      // Log audit action
      await adminService.logAuditAction(
        user.sub,
        data.approved ? 'approve_office' : 'reject_office',
        'office',
        officeId,
        JSON.stringify({
          approved: data.approved,
          reason: data.reason,
        })
      );

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Approve office error:', error);
      const message = error instanceof Error ? error.message : 'Failed to update office';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Reset office admin password
adminRoute.post(
  '/offices/:id/reset-password',
  zValidator('json', resetOfficePasswordSchema),
  async (c) => {
    const officeId = c.req.param('id');
    const data = c.req.valid('json');
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const result = await adminService.resetOfficeAdminPassword(data);

      // Log audit action
      await adminService.logAuditAction(
        user.sub,
        'reset_office_password',
        'user',
        data.adminUserId,
        JSON.stringify({ officeId })
      );

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Reset password error:', error);
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// Create maid for a specific office
adminRoute.post(
  '/offices/:officeId/maids',
  zValidator('json', createMaidForOfficeSchema),
  async (c) => {
    const officeId = c.req.param('officeId');
    const data = c.req.valid('json');
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    try {
      const db = createDb(c.env.DATABASE_URL);
      const adminService = createAdminService(db);
      const maid = await adminService.createMaidForOffice(officeId, data);

      // Log audit action
      await adminService.logAuditAction(
        user.sub,
        'create_maid_for_office',
        'maid',
        maid.id,
        JSON.stringify({
          officeId,
          maidName: data.name,
        })
      );

      return c.json({ success: true, data: maid }, 201);
    } catch (error) {
      console.error('Create maid for office error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create maid';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

export default adminRoute;
