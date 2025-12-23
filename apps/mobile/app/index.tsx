import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/store/auth';
import { storage } from '@/lib/storage';

export default function Index() {
  const { isAuthenticated, user, isLoading, initialize } = useAuth();
  const [userIntent, setUserIntent] = useState<string | null>(null);
  const [checkingIntent, setCheckingIntent] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initialize();
      const intent = await storage.getItem('user_intent');
      setUserIntent(intent);
      setCheckingIntent(false);
    };
    init();
  }, [initialize]);

  // Show loading while checking auth state
  if (isLoading || checkingIntent) {
    return (
      <View className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  // No session → always show onboarding
  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  // User selected "I'm an office" but hasn't registered yet
  if (userIntent === 'office' && user?.role === 'customer' && !user?.officeId) {
    return <Redirect href="/register-office" />;
  }

  // Redirect based on user role
  if (user?.role === 'office_admin') {
    return <Redirect href="/(office)" />;
  }

  return <Redirect href="/(customer)" />;
}
