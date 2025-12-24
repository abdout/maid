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
  search?: string;
  nationalityId?: string;
  ageMin?: number;
  ageMax?: number;
  maritalStatus?: MaritalStatusFilter;
  religion?: Religion;
  experienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  languages?: string[];
  status?: MaidStatus;
  serviceType?: ServiceType;
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
