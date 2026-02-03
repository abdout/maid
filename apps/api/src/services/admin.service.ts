import { eq, and, sql, desc, count, like, or, inArray, gte, lte } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import type { createDb } from '../db';
import {
  users,
  offices,
  maids,
  quotations,
  payments,
  officeSubscriptions,
  nationalities,
  languages,
  maidLanguages,
  maidDocuments,
  cvUnlocks,
  auditLogs,
  favorites,
} from '../db/schema';
import { generateSecurePassword } from '../lib/password';
import type {
  CreateOfficeWithAdminInput,
  ApproveOfficeInput,
  ResetOfficePasswordInput,
  CreateMaidForOfficeInput,
} from '../validators/admin.schema';

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
  isSuspended: boolean;
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

export interface PaymentListItem {
  id: string;
  type: string;
  provider: string;
  status: string;
  amount: string;
  currency: string;
  user: { id: string; name: string | null; phone: string | null } | null;
  createdAt: Date;
}

export interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  succeededPayments: number;
  failedPayments: number;
  pendingPayments: number;
  cvUnlockRevenue: number;
  subscriptionRevenue: number;
}

export interface CvUnlockListItem {
  id: string;
  customer: { id: string; name: string | null; phone: string | null } | null;
  maid: { id: string; name: string; photoUrl: string | null } | null;
  payment: { id: string; amount: string; status: string } | null;
  unlockedAt: Date;
}

export interface CvUnlockStats {
  totalUnlocks: number;
  uniqueCustomers: number;
  uniqueMaids: number;
  todayUnlocks: number;
  weekUnlocks: number;
  monthUnlocks: number;
}

export interface AuditLogListItem {
  id: string;
  admin: { id: string; name: string | null } | null;
  action: string;
  targetType: string;
  targetId: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface QuotationListItem {
  id: string;
  customer: { id: string; name: string | null; phone: string | null } | null;
  maid: { id: string; name: string; photoUrl: string | null } | null;
  office: { id: string; name: string } | null;
  salary: string;
  contractMonths: number;
  status: string;
  notes: string | null;
  createdAt: Date;
}

export interface OfficeDetail {
  id: string;
  name: string;
  nameAr: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  addressAr: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  scopes: string[];
  licenseNumber: string | null;
  licenseExpiry: Date | null;
  licenseImageUrl: string | null;
  managerPhone1: string | null;
  managerPhone2: string | null;
  googleMapsUrl: string | null;
  emirate: string | null;
  website: string | null;
  createdByAdminId: string | null;
  createdAt: Date;
  updatedAt: Date;
  adminUsers: { id: string; email: string | null; name: string | null; createdAt: Date }[];
  createdByAdmin: { id: string; name: string | null } | null;
  stats: { totalMaids: number; activeMaids: number; quotations: number };
}

export interface CreateOfficeResult {
  office: OfficeListItem;
  admin: {
    id: string;
    email: string;
    name: string | null;
    temporaryPassword?: string;
  };
}

export interface MaidDetail {
  id: string;
  officeId: string;
  name: string;
  nameAr: string | null;
  nationalityId: string;
  dateOfBirth: Date;
  maritalStatus: string;
  religion: string;
  experienceYears: number;
  salary: string;
  photoUrl: string | null;
  status: string;
  serviceType: string;
  bio: string | null;
  bioAr: string | null;
  sex: string | null;
  educationLevel: string | null;
  hasChildren: boolean | null;
  jobType: string | null;
  packageType: string | null;
  hasExperience: boolean | null;
  experienceDetails: string | null;
  skillsDetails: string | null;
  cookingSkills: string | null;
  babySitter: boolean | null;
  officeFees: string | null;
  availability: string | null;
  whatsappNumber: string | null;
  contactNumber: string | null;
  cvReference: string | null;
  nationality: { id: string; code: string; nameEn: string; nameAr: string } | null;
  office: { id: string; name: string; nameAr: string | null } | null;
  languages: { id: string; code: string; nameEn: string; nameAr: string }[];
  documents: { id: string; type: string; url: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMaidInput {
  officeId: string;
  name: string;
  nameAr?: string;
  nationalityId: string;
  dateOfBirth: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  religion: 'muslim' | 'non_muslim';
  experienceYears?: number;
  salary: string;
  photoUrl?: string;
  status?: 'available' | 'inactive' | 'busy' | 'reserved';
  serviceType?: string;
  bio?: string;
  bioAr?: string;
  sex?: 'male' | 'female';
  educationLevel?: string;
  hasChildren?: boolean;
  jobType?: string;
  packageType?: string;
  hasExperience?: boolean;
  experienceDetails?: string;
  skillsDetails?: string;
  cookingSkills?: string;
  babySitter?: boolean;
  officeFees?: string;
  availability?: string;
  whatsappNumber?: string;
  contactNumber?: string;
  cvReference?: string;
  languageIds?: string[];
}

export type UpdateMaidInput = Partial<CreateMaidInput>;

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
        isSuspended: o.isSuspended,
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
    data: { isVerified?: boolean; isSuspended?: boolean }
  ): Promise<OfficeListItem> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;
    if (data.isSuspended !== undefined) updateData.isSuspended = data.isSuspended;

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
      isSuspended: office.isSuspended,
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

