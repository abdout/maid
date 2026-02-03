import { eq, and, sql, desc, ilike, or } from 'drizzle-orm';
import type { Database } from '../db';
import { businesses } from '../db/schema';
import type { BusinessFiltersInput, CreateBusinessInput, UpdateBusinessInput } from '../validators/business.schema';

export class BusinessService {
  constructor(private db: Database) {}

  async list(filters: BusinessFiltersInput): Promise<{
    items: (typeof businesses.$inferSelect)[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, ...filterParams } = filters;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];

    // Only show active businesses
    conditions.push(eq(businesses.isActive, true));

    // Filter by type
    if (filterParams.type) {
      conditions.push(eq(businesses.type, filterParams.type));
    }

    // Text search on name fields
    if (filterParams.search) {
      const searchTerm = `%${filterParams.search}%`;
      conditions.push(
        or(
          ilike(businesses.name, searchTerm),
          ilike(businesses.nameAr, searchTerm)
        )!
      );
    }

    // Filter by emirate
    if (filterParams.emirate) {
      conditions.push(eq(businesses.emirate, filterParams.emirate));
    }

    // Filter by verified status
    if (filterParams.isVerified !== undefined) {
      conditions.push(eq(businesses.isVerified, filterParams.isVerified));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(businesses)
      .where(whereClause);

    // Get paginated results
    const items = await this.db
      .select()
      .from(businesses)
      .where(whereClause)
      .orderBy(desc(businesses.isVerified), desc(businesses.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      items,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  async getById(id: string): Promise<typeof businesses.$inferSelect | null> {
    const [result] = await this.db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, id), eq(businesses.isActive, true)))
      .limit(1);

    return result || null;
  }

  async create(data: CreateBusinessInput): Promise<typeof businesses.$inferSelect> {
    const [business] = await this.db
      .insert(businesses)
      .values(data)
      .returning();

    return business;
  }

  async update(
    id: string,
    data: UpdateBusinessInput
  ): Promise<typeof businesses.$inferSelect | null> {
    const [existing] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    if (!existing) {
      return null;
    }

    const [updated] = await this.db
      .update(businesses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const [existing] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    if (!existing) {
      return false;
    }

    // Soft delete by setting isActive to false
    await this.db
      .update(businesses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(businesses.id, id));

    return true;
  }
}
