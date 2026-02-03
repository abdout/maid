import { describe, it, expect } from 'vitest';
import { validateRequiredEnv, formatEnvErrors } from './env-validation';

describe('env-validation', () => {
  describe('validateRequiredEnv', () => {
    it('returns empty array when all required vars are present', () => {
      const env = {
        DATABASE_URL: 'postgresql://...',
        JWT_SECRET: 'secret',
      };

      const missing = validateRequiredEnv(env);

      expect(missing).toEqual([]);
    });

    it('returns missing variable names when DATABASE_URL is missing', () => {
      const env = {
        JWT_SECRET: 'secret',
      };

      const missing = validateRequiredEnv(env);

      expect(missing).toContain('DATABASE_URL');
    });

    it('returns missing variable names when JWT_SECRET is missing', () => {
      const env = {
        DATABASE_URL: 'postgresql://...',
      };

      const missing = validateRequiredEnv(env);

      expect(missing).toContain('JWT_SECRET');
    });

    it('returns all missing variables when none are present', () => {
      const env = {};

      const missing = validateRequiredEnv(env);

      expect(missing).toContain('DATABASE_URL');
      expect(missing).toContain('JWT_SECRET');
      expect(missing.length).toBe(2);
    });
  });

  describe('formatEnvErrors', () => {
    it('formats missing variables list correctly', () => {
      const missing = ['DATABASE_URL', 'JWT_SECRET'];

      const formatted = formatEnvErrors(missing);

      expect(formatted).toContain('Missing required environment variables:');
      expect(formatted).toContain('DATABASE_URL');
      expect(formatted).toContain('JWT_SECRET');
      expect(formatted).toContain('.env.example');
    });

    it('handles empty missing list', () => {
      const formatted = formatEnvErrors([]);

      expect(formatted).not.toContain('Missing required');
      expect(formatted).toContain('.env.example');
    });
  });
});
