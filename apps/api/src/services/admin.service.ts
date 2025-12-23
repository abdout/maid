import { eq, and, sql, desc, count, like, or } from 'drizzle-orm';
import type { createDb } from '../db';
import {
  users,
  offices,
  maids,
  quotations,
  payments,
  officeSubscriptions,
  nationalities,
} from '../db/schema';

export interface PlatformStats {
  totalUsers: number;
  totalOffices: number;
  totalMaids: number;
  totalQuotations: number;
  totalPayments: number;
  revenue: number;
  activeSubscriptions: number;
}

export interface MaidListItem {
  id: string;
  name: string;
  nameAr: string | null;
  photoUrl: string | null;
  status: string;
  salary: string;
  experienceYears: number;
  nationality: { id: string; nameEn: string; nameAr: string } | null;
  office: { id: string; name: string } | null;
  createdAt: Date;
}

export interface OfficeListItem {
  id: string;
  name: string;
  nameAr: string | null;
  phone: string | null;
  email: string | null;
  isVerified: boolean;
  maidCount: number;
  createdAt: Date;
}

export interface UserListItem {
  id: string;
  phone: string | null;
  name: string | null;
  role: 'customer' | 'office_admin' | 'super_admin';
  createdAt: Date;
}

export class AdminService {
  constructor(private db: ReturnType<typeof createDb>) {}

  async getPlatformStats(): Promise<PlatformStats> {
    const [
      totalUsersResult,
      totalOfficesResult,
      totalMaidsResult,
      totalQuotationsResult,
      paymentsResult,
      activeSubsResult,
    ] = await Promise.all([
      this.db.select({ count: count() }).from(users),
      this.db.select({ count: count() }).from(offices),
      this.db.select({ count: count() }).from(maids),
      this.db.select({ count: count() }).from(quotations),
      this.db
        .select({
          count: count(),
          sum: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        })
        .from(payments)
        .where(eq(payments.status, 'succeeded')),
      this.db
        .select({ count: count() })
        .from(officeSubscriptions)
        .where(eq(officeSubscriptions.status, 'active')),
    ]);

    return {
      totalUsers: totalUsersResult[0]?.count || 0,
      totalOffices: totalOfficesResult[0]?.count || 0,
      totalMaids: totalMaidsResult[0]?.count || 0,
      totalQuotations: totalQuotationsResult[0]?.count || 0,
      totalPayments: paymentsResult[0]?.count || 0,
      revenue: Number(paymentsResult[0]?.sum) || 0,
      activeSubscriptions: activeSubsResult[0]?.count || 0,
    };
  }

