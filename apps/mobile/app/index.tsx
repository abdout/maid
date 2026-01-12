import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '@/store/auth';
import { storage, STORAGE_KEYS } from '@/lib/storage';

// Guest mode: when false, customers can browse without login (free trial period)
const requireCustomerAuth = Constants.expoConfig?.extra?.requireCustomerAuth ?? false;

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

        // Guest mode: allow customers to browse without login
        if (!isAuthenticated) {
          if (requireCustomerAuth) {
            router.replace('/login');
          } else {
            // Free trial mode: go directly to customer screens
            router.replace('/(customer)');
          }
          return;
        }

        // Redirect based on user role
        if (user?.role === 'office_admin') {
          router.replace('/(office)');
        } else {
          router.replace('/(customer)');
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
