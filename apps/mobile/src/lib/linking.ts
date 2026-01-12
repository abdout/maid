import { Linking, Platform, Alert } from 'react-native';

/**
 * Opens WhatsApp with a pre-filled message
 * @param phone Phone number (with or without country code)
 * @param message Pre-filled message text
 */
export async function openWhatsApp(phone: string, message?: string): Promise<void> {
  // Clean phone number - remove spaces, dashes, and ensure it has country code
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Add UAE country code if not present
  if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('971')) {
    cleanPhone = '971' + cleanPhone;
  } else if (cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.substring(1);
  }

  const encodedMessage = message ? encodeURIComponent(message) : '';
  const whatsappUrl = `whatsapp://send?phone=${cleanPhone}${encodedMessage ? `&text=${encodedMessage}` : ''}`;
  const webWhatsappUrl = `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;

  try {
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fallback to web WhatsApp
      await Linking.openURL(webWhatsappUrl);
    }
  } catch {
    // Final fallback
    await Linking.openURL(webWhatsappUrl);
  }
}

/**
 * Opens the phone dialer with the given number
 * @param phone Phone number to call
 */
export async function openPhoneDialer(phone: string): Promise<void> {
  // Clean phone number
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Add UAE country code if not present
  if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('971')) {
    cleanPhone = '+971' + cleanPhone;
  } else if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone;
  }

  const phoneUrl = `tel:${cleanPhone}`;

  try {
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Error', 'Unable to make phone calls on this device');
    }
  } catch {
    Alert.alert('Error', 'Unable to open phone dialer');
  }
}

/**
 * Generates a CV inquiry message for WhatsApp
 * @param cvReference CV reference number
 * @param workerName Worker name (optional)
 * @param isArabic Whether to use Arabic message
 */
export function generateCVInquiryMessage(
  cvReference?: string,
  workerName?: string,
  isArabic = false
): string {
  if (isArabic) {
    if (cvReference) {
      return `مرحبا، أنا مهتم بالسيرة الذاتية رقم ${cvReference}${workerName ? ` (${workerName})` : ''}. هل يمكنني الحصول على مزيد من المعلومات؟`;
    }
    return `مرحبا، أنا مهتم بالعمالة المنزلية${workerName ? ` (${workerName})` : ''}. هل يمكنني الحصول على مزيد من المعلومات؟`;
  }

  if (cvReference) {
    return `Hi, I'm interested in CV ${cvReference}${workerName ? ` (${workerName})` : ''}. Can I get more information?`;
  }
  return `Hi, I'm interested in the domestic worker${workerName ? ` (${workerName})` : ''}. Can I get more information?`;
}
