import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { UploadService } from '../services/upload.service';
import { authMiddleware, requireRole, officeMiddleware } from '../middleware';
import { uploadRateLimit } from '../middleware/rate-limit';

const uploadsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply upload rate limit to all upload routes
uploadsRoute.use('*', uploadRateLimit);

// Get presigned URL for upload
uploadsRoute.post(
  '/presign',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  zValidator('json', z.object({
    filename: z.string().min(1).max(255),
    contentType: z.string().regex(/^(image|application)\//),
    folder: z.enum(['maids', 'documents', 'logos']),
  })),
  async (c) => {
    const { filename, contentType, folder } = c.req.valid('json');
    const officeId = c.get('officeId')!;

    try {
      if (!c.env.BUCKET) {
        return c.json({ success: false, error: 'Storage not configured' }, 500);
      }
      const uploadService = new UploadService(c.env.BUCKET);

      // Include office ID in path for organization
      const folderPath = `${folder}/${officeId}`;
      const result = await uploadService.generatePresignedUrl(folderPath, filename, contentType);

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error('Presign error:', error);
      return c.json({ success: false, error: 'Failed to generate upload URL' }, 500);
    }
  }
);

// Direct file upload
uploadsRoute.post(
  '/file',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  async (c) => {
    const officeId = c.get('officeId')!;

    try {
      const formData = await c.req.formData();
      const file = formData.get('file') as File | null;
      const folder = formData.get('folder') as string || 'maids';

      if (!file) {
        return c.json({ success: false, error: 'No file provided' }, 400);
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return c.json({ success: false, error: 'Invalid file type' }, 400);
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return c.json({ success: false, error: 'File too large (max 10MB)' }, 400);
      }

      if (!c.env.BUCKET) {
        return c.json({ success: false, error: 'Storage not configured' }, 500);
      }
      const uploadService = new UploadService(c.env.BUCKET);

      // Generate key
      const timestamp = Date.now();
      const ext = file.name.split('.').pop() || 'bin';
      const key = `${folder}/${officeId}/${timestamp}.${ext}`;

      // Upload
      const arrayBuffer = await file.arrayBuffer();
      const url = await uploadService.upload(key, arrayBuffer, file.type);

      return c.json({
        success: true,
        data: { url, key },
      });
    } catch (error) {
      console.error('Upload error:', error);
      return c.json({ success: false, error: 'Failed to upload file' }, 500);
    }
  }
);

// Delete file
uploadsRoute.delete(
  '/:key',
  authMiddleware,
  requireRole('office_admin'),
  officeMiddleware,
  async (c) => {
    const key = c.req.param('key');
    const officeId = c.get('officeId')!;

    // Verify the file belongs to this office
    if (!key.includes(`/${officeId}/`)) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }

    try {
      if (!c.env.BUCKET) {
        return c.json({ success: false, error: 'Storage not configured' }, 500);
      }
      const uploadService = new UploadService(c.env.BUCKET);
      await uploadService.delete(key);

      return c.json({ success: true, message: 'File deleted' });
    } catch (error) {
      console.error('Delete file error:', error);
      return c.json({ success: false, error: 'Failed to delete file' }, 500);
    }
  }
);

export default uploadsRoute;
