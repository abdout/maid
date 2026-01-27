import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Platform, View, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStripeProvider } from '@/components/stripe-provider';
import '../global.css';
// Initialize i18n - must be imported to execute the init() call
import { initializeLanguage } from '@/lib/i18n';

// Enable screen freezing for tab state preservation (native only)
if (Platform.OS !== 'web') {
  // Dynamic import to avoid web bundling issues
  const { enableFreeze } = require('react-native-screens');
  enableFreeze(true);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  // Initialize language from storage on app start
  useEffect(() => {
    initializeLanguage()
      .then(() => setIsLanguageReady(true))
      .catch(() => setIsLanguageReady(true)); // Continue even if init fails
  }, []);

  // Show loading while initializing language
  if (!isLanguageReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppStripeProvider>
          <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="onboarding"
        >
          <Stack.Screen
            name="maid-onboarding"
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="edit-maid/[id]"
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="profile-edit"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="payment-history"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          </Stack>
        </AppStripeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
