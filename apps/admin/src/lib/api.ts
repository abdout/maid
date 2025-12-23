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

interface UserListItem {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  createdAt: string;
}

// Admin API
export const adminApi = {
  // Stats
  getStats: () => apiFetch<{ success: boolean; data: PlatformStats }>('/admin/stats'),

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

export type {
  PlatformStats,
  MaidListItem,
  OfficeListItem,
  UserListItem,
  NotificationHistoryItem,
};
