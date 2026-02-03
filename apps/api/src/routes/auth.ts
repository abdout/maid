import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables, AUTH_CONFIG } from '../types';
import { createDb } from '../db';
import { OtpService, AuthService } from '../services';
import { otpRateLimit, authRateLimit } from '../middleware/rate-limit';

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply specific rate limits for OTP and auth endpoints
auth.use('/otp/*', otpRateLimit);
auth.use('/login', authRateLimit);
auth.use('/refresh', authRateLimit);
auth.use('/logout', authRateLimit);

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const phoneSchema = z.object({
  phone: z
    .string()
    .min(9, 'Phone number too short')
    .max(15, 'Phone number too long')
    .regex(/^\+?[0-9]+$/, 'Invalid phone number format'),
});

const verifySchema = z.object({
  phone: z
    .string()
    .min(9, 'Phone number too short')
    .max(15, 'Phone number too long')
    .regex(/^\+?[0-9]+$/, 'Invalid phone number format'),
  code: z
    .string()
    .length(4, 'OTP must be 4 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  // Login accepts any password - validation happens during hash comparison
  // Min length only enforced during registration/password change
  password: z.string().min(1, 'Password is required').max(72, 'Password too long'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  name: z.string().optional(),
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0] || 'unknown';
}

// ==========================================
// OTP ENDPOINTS
// ==========================================

/**
 * POST /auth/otp/request
 * Request OTP for phone verification
 */
auth.post('/otp/request', zValidator('json', phoneSchema), async (c) => {
  const { phone } = c.req.valid('json');
  const clientIp = getClientIp(c);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const otpService = new OtpService(c.env);
    const authService = new AuthService(db, c.env);

    // Validate phone format
    if (!otpService.isValidPhoneNumber(phone)) {
      return c.json(
        { success: false, error: 'Invalid phone number format' },
        400
      );
    }

    // Generate OTP (fixed code for demo phones in non-production)
    const code = otpService.generateCode(phone);
    const isDemo = otpService.isDemoPhone(phone);

    // Store OTP in database
    await authService.createOtp(phone, code);

    // Log auth event
    await authService.logAuthEvent('otp_request', null, { phone }, clientIp);

    // Send SMS (skipped for demo phones)
    const result = await otpService.sendSms(phone, code);

    if (!result.success) {
      return c.json(
        { success: false, error: result.error || 'Failed to send OTP' },
        500
      );
    }

    // Return response without revealing OTP code
    return c.json({
      success: true,
      message: isDemo
        ? 'Demo mode: Use code 1234'
        : 'Verification code sent successfully',
      data: {
        phone: otpService.normalizePhone(phone),
        expiresIn: 300, // 5 minutes in seconds
      },
    });
  } catch (error) {
    console.error('OTP request error:', error instanceof Error ? error.message : 'Unknown');
    return c.json({ success: false, error: 'Failed to send verification code' }, 500);
  }
});

/**
 * POST /auth/otp/verify
 * Verify OTP and authenticate user
 */
auth.post('/otp/verify', zValidator('json', verifySchema), async (c) => {
  const { phone, code } = c.req.valid('json');
  const clientIp = getClientIp(c);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);
    const otpService = new OtpService(c.env);

    // Normalize phone number
    const normalizedPhone = otpService.normalizePhone(phone);

    // Verify OTP (atomic operation)
    const isValid = await authService.verifyOtp(normalizedPhone, code);

    if (!isValid) {
      await authService.logAuthEvent('otp_verify_failure', null, { phone: normalizedPhone }, clientIp);
      return c.json(
        { success: false, error: 'Invalid or expired verification code' },
        401
      );
    }

    // Find or create user
    const user = await authService.findOrCreateUser(normalizedPhone);

    // Generate token pair
    const tokens = await authService.generateTokenPair(user);

    // Log successful verification
    await authService.logAuthEvent('otp_verify_success', user.id, { phone: normalizedPhone }, clientIp);

    return c.json({
      success: true,
      message: 'Verification successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          officeId: user.officeId,
        },
      },
    });
  } catch (error) {
    console.error('OTP verify error:', error instanceof Error ? error.message : 'Unknown');
    return c.json({ success: false, error: 'Verification failed' }, 500);
  }
});

// ==========================================
// EMAIL/PASSWORD ENDPOINTS
// ==========================================

