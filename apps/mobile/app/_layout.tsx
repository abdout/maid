import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '@/lib/i18n';
import { useColorScheme } from 'react-native';
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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <GluestackUIProvider colorMode={colorScheme === 'dark' ? 'dark' : 'light'}>
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
        </GluestackUIProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
