import { S3Service } from './s3.service';

interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface UploadServiceConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  cloudfrontUrl: string;
  cloudfrontKeyPairId: string;
  cloudfrontPrivateKey: string;
}

export class UploadService {
  private s3: S3Service;

  constructor(config: UploadServiceConfig) {
    this.s3 = new S3Service(config);
  }

  async generatePresignedUrl(
    folder: string,
    filename: string,
    contentType: string
  ): Promise<PresignedUrlResult> {
    const parts = folder.split('/');
    const baseFolder = parts[0] as 'maids' | 'documents' | 'logos';
    const officeId = parts[1] || 'default';

    const key = this.s3.generateKey(baseFolder, officeId, filename);
    return this.s3.generatePresignedUploadUrl(key, contentType);
  }

  async upload(
    key: string,
    file: ArrayBuffer,
    contentType: string
  ): Promise<string> {
    const result = await this.s3.upload(key, file, contentType);
    return result.publicUrl;
  }

  async delete(key: string): Promise<void> {
    await this.s3.delete(key);
  }

  async getSignedUrl(key: string, expiresIn = 86400): Promise<string> {
    return this.s3.generateSignedUrl(key, expiresIn);
  }

  async getPublicUrl(key: string): Promise<string> {
    return this.s3.getPublicUrl(key);
  }

  generateKey(
    folder: 'maids' | 'documents' | 'logos',
    officeId: string,
    filename: string
  ): string {
    return this.s3.generateKey(folder, officeId, filename);
  }
}
