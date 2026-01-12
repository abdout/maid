import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import type { User } from '@maid/shared';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  login: (data: { tokens: TokenPair; user: User }) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateTokens: (tokens: TokenPair) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  setRefreshing: (isRefreshing: boolean) => void;
  // Legacy support for single token (will be migrated)
  legacyLogin: (data: { token: string; user: User }) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isRefreshing: false,

  login: async ({ tokens, user }) => {
    await Promise.all([
      storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      storage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user)),
    ]);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      isAuthenticated: true,
    });
  },

  // Legacy support for old API responses
  legacyLogin: async ({ token, user }) => {
    await Promise.all([
      storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
      storage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user)),
    ]);
    set({
      accessToken: token,
      refreshToken: null,
      user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await Promise.all([
      storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
      storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
      storage.deleteItem(STORAGE_KEYS.AUTH_USER),
      // Clean up legacy key if exists
      storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN),
    ]);
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  initialize: async () => {
    try {
      // Try new token keys first
      let accessToken = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      let refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userJson = await storage.getItem(STORAGE_KEYS.AUTH_USER);

      // Migration: check legacy token if new ones not found
      if (!accessToken) {
        const legacyToken = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (legacyToken) {
          accessToken = legacyToken;
          // Migrate to new key
          await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, legacyToken);
          await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
        }
      }

      if (accessToken && userJson) {
        const user = JSON.parse(userJson) as User;
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateTokens: async (tokens: TokenPair) => {
    await Promise.all([
      storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  },

  setRefreshing: (isRefreshing: boolean) => {
    set({ isRefreshing });
  },

  updateUser: async (user: User) => {
    await storage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    set({ user });
  },
}));

// Selector for getting token (backwards compatibility)
export const getToken = () => useAuth.getState().accessToken;
