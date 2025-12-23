/**
 * Component that handles push notification registration.
 * Push notifications only work on native (iOS/Android).
 * On web, this is a passthrough component.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Push notifications are handled in the native-specific file
  // This is a no-op wrapper for web compatibility
  return <>{children}</>;
}
