import { usePushNotifications } from '@/hooks/use-notifications';

/**
 * Native-specific notification provider.
 * Handles push notification registration on iOS/Android.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // This hook handles registration automatically when user is authenticated
  usePushNotifications();

  return <>{children}</>;
}
