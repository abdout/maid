import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings, Variables } from '../types';
import { createDb } from '../db';
import { OAuthService, AuthService } from '../services';

const oauth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const googleSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

const appleSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
  fullName: z.object({
    givenName: z.string().optional(),
    familyName: z.string().optional(),
  }).optional(),
});

const linkPhoneSchema = z.object({
  phone: z
    .string()
    .min(9)
    .max(15)
    .regex(/^\+?[0-9]+$/, 'Invalid phone number format'),
  code: z.string().min(4).max(6, 'OTP must be 4-6 digits'),
});

// Google Sign-In
oauth.post('/google', zValidator('json', googleSchema), async (c) => {
  const { idToken } = c.req.valid('json');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const oauthService = new OAuthService(db, c.env);
    const authService = new AuthService(db, c.env);

    // Verify Google token
    const tokenInfo = await oauthService.verifyGoogleToken(idToken);

    if (!tokenInfo) {
      return c.json(
        { success: false, error: 'Invalid Google token' },
        401
      );
    }

    // Find or create user
    const { user, isNew } = await oauthService.findOrCreateOAuthUser(
      'google',
      tokenInfo.sub,
      tokenInfo.email,
      tokenInfo.name
    );

    // Generate JWT
    const token = await authService.generateToken(user);

    return c.json({
      success: true,
      message: isNew ? 'Account created' : 'Signed in',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role,
          officeId: user.officeId,
        },
        isNew,
        requiresPhone: !user.phone,
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return c.json({ success: false, error: 'Authentication failed' }, 500);
  }
});

// Apple Sign-In
oauth.post('/apple', zValidator('json', appleSchema), async (c) => {
  const { idToken, fullName } = c.req.valid('json');

  try {
    const db = createDb(c.env.DATABASE_URL);
    const oauthService = new OAuthService(db, c.env);
    const authService = new AuthService(db, c.env);

    // Verify Apple token
    const tokenInfo = await oauthService.verifyAppleToken(idToken);

    if (!tokenInfo) {
      return c.json(
        { success: false, error: 'Invalid Apple token' },
        401
      );
    }

    // Build name from Apple's full name (only provided on first sign-in)
    let name: string | undefined;
    if (fullName?.givenName || fullName?.familyName) {
      name = [fullName.givenName, fullName.familyName].filter(Boolean).join(' ');
    }

    // Find or create user
    const { user, isNew } = await oauthService.findOrCreateOAuthUser(
      'apple',
      tokenInfo.sub,
      tokenInfo.email,
      name
    );

    // Generate JWT
    const token = await authService.generateToken(user);

    return c.json({
      success: true,
      message: isNew ? 'Account created' : 'Signed in',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role,
          officeId: user.officeId,
        },
        isNew,
        requiresPhone: !user.phone,
      },
    });
  } catch (error) {
    console.error('Apple OAuth error:', error);
    return c.json({ success: false, error: 'Authentication failed' }, 500);
  }
});

// Link phone number to OAuth account
oauth.post('/link-phone', zValidator('json', linkPhoneSchema), async (c) => {
  const { phone, code } = c.req.valid('json');

  // Get user from auth header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const db = createDb(c.env.DATABASE_URL);
    const authService = new AuthService(db, c.env);
    const oauthService = new OAuthService(db, c.env);

    // Verify JWT
    const payload = await authService.verifyToken(token);
    if (!payload) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    // Verify OTP
    const isValid = await authService.verifyOtp(phone, code);
    if (!isValid) {
      return c.json(
        { success: false, error: 'Invalid or expired OTP' },
        401
      );
    }

    // Link phone to user
    const user = await oauthService.linkPhone(payload.sub, phone);
    if (!user) {
      return c.json(
        { success: false, error: 'Phone number already in use' },
        409
      );
    }

    // Generate new token with phone
    const newToken = await authService.generateToken(user);

    return c.json({
      success: true,
      message: 'Phone linked successfully',
      data: {
        token: newToken,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role,
          officeId: user.officeId,
        },
      },
    });
  } catch (error) {
    console.error('Link phone error:', error);
    return c.json({ success: false, error: 'Failed to link phone' }, 500);
  }
});

export default oauth;
