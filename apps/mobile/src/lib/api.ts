import Constants from 'expo-constants';
import { useAuth } from '@/store/auth';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://maid-api.osmanabdout.workers.dev';

// Token refresh promise to prevent multiple simultaneous refreshes
let refreshPromise: Promise<boolean> | null = null;

// API response types for auth
interface TokenPairResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface ApiErrorResponse {
  success: boolean;
  error: string | { issues?: Array<{ message: string; path?: string[] }> };
  issues?: Array<{ message: string; path?: string[] }>;
  code?: string;
}

/**
 * Extract a readable error message from various error response formats
 * Handles Zod validation errors, simple string errors, and nested error objects
 */
function extractErrorMessage(errorData: unknown): string {
  if (!errorData || typeof errorData !== 'object') {
    return 'Request failed';
  }

  const err = errorData as Record<string, unknown>;

  // Case 1: Simple string error
  if (typeof err.error === 'string') {
    return err.error;
  }

  // Case 2: Zod validation error with issues array inside error object
  if (err.error && typeof err.error === 'object') {
    const zodError = err.error as { issues?: Array<{ message: string; path?: string[] }> };
    if (Array.isArray(zodError.issues) && zodError.issues.length > 0) {
      const issue = zodError.issues[0];
      const path = issue.path?.join('.') || '';
      return path ? `${path}: ${issue.message}` : issue.message;
    }
  }

  // Case 3: Direct issues array (some Zod setups)
  if (Array.isArray(err.issues) && err.issues.length > 0) {
    const issue = (err.issues as Array<{ message: string; path?: string[] }>)[0];
    const path = issue.path?.join('.') || '';
    return path ? `${path}: ${issue.message}` : issue.message;
  }

  // Case 4: Message field
  if (typeof err.message === 'string') {
    return err.message;
  }

  return 'Request failed';
}

/**
 * Attempt to refresh the access token using the refresh token
 * Returns true if refresh was successful, false otherwise
 */
async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken, updateTokens, logout, setRefreshing } = useAuth.getState();

  if (!refreshToken) {
    return false;
  }

  // If already refreshing, wait for existing promise
  if (refreshPromise) {
    return refreshPromise;
  }

  setRefreshing(true);

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json() as TokenPairResponse | ApiErrorResponse;

      if (response.ok && 'data' in data && data.success) {
        await updateTokens({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresIn: data.data.expiresIn,
        });
        return true;
      }

      // Refresh failed - force logout
      await logout();
      return false;
    } catch {
      // Network error during refresh
      return false;
    } finally {
      refreshPromise = null;
      setRefreshing(false);
    }
  })();

  return refreshPromise;
}

// Fetch wrapper with auth token (for external use)
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = useAuth.getState().accessToken;

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

