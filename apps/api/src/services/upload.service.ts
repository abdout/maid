import type { R2Bucket } from '@cloudflare/workers-types';

interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export class UploadService {
  constructor(private bucket: R2Bucket) {}

  async generatePresignedUrl(
    folder: string,
    filename: string,
    contentType: string
  ): Promise<PresignedUrlResult> {
    // Generate unique key
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${sanitizedFilename}`;

    // For R2, we use a custom upload endpoint
    // The actual presigned URL generation requires custom implementation
    // Here we return the key and let the client upload via our endpoint
    return {
      uploadUrl: `/uploads/file`, // Our upload endpoint
      publicUrl: `https://cdn.maid.ae/${key}`, // Public CDN URL
      key,
    };
  }

  async upload(
    key: string,
    file: ArrayBuffer,
    contentType: string
  ): Promise<string> {
    await this.bucket.put(key, file, {
      httpMetadata: {
        contentType,
      },
    });

    return `https://cdn.maid.ae/${key}`;
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    // R2 doesn't have native signed URLs like S3
    // We return the public URL assuming the bucket is public
    // For private files, implement a proxy endpoint
    return `https://cdn.maid.ae/${key}`;
  }
}
