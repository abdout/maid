import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { Stack } from 'expo-router';
import { Platform, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppStripeProvider } from '@/components/stripe-provider';
import { ToastProvider } from '@/context/toast-context';
import { ToastContainer } from '@/components/toast';
import '../global.css';
// Initialize i18n - must be imported to execute the init() call
import { initializeLanguage } from '@/lib/i18n';

// Error Boundary to catch and handle app crashes gracefully
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('App Error:', error, errorInfo);
    // TODO: Send to error tracking service (e.g., Sentry)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF' }}>
          <Text style={{ fontSize: 24, fontWeight: '600', color: '#1a1a1a', marginBottom: 12 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 16, color: '#717171', textAlign: 'center', marginBottom: 24 }}>
            We're sorry, an unexpected error occurred. Please try again.
          </Text>
          <TouchableOpacity
            onPress={this.handleRetry}
            style={{
              backgroundColor: '#FF385C',
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ToastProvider>
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
                <ToastContainer />
              </AppStripeProvider>
            </ToastProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
