import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { useAuth } from '@/store/auth';

export default function Index() {
  const { isAuthenticated, user, isLoading, initialize } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkState = async () => {
      // Initialize auth
      await initialize();

      // Check onboarding
      const completed = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      setHasCompletedOnboarding(completed === 'true');
      setCheckingOnboarding(false);
    };

    checkState();
  }, [initialize]);

  // Show loading while checking state
  if (isLoading || checkingOnboarding) {
    return (
      <View className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  // Show onboarding for new users
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Redirect based on user role
  if (user?.role === 'office_admin') {
    return <Redirect href="/(office)" />;
  }

  return <Redirect href="/(customer)" />;
}