/**
 * Base fetch function with automatic token refresh on 401
 * Handles TOKEN_EXPIRED error code by attempting refresh and retry
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const { accessToken } = useAuth.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await response.json() as T | ApiErrorResponse;

  // Handle 401 errors
  if (response.status === 401 && !isRetry) {
    const errorData = data as ApiErrorResponse;

    // Check if token expired (can be refreshed)
    if (errorData.code === 'TOKEN_EXPIRED' || (typeof errorData.error === 'string' && errorData.error.includes('expired'))) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        // Retry the original request with new token
        return apiFetch<T>(endpoint, options, true);
      }
    }

    // Force logout on auth failure that can't be recovered
    const { logout } = useAuth.getState();
    await logout();
    throw new Error(extractErrorMessage(errorData) || 'Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return data as T;
}

// Auth response types
interface AuthUser {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: string;
  officeId: string | null;
}

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
  };
}

interface OtpRequestResponse {
  success: boolean;
  message: string;
  data: {
    phone: string;
    expiresIn: number;
  };
}

interface OtpVerifyResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
  };
}

interface MeResponse {
  success: boolean;
  data: AuthUser;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  requestOtp: (phone: string) =>
    apiFetch<OtpRequestResponse>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, code: string) =>
    apiFetch<OtpVerifyResponse>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  getMe: () => apiFetch<MeResponse>('/auth/me'),

  refresh: (refreshToken: string) =>
    apiFetch<TokenPairResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: () =>
    apiFetch<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),

  logoutAll: (password?: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth/logout-all', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  register: (email: string, password: string, name?: string) =>
    apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  forgotPassword: (email: string) =>
    apiFetch<{
      success: boolean;
      message: string;
      data: { token?: string; expiresIn: number };
    }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// Maids API
export const maidsApi = {
  list: (params?: Record<string, string | number | string[] | undefined>) => {
    // Build query string with proper array serialization
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value == null) return;
        if (Array.isArray(value)) {
          // Serialize arrays as repeated params: key=v1&key=v2
          value.forEach((v) => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString() ? '?' + searchParams.toString() : '';
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
    addressAr?: string;
    scopes?: ('recruitment' | 'leasing' | 'typing')[];
    logoUrl?: string;
    licenseNumber?: string;
    licenseExpiry?: string;
    licenseImageUrl?: string;
    emirate?: string;
    googleMapsUrl?: string;
    managerPhone1?: string;
    managerPhone2?: string;
    website?: string;
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
  maidId: string;
  createdAt: string;
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

// Helper for retry delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if error is a client error that shouldn't be retried
function isClientError(message: string): boolean {
  return (
    message.includes('No file provided') ||
    message.includes('Invalid file type') ||
    message.includes('File too large') ||
    message.includes('Not authenticated')
  );
}

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

  uploadFile: async (uri: string, folder: 'maids' | 'documents' | 'logos' = 'maids', maxRetries = 3): Promise<string> => {
    let lastError: Error | null = null;

    console.log('[uploadsApi] ====== UPLOAD START v3 ======');
    console.log('[uploadsApi] URI:', uri);
    console.log('[uploadsApi] Folder:', folder);

    // Allowed MIME types (must match server validation)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    // Detect platform - on web, URIs are blob: or data: or http:
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
    const isNativeFileUri = uri.startsWith('file://') || uri.startsWith('content://');
    const isBlobUri = uri.startsWith('blob:');
    const isDataUri = uri.startsWith('data:');
    const isHttpUri = uri.startsWith('http://') || uri.startsWith('https://');

    console.log('[uploadsApi] Platform:', { isWeb, isNativeFileUri, isBlobUri, isDataUri, isHttpUri });

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const token = useAuth.getState().accessToken;
        console.log('[uploadsApi] Attempt', attempt + 1, '- Token:', token ? 'exists' : 'MISSING');
        if (!token) throw new Error('Not authenticated');

        const formData = new FormData();

        // Web platform: need to fetch blob and create File object
        if (isWeb && !isNativeFileUri) {
          console.log('[uploadsApi] WEB MODE - Converting URI to File...');

          let blob: Blob;
          let mimeType = 'image/jpeg';

          if (isBlobUri || isHttpUri) {
            // Fetch the blob from blob: or http: URL
            console.log('[uploadsApi] Fetching blob from URL...');
            const response = await fetch(uri);
            blob = await response.blob();
            console.log('[uploadsApi] Fetched blob - raw type:', JSON.stringify(blob.type), 'size:', blob.size);

            // Get the MIME type, but validate it's actually allowed
            const rawType = blob.type?.toLowerCase().trim();
            if (rawType && allowedTypes.includes(rawType)) {
              mimeType = rawType;
            } else {
              console.log('[uploadsApi] Blob type not in allowed list, defaulting to image/jpeg');
              mimeType = 'image/jpeg';
            }
          } else if (isDataUri) {
            // Parse data URI
            console.log('[uploadsApi] Parsing data URI...');
            const [header, base64] = uri.split(',');
            const mimeMatch = header.match(/data:([^;]+)/);
            const rawType = mimeMatch ? mimeMatch[1].toLowerCase().trim() : '';

            if (rawType && allowedTypes.includes(rawType)) {
              mimeType = rawType;
            } else {
              mimeType = 'image/jpeg';
            }

            const binary = atob(base64);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              array[i] = binary.charCodeAt(i);
            }
            blob = new Blob([array], { type: mimeType });
            console.log('[uploadsApi] Created blob from data URI:', { type: mimeType, size: blob.size });
          } else {
            // Unknown URI format on web - try to fetch anyway
            console.log('[uploadsApi] Unknown URI format, attempting fetch...');
            const response = await fetch(uri);
            blob = await response.blob();
            const rawType = blob.type?.toLowerCase().trim();
            if (rawType && allowedTypes.includes(rawType)) {
              mimeType = rawType;
            } else {
              mimeType = 'image/jpeg';
            }
          }

          console.log('[uploadsApi] Final mimeType:', mimeType);

          // Create filename with correct extension
          const extMap: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'application/pdf': 'pdf',
          };
          const ext = extMap[mimeType] || 'jpg';
          const filename = `photo_${Date.now()}.${ext}`;

          // CRITICAL: Create a NEW blob with the correct type if needed
          // This ensures the File has the right type even if the original blob didn't
          let typedBlob = blob;
          if (blob.type !== mimeType) {
            console.log('[uploadsApi] Re-creating blob with correct type...');
            const arrayBuffer = await blob.arrayBuffer();
            typedBlob = new Blob([arrayBuffer], { type: mimeType });
            console.log('[uploadsApi] New blob type:', typedBlob.type);
          }

          // Create File object with explicit type
          const file = new File([typedBlob], filename, { type: mimeType });
          console.log('[uploadsApi] Created File:', { name: file.name, type: file.type, size: file.size });

          // Double-check the file type before sending
          if (!allowedTypes.includes(file.type)) {
            console.error('[uploadsApi] CRITICAL: File type still invalid:', file.type);
            throw new Error(`Invalid file type: ${file.type}`);
          }

          formData.append('file', file);
        } else {
          // React Native: use RN-style object
          console.log('[uploadsApi] NATIVE MODE - Using RN FormData...');
          const filename = uri.split('/').pop() || 'image.jpg';
          const match = /\.(\w+)$/.exec(filename);
          let extension = match ? match[1].toLowerCase() : 'jpeg';
          if (extension === 'jpg') extension = 'jpeg';
          const type = ['jpeg', 'png', 'webp'].includes(extension) ? `image/${extension}` : 'image/jpeg';

          console.log('[uploadsApi] File info:', { filename, extension, type });

          formData.append('file', {
            uri,
            name: filename,
            type,
          } as unknown as Blob);
        }

        formData.append('folder', folder);

        console.log('[uploadsApi] Sending to:', `${API_URL}/uploads/file`);

        const response = await fetch(`${API_URL}/uploads/file`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        console.log('[uploadsApi] Response status:', response.status);

        const data = await response.json();
        console.log('[uploadsApi] Response data:', JSON.stringify(data).substring(0, 200));

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Upload failed');
        }

        console.log('[uploadsApi] Upload successful!');
        return data.data.url;
      } catch (error) {
        lastError = error as Error;
        console.error('[uploadsApi] Attempt', attempt + 1, 'failed:', lastError.message);

        // Don't retry client errors (400s)
        if (isClientError(lastError.message)) {
          throw lastError;
        }

        // Wait before retry with exponential backoff (1s, 2s, 4s)
        if (attempt < maxRetries - 1) {
          await delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error('Upload failed after retries');
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
  customerId?: string;
  customerSessionClientSecret?: string;
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

// Business types
interface Business {
  id: string;
  type: 'typing_office' | 'visa_transfer';
  name: string;
  nameAr: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  addressAr: string | null;
  logoUrl: string | null;
  coverPhotoUrl: string | null;
  description: string | null;
  descriptionAr: string | null;
  emirate: string | null;
  googleMapsUrl: string | null;
  services: string | null;
  servicesAr: string | null;
  priceRange: string | null;
  workingHours: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

// Businesses API
export const businessesApi = {
  list: (params?: {
    type?: 'typing_office' | 'visa_transfer';
    search?: string;
    emirate?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const cleanParams = params
      ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null))
      : {};
    const query = Object.keys(cleanParams).length > 0
      ? '?' + new URLSearchParams(cleanParams as Record<string, string>).toString()
      : '';
    return apiFetch<{
      success: boolean;
      data: {
        items: Business[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
    }>(`/businesses${query}`);
  },

  getById: (id: string) =>
    apiFetch<{ success: boolean; data: Business }>(`/businesses/${id}`),
};

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
