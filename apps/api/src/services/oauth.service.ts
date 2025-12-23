import { eq, and } from 'drizzle-orm';
import type { Database } from '../db';
import { users, oauthAccounts } from '../db/schema';
import type { Bindings } from '../types';

interface GoogleTokenInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

interface AppleTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
}

export class OAuthService {
  constructor(
    private db: Database,
    private env: Bindings
  ) {}

  // Verify Google ID token
  async verifyGoogleToken(idToken: string): Promise<GoogleTokenInfo | null> {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
      );

      if (!response.ok) {
        console.error('Google token verification failed:', response.status);
        return null;
      }

      const data = await response.json() as GoogleTokenInfo & { aud?: string };

      // Verify the token is for our app
      const clientId = this.env.GOOGLE_CLIENT_ID;
      if (clientId && data.aud !== clientId) {
        console.error('Google token audience mismatch');
        return null;
      }

      return {
        sub: data.sub,
        email: data.email,
        email_verified: data.email_verified,
        name: data.name,
        picture: data.picture,
      };
    } catch (error) {
      console.error('Google token verification error:', error);
      return null;
    }
  }

  // Verify Apple ID token
  async verifyAppleToken(idToken: string): Promise<AppleTokenPayload | null> {
    try {
      // Decode the JWT (Apple tokens are JWTs)
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        console.error('Invalid Apple token format');
        return null;
      }

      const payload = JSON.parse(atob(parts[1])) as AppleTokenPayload & {
        iss?: string;
        aud?: string;
        exp?: number;
      };

      // Verify issuer
      if (payload.iss !== 'https://appleid.apple.com') {
        console.error('Invalid Apple token issuer');
        return null;
      }

      // Verify audience (your app's client ID)
      const clientId = this.env.APPLE_CLIENT_ID;
      if (clientId && payload.aud !== clientId) {
        console.error('Apple token audience mismatch');
        return null;
      }

      // Verify expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.error('Apple token expired');
        return null;
      }

      return {
        sub: payload.sub,
        email: payload.email,
        email_verified: payload.email_verified === true || payload.email_verified === 'true',
      };
    } catch (error) {
      console.error('Apple token verification error:', error);
      return null;
    }
  }

  // Find or create user from OAuth
  async findOrCreateOAuthUser(
    provider: 'google' | 'apple',
    providerAccountId: string,
    email?: string,
    name?: string
  ): Promise<{ user: typeof users.$inferSelect; isNew: boolean }> {
    // Check if OAuth account exists
    const [existingOAuth] = await this.db
      .select()
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, provider),
          eq(oauthAccounts.providerAccountId, providerAccountId)
        )
      )
      .limit(1);

    if (existingOAuth) {
      // Return existing user
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, existingOAuth.userId))
        .limit(1);

      return { user, isNew: false };
    }

    // Check if user with this email exists (for linking)
    if (email) {
      const [existingUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        // Link OAuth account to existing user
        await this.db.insert(oauthAccounts).values({
          userId: existingUser.id,
          provider,
          providerAccountId,
          email,
        });

        return { user: existingUser, isNew: false };
      }
    }

    // Create new user
    const [newUser] = await this.db
      .insert(users)
      .values({
        email,
        name,
        role: 'customer',
      })
      .returning();

    // Create OAuth account link
    await this.db.insert(oauthAccounts).values({
      userId: newUser.id,
      provider,
      providerAccountId,
      email,
    });

    return { user: newUser, isNew: true };
  }

  // Link phone number to OAuth user
  async linkPhone(userId: string, phone: string): Promise<typeof users.$inferSelect | null> {
    // Check if phone is already used
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existingUser && existingUser.id !== userId) {
      return null; // Phone already in use by another user
    }

    // Update user with phone
    const [updatedUser] = await this.db
      .update(users)
      .set({ phone })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser || null;
  }
}
