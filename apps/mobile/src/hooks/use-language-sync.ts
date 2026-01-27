import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/auth';
import { usersApi } from '@/lib/api';

/**
 * Hook to sync language preference to backend when authenticated
 * Listens to i18n languageChanged event and updates user profile
 */
export function useLanguageSync() {
  const { i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleLanguageChange = async (lang: string) => {
      // Only sync if authenticated
      if (!isAuthenticated || !user) return;

      try {
        // Silently sync to backend - non-critical, failures are ignored
        await usersApi.update({ preferredLanguage: lang as 'ar' | 'en' });
      } catch (error) {
        // Silent fail - language preference sync is non-critical
        console.debug('[useLanguageSync] Failed to sync language:', error);
      }
    };

    // Listen to language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, isAuthenticated, user]);
}
