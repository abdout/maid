import { eq } from 'drizzle-orm';
import type { Database } from '../db';
import { users, customers, favorites, quotations, cvUnlocks, payments, pushTokens } from '../db/schema';
import type { UpdateProfileInput } from '../validators/user.schema';

export interface UserProfile {
  user: {
    id: string;
    phone: string | null;
    email: string | null;
    emailVerified: boolean;
    name: string | null;
    nameAr: string | null;
    role: string;
  };
  customer: {
    emirate: string | null;
    preferredLanguage: string | null;
    notificationsEnabled: boolean;
  } | null;
}

export class UserService {
  constructor(private db: Database) {}

  async getProfile(userId: string, userRole: string): Promise<UserProfile | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return null;

    let customerProfile = null;
    if (userRole === 'customer') {
      const [customer] = await this.db
        .select()
        .from(customers)
        .where(eq(customers.userId, userId))
        .limit(1);

      if (customer) {
        customerProfile = {
          emirate: customer.emirate,
          preferredLanguage: customer.preferredLanguage,
          notificationsEnabled: customer.notificationsEnabled ?? true,
        };
      }
    }

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        emailVerified: user.emailVerified ?? false,
        name: user.name,
        nameAr: user.nameAr,
        role: user.role,
      },
      customer: customerProfile,
    };
  }

  async updateProfile(
    userId: string,
    userRole: string,
    input: UpdateProfileInput
  ): Promise<UserProfile> {
    const { name, nameAr, email, emirate, preferredLanguage, notificationsEnabled } = input;

    // Build user update object
    const userUpdate: Partial<{
      name: string;
      nameAr: string;
      email: string | null;
      emailVerified: boolean;
      updatedAt: Date;
    }> = {};

    if (name !== undefined) userUpdate.name = name;
    if (nameAr !== undefined) userUpdate.nameAr = nameAr;
    if (email !== undefined) {
      userUpdate.email = email;
      userUpdate.emailVerified = false; // Reset verification on email change
    }

    // Update user if there are user fields to update
    let updatedUser;
    if (Object.keys(userUpdate).length > 0) {
      userUpdate.updatedAt = new Date();
      [updatedUser] = await this.db
        .update(users)
        .set(userUpdate)
        .where(eq(users.id, userId))
        .returning();
    } else {
      [updatedUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    }

    // Handle customer profile for customer role
    let customerProfile = null;
    if (userRole === 'customer') {
      customerProfile = await this.upsertCustomerProfile(userId, {
        emirate,
        preferredLanguage,
        notificationsEnabled,
      });
    }

    return {
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified ?? false,
        name: updatedUser.name,
        nameAr: updatedUser.nameAr,
        role: updatedUser.role,
      },
      customer: customerProfile,
    };
  }

  private async upsertCustomerProfile(
    userId: string,
    input: {
      emirate?: string | null;
      preferredLanguage?: string;
      notificationsEnabled?: boolean;
    }
  ) {
    // Check if customer profile exists
    const [existing] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.userId, userId))
      .limit(1);

    const updateFields: Partial<{
      emirate: string | null;
      preferredLanguage: string;
      notificationsEnabled: boolean;
      updatedAt: Date;
    }> = {};

    if (input.emirate !== undefined) updateFields.emirate = input.emirate;
    if (input.preferredLanguage !== undefined) updateFields.preferredLanguage = input.preferredLanguage;
    if (input.notificationsEnabled !== undefined) updateFields.notificationsEnabled = input.notificationsEnabled;

    if (existing) {
      // Update existing profile
      if (Object.keys(updateFields).length > 0) {
        updateFields.updatedAt = new Date();
        const [updated] = await this.db
          .update(customers)
          .set(updateFields)
          .where(eq(customers.id, existing.id))
          .returning();
        return {
          emirate: updated.emirate,
          preferredLanguage: updated.preferredLanguage,
          notificationsEnabled: updated.notificationsEnabled ?? true,
        };
      }
      return {
        emirate: existing.emirate,
        preferredLanguage: existing.preferredLanguage,
        notificationsEnabled: existing.notificationsEnabled ?? true,
      };
    } else {
      // Create new customer profile
      const [created] = await this.db
        .insert(customers)
        .values({
          userId,
          emirate: input.emirate ?? null,
          preferredLanguage: input.preferredLanguage ?? 'ar',
          notificationsEnabled: input.notificationsEnabled ?? true,
        })
        .returning();
      return {
        emirate: created.emirate,
        preferredLanguage: created.preferredLanguage,
        notificationsEnabled: created.notificationsEnabled ?? true,
      };
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    // Delete related data in order (respecting foreign key constraints)
    // 1. Delete push tokens
    await this.db.delete(pushTokens).where(eq(pushTokens.userId, userId));

    // 2. Delete CV unlocks
    await this.db.delete(cvUnlocks).where(eq(cvUnlocks.customerId, userId));

    // 3. Delete payments
    await this.db.delete(payments).where(eq(payments.userId, userId));

    // 4. Delete favorites
    await this.db.delete(favorites).where(eq(favorites.userId, userId));

    // 5. Delete quotations
    await this.db.delete(quotations).where(eq(quotations.customerId, userId));

    // 6. Delete customer profile
    await this.db.delete(customers).where(eq(customers.userId, userId));

    // 7. Finally delete user
    await this.db.delete(users).where(eq(users.id, userId));
  }
}
