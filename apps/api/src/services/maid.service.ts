import { eq, and, gte, lte, sql, desc, asc, inArray, or, ilike } from 'drizzle-orm';
import type { Database } from '../db';
import { maids, maidLanguages, maidDocuments, nationalities, languages, offices } from '../db/schema';
import type { MaidFiltersInput, CreateMaidInput, UpdateMaidInput } from '../validators/maid.schema';

// Office info type for maid detail response
export interface OfficeInfo {
  id: string;
  name: string;
  nameAr: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  addressAr: string | null;
  logoUrl: string | null;
  isVerified: boolean;
}

// Maid detail with unlock status
export interface MaidDetailResult {
  maid: typeof maids.$inferSelect;
  nationality: typeof nationalities.$inferSelect | null;
  languages: (typeof languages.$inferSelect)[];
  documents: (typeof maidDocuments.$inferSelect)[];
  office: OfficeInfo | null;
  isUnlocked: boolean;
  unlockPrice?: number;
  unlockCurrency?: string;
}

export class MaidService {
  constructor(private db: Database) {}

  async list(
    filters: MaidFiltersInput,
    officeId?: string
  ): Promise<{
    items: (typeof maids.$inferSelect & { nationality: typeof nationalities.$inferSelect | null })[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, ...filterParams } = filters;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];

    // Only show available maids for public listing (no officeId = public)
    // Also filter to only show maids from verified offices
    if (!officeId) {
      conditions.push(eq(maids.status, 'available'));
      conditions.push(eq(offices.isVerified, true));
    } else {
      conditions.push(eq(maids.officeId, officeId));
    }

    // Text search on name fields
    if (filterParams.search) {
      const searchTerm = `%${filterParams.search}%`;
      conditions.push(
        or(
          ilike(maids.name, searchTerm),
          ilike(maids.nameAr, searchTerm)
        )!
      );
    }

    if (filterParams.nationalityId) {
      conditions.push(eq(maids.nationalityId, filterParams.nationalityId));
    }

    // Multi-select nationalities filter
    if (filterParams.nationalityIds && filterParams.nationalityIds.length > 0) {
      conditions.push(inArray(maids.nationalityId, filterParams.nationalityIds));
    }

    // Simplified marital status filter: married or not_married
    if (filterParams.maritalStatus) {
      if (filterParams.maritalStatus === 'married') {
        conditions.push(eq(maids.maritalStatus, 'married'));
      } else if (filterParams.maritalStatus === 'not_married') {
        conditions.push(inArray(maids.maritalStatus, ['single', 'divorced', 'widowed']));
      }
    }

    if (filterParams.religion) {
      conditions.push(eq(maids.religion, filterParams.religion));
    }

    if (filterParams.status && officeId) {
      conditions.push(eq(maids.status, filterParams.status));
    }

    if (filterParams.serviceType) {
      conditions.push(eq(maids.serviceType, filterParams.serviceType));
    }

    // Multi-select service types filter
    if (filterParams.serviceTypes && filterParams.serviceTypes.length > 0) {
      conditions.push(inArray(maids.serviceType, filterParams.serviceTypes));
    }

    // Hiring type filter (legacy)
    if (filterParams.hiringType) {
      conditions.push(eq(maids.hiringType, filterParams.hiringType));
    }

    // Contract period filter (maps to hiringType database values)
    if (filterParams.contractPeriod) {
      // yearly/monthly maps to monthly_yearly, daily/hourly maps to hourly_daily
      if (filterParams.contractPeriod === 'yearly' || filterParams.contractPeriod === 'monthly') {
        conditions.push(eq(maids.hiringType, 'monthly_yearly'));
      } else if (filterParams.contractPeriod === 'daily' || filterParams.contractPeriod === 'hourly') {
        conditions.push(eq(maids.hiringType, 'hourly_daily'));
      }
    }

    // Visa type filter
    if (filterParams.visaType) {
      if (filterParams.visaType === 'customer_visa') {
        conditions.push(eq(maids.hiringType, 'customer_visa'));
      } else {
        // office_visa = any non-customer_visa (monthly_yearly or hourly_daily)
        conditions.push(inArray(maids.hiringType, ['monthly_yearly', 'hourly_daily']));
      }
    }

    // Emirate filter (filter by office's emirate)
    if (filterParams.emirate) {
      conditions.push(eq(offices.emirate, filterParams.emirate));
    }

    if (filterParams.experienceYears !== undefined) {
      conditions.push(gte(maids.experienceYears, filterParams.experienceYears));
    }

    if (filterParams.salaryMin !== undefined) {
      conditions.push(gte(maids.salary, filterParams.salaryMin.toString()));
    }

    if (filterParams.salaryMax !== undefined) {
      conditions.push(lte(maids.salary, filterParams.salaryMax.toString()));
    }

