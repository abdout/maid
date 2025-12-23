import { eq } from 'drizzle-orm';
import type { Database } from '../db';
import { offices, users } from '../db/schema';

interface CreateOfficeInput {
  name: string;
  nameAr?: string;
  phone: string;
  email?: string;
  address?: string;
  addressAr?: string;
}

interface UpdateOfficeInput {
  name?: string;
  nameAr?: string;
  email?: string;
  address?: string;
  addressAr?: string;
  logoUrl?: string;
}

export class OfficeService {
  constructor(private db: Database) {}

  async getById(id: string) {
    const [office] = await this.db
      .select()
      .from(offices)
      .where(eq(offices.id, id))
      .limit(1);

    return office || null;
  }

  async getByPhone(phone: string) {
    const [office] = await this.db
      .select()
      .from(offices)
      .where(eq(offices.phone, phone))
      .limit(1);

    return office || null;
  }

  async create(data: CreateOfficeInput, adminUserId: string) {
    // Create office
    const [office] = await this.db
      .insert(offices)
      .values(data)
      .returning();

    // Update user to be office admin
    await this.db
      .update(users)
      .set({
        role: 'office_admin',
        officeId: office.id,
        updatedAt: new Date(),
      })
      .where(eq(users.id, adminUserId));

    return office;
  }

  async update(id: string, data: UpdateOfficeInput) {
    const [updated] = await this.db
      .update(offices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(offices.id, id))
      .returning();

    return updated || null;
  }

  async getStats(officeId: string) {
    // Import here to avoid circular dependency
    const { maids, quotations } = await import('../db/schema');
    const { count, sql } = await import('drizzle-orm');

    const [maidStats] = await this.db
      .select({
        total: sql<number>`count(*)::int`,
        available: sql<number>`count(*) filter (where status = 'available')::int`,
        busy: sql<number>`count(*) filter (where status = 'busy')::int`,
        reserved: sql<number>`count(*) filter (where status = 'reserved')::int`,
      })
      .from(maids)
      .where(eq(maids.officeId, officeId));

    const [quotationStats] = await this.db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where status = 'pending')::int`,
        accepted: sql<number>`count(*) filter (where status = 'accepted')::int`,
      })
      .from(quotations)
      .where(eq(quotations.officeId, officeId));

    return {
      maids: maidStats,
      quotations: quotationStats,
    };
  }
}
