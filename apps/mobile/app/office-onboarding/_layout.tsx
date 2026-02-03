import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/store/auth';
import { View, ActivityIndicator } from 'react-native';
import { storage } from '@/lib/storage';

export default function OfficeOnboardingLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Redirect to login if not authenticated (after loading completes)
    if (!isLoading && !isAuthenticated) {
      // Store the redirect so user comes back after login
      storage.setItem('post_login_redirect', '/office-onboarding');
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
