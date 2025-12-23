import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '@/lib/i18n';
import { Platform } from 'react-native';
import { NotificationProvider } from '@/components/notification-provider';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Conditionally import GluestackUIProvider only on native
let GluestackUIProvider: React.ComponentType<{ colorMode?: string; children: React.ReactNode }> | null = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  GluestackUIProvider = require('@gluestack-ui/themed').GluestackUIProvider;
}

export default function RootLayout() {
  const content = (
    <SafeAreaProvider>
      <NotificationProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </NotificationProvider>
    </SafeAreaProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {Platform.OS === 'web' || !GluestackUIProvider ? (
          content
        ) : (
          <GluestackUIProvider colorMode="light">
            {content}
          </GluestackUIProvider>
        )}
      </I18nextProvider>
    </QueryClientProvider>
  );
}
