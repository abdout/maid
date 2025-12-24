import { eq, and, gte, lte, sql, desc, asc, inArray, or, ilike } from 'drizzle-orm';
import type { Database } from '../db';
import { maids, maidLanguages, maidDocuments, nationalities, languages, offices, cvUnlocks, cvUnlockPricing } from '../db/schema';
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
    if (!officeId) {
      conditions.push(eq(maids.status, 'available'));
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

    if (filterParams.experienceYears !== undefined) {
      conditions.push(gte(maids.experienceYears, filterParams.experienceYears));
    }

    if (filterParams.salaryMin !== undefined) {
      conditions.push(gte(maids.salary, filterParams.salaryMin.toString()));
    }

    if (filterParams.salaryMax !== undefined) {
      conditions.push(lte(maids.salary, filterParams.salaryMax.toString()));
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

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(maids)
      .where(whereClause);

    // Get paginated results with nationality
    const items = await this.db
      .select({
        maid: maids,
        nationality: nationalities,
      })
      .from(maids)
      .leftJoin(nationalities, eq(maids.nationalityId, nationalities.id))
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

    // Check if unlocked by this customer
    let isUnlocked = false;
    if (customerId) {
      const [unlock] = await this.db
        .select()
        .from(cvUnlocks)
        .where(
          and(
            eq(cvUnlocks.customerId, customerId),
            eq(cvUnlocks.maidId, id)
          )
        )
        .limit(1);
      isUnlocked = !!unlock;
    }

    // Get unlock price
    let unlockPrice = 99; // Default price
    let unlockCurrency = 'AED';

    // Try nationality-specific pricing first
    let pricing = await this.db
      .select()
      .from(cvUnlockPricing)
      .where(
        and(
          eq(cvUnlockPricing.nationalityId, result.maid.nationalityId),
          eq(cvUnlockPricing.isActive, true)
        )
      )
      .limit(1);

    // Fall back to default pricing
    if (pricing.length === 0) {
      pricing = await this.db
        .select()
        .from(cvUnlockPricing)
        .where(eq(cvUnlockPricing.isActive, true))
        .limit(1);
    }

    if (pricing.length > 0) {
      unlockPrice = parseFloat(pricing[0].price);
      unlockCurrency = pricing[0].currency;
    }

    // Build office info - mask contact details if not unlocked
    let officeInfo: OfficeInfo | null = null;
    if (result.office) {
      if (isUnlocked) {
        // Full office info for unlocked CVs
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
      } else {
        // Masked office info for locked CVs
        officeInfo = {
          id: result.office.id,
          name: result.office.name,
          nameAr: result.office.nameAr,
          phone: null, // Hidden
          email: null, // Hidden
          address: null, // Hidden
          addressAr: null, // Hidden
          logoUrl: result.office.logoUrl,
          isVerified: result.office.isVerified,
        };
      }
    }

    return {
      maid: result.maid,
      nationality: result.nationality,
      languages: maidLangs.map((l) => l.language),
      documents: docs,
      office: officeInfo,
      isUnlocked,
      unlockPrice: isUnlocked ? undefined : unlockPrice,
      unlockCurrency: isUnlocked ? undefined : unlockCurrency,
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
