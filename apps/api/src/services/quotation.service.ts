import { eq, and, desc } from 'drizzle-orm';
import type { Database } from '../db';
import { quotations, maids, offices, users } from '../db/schema';

interface CreateQuotationInput {
  maidId: string;
  notes?: string;
}

export class QuotationService {
  constructor(private db: Database) {}

  async listForCustomer(customerId: string, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;

    const items = await this.db
      .select({
        quotation: quotations,
        maid: maids,
        office: offices,
      })
      .from(quotations)
      .innerJoin(maids, eq(quotations.maidId, maids.id))
      .innerJoin(offices, eq(quotations.officeId, offices.id))
      .where(eq(quotations.customerId, customerId))
      .orderBy(desc(quotations.createdAt))
      .limit(pageSize)
      .offset(offset);

    return items.map((row) => ({
      ...row.quotation,
      maid: row.maid,
      office: row.office,
    }));
  }

  async listForOffice(officeId: string, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;

    const items = await this.db
      .select({
        quotation: quotations,
        maid: maids,
        customer: users,
      })
      .from(quotations)
      .innerJoin(maids, eq(quotations.maidId, maids.id))
      .innerJoin(users, eq(quotations.customerId, users.id))
      .where(eq(quotations.officeId, officeId))
      .orderBy(desc(quotations.createdAt))
      .limit(pageSize)
      .offset(offset);

    return items.map((row) => ({
      ...row.quotation,
      maid: row.maid,
      customer: {
        id: row.customer.id,
        phone: row.customer.phone,
        name: row.customer.name,
      },
    }));
  }

  async getById(id: string) {
    const [result] = await this.db
      .select({
        quotation: quotations,
        maid: maids,
        office: offices,
        customer: users,
      })
      .from(quotations)
      .innerJoin(maids, eq(quotations.maidId, maids.id))
      .innerJoin(offices, eq(quotations.officeId, offices.id))
      .innerJoin(users, eq(quotations.customerId, users.id))
      .where(eq(quotations.id, id))
      .limit(1);

    if (!result) return null;

    return {
      ...result.quotation,
      maid: result.maid,
      office: result.office,
      customer: {
        id: result.customer.id,
        phone: result.customer.phone,
        name: result.customer.name,
      },
    };
  }

  async create(customerId: string, data: CreateQuotationInput) {
    // Get maid to find office and salary
    const [maid] = await this.db
      .select()
      .from(maids)
      .where(eq(maids.id, data.maidId))
      .limit(1);

    if (!maid) {
      throw new Error('Maid not found');
    }

    if (maid.status !== 'available') {
      throw new Error('Maid is not available');
    }

    // Create quotation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const [quotation] = await this.db
      .insert(quotations)
      .values({
        customerId,
        officeId: maid.officeId,
        maidId: data.maidId,
        salary: maid.salary,
        notes: data.notes,
        expiresAt,
      })
      .returning();

    return quotation;
  }

  async updateStatus(
    id: string,
    officeId: string,
    status: 'sent' | 'accepted' | 'rejected'
  ) {
    const [updated] = await this.db
      .update(quotations)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(quotations.id, id), eq(quotations.officeId, officeId)))
      .returning();

    return updated || null;
  }

  async updateQuotation(
    id: string,
    officeId: string,
    data: { salary?: number; contractMonths?: number; notes?: string }
  ) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.salary !== undefined) updateData.salary = data.salary.toString();
    if (data.contractMonths !== undefined) updateData.contractMonths = data.contractMonths;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const [updated] = await this.db
      .update(quotations)
      .set(updateData)
      .where(and(eq(quotations.id, id), eq(quotations.officeId, officeId)))
      .returning();

    return updated || null;
  }
}
