import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permissions not granted');
    return null;
  }

  // Get Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

// Configure Android notification channel
export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1e40af',
    });

    await Notifications.setNotificationChannelAsync('quotations', {
      name: 'Quotations',
      description: 'Notifications about quotation updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1e40af',
    });
  }
}

// Schedule local notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  channelId = 'default'
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Immediate
  });
}

// Add notification listeners
export function addNotificationListeners(
  onReceived?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void
) {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      onReceived?.(notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      onResponse?.(response);
    }
  );

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}
