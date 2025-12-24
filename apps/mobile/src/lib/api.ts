import Constants from 'expo-constants';
import { useAuth } from '@/store/auth';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://maid-api.osmanabdout.workers.dev';

// Fetch wrapper with auth token
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = useAuth.getState().token;

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');

  return fetch(input, {
    ...init,
    headers,
  });
}

// Base fetch function
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuth.getState().token;

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
        token: string;
        user: {
          id: string;
          email: string | null;
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
          officeId: string | null;
        };
      };
    }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  getMe: () =>
    apiFetch<{ success: boolean; data: { id: string; phone: string; name: string | null; role: string; officeId: string | null } }>('/auth/me'),

  refresh: () =>
    apiFetch<{ success: boolean; data: { token: string } }>('/auth/refresh', {
      method: 'POST',
    }),
};

// Maids API
export const maidsApi = {
  list: (params?: Record<string, string | number | undefined>) => {
    // Filter out undefined/null values before creating query string
    const cleanParams = params
      ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null))
      : {};
    const query = Object.keys(cleanParams).length > 0
      ? '?' + new URLSearchParams(cleanParams as Record<string, string>).toString()
      : '';
    return apiFetch<{
      success: boolean;
      data: {
        items: Array<{
          id: string;
          name: string;
          nameAr: string | null;
          photoUrl: string | null;
          status: string;
          salary: string;
          experienceYears: number;
          nationality: { id: string; nameEn: string; nameAr: string } | null;
        }>;
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/maids${query}`);
  },

  getById: (id: string) =>
    apiFetch<{
      success: boolean;
      data: {
        maid: {
          id: string;
          name: string;
          nameAr: string | null;
          photoUrl: string | null;
          status: string;
          salary: string;
          experienceYears: number;
          dateOfBirth: string;
          maritalStatus: string;
          religion: string;
          bio: string | null;
          bioAr: string | null;
          nationalityId: string | null;
        };
        nationality: { id: string; nameEn: string; nameAr: string } | null;
        languages: Array<{ id: string; nameEn: string; nameAr: string }>;
        documents: Array<{ id: string; type: string; url: string }>;
        office: {
          id: string;
          name: string;
          nameAr: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          isVerified: boolean;
        } | null;
        isUnlocked: boolean;
        unlockPrice?: number;
        unlockCurrency?: string;
      };
    }>(`/maids/${id}`),

  // Office routes
  officeList: (params?: Record<string, string | number | undefined>) => {
    const cleanParams = params
      ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null))
      : {};
    const query = Object.keys(cleanParams).length > 0
      ? '?' + new URLSearchParams(cleanParams as Record<string, string>).toString()
      : '';
    return apiFetch<{
      success: boolean;
      data: {
        items: Array<{
          id: string;
          name: string;
          nameAr: string | null;
          photoUrl: string | null;
          status: string;
          salary: string;
          experienceYears: number;
          nationality: { id: string; nameEn: string; nameAr: string } | null;
        }>;
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/maids/office/list${query}`);
  },

  create: (data: Record<string, unknown>) =>
    apiFetch('/maids', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/maids/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch(`/maids/${id}`, { method: 'DELETE' }),

  updateStatus: (id: string, status: string) =>
    apiFetch(`/maids/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// Quotation type
interface QuotationItem {
  id: string;
  maid: { id: string; name: string; photoUrl: string | null } | null;
  office: { id: string; name: string } | null;
  customer: { phone: string } | null;
  salary: string;
  contractMonths: number;
  notes: string | null;
  status: string;
  createdAt: string;
}

// Quotations API
export const quotationsApi = {
  create: (maidId: string, notes?: string) =>
    apiFetch<{ success: boolean; data: QuotationItem }>('/quotations', {
      method: 'POST',
      body: JSON.stringify({ maidId, notes }),
    }),

  listMy: (page = 1) =>
    apiFetch<{ success: boolean; data: QuotationItem[] }>(`/quotations/my?page=${page}`),

  listOffice: (page = 1) =>
    apiFetch<{ success: boolean; data: QuotationItem[] }>(`/quotations/office?page=${page}`),

  getById: (id: string) =>
    apiFetch<{ success: boolean; data: QuotationItem }>(`/quotations/${id}`),

  updateStatus: (id: string, status: string) =>
    apiFetch<{ success: boolean; data: QuotationItem }>(`/quotations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Offices API
export const officesApi = {
  register: (data: {
    name: string;
    nameAr?: string;
    phone: string;
    email?: string;
    address?: string;
  }) =>
    apiFetch('/offices/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => apiFetch('/offices/me'),

  update: (data: Record<string, unknown>) =>
    apiFetch('/offices/me', { method: 'PUT', body: JSON.stringify(data) }),

  getStats: () => apiFetch('/offices/stats'),
};

// Favorite type
interface FavoriteItem {
  id: string;
  maid: {
    id: string;
    name: string;
    nameAr: string | null;
    photoUrl: string | null;
    status: string;
    salary: string;
    experienceYears: number;
    nationality: { id: string; nameEn: string; nameAr: string } | null;
  };
}

// Favorites API
export const favoritesApi = {
  list: () => apiFetch<{ success: boolean; data: FavoriteItem[] }>('/favorites'),

  add: (maidId: string) =>
    apiFetch<{ success: boolean; data: FavoriteItem }>('/favorites', { method: 'POST', body: JSON.stringify({ maidId }) }),

  remove: (maidId: string) =>
    apiFetch<{ success: boolean }>(`/favorites/${maidId}`, { method: 'DELETE' }),

  check: (maidId: string) =>
    apiFetch<{ success: boolean; data: { isFavorite: boolean } }>(`/favorites/check/${maidId}`),
};

// Lookups API
export const lookupsApi = {
  getNationalities: () =>
    apiFetch<{
      success: boolean;
      data: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
    }>('/lookups/nationalities'),

  getLanguages: () =>
    apiFetch<{
      success: boolean;
      data: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
    }>('/lookups/languages'),
};

// Health API
export const healthApi = {
  check: () => apiFetch<{ success: boolean; data: { api: string; timestamp: string } }>('/health'),
};

// Uploads API
export const uploadsApi = {
  getPresignedUrl: (filename: string, contentType: string, folder: 'maids' | 'documents' | 'logos') =>
    apiFetch<{
      success: boolean;
      data: { uploadUrl: string; publicUrl: string; key: string };
    }>('/uploads/presign', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType, folder }),
    }),

  uploadFile: async (uri: string, folder: 'maids' | 'documents' | 'logos' = 'maids'): Promise<string> => {
    const token = useAuth.getState().token;

    // Get file info
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: filename,
      type,
    } as unknown as Blob);
    formData.append('folder', folder);

    const response = await fetch(`${API_URL}/uploads/file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.data.url;
  },
};

// Payment types
interface CvUnlockPrice {
  maidId: string;
  price: number;
  currency: string;
  nationalityId: string | null;
}

interface PaymentIntent {
  clientSecret: string;
  paymentId: string;
  amount: number;
  currency: string;
}

interface UnlockedCv {
  id: string;
  maidId: string;
  maid: {
    id: string;
    name: string;
    nameAr: string | null;
    photoUrl: string | null;
    status: string;
    nationality: { id: string; nameEn: string; nameAr: string } | null;
  } | null;
  unlockedAt: string;
}

interface PaymentHistoryItem {
  id: string;
  type: string;
  provider: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  maid: {
    id: string;
    name: string;
    photoUrl: string | null;
  } | null;
}

// Tabby types
interface TabbyCheckout {
  paymentId: string;
  sessionId: string;
  checkoutUrl: string | null;
  amount: number;
  currency: string;
  installments: Array<{ amount: string; dueDate: string }>;
}

// Payments API
export const paymentsApi = {
  getCvUnlockPrice: (maidId: string) =>
    apiFetch<{ success: boolean; data: CvUnlockPrice }>(`/payments/cv-unlock/price/${maidId}`),

  checkUnlock: (maidId: string) =>
    apiFetch<{ success: boolean; data: { isUnlocked: boolean } }>(`/payments/cv-unlock/check/${maidId}`),

  createPaymentIntent: (maidId: string) =>
    apiFetch<{ success: boolean; data: PaymentIntent }>('/payments/cv-unlock/create-intent', {
      method: 'POST',
      body: JSON.stringify({ maidId }),
    }),

  confirmPayment: (paymentId: string, stripePaymentIntentId?: string) =>
    apiFetch<{ success: boolean; data: { success: boolean } }>('/payments/cv-unlock/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentId, stripePaymentIntentId }),
    }),

  // Tabby endpoints
  createTabbyCheckout: (maidId: string) =>
    apiFetch<{ success: boolean; data: TabbyCheckout }>('/payments/cv-unlock/tabby/create', {
      method: 'POST',
      body: JSON.stringify({ maidId }),
    }),

  confirmTabbyPayment: (paymentId: string, tabbyPaymentId: string) =>
    apiFetch<{ success: boolean; data: { confirmed: boolean; alreadyConfirmed?: boolean } }>(
      '/payments/cv-unlock/tabby/confirm',
      {
        method: 'POST',
        body: JSON.stringify({ paymentId, tabbyPaymentId }),
      }
    ),

  getUnlockedCvs: () =>
    apiFetch<{ success: boolean; data: UnlockedCv[] }>('/payments/unlocked'),

  getPaymentHistory: (page = 1, pageSize = 20) =>
    apiFetch<{
      success: boolean;
      data: {
        items: PaymentHistoryItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/payments/history?page=${page}&pageSize=${pageSize}`),
};

