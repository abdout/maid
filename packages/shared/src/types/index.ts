// User roles
export type UserRole = 'customer' | 'office_admin' | 'super_admin';

// Maid status
export type MaidStatus = 'available' | 'busy' | 'reserved' | 'inactive';

// Marital status (database values)
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

// Marital status filter (simplified for UI)
export type MaritalStatusFilter = 'married' | 'not_married';

// Religion
export type Religion = 'muslim' | 'non_muslim';

// Service Type
export type ServiceType = 'individual' | 'business' | 'cleaning' | 'cooking' | 'babysitter' | 'elderly' | 'driver';

// Quotation status
export type QuotationStatus = 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';

// New types from client feedback
export type PackageType = 'traditional' | 'flexible' | 'hourly';
export type CookingSkills = 'good' | 'average' | 'willing_to_learn' | 'none';
export type AvailabilityType = 'inside_uae' | 'outside_uae';
export type Sex = 'male' | 'female';
export type EducationLevel = 'college' | 'high_school' | 'primary' | 'none';
export type JobType = 'domestic_worker' | 'nurse_caregiver' | 'driver';

// Hiring type for domestic workers (legacy - kept for backward compatibility)
export type HiringType = 'customer_visa' | 'monthly_yearly' | 'hourly_daily';

// Office scope (service types offered by recruitment offices)
export type OfficeScope = 'recruitment' | 'leasing' | 'typing';

// Contract period (split from hiring type)
export type ContractPeriod = 'yearly' | 'monthly' | 'daily' | 'hourly';

// Visa type (split from hiring type)
export type VisaType = 'customer_visa' | 'office_visa';

// Common API response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Age range presets for filtering
export type AgeRangePreset = '20-30' | '31-40' | '40+';

// Maid filters
export interface MaidFilters {
  search?: string;
  nationalityId?: string; // Single nationality (legacy)
  nationalityIds?: string[]; // Multi-select nationalities (max 3)
  ageMin?: number;
  ageMax?: number;
  ageRange?: AgeRangePreset; // Preset age range
  maritalStatus?: MaritalStatusFilter;
  religion?: Religion;
  experienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  languages?: string[];
  status?: MaidStatus;
  serviceType?: ServiceType;
  serviceTypes?: ServiceType[]; // Multi-select service types (max 4)
  hiringType?: HiringType; // Legacy - kept for backward compatibility
  contractPeriod?: ContractPeriod; // NEW: period filter (yearly, monthly, daily, hourly)
  visaType?: VisaType; // NEW: visa filter (customer_visa, office_visa)
  emirate?: string; // Filter by office's emirate
}

// User base
export interface User {
  id: string;
  phone: string | null;
  email?: string | null;
  name: string | null;
  role: UserRole;
  officeId: string | null;
  createdAt: Date;
}

// Nationality
export interface Nationality {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
}

// Language
export interface Language {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
}

// Maid profile
export interface Maid {
  id: string;
  officeId: string;
  name: string;
  nameAr: string | null;
  nationalityId: string;
  nationality?: Nationality;
  dateOfBirth: Date;
  maritalStatus: MaritalStatus;
  religion: Religion;
  experienceYears: number;
  salary: number;
  languages: Language[];
  photoUrl: string | null;
  status: MaidStatus;
  serviceType: ServiceType;
  bio: string | null;
  bioAr: string | null;
  // New fields from client feedback
  sex: Sex;
  educationLevel: EducationLevel | null;
  hasChildren: boolean;
  jobType: JobType;
  packageType: PackageType;
  hasExperience: boolean;
  experienceDetails: string | null;
  skillsDetails: string | null;
  cookingSkills: CookingSkills | null;
  babySitter: boolean;
  officeFees: number | null;
  availability: AvailabilityType;
  hiringType: HiringType;
  whatsappNumber: string | null;
  contactNumber: string | null;
  cvReference: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Office
export interface Office {
  id: string;
  name: string;
  nameAr: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  scopes: OfficeScope[];
  // New fields from client feedback
  licenseNumber: string | null;
  licenseExpiry: Date | null;
  licenseImageUrl: string | null;
  managerPhone1: string | null;
  managerPhone2: string | null;
  googleMapsUrl: string | null;
  emirate: string | null;
  website: string | null;
  createdAt: Date;
}

// Quotation
export interface Quotation {
  id: string;
  customerId: string;
  officeId: string;
  maidId: string;
  maid?: Maid;
  office?: Office;
  salary: number;
  contractMonths: number;
  notes: string | null;
  status: QuotationStatus;
  createdAt: Date;
  expiresAt: Date | null;
}
