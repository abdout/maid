import type { Hyperdrive, KVNamespace } from '@cloudflare/workers-types';

// Cloudflare Worker bindings
export interface Bindings {
  HYPERDRIVE?: Hyperdrive;
  RATE_LIMIT_KV?: KVNamespace;
  TOKEN_BLACKLIST_KV?: KVNamespace;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET?: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  // AWS S3 Configuration
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  // CloudFront Configuration
  CLOUDFRONT_URL: string;
  CLOUDFRONT_KEY_PAIR_ID: string;
  CLOUDFRONT_PRIVATE_KEY: string;
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
  jti: string; // unique token ID for revocation
  phone: string | null;
  email?: string | null;
  role: 'customer' | 'office_admin' | 'super_admin';
  officeId: string | null;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

// Auth event types for audit logging
export type AuthEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'token_refresh'
  | 'otp_request'
  | 'otp_verify_success'
  | 'otp_verify_failure'
  | 'account_locked'
  | 'password_reset_request'
  | 'password_reset_success'
  | 'register_success'
  | 'register_failure';

// Security configuration constants
export const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',      // 15 minutes for access tokens
  REFRESH_TOKEN_EXPIRY: '7d',      // 7 days for refresh tokens
  OTP_EXPIRY_MINUTES: 5,
  OTP_LENGTH: 4,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 72,
} as const;

// Context variables set by middleware
export interface Variables {
  user: JwtPayload;
  officeId: string | null;
}