// Subscription types
interface SubscriptionPlan {
  id: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  priceMonthly: string;
  priceYearly: string | null;
  currency: string;
  maxMaids: number;
  features: string[] | null;
  isActive: boolean;
}

interface OfficeSubscription {
  id: string;
  officeId: string;
  planId: string;
  plan: SubscriptionPlan | null;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface CanPublishResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  plan: string;
  needsUpgrade: boolean;
}

// Subscriptions API
export const subscriptionsApi = {
  getPlans: () =>
    apiFetch<{ success: boolean; data: SubscriptionPlan[] }>('/subscriptions/plans'),

  getCurrent: () =>
    apiFetch<{ success: boolean; data: OfficeSubscription | null }>('/subscriptions/current'),

  canPublish: () =>
    apiFetch<{ success: boolean; data: CanPublishResult }>('/subscriptions/can-publish'),

  subscribe: (planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') =>
    apiFetch<{ success: boolean; data: { subscriptionId: string; checkoutUrl?: string } }>(
      '/subscriptions/subscribe',
      {
        method: 'POST',
        body: JSON.stringify({ planId, billingCycle }),
      }
    ),

  cancel: () =>
    apiFetch<{ success: boolean; message: string }>('/subscriptions/cancel', {
      method: 'POST',
    }),
};

// Notifications API
export const notificationsApi = {
  registerPushToken: (token: string, platform: 'ios' | 'android') =>
    apiFetch<{ success: boolean; data: { id: string } }>('/notifications/push-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    }),

  removePushToken: (token?: string) =>
    apiFetch<{ success: boolean; data: { removed: boolean } }>('/notifications/push-token', {
      method: 'DELETE',
      body: JSON.stringify({ token }),
    }),
};

// Business Plans types
interface BusinessPlan {
  id: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  freeUnlocksPerMonth: number;
  discountPercent: number;
  features: string[] | null;
  isActive: boolean;
}

interface CustomerSubscription {
  id: string;
  customerId: string;
  planId: string;
  plan: BusinessPlan | null;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  freeUnlocksUsed: number;
  freeUnlocksResetAt: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
}

interface UnlockPriceResult {
  basePrice: number;
  finalPrice: number;
  discountPercent: number;
  canUseFreeUnlock: boolean;
  freeUnlocksRemaining: number;
  currency: string;
}

// Business Plans API
export const businessPlansApi = {
  getPlans: () =>
    apiFetch<{ success: boolean; data: BusinessPlan[] }>('/business-plans'),

  getSubscription: () =>
    apiFetch<{ success: boolean; data: CustomerSubscription | null }>('/business-plans/subscription'),

  getUnlockPrice: (maidId: string) =>
    apiFetch<{ success: boolean; data: UnlockPriceResult }>(`/business-plans/unlock-price/${maidId}`),

  subscribe: (planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') =>
    apiFetch<{ success: boolean; data: { subscriptionId: string; checkoutUrl?: string } }>(
      '/business-plans/subscribe',
      {
        method: 'POST',
        body: JSON.stringify({ planId, billingCycle }),
      }
    ),

  cancel: () =>
    apiFetch<{ success: boolean; message: string }>('/business-plans/cancel', {
      method: 'POST',
    }),

  useFreeUnlock: () =>
    apiFetch<{ success: boolean; message: string }>('/business-plans/use-free-unlock', {
      method: 'POST',
    }),
};

// User Profile types
interface UserProfile {
  user: {
    id: string;
    phone: string | null;
    email: string | null;
    emailVerified: boolean;
    name: string | null;
    nameAr: string | null;
    role: string;
  };
  customer: {
    emirate: string | null;
    preferredLanguage: string | null;
    notificationsEnabled: boolean;
  } | null;
}

interface UpdateProfileInput {
  name?: string;
  nameAr?: string;
  email?: string | null;
  emirate?: string | null;
  preferredLanguage?: 'ar' | 'en';
  notificationsEnabled?: boolean;
}

// Users API
export const usersApi = {
  getMe: () =>
    apiFetch<{ success: boolean; data: UserProfile }>('/users/me'),

  update: (data: UpdateProfileInput) =>
    apiFetch<{ success: boolean; message: string; data: UserProfile }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAccount: (confirmation: string) =>
    apiFetch<{ success: boolean; message: string }>('/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ confirmation }),
    }),
};

// Wallet types
interface WalletBalance {
  balance: number;
  currency: string;
}

interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'topup' | 'cv_unlock' | 'refund' | 'bonus' | 'adjustment';
  amount: string;
  balanceAfter: string;
  description: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
}

interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TopUpResult {
  transaction: WalletTransaction;
  newBalance: number;
}

interface CvUnlockResult {
  alreadyUnlocked: boolean;
  cvUnlock?: {
    id: string;
    customerId: string;
    maidId: string;
    unlockedAt: string;
  };
  transaction?: WalletTransaction;
  newBalance?: number;
}

interface CanUnlockResult {
  canUnlock: boolean;
  balance: number;
  requiredAmount: number;
  shortfall: number;
}

// Wallet API
export const walletApi = {
  getBalance: () =>
    apiFetch<{ success: boolean; data: WalletBalance }>('/wallet/balance'),

  getTransactions: (page = 1, limit = 20) =>
    apiFetch<{ success: boolean; data: WalletTransactionsResponse }>(
      `/wallet/transactions?page=${page}&limit=${limit}`
    ),

  createTopUpIntent: (amount: number) =>
    apiFetch<{
      success: boolean;
      data: { intentId: string; amount: number; currency: string };
    }>('/wallet/topup/intent', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  topUp: (amount: number) =>
    apiFetch<{ success: boolean; data: TopUpResult }>('/wallet/topup/confirm', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  unlockCv: (maidId: string) =>
    apiFetch<{ success: boolean; data: CvUnlockResult }>('/wallet/cv-unlock', {
      method: 'POST',
      body: JSON.stringify({ maidId }),
    }),

  canUnlock: () =>
    apiFetch<{ success: boolean; data: CanUnlockResult }>('/wallet/can-unlock'),
};
