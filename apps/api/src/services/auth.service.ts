import { SignJWT, jwtVerify } from 'jose';
import { eq, and, gt } from 'drizzle-orm';
import type { Database } from '../db';
import { users, otpCodes } from '../db/schema';
import type { Bindings, JwtPayload } from '../types';

const OTP_EXPIRY_MINUTES = 5;
const JWT_EXPIRY_DAYS = 30;

export class AuthService {
  constructor(
    private db: Database,
    private env: Bindings
  ) {}

  async createOtp(phone: string, code: string): Promise<void> {
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.db.insert(otpCodes).values({
      phone,
      code,
      expiresAt,
    });
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const now = new Date();

    const [otp] = await this.db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phone, phone),
          eq(otpCodes.code, code),
          eq(otpCodes.verified, false),
          gt(otpCodes.expiresAt, now)
        )
      )
      .limit(1);

    if (!otp) {
      return false;
    }

    // Mark as verified
    await this.db
      .update(otpCodes)
      .set({ verified: true })
      .where(eq(otpCodes.id, otp.id));

    return true;
  }

  async findOrCreateUser(phone: string): Promise<typeof users.$inferSelect> {
    // Check if user exists
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const [newUser] = await this.db
      .insert(users)
      .values({
        phone,
        role: 'customer',
      })
      .returning();

    return newUser;
  }

  async generateToken(user: typeof users.$inferSelect): Promise<string> {
    const secret = new TextEncoder().encode(this.env.JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      officeId: user.officeId,
    };

    const token = await new SignJWT(payload as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(`${JWT_EXPIRY_DAYS}d`)
      .sign(secret);

    return token;
  }

  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const secret = new TextEncoder().encode(this.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      return {
        sub: payload.sub as string,
        phone: payload.phone as string | null,
        email: payload.email as string | null | undefined,
        role: payload.role as JwtPayload['role'],
        officeId: payload.officeId as string | null,
        iat: payload.iat as number,
        exp: payload.exp as number,
      };
    } catch {
      return null;
    }
  }

  async getUserById(id: string): Promise<typeof users.$inferSelect | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }
}
