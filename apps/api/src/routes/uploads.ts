import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { UploadService } from '../services/upload.service';
import { authMiddleware, requireRole, officeMiddleware } from '../middleware';
import { uploadRateLimit } from '../middleware/rate-limit';

const uploadsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

function createUploadService(env: Bindings): UploadService {
  return new UploadService({
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    bucketName: env.S3_BUCKET_NAME,
    cloudfrontUrl: env.CLOUDFRONT_URL,
    cloudfrontKeyPairId: env.CLOUDFRONT_KEY_PAIR_ID,
    cloudfrontPrivateKey: env.CLOUDFRONT_PRIVATE_KEY,
  });
}

// Apply upload rate limit to all upload routes
uploadsRoute.use('*', uploadRateLimit);

// Get presigned URL for upload
uploadsRoute.post(
  '/presign',
  authMiddleware,
  zValidator('json', z.object({
    filename: z.string().min(1).max(255),
    contentType: z.string().regex(/^(image|application)\//),
    folder: z.enum(['maids', 'documents', 'logos']),
  })),
  async (c) => {
    const { filename, contentType, folder } = c.req.valid('json');
    const user = c.get('user');
    // Use officeId for tenant isolation, or 'public' for users without office
    const officeId = user?.officeId || 'public';

    try {
      const uploadService = createUploadService(c.env);
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
  async (c) => {
    const user = c.get('user');
    // Use officeId for tenant isolation, or 'public' for users without office
    const officeId = user?.officeId || 'public';

    try {
      const formData = await c.req.formData();
      const file = formData.get('file') as File | null;
      const folder = formData.get('folder') as string || 'maids';

      console.log('[Upload] Received upload request:', {
        hasFile: !!file,
        fileName: file?.name,
        fileType: file?.type,
        fileSize: file?.size,
        folder,
        officeId,
      });

      if (!file) {
        console.log('[Upload] ERROR: No file provided');
        return c.json({ success: false, error: 'No file provided' }, 400);
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      console.log('[Upload] Checking file type:', JSON.stringify(file.type), 'allowed:', allowedTypes);
      if (!allowedTypes.includes(file.type)) {
        console.log('[Upload] ERROR: Invalid file type:', file.type);
        return c.json({ success: false, error: `Invalid file type: ${file.type}` }, 400);
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return c.json({ success: false, error: 'File too large (max 10MB)' }, 400);
      }

      const uploadService = createUploadService(c.env);

      // Generate key with tenant isolation
      const validFolder = folder as 'maids' | 'documents' | 'logos';
      const key = uploadService.generateKey(validFolder, officeId, file.name);

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

// Get signed URL for private document access
uploadsRoute.get(
  '/signed/:key',
  authMiddleware,
  async (c) => {
    const key = decodeURIComponent(c.req.param('key'));

    try {
      const uploadService = createUploadService(c.env);
      const signedUrl = await uploadService.getSignedUrl(key);

      return c.json({
        success: true,
        data: { url: signedUrl },
      });
    } catch (error) {
      console.error('Signed URL error:', error);
      return c.json({ success: false, error: 'Failed to generate signed URL' }, 500);
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
      const uploadService = createUploadService(c.env);
      await uploadService.delete(key);

      return c.json({ success: true, message: 'File deleted' });
    } catch (error) {
      console.error('Delete file error:', error);
      return c.json({ success: false, error: 'Failed to delete file' }, 500);
    }
  }
);

// TEST ONLY: Unauthenticated upload for testing
uploadsRoute.post(
  '/test',
  async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get('file') as File | null;
      const folder = formData.get('folder') as string || 'maids';

      console.log('[Upload Test] Received:', {
        hasFile: !!file,
        fileName: file?.name,
        fileType: file?.type,
        fileSize: file?.size,
        folder,
      });

      if (!file) {
        return c.json({ success: false, error: 'No file provided' }, 400);
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        console.log('[Upload Test] Invalid type:', file.type);
        return c.json({ success: false, error: `Invalid file type: ${file.type}` }, 400);
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return c.json({ success: false, error: 'File too large (max 10MB)' }, 400);
      }

      const uploadService = createUploadService(c.env);
      const key = uploadService.generateKey(folder as 'maids' | 'documents' | 'logos', 'test', file.name);
      const arrayBuffer = await file.arrayBuffer();
      const url = await uploadService.upload(key, arrayBuffer, file.type);

      console.log('[Upload Test] Success:', url);
      return c.json({ success: true, data: { url, key } });
    } catch (error) {
      console.error('[Upload Test] Error:', error);
      return c.json({ success: false, error: 'Upload failed' }, 500);
    }
  }
);

export default uploadsRoute;
