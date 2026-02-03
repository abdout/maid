import { eq, sql } from 'drizzle-orm';
import type { createDb } from '../db';
import {
  maids,
  maidLanguages,
  nationalities,
  languages,
  offices,
} from '../db/schema';

// Raw row from Excel/CSV
export interface RawImportRow {
  row_number: number;
  office_name: string;
  name: string;
  name_ar?: string;
  nationality: string;
  date_of_birth: string;
  marital_status: string;
  religion: string;
  salary: string;
  experience_years?: string;
  service_type?: string;
  languages?: string;
  whatsapp_number?: string;
  contact_number?: string;
  cv_reference?: string;
  sex?: string;
  education_level?: string;
  has_children?: string;
  job_type?: string;
  package_type?: string;
  cooking_skills?: string;
  baby_sitter?: string;
  office_fees?: string;
  availability?: string;
  bio?: string;
  bio_ar?: string;
}

// Validated row ready for insertion
export interface ValidatedRow {
  officeId: string;
  name: string;
  nameAr?: string;
  nationalityId: string;
  dateOfBirth: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  religion: 'muslim' | 'non_muslim';
  salary: string;
  experienceYears: number;
  serviceType: 'individual' | 'business' | 'cleaning' | 'cooking' | 'babysitter' | 'elderly' | 'driver';
  languageIds: string[];
  whatsappNumber?: string;
  contactNumber?: string;
  cvReference?: string;
  sex?: 'male' | 'female';
  educationLevel?: 'college' | 'high_school' | 'primary' | 'none';
  hasChildren?: boolean;
  jobType?: 'domestic_worker' | 'nurse_caregiver' | 'driver';
  packageType?: 'traditional' | 'flexible' | 'hourly';
  cookingSkills?: 'good' | 'average' | 'willing_to_learn' | 'none';
  babySitter?: boolean;
  officeFees?: string;
  availability?: 'inside_uae' | 'outside_uae';
  bio?: string;
  bioAr?: string;
}

export interface RowValidationResult {
  row_number: number;
  valid: boolean;
  errors: string[];
  data?: ValidatedRow;
}

export interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  rows: RowValidationResult[];
}

export interface ImportResult {
  success: boolean;
  created: number;
  failed: number;
  errors: { row_number: number; error: string }[];
}

export interface LookupMaps {
  nationalities: { id: string; nameEn: string; nameAr: string; code: string }[];
  languages: { id: string; nameEn: string; nameAr: string; code: string }[];
  offices: { id: string; name: string; nameAr: string | null }[];
}

// Nationality aliases for flexible matching
const NATIONALITY_ALIASES: Record<string, string[]> = {
  'Philippines': ['Filipino', 'Filipina', 'PH', 'PHL'],
  'Indonesia': ['Indonesian', 'ID', 'IDN'],
  'Ethiopia': ['Ethiopian', 'ET', 'ETH'],
  'Sri Lanka': ['Sri Lankan', 'LK', 'LKA'],
  'India': ['Indian', 'IN', 'IND'],
  'Bangladesh': ['Bangladeshi', 'BD', 'BGD'],
  'Nepal': ['Nepalese', 'Nepali', 'NP', 'NPL'],
  'Uganda': ['Ugandan', 'UG', 'UGA'],
  'Kenya': ['Kenyan', 'KE', 'KEN'],
  'Ghana': ['Ghanaian', 'GH', 'GHA'],
  'Nigeria': ['Nigerian', 'NG', 'NGA'],
  'Myanmar': ['Burmese', 'MM', 'MMR', 'Burma'],
  'Vietnam': ['Vietnamese', 'VN', 'VNM'],
  'Pakistan': ['Pakistani', 'PK', 'PAK'],
};

export class BulkImportService {
  constructor(private db: ReturnType<typeof createDb>) {}

  // Get lookup maps for validation
  async getLookupMaps(): Promise<LookupMaps> {
    const [nationalityList, languageList, officeList] = await Promise.all([
      this.db.query.nationalities.findMany(),
      this.db.query.languages.findMany(),
      this.db.query.offices.findMany({
        columns: { id: true, name: true, nameAr: true },
      }),
    ]);

    return {
      nationalities: nationalityList.map(n => ({
        id: n.id,
        nameEn: n.nameEn,
        nameAr: n.nameAr,
        code: n.code,
      })),
      languages: languageList.map(l => ({
        id: l.id,
        nameEn: l.nameEn,
        nameAr: l.nameAr,
        code: l.code,
      })),
      offices: officeList.map(o => ({
        id: o.id,
        name: o.name,
        nameAr: o.nameAr,
      })),
    };
  }

