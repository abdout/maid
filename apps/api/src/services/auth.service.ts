import { SignJWT, jwtVerify } from 'jose';
import { eq, and, gt, lt, sql } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import type { Database } from '../db';
import { users, otpCodes, auditLogs, passwordResetTokens } from '../db/schema';
import type { Bindings, JwtPayload, AuthEventType, AUTH_CONFIG } from '../types';

// Token blacklist in-memory fallback (for development)
const memoryBlacklist = new Map<string, number>();

// Login attempt tracking in-memory fallback
const loginAttempts = new Map<string, { count: number; lockedUntil: number | null }>();

export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    private db: Database,
    private env: Bindings
  ) {}

  // ==========================================
  // OTP MANAGEMENT
  // ==========================================

  async createOtp(phone: string, code: string): Promise<void> {
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Invalidate any existing OTPs for this phone
    await this.db
      .update(otpCodes)
      .set({ verified: true })
      .where(and(eq(otpCodes.phone, phone), eq(otpCodes.verified, false)));

    await this.db.insert(otpCodes).values({
      phone,
      code,
      expiresAt,
    });
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const now = new Date();

    // Atomic verification with UPDATE RETURNING to prevent race conditions
    const result = await this.db
      .update(otpCodes)
      .set({ verified: true })
      .where(
        and(
          eq(otpCodes.phone, phone),
          eq(otpCodes.code, code),
          eq(otpCodes.verified, false),
          gt(otpCodes.expiresAt, now)
        )
      )
      .returning({ id: otpCodes.id });

    return result.length > 0;
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  async findOrCreateUser(phone: string): Promise<typeof users.$inferSelect> {
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existingUser) {
      return existingUser;
    }

    const [newUser] = await this.db
      .insert(users)
      .values({
        phone,
        role: 'customer',
      })
      .returning();

    return newUser;
  }

  async getUserById(id: string): Promise<typeof users.$inferSelect | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }

  async findUserByEmail(email: string): Promise<typeof users.$inferSelect | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return user || null;
  }

  // ==========================================
  // PASSWORD HANDLING
  // ==========================================

  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.BCRYPT_ROUNDS);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // ==========================================
  // TOKEN GENERATION & VERIFICATION
  // ==========================================

  private generateTokenId(): string {
    return crypto.randomUUID();
  }

  async generateTokenPair(user: typeof users.$inferSelect): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const accessToken = await this.generateToken(user, 'access');
    const refreshToken = await this.generateToken(user, 'refresh');

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  async generateToken(
    user: typeof users.$inferSelect,
    type: 'access' | 'refresh' = 'access'
  ): Promise<string> {
    const secret = new TextEncoder().encode(
      type === 'refresh' && this.env.JWT_REFRESH_SECRET
        ? this.env.JWT_REFRESH_SECRET
        : this.env.JWT_SECRET
    );

    const jti = this.generateTokenId();
    const expiry = type === 'access' ? this.ACCESS_TOKEN_EXPIRY : this.REFRESH_TOKEN_EXPIRY;

    const payload = {
      sub: user.id,
      jti,
      phone: user.phone,
      email: user.email,
      role: user.role,
      officeId: user.officeId,
      type,
    };

    const token = await new SignJWT(payload as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiry)
      .sign(secret);

    return token;
  }

  async verifyToken(
    token: string,
    expectedType: 'access' | 'refresh' = 'access'
  ): Promise<JwtPayload | null> {
    try {
      const secret = new TextEncoder().encode(
        expectedType === 'refresh' && this.env.JWT_REFRESH_SECRET
          ? this.env.JWT_REFRESH_SECRET
          : this.env.JWT_SECRET
      );

      const { payload } = await jwtVerify(token, secret);

      // Validate token type
      if (payload.type !== expectedType) {
        return null;
      }

      // Check if token is blacklisted
      const jti = payload.jti as string;
      if (await this.isTokenBlacklisted(jti)) {
        return null;
      }

      return {
        sub: payload.sub as string,
        jti: payload.jti as string,
        phone: payload.phone as string | null,
        email: payload.email as string | null | undefined,
        role: payload.role as JwtPayload['role'],
        officeId: payload.officeId as string | null,
        iat: payload.iat as number,
        exp: payload.exp as number,
        type: payload.type as 'access' | 'refresh',
      };
    } catch {
      return null;
    }
  }

  // ==========================================
  // TOKEN BLACKLISTING (REVOCATION)
  // ==========================================

  async blacklistToken(jti: string, expiresAt: number): Promise<void> {
    const ttl = Math.max(0, expiresAt - Math.floor(Date.now() / 1000));

    if (this.env.TOKEN_BLACKLIST_KV) {
      await this.env.TOKEN_BLACKLIST_KV.put(`bl:${jti}`, '1', {
        expirationTtl: ttl + 60, // Add buffer
      });
    } else {
      memoryBlacklist.set(jti, expiresAt);
      // Cleanup expired entries
      if (memoryBlacklist.size > 10000) {
        const now = Math.floor(Date.now() / 1000);
        for (const [key, exp] of memoryBlacklist.entries()) {
          if (exp < now) memoryBlacklist.delete(key);
        }
      }
    }
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    if (this.env.TOKEN_BLACKLIST_KV) {
      const result = await this.env.TOKEN_BLACKLIST_KV.get(`bl:${jti}`);
      return result !== null;
    }
    const expiresAt = memoryBlacklist.get(jti);
    if (!expiresAt) return false;
    return expiresAt > Math.floor(Date.now() / 1000);
  }

  // ==========================================
  // ACCOUNT LOCKOUT
  // ==========================================

  async checkAccountLockout(identifier: string): Promise<{
    isLocked: boolean;
    remainingAttempts: number;
    lockedUntil: Date | null;
  }> {
    const key = `lockout:${identifier}`;
    const now = Date.now();

    if (this.env.RATE_LIMIT_KV) {
      const data = await this.env.RATE_LIMIT_KV.get<{
        count: number;
        lockedUntil: number | null;
      }>(key, 'json');

      if (!data) {
        return { isLocked: false, remainingAttempts: this.MAX_LOGIN_ATTEMPTS, lockedUntil: null };
      }

      if (data.lockedUntil && data.lockedUntil > now) {
        return {
          isLocked: true,
          remainingAttempts: 0,
          lockedUntil: new Date(data.lockedUntil),
        };
      }

      // Reset if lockout expired
      if (data.lockedUntil && data.lockedUntil <= now) {
        await this.env.RATE_LIMIT_KV.delete(key);
        return { isLocked: false, remainingAttempts: this.MAX_LOGIN_ATTEMPTS, lockedUntil: null };
      }

      return {
        isLocked: false,
        remainingAttempts: Math.max(0, this.MAX_LOGIN_ATTEMPTS - data.count),
        lockedUntil: null,
      };
    }

    // Memory fallback
    const data = loginAttempts.get(key);
    if (!data) {
      return { isLocked: false, remainingAttempts: this.MAX_LOGIN_ATTEMPTS, lockedUntil: null };
    }

    if (data.lockedUntil && data.lockedUntil > now) {
      return {
        isLocked: true,
        remainingAttempts: 0,
        lockedUntil: new Date(data.lockedUntil),
      };
    }

    if (data.lockedUntil && data.lockedUntil <= now) {
      loginAttempts.delete(key);
      return { isLocked: false, remainingAttempts: this.MAX_LOGIN_ATTEMPTS, lockedUntil: null };
    }

    return {
      isLocked: false,
      remainingAttempts: Math.max(0, this.MAX_LOGIN_ATTEMPTS - data.count),
      lockedUntil: null,
    };
  }

  async recordLoginAttempt(
    identifier: string,
    success: boolean
  ): Promise<{ locked: boolean; lockedUntil: Date | null }> {
    const key = `lockout:${identifier}`;
    const now = Date.now();

    if (success) {
      // Clear attempts on successful login
      if (this.env.RATE_LIMIT_KV) {
        await this.env.RATE_LIMIT_KV.delete(key);
      } else {
        loginAttempts.delete(key);
      }
      return { locked: false, lockedUntil: null };
    }

    // Increment failed attempts
    if (this.env.RATE_LIMIT_KV) {
      const data = await this.env.RATE_LIMIT_KV.get<{
        count: number;
        lockedUntil: number | null;
      }>(key, 'json');

      const newCount = (data?.count || 0) + 1;
      const shouldLock = newCount >= this.MAX_LOGIN_ATTEMPTS;
      const lockedUntil = shouldLock ? now + this.LOCKOUT_DURATION_MS : null;

      await this.env.RATE_LIMIT_KV.put(
        key,
        JSON.stringify({ count: newCount, lockedUntil }),
        { expirationTtl: Math.ceil(this.LOCKOUT_DURATION_MS / 1000) + 60 }
      );

      return {
        locked: shouldLock,
        lockedUntil: lockedUntil ? new Date(lockedUntil) : null,
      };
    }

    // Memory fallback
    const data = loginAttempts.get(key) || { count: 0, lockedUntil: null };
    data.count += 1;

    if (data.count >= this.MAX_LOGIN_ATTEMPTS) {
      data.lockedUntil = now + this.LOCKOUT_DURATION_MS;
    }

    loginAttempts.set(key, data);

    return {
      locked: data.lockedUntil !== null,
      lockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : null,
    };
  }

  // ==========================================
  // AUDIT LOGGING
  // ==========================================

  async logAuthEvent(
    event: AuthEventType,
    userId: string | null,
    details: Record<string, unknown>,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Mask sensitive data in logs
      const sanitizedDetails = this.sanitizeLogDetails(details);

      // Only log to DB if we have a valid userId for audit trail
      if (userId) {
        await this.db.insert(auditLogs).values({
          adminId: userId,
          action: event,
          targetType: 'user',
          targetId: userId,
          details: JSON.stringify(sanitizedDetails),
          ipAddress: ipAddress || null,
        });
      }

      // Always log to console in non-production (structured logging)
      if (this.env.ENVIRONMENT !== 'production') {
        console.log(JSON.stringify({
          type: 'auth_event',
          event,
          userId: userId ? this.maskUserId(userId) : null,
          ...sanitizedDetails,
          timestamp: new Date().toISOString(),
        }));
      }
    } catch (error) {
      // Don't fail authentication due to logging errors
      console.error('Failed to log auth event:', error);
    }
  }

  private sanitizeLogDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details };

    // Mask phone numbers
    if (typeof sanitized.phone === 'string') {
      sanitized.phone = this.maskPhone(sanitized.phone);
    }

    // Mask email
    if (typeof sanitized.email === 'string') {
      sanitized.email = this.maskEmail(sanitized.email);
    }

    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.otp;
    delete sanitized.code;

    return sanitized;
  }

  private maskPhone(phone: string): string {
    if (phone.length <= 4) return '****';
    return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '****';
    const maskedLocal = local.length > 2
      ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
      : '**';
    return `${maskedLocal}@${domain}`;
  }

  private maskUserId(id: string): string {
    return id.slice(0, 8) + '...';
  }

  // ==========================================
  // PASSWORD RESET
  // ==========================================

  private readonly RESET_TOKEN_EXPIRY_HOURS = 1;

  /**
   * Generate a secure password reset token
   * Returns the plain token to send to user, stores hash in DB
   */
  async createPasswordResetToken(userId: string): Promise<string> {
    // Invalidate any existing tokens for this user
    await this.db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(and(eq(passwordResetTokens.userId, userId), eq(passwordResetTokens.used, false)));

    // Generate cryptographically secure token (32 bytes = 64 hex chars)
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const plainToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Hash token for storage (using SHA-256 for fast lookup)
    const encoder = new TextEncoder();
    const data = encoder.encode(plainToken);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Store hashed token with expiry
    const expiresAt = new Date(Date.now() + this.RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.db.insert(passwordResetTokens).values({
      userId,
      tokenHash,
      expiresAt,
    });

    return plainToken;
  }

  /**
   * Verify a password reset token and return the user ID
   * Returns null if token is invalid, expired, or already used
   */
  async verifyPasswordResetToken(plainToken: string): Promise<string | null> {
    // Hash the provided token
    const encoder = new TextEncoder();
    const data = encoder.encode(plainToken);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const now = new Date();

    // Find valid token
    const [token] = await this.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (!token) {
      return null;
    }

    return token.userId;
  }

  /**
   * Mark a password reset token as used
   */
  async markPasswordResetTokenUsed(plainToken: string): Promise<void> {
    // Hash the provided token
    const encoder = new TextEncoder();
    const data = encoder.encode(plainToken);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    await this.db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.tokenHash, tokenHash));
  }

  /**
   * Update user's password
   */
  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    await this.db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  /**
   * Invalidate all user sessions by clearing lockout data
   * Note: Full implementation would track all active tokens per user
   */
  async invalidateUserSessions(identifier: string): Promise<void> {
    const key = `lockout:${identifier}`;
    if (this.env.RATE_LIMIT_KV) {
      await this.env.RATE_LIMIT_KV.delete(key);
    } else {
      loginAttempts.delete(key);
    }
  }

  // ==========================================
  // ENVIRONMENT CHECKS
  // ==========================================

  isProduction(): boolean {
    return this.env.ENVIRONMENT === 'production';
  }

  isDevelopment(): boolean {
    return this.env.ENVIRONMENT === 'development';
  }
}
