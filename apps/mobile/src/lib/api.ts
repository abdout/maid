import Constants from 'expo-constants';
import { useAuth } from '@/store/auth';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8787';

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
  list: (params?: Record<string, string | number>) => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
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
  officeList: (params?: Record<string, string | number>) => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
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
