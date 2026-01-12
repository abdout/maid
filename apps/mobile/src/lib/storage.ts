import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Cross-platform storage utility
 * Uses SecureStore on native platforms and localStorage on web
 */
export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    // Guard against storing undefined/null values
    if (value === undefined || value === null) {
      console.warn(`[Storage] Attempted to store ${value} for key: ${key}`);
      return;
    }
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  AUTH_USER: 'auth_user',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LANGUAGE: 'app_language',
  // Legacy key for migration
  AUTH_TOKEN: 'auth_token',
} as const;