  async listMaids(options: {
    page: number;
    pageSize: number;
    search?: string;
    status?: 'available' | 'busy' | 'reserved' | 'inactive';
    officeId?: string;
  }): Promise<{
    items: MaidListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, search, status, officeId } = options;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (status) conditions.push(eq(maids.status, status));
    if (officeId) conditions.push(eq(maids.officeId, officeId));
    if (search) {
      conditions.push(
        or(
          like(maids.name, `%${search}%`),
          like(maids.nameAr, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.db.query.maids.findMany({
        where: whereClause,
        with: {
          nationality: true,
          office: {
            columns: { id: true, name: true },
          },
        },
        orderBy: [desc(maids.createdAt)],
        limit: pageSize,
        offset,
      }),
      this.db.select({ count: count() }).from(maids).where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      items: items.map((m) => ({
        id: m.id,
        name: m.name,
        nameAr: m.nameAr,
        photoUrl: m.photoUrl,
        status: m.status,
        salary: m.salary,
        experienceYears: m.experienceYears,
        nationality: m.nationality
          ? {
              id: m.nationality.id,
              nameEn: m.nationality.nameEn,
              nameAr: m.nationality.nameAr,
            }
          : null,
        office: m.office ? { id: m.office.id, name: m.office.name } : null,
        createdAt: m.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateMaidStatus(
    maidId: string,
    status: 'available' | 'busy' | 'reserved' | 'inactive'
  ): Promise<{ id: string; status: string }> {
    await this.db
      .update(maids)
      .set({ status, updatedAt: new Date() })
      .where(eq(maids.id, maidId));

    return { id: maidId, status };
  }

  async bulkUpdateMaidStatus(
    maidIds: string[],
    status: 'available' | 'busy' | 'reserved' | 'inactive'
  ): Promise<{ updated: number }> {
    if (maidIds.length === 0) return { updated: 0 };

    await this.db
      .update(maids)
      .set({ status, updatedAt: new Date() })
      .where(sql`${maids.id} IN (${sql.join(maidIds.map(id => sql`${id}`), sql`, `)})`);

    return { updated: maidIds.length };
  }

  async listOffices(options: {
    page: number;
    pageSize: number;
    search?: string;
    isVerified?: boolean;
  }): Promise<{
    items: OfficeListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, search, isVerified } = options;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (isVerified !== undefined) conditions.push(eq(offices.isVerified, isVerified));
    if (search) {
      conditions.push(
        or(
          like(offices.name, `%${search}%`),
          like(offices.nameAr, `%${search}%`),
          like(offices.phone, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [officeList, totalResult] = await Promise.all([
      this.db.query.offices.findMany({
        where: whereClause,
        orderBy: [desc(offices.createdAt)],
        limit: pageSize,
        offset,
      }),
      this.db.select({ count: count() }).from(offices).where(whereClause),
    ]);

    // Get maid counts
    const officeIds = officeList.map((o) => o.id);
    const maidCounts =
      officeIds.length > 0
        ? await this.db
            .select({
              officeId: maids.officeId,
              count: count(),
            })
            .from(maids)
            .where(sql`${maids.officeId} IN (${sql.join(officeIds.map(id => sql`${id}`), sql`, `)})`)
            .groupBy(maids.officeId)
        : [];

    const countMap = new Map(maidCounts.map((c) => [c.officeId, c.count]));
    const total = totalResult[0]?.count || 0;

    return {
      items: officeList.map((o) => ({
        id: o.id,
        name: o.name,
        nameAr: o.nameAr,
        phone: o.phone,
        email: o.email,
        isVerified: o.isVerified,
        maidCount: countMap.get(o.id) || 0,
        createdAt: o.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateOffice(
    officeId: string,
    data: { isVerified?: boolean }
  ): Promise<OfficeListItem> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;

    await this.db.update(offices).set(updateData).where(eq(offices.id, officeId));

    const office = await this.db.query.offices.findFirst({
      where: eq(offices.id, officeId),
    });

    if (!office) throw new Error('Office not found');

    const maidCount = await this.db
      .select({ count: count() })
      .from(maids)
      .where(eq(maids.officeId, officeId));

    return {
      id: office.id,
      name: office.name,
      nameAr: office.nameAr,
      phone: office.phone,
      email: office.email,
      isVerified: office.isVerified,
      maidCount: maidCount[0]?.count || 0,
      createdAt: office.createdAt,
    };
  }

  async listUsers(options: {
    page: number;
    pageSize: number;
    search?: string;
    role?: 'customer' | 'office_admin' | 'super_admin';
  }): Promise<{
    items: UserListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, search, role } = options;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (role) conditions.push(eq(users.role, role));
    if (search) {
      conditions.push(
        or(
          like(users.phone, `%${search}%`),
          like(users.name, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [userList, totalResult] = await Promise.all([
      this.db.query.users.findMany({
        where: whereClause,
        orderBy: [desc(users.createdAt)],
        limit: pageSize,
        offset,
      }),
      this.db.select({ count: count() }).from(users).where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      items: userList.map((u) => ({
        id: u.id,
        phone: u.phone,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async sendMassNotification(
    title: string,
    body: string,
    targetRole?: 'customer' | 'office_admin' | 'super_admin'
  ): Promise<{ sent: number }> {
    // This method is kept for backwards compatibility
    // The admin route now uses NotificationService directly

    let userCount: number;
    if (targetRole) {
      const result = await this.db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, targetRole));
      userCount = result[0]?.count || 0;
    } else {
      const result = await this.db.select({ count: count() }).from(users);
      userCount = result[0]?.count || 0;
    }

    console.log(`Would send notification to ${userCount} users:`, { title, body });

    return { sent: userCount };
  }
}