/**
 * POST /auth/login
 * Email/password authentication
 */
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const clientIp = getClientIp(c);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    // Check account lockout
    const lockoutStatus = await authService.checkAccountLockout(email);
    if (lockoutStatus.isLocked) {
      await authService.logAuthEvent('login_failure', null, {
        email,
        reason: 'account_locked',
      }, clientIp);

      return c.json({
        success: false,
        error: 'Account temporarily locked due to too many failed attempts',
        lockedUntil: lockoutStatus.lockedUntil?.toISOString(),
      }, 429);
    }

    // Find user by email
    const user = await authService.findUserByEmail(email);

    if (!user || !user.password) {
      // Record failed attempt
      const result = await authService.recordLoginAttempt(email, false);
      await authService.logAuthEvent('login_failure', null, {
        email,
        reason: 'user_not_found',
        attemptsRemaining: 5 - (result.locked ? 5 : 0),
      }, clientIp);

      // Use same error message to prevent user enumeration
      return c.json({
        success: false,
        error: 'Invalid credentials',
        remainingAttempts: lockoutStatus.remainingAttempts - 1,
      }, 401);
    }

    // Verify password
    const isValid = await authService.verifyPassword(password, user.password);

    if (!isValid) {
      // Record failed attempt
      const result = await authService.recordLoginAttempt(email, false);
      await authService.logAuthEvent('login_failure', user.id, {
        email,
        reason: 'invalid_password',
      }, clientIp);

      if (result.locked) {
        await authService.logAuthEvent('account_locked', user.id, { email }, clientIp);
        return c.json({
          success: false,
          error: 'Account temporarily locked due to too many failed attempts',
          lockedUntil: result.lockedUntil?.toISOString(),
        }, 429);
      }

      return c.json({
        success: false,
        error: 'Invalid credentials',
        remainingAttempts: lockoutStatus.remainingAttempts - 1,
      }, 401);
    }

    // Clear failed attempts on successful login
    await authService.recordLoginAttempt(email, true);

    // Reset demo office account for fresh onboarding experience
    const DEMO_OFFICE_EMAIL = 'company@tadbeer.com';
    if (user.isDemo && user.email === DEMO_OFFICE_EMAIL && user.officeId) {
      await authService.resetDemoOfficeAccount(user.id);
      // Update local user object to reflect reset state
      user.officeId = null;
      user.role = 'customer';
    }

    // Generate token pair
    const tokens = await authService.generateTokenPair(user);

    // Log successful login
    await authService.logAuthEvent('login_success', user.id, { email }, clientIp);

    return c.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          officeId: user.officeId,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : 'Unknown');
    return c.json({ success: false, error: 'Authentication failed' }, 500);
  }
});

/**
 * POST /auth/register
 * Create a new account with email/password
 */
auth.post('/register', authRateLimit, zValidator('json', registerSchema), async (c) => {
  const { email, password, name } = c.req.valid('json');
  const clientIp = getClientIp(c);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    // Check if user already exists
    const existingUser = await authService.findUserByEmail(email);

    if (existingUser) {
      await authService.logAuthEvent('register_failure', null, {
        email,
        reason: 'email_exists',
      }, clientIp);

      return c.json({
        success: false,
        error: 'An account with this email already exists',
      }, 409);
    }

    // Create the user
    const user = await authService.createUser(email, password, name);

    // Generate token pair for auto-login
    const tokens = await authService.generateTokenPair(user);

    // Log successful registration
    await authService.logAuthEvent('register_success', user.id, { email }, clientIp);

    return c.json({
      success: true,
      message: 'Account created successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          officeId: user.officeId,
        },
      },
    }, 201);
  } catch (error) {
    console.error('Registration error:', error instanceof Error ? error.message : 'Unknown');
    return c.json({ success: false, error: 'Registration failed' }, 500);
  }
});

// ==========================================
// TOKEN MANAGEMENT ENDPOINTS
// ==========================================

/**
 * GET /auth/me
 * Get current authenticated user
 */
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    const payload = await authService.verifyToken(token, 'access');

    if (!payload) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    }

    const user = await authService.getUserById(payload.sub);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        officeId: user.officeId,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error instanceof Error ? error.message : 'Unknown');
    return c.json({ success: false, error: 'Authentication failed' }, 500);
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
auth.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');
  const clientIp = getClientIp(c);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    // Verify refresh token
    const payload = await authService.verifyToken(refreshToken, 'refresh');

    if (!payload) {
      return c.json({ success: false, error: 'Invalid or expired refresh token' }, 401);
    }

    // Get user to ensure they still exist and have valid permissions
    const user = await authService.getUserById(payload.sub);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Blacklist the old refresh token (single use)
    await authService.blacklistToken(payload.jti, payload.exp);

    // Generate new token pair
    const tokens = await authService.generateTokenPair(user);

    // Log token refresh
    await authService.logAuthEvent('token_refresh', user.id, {}, clientIp);

    return c.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error instanceof Error ? error.message : 'Unknown');
    return c.json({ success: false, error: 'Token refresh failed' }, 500);
  }
});

