import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useMutation } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { useAuth } from '@/store/auth';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { isAuthenticated } = useAuth();

  const registerMutation = useMutation({
    mutationFn: ({ token, platform }: { token: string; platform: 'ios' | 'android' }) =>
      notificationsApi.registerPushToken(token, platform),
    onError: (error) => {
      console.error('Failed to register push token:', error);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (token?: string) => notificationsApi.removePushToken(token),
    onError: (error) => {
      console.error('Failed to remove push token:', error);
    },
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // Send token to backend
        registerMutation.mutate({
          token,
          platform: Platform.OS as 'ios' | 'android',
        });
      }
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for notification responses (when user taps on notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      // Handle notification tap - navigate to relevant screen based on data
      console.log('Notification tapped:', data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated]);

  const unregister = async () => {
    if (expoPushToken) {
      await removeMutation.mutateAsync(expoPushToken);
      setExpoPushToken(null);
    }
  };

  return {
    expoPushToken,
    notification,
    unregister,
    isRegistering: registerMutation.isPending,
    isUnregistering: removeMutation.isPending,
  };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check and request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get the Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return token.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

// Hook to use in components that need to schedule local notifications
export function useLocalNotifications() {
  const scheduleNotification = async (
    title: string,
    body: string,
    data?: Record<string, unknown>,
    trigger?: Notifications.NotificationTriggerInput
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: trigger || null, // null means immediate
    });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const getBadgeCount = async () => {
    return await Notifications.getBadgeCountAsync();
  };

  const setBadgeCount = async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  };

  return {
    scheduleNotification,
    cancelAllNotifications,
    getBadgeCount,
    setBadgeCount,
  };
}
