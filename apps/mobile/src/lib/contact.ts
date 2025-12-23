import { Linking, Alert, Platform, AlertButton } from 'react-native';

/**
 * Open phone dialer with the given number
 */
export async function callPhone(phoneNumber: string): Promise<void> {
  const url = `tel:${phoneNumber}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Phone calls are not supported on this device');
    }
  } catch (error) {
    console.error('Call phone error:', error);
    Alert.alert('Error', 'Could not open phone dialer');
  }
}

/**
 * Open SMS app with the given number
 */
export async function sendSMS(phoneNumber: string, message?: string): Promise<void> {
  const separator = Platform.OS === 'ios' ? '&' : '?';
  const url = message
    ? `sms:${phoneNumber}${separator}body=${encodeURIComponent(message)}`
    : `sms:${phoneNumber}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'SMS is not supported on this device');
    }
  } catch (error) {
    console.error('Send SMS error:', error);
    Alert.alert('Error', 'Could not open SMS app');
  }
}

/**
 * Open WhatsApp chat with the given number
 * Phone number should include country code without + (e.g., 971501234567)
 */
export async function openWhatsApp(phoneNumber: string, message?: string): Promise<void> {
  // Remove any non-digit characters and leading +
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  const url = message
    ? `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`
    : `whatsapp://send?phone=${cleanNumber}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback to web WhatsApp
      const webUrl = message
        ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
        : `https://wa.me/${cleanNumber}`;
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    console.error('WhatsApp error:', error);
    Alert.alert('Error', 'Could not open WhatsApp');
  }
}

/**
 * Open email client
 */
export async function sendEmail(
  email: string,
  subject?: string,
  body?: string
): Promise<void> {
  let url = `mailto:${email}`;
  const params: string[] = [];

  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Email is not supported on this device');
    }
  } catch (error) {
    console.error('Send email error:', error);
    Alert.alert('Error', 'Could not open email client');
  }
}

/**
 * Open maps with the given address
 */
export async function openMaps(address: string): Promise<void> {
  const encodedAddress = encodeURIComponent(address);
  const url = Platform.select({
    ios: `maps:0,0?q=${encodedAddress}`,
    android: `geo:0,0?q=${encodedAddress}`,
    default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
  });

  try {
    await Linking.openURL(url!);
  } catch (error) {
    console.error('Open maps error:', error);
    // Fallback to Google Maps web
    await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
  }
}

/**
 * Show contact options action sheet
 */
export function showContactOptions(
  phoneNumber: string,
  options?: {
    email?: string;
    whatsappMessage?: string;
  }
): void {
  const buttons: AlertButton[] = [
    {
      text: '📞 Call',
      onPress: () => { callPhone(phoneNumber); },
    },
    {
      text: '💬 WhatsApp',
      onPress: () => { openWhatsApp(phoneNumber, options?.whatsappMessage); },
    },
    {
      text: '📱 SMS',
      onPress: () => { sendSMS(phoneNumber); },
    },
  ];

  if (options?.email) {
    buttons.push({
      text: '📧 Email',
      onPress: () => { sendEmail(options.email!); },
    });
  }

  buttons.push({
    text: 'Cancel',
    style: 'cancel' as const,
  });

  Alert.alert(
    'Contact Office',
    `Phone: ${phoneNumber}`,
    buttons,
    { cancelable: true }
  );
}
