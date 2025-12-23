// User roles
export type UserRole = 'customer' | 'office_admin' | 'super_admin';

// Maid status
export type MaidStatus = 'available' | 'busy' | 'reserved' | 'inactive';

// Marital status
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

// Religion
export type Religion = 'muslim' | 'non_muslim';

// Quotation status
export type QuotationStatus = 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';

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

// Maid filters
export interface MaidFilters {
  nationalityId?: string;
  ageMin?: number;
  ageMax?: number;
  maritalStatus?: MaritalStatus;
  religion?: Religion;
  experienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  languages?: string[];
  status?: MaidStatus;
}

// User base
export interface User {
  id: string;
  phone: string;
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
  bio: string | null;
  bioAr: string | null;
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