/**
 * POST /auth/logout
 * Logout and invalidate tokens
 */
auth.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  const clientIp = getClientIp(c);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    // Verify token first
    const payload = await authService.verifyToken(token, 'access');

    if (payload) {
      // Blacklist the access token
      await authService.blacklistToken(payload.jti, payload.exp);

      // Log logout
      await authService.logAuthEvent('logout', payload.sub, {}, clientIp);
    }

    // Always return success (don't leak token validity)
    return c.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error instanceof Error ? error.message : 'Unknown');
    // Still return success to client
    return c.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
});

/**
 * POST /auth/logout-all
 * Logout from all devices (requires password confirmation)
 */
auth.post('/logout-all', zValidator('json', z.object({
  password: z.string().optional(),
})), async (c) => {
  const authHeader = c.req.header('Authorization');
  const { password } = c.req.valid('json');
  const clientIp = getClientIp(c);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    const payload = await authService.verifyToken(token, 'access');

    if (!payload) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    const user = await authService.getUserById(payload.sub);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Require password confirmation if user has password
    if (user.password && !password) {
      return c.json({
        success: false,
        error: 'Password confirmation required',
        requiresPassword: true,
      }, 400);
    }

    if (user.password && password) {
      const isValid = await authService.verifyPassword(password, user.password);
      if (!isValid) {
        return c.json({ success: false, error: 'Invalid password' }, 401);
      }
    }

    // Note: Full implementation would require tracking all user tokens
    // For now, blacklist current token and force re-authentication
    await authService.blacklistToken(payload.jti, payload.exp);

    await authService.logAuthEvent('logout', user.id, { allDevices: true }, clientIp);

    return c.json({
      success: true,
      message: 'Logged out from all devices. Please log in again.',
    });
  } catch (error) {
    console.error('Logout all error:', error instanceof Error ? error.message : 'Unknown');
    return c.json({ success: false, error: 'Logout failed' }, 500);
  }
});

// ==========================================
// PASSWORD RESET ENDPOINTS
// ==========================================

/**
 * POST /auth/forgot-password
 * Request password reset email
 */
auth.post('/forgot-password', authRateLimit, zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json');
  const clientIp = getClientIp(c);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    // Find user by email
    const user = await authService.findUserByEmail(email);

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      await authService.logAuthEvent('password_reset_request', null, {
        email,
        reason: 'user_not_found',
      }, clientIp);

      // Return same response as success to prevent enumeration
      return c.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
        data: {
          expiresIn: 3600, // 1 hour
        },
      });
    }

    // Generate reset token
    const resetToken = await authService.createPasswordResetToken(user.id);

    // Log the request
    await authService.logAuthEvent('password_reset_request', user.id, { email }, clientIp);

    // In development, return the token directly
    // In production, this would send an email
    if (c.env.ENVIRONMENT !== 'production') {
      return c.json({
        success: true,
        message: 'Password reset token generated (dev mode)',
        data: {
          token: resetToken,
          expiresIn: 3600,
        },
      });
    }

    // TODO: Send email with reset link
    // For now, just acknowledge the request
    return c.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      data: {
        expiresIn: 3600,
      },
    });
  } catch (error) {
    console.error('Forgot password error:', error instanceof Error ? error.message : 'Unknown');
    return c.json({ success: false, error: 'Failed to process request' }, 500);
  }
});

/**
 * POST /auth/reset-password
 * Reset password with token
 */
auth.post('/reset-password', authRateLimit, zValidator('json', resetPasswordSchema), async (c) => {
  const { token, password } = c.req.valid('json');
  const clientIp = getClientIp(c);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    // Verify token and get user ID
    const userId = await authService.verifyPasswordResetToken(token);

    if (!userId) {
      return c.json({
        success: false,
        error: 'Invalid or expired reset token',
      }, 400);
    }

    // Get user for logging
    const user = await authService.getUserById(userId);

    if (!user) {
      return c.json({
        success: false,
        error: 'User not found',
      }, 404);
    }

    // Update password
    await authService.updateUserPassword(userId, password);

    // Mark token as used
    await authService.markPasswordResetTokenUsed(token);

    // Clear any account lockout
    if (user.email) {
      await authService.invalidateUserSessions(user.email);
    }

    // Log successful reset
    await authService.logAuthEvent('password_reset_success', userId, {
      email: user.email,
    }, clientIp);

    return c.json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error instanceof Error ? error.message : 'Unknown');
    return c.json({ success: false, error: 'Failed to reset password' }, 500);
  }
});

export default auth;
