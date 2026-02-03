import type { Bindings } from '../types';

/**
 * Required environment variables for the API to function
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
] as const;

/**
 * Conditionally required based on features
 */
const FEATURE_ENV_VARS = {
  twilio: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
  aws: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'],
  cloudfront: ['CLOUDFRONT_URL', 'CLOUDFRONT_KEY_PAIR_ID', 'CLOUDFRONT_PRIVATE_KEY'],
  stripe: ['STRIPE_SECRET_KEY'],
} as const;

/**
 * Validate required environment variables at startup
 * Returns array of missing variable names
 */
export function validateRequiredEnv(env: Partial<Bindings>): string[] {
  const missing: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    if (!env[varName]) {
      missing.push(varName);
    }
  }

  return missing;
}

/**
 * Validate feature-specific environment variables
 * Returns object with feature name and missing variables
 */
export function validateFeatureEnv(
  env: Partial<Bindings>,
  features: (keyof typeof FEATURE_ENV_VARS)[]
): Record<string, string[]> {
  const missingByFeature: Record<string, string[]> = {};

  for (const feature of features) {
    const required = FEATURE_ENV_VARS[feature];
    const missing = required.filter(
      (varName) => !env[varName as keyof Bindings]
    );

    if (missing.length > 0) {
      missingByFeature[feature] = missing;
    }
  }

  return missingByFeature;
}

/**
 * Format validation errors for logging
 */
export function formatEnvErrors(missing: string[], featureMissing?: Record<string, string[]>): string {
  const lines: string[] = [];

  if (missing.length > 0) {
    lines.push('Missing required environment variables:');
    for (const varName of missing) {
      lines.push(`  - ${varName}`);
    }
  }

  if (featureMissing && Object.keys(featureMissing).length > 0) {
    lines.push('\nMissing feature environment variables:');
    for (const [feature, vars] of Object.entries(featureMissing)) {
      lines.push(`  ${feature}:`);
      for (const varName of vars) {
        lines.push(`    - ${varName}`);
      }
    }
  }

  lines.push('\nPlease check your .dev.vars file or Cloudflare secrets configuration.');
  lines.push('See apps/api/.env.example for required variables.');

  return lines.join('\n');
}
