import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { OtpService, AuthService } from '../services';
import { otpRateLimit, authRateLimit } from '../middleware/rate-limit';

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply specific rate limits for OTP and auth endpoints
auth.use('/otp/*', otpRateLimit);
auth.use('/refresh', authRateLimit);

// Phone number validation (UAE format or international)
const phoneSchema = z.object({
  phone: z
    .string()
    .min(9)
    .max(15)
    .regex(/^\+?[0-9]+$/, 'Invalid phone number format'),
});

const verifySchema = z.object({
  phone: z
    .string()
    .min(9)
    .max(15)
    .regex(/^\+?[0-9]+$/, 'Invalid phone number format'),
  code: z.string().length(4, 'OTP must be 4 digits'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

// Request OTP
auth.post('/otp/request', zValidator('json', phoneSchema), async (c) => {
  const { phone } = c.req.valid('json');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const otpService = new OtpService(c.env);
    const authService = new AuthService(db, c.env);

    // Generate OTP (fixed code for demo phones)
    const code = otpService.generateCode(phone);
    const isDemo = otpService.isDemoPhone(phone);

    // Store OTP in database
    await authService.createOtp(phone, code);

    // Send SMS (skipped for demo phones)
    const result = await otpService.sendSms(phone, code);

    if (!result.success) {
      return c.json(
        { success: false, error: result.error || 'Failed to send OTP' },
        500
      );
    }

    return c.json({
      success: true,
      message: isDemo ? 'Demo mode: Use code 1234' : 'OTP sent successfully',
      data: { phone, isDemo },
    });
  } catch (error) {
    console.error('OTP request error:', error);
    return c.json({ success: false, error: 'Failed to send OTP' }, 500);
  }
});

// Verify OTP
auth.post('/otp/verify', zValidator('json', verifySchema), async (c) => {
  const { phone, code } = c.req.valid('json');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    // Verify OTP
    const isValid = await authService.verifyOtp(phone, code);

    if (!isValid) {
      return c.json(
        { success: false, error: 'Invalid or expired OTP' },
        401
      );
    }

    // Find or create user
    const user = await authService.findOrCreateUser(phone);

    // Generate JWT
    const token = await authService.generateToken(user);

    return c.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
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
    console.error('OTP verify error:', error);
    return c.json({ success: false, error: 'Verification failed' }, 500);
  }
});

// Email/Password Login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    // Find user by email
    const user = await authService.findUserByEmail(email);
    if (!user || !user.password) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await authService.verifyPassword(password, user.password);
    if (!isValid) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Generate JWT
    const token = await authService.generateToken(user);

    return c.json({
      success: true,
      data: {
        token,
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
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});

// Get current user
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    const payload = await authService.verifyToken(token);

    if (!payload) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
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
        name: user.name,
        role: user.role,
        officeId: user.officeId,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return c.json({ success: false, error: 'Authentication failed' }, 500);
  }
});

// Refresh token
auth.post('/refresh', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);

    const payload = await authService.verifyToken(token);

    if (!payload) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    const user = await authService.getUserById(payload.sub);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const newToken = await authService.generateToken(user);

    return c.json({
      success: true,
      data: { token: newToken },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json({ success: false, error: 'Token refresh failed' }, 500);
  }
});

export default auth;
