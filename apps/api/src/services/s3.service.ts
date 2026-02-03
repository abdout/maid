import { AwsClient } from 'aws4fetch';

interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  cloudfrontUrl: string;
  cloudfrontKeyPairId: string;
  cloudfrontPrivateKey: string;
}

interface UploadResult {
  key: string;
  publicUrl: string;
}

interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

type PublicFolder = 'maids' | 'logos';
type PrivateFolder = 'documents';
type UploadFolder = PublicFolder | PrivateFolder;

export class S3Service {
  private aws: AwsClient;
  private bucketName: string;
  private region: string;
  private cloudfrontUrl: string;
  private cloudfrontKeyPairId: string;
  private cloudfrontPrivateKey: string;

  constructor(config: S3Config) {
    this.aws = new AwsClient({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      service: 's3',
      region: config.region,
    });
    this.bucketName = config.bucketName;
    this.region = config.region;
    this.cloudfrontUrl = config.cloudfrontUrl;
    this.cloudfrontKeyPairId = config.cloudfrontKeyPairId;
    this.cloudfrontPrivateKey = config.cloudfrontPrivateKey;
  }

  private get s3Endpoint(): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
  }

  private isPrivateFolder(key: string): boolean {
    return key.startsWith('documents/') || key.startsWith('documents');
  }

  generateKey(folder: UploadFolder, officeId: string, filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = sanitizedFilename.split('.').pop() || 'bin';
    return `${folder}/${officeId}/${timestamp}.${ext}`;
  }

  async upload(
    key: string,
    file: ArrayBuffer,
    contentType: string
  ): Promise<UploadResult> {
    const url = `${this.s3Endpoint}/${key}`;

    const response = await this.aws.fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(file.byteLength),
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`S3 upload failed: ${response.status} - ${errorText}`);
    }

    // Always generate signed URLs since S3 bucket has block public access enabled
    // Signed URLs expire in 7 days for maids/logos, 1 day for documents
    const expiresIn = this.isPrivateFolder(key) ? 24 * 60 * 60 : 7 * 24 * 60 * 60;
    const publicUrl = await this.generateSignedUrl(key, expiresIn);

    return { key, publicUrl };
  }

  async delete(key: string): Promise<void> {
    const url = `${this.s3Endpoint}/${key}`;

    const response = await this.aws.fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(`S3 delete failed: ${response.status} - ${errorText}`);
    }
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600
  ): Promise<PresignedUrlResult> {
    const endpoint = `${this.s3Endpoint}/${key}`;

    const signedRequest = await this.aws.sign(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      aws: {
        signQuery: true,
      },
    });

    const publicUrl = this.isPrivateFolder(key)
      ? `${this.cloudfrontUrl}/${key}`
      : `${this.cloudfrontUrl}/${key}`;

    return {
      uploadUrl: signedRequest.url,
      publicUrl,
      key,
    };
  }

  async generateSignedUrl(key: string, expiresInSeconds = 86400): Promise<string> {
    const url = `${this.cloudfrontUrl}/${key}`;
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

    const policy = JSON.stringify({
      Statement: [
        {
          Resource: url,
          Condition: {
            DateLessThan: {
              'AWS:EpochTime': expires,
            },
          },
        },
      ],
    });

    const signature = await this.signWithRsaSha1(policy);

    const signedUrl = new URL(url);
    signedUrl.searchParams.set('Expires', String(expires));
    signedUrl.searchParams.set('Signature', this.toUrlSafeBase64(signature));
    signedUrl.searchParams.set('Key-Pair-Id', this.cloudfrontKeyPairId);

    return signedUrl.toString();
  }

  private async signWithRsaSha1(data: string): Promise<string> {
    const pemKey = this.cloudfrontPrivateKey;
    const pemContents = pemKey
      .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
      .replace(/-----END RSA PRIVATE KEY-----/, '')
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');

    const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-1',
      },
      false,
      ['sign']
    );

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const signatureBuffer = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      dataBuffer
    );

    return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  }

  private toUrlSafeBase64(base64: string): string {
    return base64
      .replace(/\+/g, '-')
      .replace(/=/g, '_')
      .replace(/\//g, '~');
  }

  async getPublicUrl(key: string): Promise<string> {
    // Always return signed URLs since S3 bucket has block public access enabled
    const expiresIn = this.isPrivateFolder(key) ? 24 * 60 * 60 : 7 * 24 * 60 * 60;
    return this.generateSignedUrl(key, expiresIn);
  }

  async exists(key: string): Promise<boolean> {
    const url = `${this.s3Endpoint}/${key}`;

    const response = await this.aws.fetch(url, {
      method: 'HEAD',
    });

    return response.ok;
  }
}
