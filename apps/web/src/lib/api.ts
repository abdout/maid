const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// Fetch wrapper with auth token
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get token from cookie or localStorage in the browser
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('admin_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{
      success: boolean;
      data: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
          id: string;
          email: string;
          name: string | null;
          role: string;
          officeId: string | null;
        };
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  requestOtp: (phone: string) =>
    apiFetch<{ success: boolean; data: { phone: string } }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, code: string) =>
    apiFetch<{
      success: boolean;
      data: {
        token: string;
        user: {
          id: string;
          phone: string;
          name: string | null;
          role: string;
        };
      };
    }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  getMe: () =>
    apiFetch<{
      success: boolean;
      data: { id: string; phone: string; name: string | null; role: string };
    }>('/auth/me'),
};

// Admin Stats types
interface PlatformStats {
  totalUsers: number;
  totalOffices: number;
  totalMaids: number;
  totalQuotations: number;
  totalPayments: number;
  revenue: number;
  activeSubscriptions: number;
}

interface MaidListItem {
  id: string;
  name: string;
  nameAr: string | null;
  photoUrl: string | null;
  status: string;
  salary: string;
  experienceYears: number;
  nationality: { id: string; nameEn: string; nameAr: string } | null;
  office: { id: string; name: string } | null;
  createdAt: string;
}

interface OfficeListItem {
  id: string;
  name: string;
  nameAr: string | null;
  phone: string | null;
  email: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  maidCount: number;
  createdAt: string;
}

interface OfficeDetail {
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
  licenseExpiry: string | null;
  licenseImageUrl: string | null;
  managerPhone1: string | null;
  managerPhone2: string | null;
  googleMapsUrl: string | null;
  emirate: string | null;
  website: string | null;
  createdByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
  adminUsers: { id: string; email: string | null; name: string | null; createdAt: string }[];
  createdByAdmin: { id: string; name: string | null } | null;
  stats: { totalMaids: number; activeMaids: number; quotations: number };
}

interface CreateOfficeWithAdminInput {
  office: {
    name: string;
    nameAr?: string;
    phone: string;
    email?: string;
    address?: string;
    addressAr?: string;
    scopes: ('recruitment' | 'leasing' | 'typing')[];
    emirate?: string;
  };
  admin: {
    email: string;
    password?: string;
    name?: string;
  };
  autoVerify?: boolean;
}

interface CreateOfficeResult {
  office: OfficeListItem;
  admin: {
    id: string;
    email: string;
    name: string | null;
    temporaryPassword?: string;
  };
}

interface CreateMaidForOfficeInput {
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
  hiringType?: string;
  languageIds?: string[];
}

interface UserListItem {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  createdAt: string;
}

interface PaymentListItem {
  id: string;
  type: string;
  provider: string;
  status: string;
  amount: string;
  currency: string;
  user: { id: string; name: string | null; phone: string | null } | null;
  createdAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  succeededPayments: number;
  failedPayments: number;
  pendingPayments: number;
  cvUnlockRevenue: number;
  subscriptionRevenue: number;
}

interface CvUnlockListItem {
  id: string;
  customer: { id: string; name: string | null; phone: string | null } | null;
  maid: { id: string; name: string; photoUrl: string | null } | null;
  payment: { id: string; amount: string; status: string } | null;
  unlockedAt: string;
}

interface CvUnlockStats {
  totalUnlocks: number;
  uniqueCustomers: number;
  uniqueMaids: number;
  todayUnlocks: number;
  weekUnlocks: number;
  monthUnlocks: number;
}