  async listPayments(options: {
    page: number;
    pageSize: number;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    items: PaymentListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, status, type, startDate, endDate } = options;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (status) conditions.push(eq(payments.status, status as 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'));
    if (type) conditions.push(eq(payments.type, type as 'cv_unlock' | 'subscription' | 'business_subscription'));
    if (startDate) conditions.push(gte(payments.createdAt, new Date(startDate)));
    if (endDate) conditions.push(lte(payments.createdAt, new Date(endDate)));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.db.query.payments.findMany({
        where: whereClause,
        with: {
          user: {
            columns: { id: true, name: true, phone: true },
          },
        },
        orderBy: [desc(payments.createdAt)],
        limit: pageSize,
        offset,
      }),
      this.db.select({ count: count() }).from(payments).where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      items: items.map((p) => ({
        id: p.id,
        type: p.type,
        provider: p.provider,
        status: p.status,
        amount: p.amount,
        currency: p.currency,
        user: p.user ? { id: p.user.id, name: p.user.name, phone: p.user.phone } : null,
        createdAt: p.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getPaymentStats(): Promise<PaymentStats> {
    const [
      totalResult,
      succeededResult,
      failedResult,
      pendingResult,
      cvUnlockResult,
      subscriptionResult,
    ] = await Promise.all([
      this.db
        .select({
          count: count(),
          sum: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        })
        .from(payments),
      this.db
        .select({ count: count() })
        .from(payments)
        .where(eq(payments.status, 'succeeded')),
      this.db
        .select({ count: count() })
        .from(payments)
        .where(eq(payments.status, 'failed')),
      this.db
        .select({ count: count() })
        .from(payments)
        .where(eq(payments.status, 'pending')),
      this.db
        .select({
          sum: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        })
        .from(payments)
        .where(and(eq(payments.type, 'cv_unlock'), eq(payments.status, 'succeeded'))),
      this.db
        .select({
          sum: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
        })
        .from(payments)
        .where(and(eq(payments.type, 'subscription'), eq(payments.status, 'succeeded'))),
    ]);

    return {
      totalPayments: totalResult[0]?.count || 0,
      totalRevenue: Number(totalResult[0]?.sum) || 0,
      succeededPayments: succeededResult[0]?.count || 0,
      failedPayments: failedResult[0]?.count || 0,
      pendingPayments: pendingResult[0]?.count || 0,
      cvUnlockRevenue: Number(cvUnlockResult[0]?.sum) || 0,
      subscriptionRevenue: Number(subscriptionResult[0]?.sum) || 0,
    };
  }

  async listCvUnlocks(options: {
    page: number;
    pageSize: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    items: CvUnlockListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, startDate, endDate } = options;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (startDate) conditions.push(gte(cvUnlocks.unlockedAt, new Date(startDate)));
    if (endDate) conditions.push(lte(cvUnlocks.unlockedAt, new Date(endDate)));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.db.query.cvUnlocks.findMany({
        where: whereClause,
        with: {
          customer: {
            columns: { id: true, name: true, phone: true },
          },
          maid: {
            columns: { id: true, name: true, photoUrl: true },
          },
          payment: {
            columns: { id: true, amount: true, status: true },
          },
        },
        orderBy: [desc(cvUnlocks.unlockedAt)],
        limit: pageSize,
        offset,
      }),
      this.db.select({ count: count() }).from(cvUnlocks).where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      items: items.map((u) => ({
        id: u.id,
        customer: u.customer ? { id: u.customer.id, name: u.customer.name, phone: u.customer.phone } : null,
        maid: u.maid ? { id: u.maid.id, name: u.maid.name, photoUrl: u.maid.photoUrl } : null,
        payment: u.payment ? { id: u.payment.id, amount: u.payment.amount, status: u.payment.status } : null,
        unlockedAt: u.unlockedAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getCvUnlockStats(): Promise<CvUnlockStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setMonth(monthStart.getMonth() - 1);

    const [
      totalResult,
      uniqueCustomersResult,
      uniqueMaidsResult,
      todayResult,
      weekResult,
      monthResult,
    ] = await Promise.all([
      this.db.select({ count: count() }).from(cvUnlocks),
      this.db.select({ count: sql<number>`COUNT(DISTINCT ${cvUnlocks.customerId})` }).from(cvUnlocks),
      this.db.select({ count: sql<number>`COUNT(DISTINCT ${cvUnlocks.maidId})` }).from(cvUnlocks),
      this.db.select({ count: count() }).from(cvUnlocks).where(gte(cvUnlocks.unlockedAt, todayStart)),
      this.db.select({ count: count() }).from(cvUnlocks).where(gte(cvUnlocks.unlockedAt, weekStart)),
      this.db.select({ count: count() }).from(cvUnlocks).where(gte(cvUnlocks.unlockedAt, monthStart)),
    ]);

    return {
      totalUnlocks: totalResult[0]?.count || 0,
      uniqueCustomers: Number(uniqueCustomersResult[0]?.count) || 0,
      uniqueMaids: Number(uniqueMaidsResult[0]?.count) || 0,
      todayUnlocks: todayResult[0]?.count || 0,
      weekUnlocks: weekResult[0]?.count || 0,
      monthUnlocks: monthResult[0]?.count || 0,
    };
  }

  async listAuditLogs(options: {
    page: number;
    pageSize: number;
    action?: string;
    targetType?: string;
    adminId?: string;
  }): Promise<{
    items: AuditLogListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, action, targetType, adminId } = options;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (action) conditions.push(eq(auditLogs.action, action));
    if (targetType) conditions.push(eq(auditLogs.targetType, targetType));
    if (adminId) conditions.push(eq(auditLogs.adminId, adminId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.db.query.auditLogs.findMany({
        where: whereClause,
        with: {
          admin: {
            columns: { id: true, name: true },
          },
        },
        orderBy: [desc(auditLogs.createdAt)],
        limit: pageSize,
        offset,
      }),
      this.db.select({ count: count() }).from(auditLogs).where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      items: items.map((l) => ({
        id: l.id,
        admin: l.admin ? { id: l.admin.id, name: l.admin.name } : null,
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        details: l.details,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async listQuotations(options: {
    page: number;
    pageSize: number;
    status?: string;
    officeId?: string;
  }): Promise<{
    items: QuotationListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, status, officeId } = options;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (status) conditions.push(eq(quotations.status, status as 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired'));
    if (officeId) conditions.push(eq(quotations.officeId, officeId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.db.query.quotations.findMany({
        where: whereClause,
        with: {
          customer: {
            columns: { id: true, name: true, phone: true },
          },
          maid: {
            columns: { id: true, name: true, photoUrl: true },
          },
          office: {
            columns: { id: true, name: true },
          },
        },
        orderBy: [desc(quotations.createdAt)],
        limit: pageSize,
        offset,
      }),
      this.db.select({ count: count() }).from(quotations).where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      items: items.map((q) => ({
        id: q.id,
        customer: q.customer ? { id: q.customer.id, name: q.customer.name, phone: q.customer.phone } : null,
        maid: q.maid ? { id: q.maid.id, name: q.maid.name, photoUrl: q.maid.photoUrl } : null,
        office: q.office ? { id: q.office.id, name: q.office.name } : null,
        salary: q.salary,
        contractMonths: q.contractMonths,
        status: q.status,
        notes: q.notes,
        createdAt: q.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateQuotationStatus(
    quotationId: string,
    status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired'
  ): Promise<QuotationListItem> {
    await this.db
      .update(quotations)
      .set({ status, updatedAt: new Date() })
      .where(eq(quotations.id, quotationId));

    const quotation = await this.db.query.quotations.findFirst({
      where: eq(quotations.id, quotationId),
      with: {
        customer: { columns: { id: true, name: true, phone: true } },
        maid: { columns: { id: true, name: true, photoUrl: true } },
        office: { columns: { id: true, name: true } },
      },
    });

    if (!quotation) throw new Error('Quotation not found');

    return {
      id: quotation.id,
      customer: quotation.customer ? { id: quotation.customer.id, name: quotation.customer.name, phone: quotation.customer.phone } : null,
      maid: quotation.maid ? { id: quotation.maid.id, name: quotation.maid.name, photoUrl: quotation.maid.photoUrl } : null,
      office: quotation.office ? { id: quotation.office.id, name: quotation.office.name } : null,
      salary: quotation.salary,
      contractMonths: quotation.contractMonths,
      status: quotation.status,
      notes: quotation.notes,
      createdAt: quotation.createdAt,
    };
  }

  async getMaid(maidId: string): Promise<MaidDetail | null> {
    const maid = await this.db.query.maids.findFirst({
      where: eq(maids.id, maidId),
      with: {
        nationality: true,
        office: {
          columns: { id: true, name: true, nameAr: true },
        },
        languages: {
          with: {
            language: true,
          },
        },
        documents: true,
      },
    });

    if (!maid) return null;

    return {
      id: maid.id,
      officeId: maid.officeId,
      name: maid.name,
      nameAr: maid.nameAr,
      nationalityId: maid.nationalityId,
      dateOfBirth: maid.dateOfBirth,
      maritalStatus: maid.maritalStatus,
      religion: maid.religion,
      experienceYears: maid.experienceYears,
      salary: maid.salary,
      photoUrl: maid.photoUrl,
      status: maid.status,
      serviceType: maid.serviceType,
      bio: maid.bio,
      bioAr: maid.bioAr,
      sex: maid.sex,
      educationLevel: maid.educationLevel,
      hasChildren: maid.hasChildren,
      jobType: maid.jobType,
      packageType: maid.packageType,
      hasExperience: maid.hasExperience,
      experienceDetails: maid.experienceDetails,
      skillsDetails: maid.skillsDetails,
      cookingSkills: maid.cookingSkills,
      babySitter: maid.babySitter,
      officeFees: maid.officeFees,
      availability: maid.availability,
      whatsappNumber: maid.whatsappNumber,
      contactNumber: maid.contactNumber,
      cvReference: maid.cvReference,
      nationality: maid.nationality
        ? {
            id: maid.nationality.id,
            code: maid.nationality.code,
            nameEn: maid.nationality.nameEn,
            nameAr: maid.nationality.nameAr,
          }
        : null,
      office: maid.office
        ? { id: maid.office.id, name: maid.office.name, nameAr: maid.office.nameAr }
        : null,
      languages: maid.languages.map((ml) => ({
        id: ml.language.id,
        code: ml.language.code,
        nameEn: ml.language.nameEn,
        nameAr: ml.language.nameAr,
      })),
      documents: maid.documents.map((d) => ({
        id: d.id,
        type: d.type,
        url: d.url,
        createdAt: d.createdAt,
      })),
      createdAt: maid.createdAt,
      updatedAt: maid.updatedAt,
    };
  }

  async createMaid(input: CreateMaidInput): Promise<MaidDetail> {
    const { languageIds, ...maidData } = input;

    const [newMaid] = await this.db
      .insert(maids)
      .values({
        ...maidData,
        dateOfBirth: new Date(maidData.dateOfBirth),
        experienceYears: maidData.experienceYears || 0,
        status: maidData.status || 'available',
        serviceType: (maidData.serviceType as 'individual' | 'business' | 'cleaning' | 'cooking' | 'babysitter' | 'elderly' | 'driver') || 'individual',
        sex: (maidData.sex as 'male' | 'female') || 'female',
        educationLevel: maidData.educationLevel as 'college' | 'high_school' | 'primary' | 'none' | undefined,
        jobType: (maidData.jobType as 'domestic_worker' | 'nurse_caregiver' | 'driver') || 'domestic_worker',
        packageType: (maidData.packageType as 'traditional' | 'flexible' | 'hourly') || 'traditional',
        cookingSkills: maidData.cookingSkills as 'good' | 'average' | 'willing_to_learn' | 'none' | undefined,
        availability: (maidData.availability as 'inside_uae' | 'outside_uae') || 'inside_uae',
      })
      .returning();

    if (languageIds && languageIds.length > 0) {
      await this.db.insert(maidLanguages).values(
        languageIds.map((languageId) => ({
          maidId: newMaid.id,
          languageId,
        }))
      );
    }

    return this.getMaid(newMaid.id) as Promise<MaidDetail>;
  }

  async updateMaid(maidId: string, input: UpdateMaidInput): Promise<MaidDetail> {
    const { languageIds, ...maidData } = input;

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };

    if (maidData.officeId !== undefined) updateValues.officeId = maidData.officeId;
    if (maidData.name !== undefined) updateValues.name = maidData.name;
    if (maidData.nameAr !== undefined) updateValues.nameAr = maidData.nameAr;
    if (maidData.nationalityId !== undefined) updateValues.nationalityId = maidData.nationalityId;
    if (maidData.dateOfBirth !== undefined) updateValues.dateOfBirth = new Date(maidData.dateOfBirth);
    if (maidData.maritalStatus !== undefined) updateValues.maritalStatus = maidData.maritalStatus;
    if (maidData.religion !== undefined) updateValues.religion = maidData.religion;
    if (maidData.experienceYears !== undefined) updateValues.experienceYears = maidData.experienceYears;
    if (maidData.salary !== undefined) updateValues.salary = maidData.salary;
    if (maidData.photoUrl !== undefined) updateValues.photoUrl = maidData.photoUrl;
    if (maidData.status !== undefined) updateValues.status = maidData.status;
    if (maidData.serviceType !== undefined) updateValues.serviceType = maidData.serviceType;
    if (maidData.bio !== undefined) updateValues.bio = maidData.bio;
    if (maidData.bioAr !== undefined) updateValues.bioAr = maidData.bioAr;
    if (maidData.sex !== undefined) updateValues.sex = maidData.sex;
    if (maidData.educationLevel !== undefined) updateValues.educationLevel = maidData.educationLevel;
    if (maidData.hasChildren !== undefined) updateValues.hasChildren = maidData.hasChildren;
    if (maidData.jobType !== undefined) updateValues.jobType = maidData.jobType;
    if (maidData.packageType !== undefined) updateValues.packageType = maidData.packageType;
    if (maidData.hasExperience !== undefined) updateValues.hasExperience = maidData.hasExperience;
    if (maidData.experienceDetails !== undefined) updateValues.experienceDetails = maidData.experienceDetails;
    if (maidData.skillsDetails !== undefined) updateValues.skillsDetails = maidData.skillsDetails;
    if (maidData.cookingSkills !== undefined) updateValues.cookingSkills = maidData.cookingSkills;
    if (maidData.babySitter !== undefined) updateValues.babySitter = maidData.babySitter;
    if (maidData.officeFees !== undefined) updateValues.officeFees = maidData.officeFees;
    if (maidData.availability !== undefined) updateValues.availability = maidData.availability;
    if (maidData.whatsappNumber !== undefined) updateValues.whatsappNumber = maidData.whatsappNumber;
    if (maidData.contactNumber !== undefined) updateValues.contactNumber = maidData.contactNumber;
    if (maidData.cvReference !== undefined) updateValues.cvReference = maidData.cvReference;

    await this.db.update(maids).set(updateValues).where(eq(maids.id, maidId));

    if (languageIds !== undefined) {
      await this.db.delete(maidLanguages).where(eq(maidLanguages.maidId, maidId));
      if (languageIds.length > 0) {
        await this.db.insert(maidLanguages).values(
          languageIds.map((languageId) => ({
            maidId,
            languageId,
          }))
        );
      }
    }

    return this.getMaid(maidId) as Promise<MaidDetail>;
  }

  async deleteMaid(maidId: string): Promise<void> {
    await this.db.delete(maidLanguages).where(eq(maidLanguages.maidId, maidId));
    await this.db.delete(maidDocuments).where(eq(maidDocuments.maidId, maidId));
    await this.db.delete(maids).where(eq(maids.id, maidId));
  }

  async addMaidDocument(maidId: string, type: string, url: string): Promise<{ id: string; type: string; url: string; createdAt: Date }> {
    const [doc] = await this.db
      .insert(maidDocuments)
      .values({ maidId, type, url })
      .returning();

    return { id: doc.id, type: doc.type, url: doc.url, createdAt: doc.createdAt };
  }

  async deleteMaidDocument(documentId: string): Promise<void> {
    await this.db.delete(maidDocuments).where(eq(maidDocuments.id, documentId));
  }

  async listNationalities(): Promise<{ id: string; code: string; nameEn: string; nameAr: string }[]> {
    const result = await this.db.query.nationalities.findMany();
    return result.map((n) => ({
      id: n.id,
      code: n.code,
      nameEn: n.nameEn,
      nameAr: n.nameAr,
    }));
  }

  async listLanguages(): Promise<{ id: string; code: string; nameEn: string; nameAr: string }[]> {
    const result = await this.db.query.languages.findMany();
    return result.map((l) => ({
      id: l.id,
      code: l.code,
      nameEn: l.nameEn,
      nameAr: l.nameAr,
    }));
  }

  async logAuditAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details?: string,
    ipAddress?: string
  ): Promise<void> {
    await this.db.insert(auditLogs).values({
      adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
    });
  }

  // ==========================================
  // OFFICE MANAGEMENT (SUPER ADMIN)
  // ==========================================

  private readonly BCRYPT_ROUNDS = 12;

  /**
   * Create a new office with an admin user account
   * Used by super_admin to manually onboard offices
   */
  async createOfficeWithAdmin(
    input: CreateOfficeWithAdminInput,
    createdByAdminId: string
  ): Promise<CreateOfficeResult> {
    const { office: officeData, admin: adminData, autoVerify } = input;

    // Check if admin email already exists
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, adminData.email.toLowerCase()),
    });
    if (existingUser) {
      throw new Error('Admin email already exists');
    }

    // Check if office phone already exists
    const existingOffice = await this.db.query.offices.findFirst({
      where: eq(offices.phone, officeData.phone),
    });
    if (existingOffice) {
      throw new Error('Office phone already exists');
    }

    // Generate password if not provided
    const password = adminData.password || generateSecurePassword();
    const hashedPassword = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // Create office first
    const [newOffice] = await this.db
      .insert(offices)
      .values({
        name: officeData.name,
        nameAr: officeData.nameAr,
        phone: officeData.phone,
        email: officeData.email,
        address: officeData.address,
        addressAr: officeData.addressAr,
        scopes: officeData.scopes as ('recruitment' | 'leasing' | 'typing')[],
        emirate: officeData.emirate,
        isVerified: autoVerify,
        createdByAdminId,
      })
      .returning();

    // Create admin user linked to office
    const [adminUser] = await this.db
      .insert(users)
      .values({
        email: adminData.email.toLowerCase(),
        password: hashedPassword,
        name: adminData.name,
        role: 'office_admin',
        officeId: newOffice.id,
      })
      .returning();

    // Get maid count (should be 0 for new office)
    const maidCountResult = await this.db
      .select({ count: count() })
      .from(maids)
      .where(eq(maids.officeId, newOffice.id));

    const officeResult: OfficeListItem = {
      id: newOffice.id,
      name: newOffice.name,
      nameAr: newOffice.nameAr,
      phone: newOffice.phone,
      email: newOffice.email,
      isVerified: newOffice.isVerified,
      isSuspended: newOffice.isSuspended,
      maidCount: maidCountResult[0]?.count || 0,
      createdAt: newOffice.createdAt,
    };

    return {
      office: officeResult,
      admin: {
        id: adminUser.id,
        email: adminUser.email!,
        name: adminUser.name,
        // Only return the password if we generated it
        ...(adminData.password ? {} : { temporaryPassword: password }),
      },
    };
  }

  /**
   * Get detailed information about an office including admin users and stats
   */
  async getOfficeDetails(officeId: string): Promise<OfficeDetail | null> {
    const office = await this.db.query.offices.findFirst({
      where: eq(offices.id, officeId),
    });

    if (!office) return null;

    // Get admin users for this office
    const adminUsers = await this.db.query.users.findMany({
      where: and(
        eq(users.officeId, officeId),
        eq(users.role, 'office_admin')
      ),
      columns: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Get the admin who created this office (if any)
    let createdByAdmin = null;
    if (office.createdByAdminId) {
      const admin = await this.db.query.users.findFirst({
        where: eq(users.id, office.createdByAdminId),
        columns: { id: true, name: true },
      });
      if (admin) {
        createdByAdmin = { id: admin.id, name: admin.name };
      }
    }

    // Get stats
    const [totalMaidsResult, activeMaidsResult, quotationsResult] = await Promise.all([
      this.db.select({ count: count() }).from(maids).where(eq(maids.officeId, officeId)),
      this.db.select({ count: count() }).from(maids).where(
        and(eq(maids.officeId, officeId), eq(maids.status, 'available'))
      ),
      this.db.select({ count: count() }).from(quotations).where(eq(quotations.officeId, officeId)),
    ]);

    return {
      id: office.id,
      name: office.name,
      nameAr: office.nameAr,
      phone: office.phone,
      email: office.email,
      address: office.address,
      addressAr: office.addressAr,
      logoUrl: office.logoUrl,
      isVerified: office.isVerified,
      isSuspended: office.isSuspended,
      scopes: office.scopes,
      licenseNumber: office.licenseNumber,
      licenseExpiry: office.licenseExpiry,
      licenseImageUrl: office.licenseImageUrl,
      managerPhone1: office.managerPhone1,
      managerPhone2: office.managerPhone2,
      googleMapsUrl: office.googleMapsUrl,
      emirate: office.emirate,
      website: office.website,
      createdByAdminId: office.createdByAdminId,
      createdAt: office.createdAt,
      updatedAt: office.updatedAt,
      adminUsers,
      createdByAdmin,
      stats: {
        totalMaids: totalMaidsResult[0]?.count || 0,
        activeMaids: activeMaidsResult[0]?.count || 0,
        quotations: quotationsResult[0]?.count || 0,
      },
    };
  }

  /**
   * Approve or reject an office registration
   */
  async approveOffice(
    officeId: string,
    input: ApproveOfficeInput
  ): Promise<OfficeListItem> {
    const { approved, reason } = input;

    await this.db
      .update(offices)
      .set({
        isVerified: approved,
        updatedAt: new Date(),
      })
      .where(eq(offices.id, officeId));

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
      isSuspended: office.isSuspended,
      maidCount: maidCount[0]?.count || 0,
      createdAt: office.createdAt,
    };
  }

  /**
   * Reset password for an office admin user
   */
  async resetOfficeAdminPassword(
    input: ResetOfficePasswordInput
  ): Promise<{ temporaryPassword?: string }> {
    const { adminUserId, newPassword } = input;

    // Verify user exists and is an office_admin
    const user = await this.db.query.users.findFirst({
      where: and(eq(users.id, adminUserId), eq(users.role, 'office_admin')),
    });

    if (!user) {
      throw new Error('Office admin user not found');
    }

    // Generate password if not provided
    const password = newPassword || generateSecurePassword();
    const hashedPassword = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    await this.db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, adminUserId));

    // Only return the password if we generated it
    return newPassword ? {} : { temporaryPassword: password };
  }

  /**
   * Create a maid for a specific office (admin creates on behalf of office)
   */
  async createMaidForOffice(
    officeId: string,
    input: CreateMaidForOfficeInput
  ): Promise<MaidDetail> {
    // Verify office exists
    const office = await this.db.query.offices.findFirst({
      where: eq(offices.id, officeId),
    });

    if (!office) {
      throw new Error('Office not found');
    }

    const { languageIds, ...maidData } = input;

    const [newMaid] = await this.db
      .insert(maids)
      .values({
        officeId,
        name: maidData.name,
        nameAr: maidData.nameAr,
        nationalityId: maidData.nationalityId,
        dateOfBirth: new Date(maidData.dateOfBirth),
        maritalStatus: maidData.maritalStatus,
        religion: maidData.religion,
        experienceYears: maidData.experienceYears || 0,
        salary: maidData.salary,
        photoUrl: maidData.photoUrl,
        status: maidData.status || 'available',
        serviceType: maidData.serviceType || 'individual',
        bio: maidData.bio,
        bioAr: maidData.bioAr,
        sex: maidData.sex || 'female',
        educationLevel: maidData.educationLevel,
        hasChildren: maidData.hasChildren,
        jobType: maidData.jobType || 'domestic_worker',
        packageType: maidData.packageType || 'traditional',
        hasExperience: maidData.hasExperience,
        experienceDetails: maidData.experienceDetails,
        skillsDetails: maidData.skillsDetails,
        cookingSkills: maidData.cookingSkills,
        babySitter: maidData.babySitter,
        officeFees: maidData.officeFees,
        availability: maidData.availability || 'inside_uae',
        whatsappNumber: maidData.whatsappNumber,
        contactNumber: maidData.contactNumber,
        cvReference: maidData.cvReference,
        hiringType: maidData.hiringType || 'monthly_yearly',
      })
      .returning();

    // Add languages if provided
    if (languageIds && languageIds.length > 0) {
      await this.db.insert(maidLanguages).values(
        languageIds.map((languageId) => ({
          maidId: newMaid.id,
          languageId,
        }))
      );
    }

    return this.getMaid(newMaid.id) as Promise<MaidDetail>;
  }

  /**
   * Suspend or resume an office
   */
  async suspendOffice(officeId: string, suspended: boolean): Promise<OfficeListItem> {
    const office = await this.db.query.offices.findFirst({
      where: eq(offices.id, officeId),
    });

    if (!office) {
      throw new Error('Office not found');
    }

    await this.db
      .update(offices)
      .set({
        isSuspended: suspended,
        updatedAt: new Date(),
      })
      .where(eq(offices.id, officeId));

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
      isSuspended: suspended,
      maidCount: maidCount[0]?.count || 0,
      createdAt: office.createdAt,
    };
  }

  /**
   * Delete an office and all associated data
   * - Deletes all maids belonging to the office (with their languages and documents)
   * - Nullifies officeId in quotations to preserve customer history
   * - Deletes the office admin users
   */
  async deleteOffice(officeId: string): Promise<void> {
    const office = await this.db.query.offices.findFirst({
      where: eq(offices.id, officeId),
    });

    if (!office) {
      throw new Error('Office not found');
    }

    // Get all maid IDs for this office
    const officeMaids = await this.db
      .select({ id: maids.id })
      .from(maids)
      .where(eq(maids.officeId, officeId));

    const maidIds = officeMaids.map((m) => m.id);

    if (maidIds.length > 0) {
      // Delete maid languages
      await this.db.delete(maidLanguages).where(
        sql`${maidLanguages.maidId} IN (${sql.join(maidIds.map(id => sql`${id}`), sql`, `)})`
      );

      // Delete maid documents
      await this.db.delete(maidDocuments).where(
        sql`${maidDocuments.maidId} IN (${sql.join(maidIds.map(id => sql`${id}`), sql`, `)})`
      );

      // Delete favorites referencing these maids
      await this.db.delete(favorites).where(
        sql`${favorites.maidId} IN (${sql.join(maidIds.map(id => sql`${id}`), sql`, `)})`
      );

      // Delete CV unlocks referencing these maids
      await this.db.delete(cvUnlocks).where(
        sql`${cvUnlocks.maidId} IN (${sql.join(maidIds.map(id => sql`${id}`), sql`, `)})`
      );

      // Delete all maids
      await this.db.delete(maids).where(eq(maids.officeId, officeId));
    }

    // Delete quotations for this office (or set officeId to null to preserve history)
    await this.db.delete(quotations).where(eq(quotations.officeId, officeId));

    // Delete office subscriptions
    await this.db.delete(officeSubscriptions).where(eq(officeSubscriptions.officeId, officeId));

    // Delete office admin users
    await this.db.delete(users).where(
      and(eq(users.officeId, officeId), eq(users.role, 'office_admin'))
    );

    // Finally delete the office
    await this.db.delete(offices).where(eq(offices.id, officeId));
  }
}