  // Validate rows and return validation results
  async validateRows(rows: RawImportRow[]): Promise<ValidationSummary> {
    const lookups = await this.getLookupMaps();

    // Build lookup indexes
    const nationalityIndex = this.buildNationalityIndex(lookups.nationalities);
    const languageIndex = this.buildLanguageIndex(lookups.languages);
    const officeIndex = this.buildOfficeIndex(lookups.offices);

    const results: RowValidationResult[] = rows.map(row =>
      this.validateRow(row, nationalityIndex, languageIndex, officeIndex)
    );

    const valid = results.filter(r => r.valid).length;

    return {
      total: rows.length,
      valid,
      invalid: rows.length - valid,
      rows: results,
    };
  }

  // Create maids from validated rows
  async createMaids(validRows: ValidatedRow[]): Promise<ImportResult> {
    const errors: { row_number: number; error: string }[] = [];
    let created = 0;

    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);

      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j;
        const row = batch[j];

        try {
          const [newMaid] = await this.db
            .insert(maids)
            .values({
              officeId: row.officeId,
              name: row.name,
              nameAr: row.nameAr,
              nationalityId: row.nationalityId,
              dateOfBirth: new Date(row.dateOfBirth),
              maritalStatus: row.maritalStatus,
              religion: row.religion,
              salary: row.salary,
              experienceYears: row.experienceYears,
              serviceType: row.serviceType,
              sex: row.sex || 'female',
              educationLevel: row.educationLevel,
              hasChildren: row.hasChildren ?? false,
              jobType: row.jobType || 'domestic_worker',
              packageType: row.packageType || 'traditional',
              cookingSkills: row.cookingSkills,
              babySitter: row.babySitter ?? false,
              officeFees: row.officeFees,
              availability: row.availability || 'inside_uae',
              whatsappNumber: row.whatsappNumber,
              contactNumber: row.contactNumber,
              cvReference: row.cvReference,
              bio: row.bio,
              bioAr: row.bioAr,
              status: 'available',
            })
            .returning();

          // Add language relationships
          if (row.languageIds.length > 0) {
            await this.db.insert(maidLanguages).values(
              row.languageIds.map(languageId => ({
                maidId: newMaid.id,
                languageId,
              }))
            );
          }

          created++;
        } catch (error) {
          errors.push({
            row_number: rowIndex + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      created,
      failed: errors.length,
      errors,
    };
  }

  // Generate Excel template columns
  getTemplateColumns(): { key: string; header: string; required: boolean; example: string }[] {
    return [
      { key: 'office_name', header: 'Office Name', required: true, example: 'Al Tadbeer Services' },
      { key: 'name', header: 'Full Name (English)', required: true, example: 'Maria Santos' },
      { key: 'name_ar', header: 'Full Name (Arabic)', required: false, example: 'ماريا سانتوس' },
      { key: 'nationality', header: 'Nationality', required: true, example: 'Philippines' },
      { key: 'date_of_birth', header: 'Date of Birth', required: true, example: '15/03/1990' },
      { key: 'marital_status', header: 'Marital Status', required: true, example: 'single' },
      { key: 'religion', header: 'Religion', required: true, example: 'non_muslim' },
      { key: 'salary', header: 'Salary (AED)', required: true, example: '2500' },
      { key: 'experience_years', header: 'Years of Experience', required: false, example: '3' },
      { key: 'service_type', header: 'Service Type', required: false, example: 'cleaning' },
      { key: 'languages', header: 'Languages (comma-separated)', required: false, example: 'English, Arabic' },
      { key: 'whatsapp_number', header: 'WhatsApp Number', required: false, example: '+971501234567' },
      { key: 'contact_number', header: 'Contact Number', required: false, example: '+971501234567' },
      { key: 'cv_reference', header: 'CV Reference', required: false, example: 'CV-001' },
      { key: 'sex', header: 'Sex', required: false, example: 'female' },
      { key: 'education_level', header: 'Education Level', required: false, example: 'high_school' },
      { key: 'has_children', header: 'Has Children', required: false, example: 'no' },
      { key: 'job_type', header: 'Job Type', required: false, example: 'domestic_worker' },
      { key: 'package_type', header: 'Package Type', required: false, example: 'traditional' },
      { key: 'cooking_skills', header: 'Cooking Skills', required: false, example: 'good' },
      { key: 'baby_sitter', header: 'Baby Sitter', required: false, example: 'yes' },
      { key: 'office_fees', header: 'Office Fees (AED)', required: false, example: '5000' },
      { key: 'availability', header: 'Availability', required: false, example: 'inside_uae' },
      { key: 'bio', header: 'Bio (English)', required: false, example: 'Experienced domestic helper' },
      { key: 'bio_ar', header: 'Bio (Arabic)', required: false, example: 'عاملة منزلية ذات خبرة' },
    ];
  }

  // Private validation helpers
  private buildNationalityIndex(
    nationalities: { id: string; nameEn: string; nameAr: string; code: string }[]
  ): Map<string, string> {
    const index = new Map<string, string>();

    for (const n of nationalities) {
      // Add exact matches
      index.set(n.nameEn.toLowerCase(), n.id);
      index.set(n.nameAr, n.id);
      index.set(n.code.toLowerCase(), n.id);

      // Add aliases
      const aliases = NATIONALITY_ALIASES[n.nameEn];
      if (aliases) {
        for (const alias of aliases) {
          index.set(alias.toLowerCase(), n.id);
        }
      }
    }

    return index;
  }

  private buildLanguageIndex(
    languages: { id: string; nameEn: string; nameAr: string; code: string }[]
  ): Map<string, string> {
    const index = new Map<string, string>();

    for (const l of languages) {
      index.set(l.nameEn.toLowerCase(), l.id);
      index.set(l.nameAr, l.id);
      index.set(l.code.toLowerCase(), l.id);
    }

    return index;
  }

  private buildOfficeIndex(
    offices: { id: string; name: string; nameAr: string | null }[]
  ): Map<string, string> {
    const index = new Map<string, string>();

    for (const o of offices) {
      index.set(o.name.toLowerCase(), o.id);
      if (o.nameAr) {
        index.set(o.nameAr, o.id);
      }
    }

    return index;
  }

  private validateRow(
    row: RawImportRow,
    nationalityIndex: Map<string, string>,
    languageIndex: Map<string, string>,
    officeIndex: Map<string, string>
  ): RowValidationResult {
    const errors: string[] = [];

    // Required field validation
    if (!row.office_name?.trim()) {
      errors.push('Office name is required');
    }
    if (!row.name?.trim()) {
      errors.push('Name is required');
    }
    if (!row.nationality?.trim()) {
      errors.push('Nationality is required');
    }
    if (!row.date_of_birth?.trim()) {
      errors.push('Date of birth is required');
    }
    if (!row.marital_status?.trim()) {
      errors.push('Marital status is required');
    }
    if (!row.religion?.trim()) {
      errors.push('Religion is required');
    }
    if (!row.salary?.trim()) {
      errors.push('Salary is required');
    }

    // If required fields are missing, return early
    if (errors.length > 0) {
      return { row_number: row.row_number, valid: false, errors };
    }

    // Lookup office
    const officeId = officeIndex.get(row.office_name.trim().toLowerCase());
    if (!officeId) {
      errors.push(`Office '${row.office_name}' not found`);
    }

    // Lookup nationality
    const nationalityId = nationalityIndex.get(row.nationality.trim().toLowerCase());
    if (!nationalityId) {
      errors.push(`Nationality '${row.nationality}' not recognized`);
    }

    // Parse date
    const dateOfBirth = this.parseDate(row.date_of_birth);
    if (!dateOfBirth) {
      errors.push(`Invalid date format: '${row.date_of_birth}'`);
    }

    // Validate marital status
    const maritalStatus = this.parseMaritalStatus(row.marital_status);
    if (!maritalStatus) {
      errors.push(`Marital status must be: single, married, divorced, widowed`);
    }

    // Validate religion
    const religion = this.parseReligion(row.religion);
    if (!religion) {
      errors.push(`Religion must be: muslim, non_muslim`);
    }

    // Parse salary
    const salary = this.parseSalary(row.salary);
    if (salary === null) {
      errors.push(`Invalid salary value: '${row.salary}'`);
    }

    // Parse experience years
    const experienceYears = row.experience_years
      ? this.parseNumber(row.experience_years, 0, 50)
      : 0;
    if (row.experience_years && experienceYears === null) {
      errors.push(`Invalid experience years: '${row.experience_years}'`);
    }

    // Parse languages
    const languageIds: string[] = [];
    if (row.languages?.trim()) {
      const languageNames = row.languages.split(',').map(l => l.trim().toLowerCase());
      for (const langName of languageNames) {
        const langId = languageIndex.get(langName);
        if (langId) {
          languageIds.push(langId);
        }
        // Don't error on unrecognized languages, just skip them
      }
    }

    // Validate optional enums
    const serviceType = row.service_type ? this.parseServiceType(row.service_type) : 'individual';
    if (row.service_type && !serviceType) {
      errors.push(`Invalid service type: '${row.service_type}'`);
    }

    const sex = row.sex ? this.parseSex(row.sex) : 'female';
    if (row.sex && !sex) {
      errors.push(`Sex must be: male, female`);
    }

    const educationLevel = row.education_level ? this.parseEducationLevel(row.education_level) : undefined;
    if (row.education_level && !educationLevel) {
      errors.push(`Education level must be: college, high_school, primary, none`);
    }

    const jobType = row.job_type ? this.parseJobType(row.job_type) : 'domestic_worker';
    if (row.job_type && !jobType) {
      errors.push(`Job type must be: domestic_worker, nurse_caregiver, driver`);
    }

    const packageType = row.package_type ? this.parsePackageType(row.package_type) : 'traditional';
    if (row.package_type && !packageType) {
      errors.push(`Package type must be: traditional, flexible, hourly`);
    }

    const cookingSkills = row.cooking_skills ? this.parseCookingSkills(row.cooking_skills) : undefined;
    if (row.cooking_skills && !cookingSkills) {
      errors.push(`Cooking skills must be: good, average, willing_to_learn, none`);
    }

    const availability = row.availability ? this.parseAvailability(row.availability) : 'inside_uae';
    if (row.availability && !availability) {
      errors.push(`Availability must be: inside_uae, outside_uae`);
    }

    // Parse office fees
    const officeFees = row.office_fees ? this.parseSalary(row.office_fees) : undefined;
    if (row.office_fees && officeFees === null) {
      errors.push(`Invalid office fees value: '${row.office_fees}'`);
    }

    if (errors.length > 0) {
      return { row_number: row.row_number, valid: false, errors };
    }

    // Build validated row
    const validatedRow: ValidatedRow = {
      officeId: officeId!,
      name: row.name.trim(),
      nameAr: row.name_ar?.trim(),
      nationalityId: nationalityId!,
      dateOfBirth: dateOfBirth!,
      maritalStatus: maritalStatus!,
      religion: religion!,
      salary: salary!.toString(),
      experienceYears: experienceYears ?? 0,
      serviceType: serviceType as ValidatedRow['serviceType'],
      languageIds,
      whatsappNumber: row.whatsapp_number?.trim(),
      contactNumber: row.contact_number?.trim(),
      cvReference: row.cv_reference?.trim(),
      sex: sex as ValidatedRow['sex'],
      educationLevel: educationLevel as ValidatedRow['educationLevel'],
      hasChildren: row.has_children ? this.parseBoolean(row.has_children) : false,
      jobType: jobType as ValidatedRow['jobType'],
      packageType: packageType as ValidatedRow['packageType'],
      cookingSkills: cookingSkills as ValidatedRow['cookingSkills'],
      babySitter: row.baby_sitter ? this.parseBoolean(row.baby_sitter) : false,
      officeFees: officeFees?.toString(),
      availability: availability as ValidatedRow['availability'],
      bio: row.bio?.trim(),
      bioAr: row.bio_ar?.trim(),
    };

    return { row_number: row.row_number, valid: true, errors: [], data: validatedRow };
  }

  private parseDate(value: string): string | null {
    const trimmed = value.trim();

    // Try DD/MM/YYYY
    const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match1 = trimmed.match(ddmmyyyy);
    if (match1) {
      const [, day, month, year] = match1;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (this.isValidDate(date)) {
        return date.toISOString().split('T')[0];
      }
    }

    // Try YYYY-MM-DD
    const yyyymmdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const match2 = trimmed.match(yyyymmdd);
    if (match2) {
      const [, year, month, day] = match2;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (this.isValidDate(date)) {
        return date.toISOString().split('T')[0];
      }
    }

    // Try MM/DD/YYYY
    const mmddyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match3 = trimmed.match(mmddyyyy);
    if (match3) {
      const [, month, day, year] = match3;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (this.isValidDate(date)) {
        return date.toISOString().split('T')[0];
      }
    }

    // Try Excel serial number
    const serialNumber = parseFloat(trimmed);
    if (!isNaN(serialNumber) && serialNumber > 10000 && serialNumber < 100000) {
      // Excel dates start from 1900-01-01
      const date = new Date((serialNumber - 25569) * 86400 * 1000);
      if (this.isValidDate(date)) {
        return date.toISOString().split('T')[0];
      }
    }

    return null;
  }

  private isValidDate(date: Date): boolean {
    if (isNaN(date.getTime())) return false;
    const year = date.getFullYear();
    return year >= 1940 && year <= 2010; // Reasonable birth year range
  }

  private parseMaritalStatus(value: string): 'single' | 'married' | 'divorced' | 'widowed' | null {
    const normalized = value.trim().toLowerCase();
    const map: Record<string, 'single' | 'married' | 'divorced' | 'widowed'> = {
      'single': 'single',
      'unmarried': 'single',
      'never married': 'single',
      'married': 'married',
      'divorced': 'divorced',
      'separated': 'divorced',
      'widowed': 'widowed',
      'widow': 'widowed',
    };
    return map[normalized] ?? null;
  }

  private parseReligion(value: string): 'muslim' | 'non_muslim' | null {
    const normalized = value.trim().toLowerCase();
    const map: Record<string, 'muslim' | 'non_muslim'> = {
      'muslim': 'muslim',
      'islam': 'muslim',
      'non_muslim': 'non_muslim',
      'non-muslim': 'non_muslim',
      'nonmuslim': 'non_muslim',
      'christian': 'non_muslim',
      'hindu': 'non_muslim',
      'buddhist': 'non_muslim',
      'other': 'non_muslim',
    };
    return map[normalized] ?? null;
  }

  private parseSalary(value: string): number | null {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num) || num < 0) return null;
    return Math.round(num * 100) / 100; // Round to 2 decimal places
  }

  private parseNumber(value: string, min: number, max: number): number | null {
    const num = parseInt(value.trim(), 10);
    if (isNaN(num) || num < min || num > max) return null;
    return num;
  }

  private parseBoolean(value: string): boolean {
    const normalized = value.trim().toLowerCase();
    return ['yes', 'true', '1', 'y'].includes(normalized);
  }

  private parseServiceType(value: string): string | null {
    const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, '');
    const map: Record<string, string> = {
      'individual': 'individual',
      'business': 'business',
      'cleaning': 'cleaning',
      'cooking': 'cooking',
      'babysitter': 'babysitter',
      'babysitting': 'babysitter',
      'elderly': 'elderly',
      'elderlycare': 'elderly',
      'driver': 'driver',
    };
    return map[normalized] ?? null;
  }

  private parseSex(value: string): 'male' | 'female' | null {
    const normalized = value.trim().toLowerCase();
    if (['male', 'm'].includes(normalized)) return 'male';
    if (['female', 'f'].includes(normalized)) return 'female';
    return null;
  }

  private parseEducationLevel(value: string): string | null {
    const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, '');
    const map: Record<string, string> = {
      'college': 'college',
      'university': 'college',
      'bachelors': 'college',
      'highschool': 'high_school',
      'high': 'high_school',
      'secondary': 'high_school',
      'primary': 'primary',
      'elementary': 'primary',
      'none': 'none',
      'no': 'none',
    };
    return map[normalized] ?? null;
  }

  private parseJobType(value: string): string | null {
    const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, '');
    const map: Record<string, string> = {
      'domesticworker': 'domestic_worker',
      'domestic': 'domestic_worker',
      'maid': 'domestic_worker',
      'nursecaregiver': 'nurse_caregiver',
      'nurse': 'nurse_caregiver',
      'caregiver': 'nurse_caregiver',
      'driver': 'driver',
    };
    return map[normalized] ?? null;
  }

  private parsePackageType(value: string): string | null {
    const normalized = value.trim().toLowerCase();
    const map: Record<string, string> = {
      'traditional': 'traditional',
      'flexible': 'flexible',
      'hourly': 'hourly',
    };
    return map[normalized] ?? null;
  }

  private parseCookingSkills(value: string): string | null {
    const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, '');
    const map: Record<string, string> = {
      'good': 'good',
      'excellent': 'good',
      'average': 'average',
      'moderate': 'average',
      'willingtolearn': 'willing_to_learn',
      'willing': 'willing_to_learn',
      'learning': 'willing_to_learn',
      'none': 'none',
      'no': 'none',
    };
    return map[normalized] ?? null;
  }

  private parseAvailability(value: string): string | null {
    const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, '');
    const map: Record<string, string> = {
      'insideuae': 'inside_uae',
      'inside': 'inside_uae',
      'uae': 'inside_uae',
      'local': 'inside_uae',
      'outsideuae': 'outside_uae',
      'outside': 'outside_uae',
      'abroad': 'outside_uae',
      'overseas': 'outside_uae',
    };
    return map[normalized] ?? null;
  }
}