    // Age range preset filter (e.g., '20-30', '31-40', '40+')
    if (filterParams.ageRange) {
      const now = new Date();
      if (filterParams.ageRange === '20-30') {
        const maxBirthDate = new Date(now);
        maxBirthDate.setFullYear(now.getFullYear() - 20);
        const minBirthDate = new Date(now);
        minBirthDate.setFullYear(now.getFullYear() - 31);
        conditions.push(lte(maids.dateOfBirth, maxBirthDate));
        conditions.push(gte(maids.dateOfBirth, minBirthDate));
      } else if (filterParams.ageRange === '31-40') {
        const maxBirthDate = new Date(now);
        maxBirthDate.setFullYear(now.getFullYear() - 31);
        const minBirthDate = new Date(now);
        minBirthDate.setFullYear(now.getFullYear() - 41);
        conditions.push(lte(maids.dateOfBirth, maxBirthDate));
        conditions.push(gte(maids.dateOfBirth, minBirthDate));
      } else if (filterParams.ageRange === '40+') {
        const maxBirthDate = new Date(now);
        maxBirthDate.setFullYear(now.getFullYear() - 40);
        conditions.push(lte(maids.dateOfBirth, maxBirthDate));
      }
    }

    // Age filter (calculate from dateOfBirth)
    if (filterParams.ageMin !== undefined) {
      const maxBirthDate = new Date();
      maxBirthDate.setFullYear(maxBirthDate.getFullYear() - filterParams.ageMin);
      conditions.push(lte(maids.dateOfBirth, maxBirthDate));
    }

    if (filterParams.ageMax !== undefined) {
      const minBirthDate = new Date();
      minBirthDate.setFullYear(minBirthDate.getFullYear() - filterParams.ageMax - 1);
      conditions.push(gte(maids.dateOfBirth, minBirthDate));
    }

    // Sex filter
    if (filterParams.sex) {
      conditions.push(eq(maids.sex, filterParams.sex));
    }

