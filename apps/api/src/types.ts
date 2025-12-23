import type { Hyperdrive, R2Bucket } from '@cloudflare/workers-types';

// Cloudflare Worker bindings
export interface Bindings {
  HYPERDRIVE?: Hyperdrive;
  BUCKET?: R2Bucket;
  DATABASE_URL: string;
  JWT_SECRET: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  ENVIRONMENT: string;
  // OAuth providers
  GOOGLE_CLIENT_ID?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_TEAM_ID?: string;
  // Stripe payment
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  // Tabby payment
  TABBY_PUBLIC_KEY?: string;
  TABBY_SECRET_KEY?: string;
  TABBY_MERCHANT_CODE?: string;
}

// JWT payload for authenticated users
export interface JwtPayload {
  sub: string; // user id
  phone: string | null;
  email?: string | null;
  role: 'customer' | 'office_admin' | 'super_admin';
  officeId: string | null;
  iat: number;
  exp: number;
}

// Context variables set by middleware
export interface Variables {
  user: JwtPayload;
  officeId: string | null;
}
