import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import type { User } from '@maid/shared';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { token: string; user: User }) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async ({ token, user }) => {
    await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await storage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
    await storage.deleteItem(STORAGE_KEYS.AUTH_USER);
    set({ token: null, user: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userJson = await storage.getItem(STORAGE_KEYS.AUTH_USER);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
