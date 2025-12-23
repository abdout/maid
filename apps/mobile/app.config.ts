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
  },
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    'expo-router',
    'expo-localization',
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#1e40af',
        sounds: [],
      },
    ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://maid-api.osmanabdout.workers.dev',
    eas: {
      projectId: 'f0a7f098-5bff-46de-95b3-65fa4d52a587',
    },
  },
});
