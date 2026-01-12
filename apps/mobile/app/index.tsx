import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/store/auth';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { authConfig } from '@/config';

// Use centralized auth config - toggle GUEST_MODE in src/config/auth.ts
const { requireCustomerAuth, requireOfficeAuth } = authConfig;

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, initialize } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      if (isLoading) return;

      try {
        const onboardingCompleted = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);

        if (!onboardingCompleted) {
          router.replace('/onboarding');
          return;
        }

        // If authenticated, redirect based on role
        if (isAuthenticated) {
          if (user?.role === 'office_admin') {
            router.replace('/(office)');
          } else {
            router.replace('/(customer)');
          }
          return;
        }

        // Not authenticated - check user intent from onboarding
        const userIntent = await storage.getItem('user_intent');

        if (userIntent === 'office') {
          // Office path
          if (requireOfficeAuth) {
            router.replace('/login');
          } else {
            router.replace('/(office)');
          }
        } else {
          // Customer path (default)
          if (requireCustomerAuth) {
            router.replace('/login');
          } else {
            router.replace('/(customer)');
          }
        }
      } catch (error) {
        console.error('Navigation error:', error);
        router.replace('/onboarding');
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingAndRedirect();
  }, [isLoading, isAuthenticated, user]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#FF385C" />
    </View>
  );
}
