import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Domestic Workers',
  slug: 'maid-uae',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'maid',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#1e40af',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'ae.maid.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1e40af',
    },
    package: 'ae.maid.app',
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
    head: [
      ['meta', { name: 'google-site-verification', content: '5R0nMTlBV9R6vAe4Y3mImjCVbfd0oTZvDarpGtPg7_Q' }]
    ]
  },
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    'expo-router',
    'expo-localization',
    'expo-secure-store',
    '@react-native-community/datetimepicker',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#1e40af',
        sounds: [],
      },
    ],
    [
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: 'merchant.ae.maid.app',
        enableGooglePay: true,
      },
    ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://maid-api.osmanabdout.workers.dev',
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    // Guest mode: when false, customers can browse without login (free trial period)
    requireCustomerAuth: process.env.EXPO_PUBLIC_REQUIRE_CUSTOMER_AUTH === 'true',
    eas: {
      projectId: 'f0a7f098-5bff-46de-95b3-65fa4d52a587',
    },
  },
});