interface AuditLogItem {
  id: string;
  admin: { id: string; name: string | null } | null;
  action: string;
  targetType: string;
  targetId: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface QuotationListItem {
  id: string;
  customer: { id: string; name: string | null; phone: string | null } | null;
  maid: { id: string; name: string; photoUrl: string | null } | null;
  office: { id: string; name: string } | null;
  salary: string;
  contractMonths: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface MaidDetail {
  id: string;
  officeId: string;
  name: string;
  nameAr: string | null;
  nationalityId: string;
  dateOfBirth: string;
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
  documents: { id: string; type: string; url: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

interface CreateMaidInput {
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

interface Nationality {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
}

interface Language {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
}

interface AnalyticsData {
  revenueByDay: { date: string; revenue: number }[];
  userGrowth: { date: string; users: number }[];
  maidsByNationality: { nationality: string; count: number }[];
  quotationsStats: { date: string; sent: number; accepted: number }[];
}

interface PricingConfig {
  cvUnlockPrice: number;
  currency: string;
}

// Admin API
export const adminApi = {
  // Stats
  getStats: () => apiFetch<{ success: boolean; data: PlatformStats }>('/admin/stats'),

  // Analytics
  getAnalytics: (period: 'week' | 'month' | 'year' = 'month') =>
    apiFetch<{ success: boolean; data: AnalyticsData }>(`/admin/analytics?period=${period}`),

  // Maids
  listMaids: (params?: Record<string, string | number>) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiFetch<{
      success: boolean;
      data: {
        items: MaidListItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/admin/maids${query}`);
  },

  updateMaidStatus: (id: string, status: string) =>
    apiFetch<{ success: boolean; data: { id: string; status: string } }>(
      `/admin/maids/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    ),

  bulkUpdateMaidStatus: (ids: string[], status: string) =>
    apiFetch<{ success: boolean; data: { updated: number } }>(
      '/admin/maids/bulk-status',
      {
        method: 'PATCH',
        body: JSON.stringify({ ids, status }),
      }
    ),

  // Offices
  listOffices: (params?: Record<string, string | number>) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiFetch<{
      success: boolean;
      data: {
        items: OfficeListItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/admin/offices${query}`);
  },

  updateOffice: (id: string, data: { isVerified?: boolean; isSuspended?: boolean }) =>
    apiFetch<{ success: boolean; data: OfficeListItem }>(`/admin/offices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Create office with admin account
  createOffice: (data: CreateOfficeWithAdminInput) =>
    apiFetch<{ success: boolean; data: CreateOfficeResult }>('/admin/offices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get office details
  getOffice: (id: string) =>
    apiFetch<{ success: boolean; data: OfficeDetail }>(`/admin/offices/${id}`),

  // Approve/reject office
  approveOffice: (id: string, data: { approved: boolean; reason?: string }) =>
    apiFetch<{ success: boolean; data: OfficeListItem }>(`/admin/offices/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Suspend/resume office
  suspendOffice: (id: string, suspended: boolean) =>
    apiFetch<{ success: boolean; data: OfficeListItem }>(`/admin/offices/${id}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ suspended }),
    }),

  // Delete office
  deleteOffice: (id: string) =>
    apiFetch<{ success: boolean }>(`/admin/offices/${id}`, {
      method: 'DELETE',
    }),

  // Reset office admin password
  resetOfficePassword: (officeId: string, data: { adminUserId: string; newPassword?: string }) =>
    apiFetch<{ success: boolean; data: { temporaryPassword?: string } }>(
      `/admin/offices/${officeId}/reset-password`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  // Create maid for specific office
  createMaidForOffice: (officeId: string, data: CreateMaidForOfficeInput) =>
    apiFetch<{ success: boolean; data: MaidDetail }>(`/admin/offices/${officeId}/maids`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Users
  listUsers: (params?: Record<string, string | number>) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiFetch<{
      success: boolean;
      data: {
        items: UserListItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/admin/users${query}`);
  },

  // Payments
  listPayments: (params?: Record<string, string | number>) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiFetch<{
      success: boolean;
      data: {
        items: PaymentListItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/admin/payments${query}`);
  },

  getPaymentStats: () =>
    apiFetch<{ success: boolean; data: PaymentStats }>('/admin/payments/stats'),

  // CV Unlocks
  listCvUnlocks: (params?: Record<string, string | number>) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiFetch<{
      success: boolean;
      data: {
        items: CvUnlockListItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/admin/cv-unlocks${query}`);
  },

  getCvUnlockStats: () =>
    apiFetch<{ success: boolean; data: CvUnlockStats }>('/admin/cv-unlocks/stats'),

  // Audit Logs
  listAuditLogs: (params?: Record<string, string | number>) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiFetch<{
      success: boolean;
      data: {
        items: AuditLogItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/admin/audit-logs${query}`);
  },

  // Quotations
  listQuotations: (params?: Record<string, string | number>) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiFetch<{
      success: boolean;
      data: {
        items: QuotationListItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/admin/quotations${query}`);
  },

  updateQuotationStatus: (id: string, status: string) =>
    apiFetch<{ success: boolean; data: QuotationListItem }>(
      `/admin/quotations/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    ),

  // Maid CRUD
  getMaid: (id: string) =>
    apiFetch<{ success: boolean; data: MaidDetail }>(`/admin/maids/${id}`),

  createMaid: (data: CreateMaidInput) =>
    apiFetch<{ success: boolean; data: MaidDetail }>('/admin/maids', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMaid: (id: string, data: Partial<CreateMaidInput>) =>
    apiFetch<{ success: boolean; data: MaidDetail }>(`/admin/maids/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMaid: (id: string) =>
    apiFetch<{ success: boolean }>(`/admin/maids/${id}`, {
      method: 'DELETE',
    }),

  // Maid documents
  addMaidDocument: (maidId: string, type: string, url: string) =>
    apiFetch<{ success: boolean; data: { id: string; type: string; url: string; createdAt: string } }>(
      `/admin/maids/${maidId}/documents`,
      {
        method: 'POST',
        body: JSON.stringify({ type, url }),
      }
    ),

  deleteMaidDocument: (documentId: string) =>
    apiFetch<{ success: boolean }>(`/admin/maids/documents/${documentId}`, {
      method: 'DELETE',
    }),

  // Reference data
  listNationalities: () =>
    apiFetch<{ success: boolean; data: Nationality[] }>('/admin/nationalities'),

  listLanguages: () =>
    apiFetch<{ success: boolean; data: Language[] }>('/admin/languages'),

  // Pricing
  getPricing: () =>
    apiFetch<{ success: boolean; data: PricingConfig }>('/admin/pricing'),

  updatePricing: (data: Partial<PricingConfig>) =>
    apiFetch<{ success: boolean; data: PricingConfig }>('/admin/pricing', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Notifications
  sendNotification: (params: {
    title: string;
    body: string;
    titleAr?: string;
    bodyAr?: string;
    targetRole?: 'customer' | 'office_admin';
  }) =>
    apiFetch<{ success: boolean; data: { sent: number; notificationId: string } }>(
      '/admin/notifications/send',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    ),

  getNotificationHistory: (page = 1, pageSize = 10) =>
    apiFetch<{
      success: boolean;
      data: {
        items: NotificationHistoryItem[];
        total: number;
      };
    }>(`/admin/notifications/history?page=${page}&pageSize=${pageSize}`),

  // Bulk Import
  getBulkImportTemplate: () =>
    apiFetch<{ success: boolean; data: { columns: BulkImportTemplateColumn[] } }>(
      '/admin/maids/bulk-import/template'
    ),

  getBulkImportLookups: () =>
    apiFetch<{ success: boolean; data: BulkImportLookups }>(
      '/admin/maids/bulk-import/lookups'
    ),

  validateBulkImport: (rows: RawImportRow[]) =>
    apiFetch<{ success: boolean; data: ValidationSummary }>(
      '/admin/maids/bulk-import/validate',
      {
        method: 'POST',
        body: JSON.stringify({ rows }),
      }
    ),

  executeBulkImport: (rows: ValidatedRow[]) =>
    apiFetch<{ success: boolean; data: ImportResult }>(
      '/admin/maids/bulk-import',
      {
        method: 'POST',
        body: JSON.stringify({ rows }),
      }
    ),
};

interface NotificationHistoryItem {
  id: string;
  title: string;
  titleAr: string | null;
  body: string;
  bodyAr: string | null;
  targetRole: string | null;
  sentCount: number;
  createdAt: string;
}

// Bulk Import Types
interface BulkImportTemplateColumn {
  key: string;
  header: string;
  required: boolean;
  example: string;
}

interface BulkImportLookups {
  nationalities: { id: string; nameEn: string; nameAr: string; code: string }[];
  languages: { id: string; nameEn: string; nameAr: string; code: string }[];
  offices: { id: string; name: string; nameAr: string | null }[];
}

interface RawImportRow {
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

interface ValidatedRow {
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

interface RowValidationResult {
  row_number: number;
  valid: boolean;
  errors: string[];
  data?: ValidatedRow;
}

interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  rows: RowValidationResult[];
}

interface ImportResult {
  success: boolean;
  created: number;
  failed: number;
  errors: { row_number: number; error: string }[];
}

export type {
  PlatformStats,
  MaidListItem,
  OfficeListItem,
  OfficeDetail,
  UserListItem,
  PaymentListItem,
  PaymentStats,
  CvUnlockListItem,
  CvUnlockStats,
  AuditLogItem,
  QuotationListItem,
  MaidDetail,
  CreateMaidInput,
  CreateOfficeWithAdminInput,
  CreateOfficeResult,
  CreateMaidForOfficeInput,
  Nationality,
  Language,
  AnalyticsData,
  PricingConfig,
  NotificationHistoryItem,
  BulkImportTemplateColumn,
  BulkImportLookups,
  RawImportRow,
  ValidatedRow,
  RowValidationResult,
  ValidationSummary,
  ImportResult,
};