    // Baby sitter filter
    if (filterParams.babySitter !== undefined) {
      conditions.push(eq(maids.babySitter, filterParams.babySitter));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    // Join offices table when: filtering by emirate OR public listing (to filter by isVerified)
    const needsOfficeJoin = !!filterParams.emirate || !officeId;

    // Get total count
    const countQuery = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(maids);

    if (needsOfficeJoin) {
      countQuery.innerJoin(offices, eq(maids.officeId, offices.id));
    }

    const [{ count }] = await countQuery.where(whereClause);

    // Get paginated results with nationality
    const itemsQuery = this.db
      .select({
        maid: maids,
        nationality: nationalities,
      })
      .from(maids)
      .leftJoin(nationalities, eq(maids.nationalityId, nationalities.id));

    if (needsOfficeJoin) {
      itemsQuery.innerJoin(offices, eq(maids.officeId, offices.id));
    }

    const items = await itemsQuery
      .where(whereClause)
      .orderBy(desc(maids.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      items: items.map((row) => ({
        ...row.maid,
        nationality: row.nationality,
      })),
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  async getById(id: string, officeId?: string): Promise<{
    maid: typeof maids.$inferSelect;
    nationality: typeof nationalities.$inferSelect | null;
    languages: (typeof languages.$inferSelect)[];
    documents: (typeof maidDocuments.$inferSelect)[];
  } | null> {
    const conditions = [eq(maids.id, id)];
    if (officeId) {
      conditions.push(eq(maids.officeId, officeId));
    }

    const [result] = await this.db
      .select({
        maid: maids,
        nationality: nationalities,
      })
      .from(maids)
      .leftJoin(nationalities, eq(maids.nationalityId, nationalities.id))
      .where(and(...conditions))
      .limit(1);

    if (!result) {
      return null;
    }

    // Get languages
    const maidLangs = await this.db
      .select({ language: languages })
      .from(maidLanguages)
      .innerJoin(languages, eq(maidLanguages.languageId, languages.id))
      .where(eq(maidLanguages.maidId, id));

    // Get documents
    const docs = await this.db
      .select()
      .from(maidDocuments)
      .where(eq(maidDocuments.maidId, id));

    return {
      maid: result.maid,
      nationality: result.nationality,
      languages: maidLangs.map((l) => l.language),
      documents: docs,
    };
  }

  // Get maid with unlock status for public viewing (customers)
  async getByIdWithUnlockStatus(
    id: string,
    customerId?: string
  ): Promise<MaidDetailResult | null> {
    // Get maid with nationality and office
    const [result] = await this.db
      .select({
        maid: maids,
        nationality: nationalities,
        office: offices,
      })
      .from(maids)
      .leftJoin(nationalities, eq(maids.nationalityId, nationalities.id))
      .innerJoin(offices, eq(maids.officeId, offices.id))
      .where(eq(maids.id, id))
      .limit(1);

    if (!result) {
      return null;
    }

    // Get languages
    const maidLangs = await this.db
      .select({ language: languages })
      .from(maidLanguages)
      .innerJoin(languages, eq(maidLanguages.languageId, languages.id))
      .where(eq(maidLanguages.maidId, id));

    // Get documents
    const docs = await this.db
      .select()
      .from(maidDocuments)
      .where(eq(maidDocuments.maidId, id));

    // Free access phase: Always show full office info without payment
    // Build office info - always return full details (no masking)
    let officeInfo: OfficeInfo | null = null;
    if (result.office) {
      officeInfo = {
        id: result.office.id,
        name: result.office.name,
        nameAr: result.office.nameAr,
        phone: result.office.phone,
        email: result.office.email,
        address: result.office.address,
        addressAr: result.office.addressAr,
        logoUrl: result.office.logoUrl,
        isVerified: result.office.isVerified,
      };
    }

    return {
      maid: result.maid,
      nationality: result.nationality,
      languages: maidLangs.map((l) => l.language),
      documents: docs,
      office: officeInfo,
      isUnlocked: true, // Always unlocked in free access phase
    };
  }

  async create(
    officeId: string,
    data: CreateMaidInput
  ): Promise<typeof maids.$inferSelect> {
    const { languageIds, ...maidData } = data;

    const [maid] = await this.db
      .insert(maids)
      .values({
        ...maidData,
        officeId,
        salary: maidData.salary.toString(),
        officeFees: maidData.officeFees?.toString(),
      })
      .returning();

    // Add languages
    if (languageIds && languageIds.length > 0) {
      await this.db.insert(maidLanguages).values(
        languageIds.map((languageId) => ({
          maidId: maid.id,
          languageId,
        }))
      );
    }

    return maid;
  }

  async update(
    id: string,
    officeId: string,
    data: UpdateMaidInput
  ): Promise<typeof maids.$inferSelect | null> {
    const { languageIds, ...maidData } = data;

    // Check ownership
    const [existing] = await this.db
      .select()
      .from(maids)
      .where(and(eq(maids.id, id), eq(maids.officeId, officeId)))
      .limit(1);

    if (!existing) {
      return null;
    }

    // Update maid
    const updateData: Record<string, unknown> = { ...maidData, updatedAt: new Date() };
    if (maidData.salary !== undefined) {
      updateData.salary = maidData.salary.toString();
    }
    if (maidData.officeFees !== undefined) {
      updateData.officeFees = maidData.officeFees.toString();
    }

    const [updated] = await this.db
      .update(maids)
      .set(updateData)
      .where(eq(maids.id, id))
      .returning();

    // Update languages if provided
    if (languageIds !== undefined) {
      // Remove existing
      await this.db.delete(maidLanguages).where(eq(maidLanguages.maidId, id));

      // Add new
      if (languageIds.length > 0) {
        await this.db.insert(maidLanguages).values(
          languageIds.map((languageId) => ({
            maidId: id,
            languageId,
          }))
        );
      }
    }

    return updated;
  }

  async delete(id: string, officeId: string): Promise<boolean> {
    // Check ownership
    const [existing] = await this.db
      .select()
      .from(maids)
      .where(and(eq(maids.id, id), eq(maids.officeId, officeId)))
      .limit(1);

    if (!existing) {
      return false;
    }

    // Delete related records
    await this.db.delete(maidLanguages).where(eq(maidLanguages.maidId, id));
    await this.db.delete(maidDocuments).where(eq(maidDocuments.maidId, id));

    // Delete maid
    await this.db.delete(maids).where(eq(maids.id, id));

    return true;
  }

  async updateStatus(
    id: string,
    officeId: string,
    status: 'available' | 'busy' | 'reserved' | 'inactive'
  ): Promise<typeof maids.$inferSelect | null> {
    const [updated] = await this.db
      .update(maids)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(maids.id, id), eq(maids.officeId, officeId)))
      .returning();

    return updated || null;
  }

  async addDocument(
    maidId: string,
    officeId: string,
    type: string,
    url: string
  ): Promise<typeof maidDocuments.$inferSelect | null> {
    // Verify ownership
    const [maid] = await this.db
      .select()
      .from(maids)
      .where(and(eq(maids.id, maidId), eq(maids.officeId, officeId)))
      .limit(1);

    if (!maid) {
      return null;
    }

    const [doc] = await this.db
      .insert(maidDocuments)
      .values({ maidId, type, url })
      .returning();

    return doc;
  }

  async removeDocument(
    documentId: string,
    officeId: string
  ): Promise<boolean> {
    // Get document with maid to verify ownership
    const [doc] = await this.db
      .select({ doc: maidDocuments, maid: maids })
      .from(maidDocuments)
      .innerJoin(maids, eq(maidDocuments.maidId, maids.id))
      .where(and(eq(maidDocuments.id, documentId), eq(maids.officeId, officeId)))
      .limit(1);

    if (!doc) {
      return false;
    }

    await this.db.delete(maidDocuments).where(eq(maidDocuments.id, documentId));

    return true;
  }
}
