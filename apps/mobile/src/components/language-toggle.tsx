import { useState } from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage, handleLanguageRestart, type SupportedLanguage } from '@/lib/i18n';
import { GlobeIcon } from './icons';

interface LanguageToggleProps {
  /** Visual style of the toggle */
  variant?: 'pill' | 'button' | 'icon' | 'text';
  /** Show country flag emoji */
  showFlag?: boolean;
  /** Callback when language changes */
  onLanguageChange?: (lang: SupportedLanguage) => void;
}

/**
 * Language toggle component for switching between English and Arabic
 * Handles RTL state changes and restart prompts
 */
export function LanguageToggle({
  variant = 'pill',
  showFlag = false,
  onLanguageChange,
}: LanguageToggleProps) {
  const { t, i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const currentLang = i18n.language as SupportedLanguage;
  const isRTL = currentLang === 'ar';

  const handleToggle = async () => {
    if (isChanging) return;

    const newLang: SupportedLanguage = currentLang === 'ar' ? 'en' : 'ar';
    setIsChanging(true);

    try {
      const needsRestart = await changeLanguage(newLang);

      // Notify callback
      onLanguageChange?.(newLang);

      if (needsRestart) {
        // Show restart prompt
        const title = newLang === 'ar'
          ? 'إعادة التشغيل مطلوبة'
          : 'Restart Required';
        const message = newLang === 'ar'
          ? 'أعد تشغيل التطبيق لتطبيق تغييرات التخطيط.'
          : 'Restart the app to apply layout changes.';
        const restartNow = newLang === 'ar' ? 'إعادة التشغيل' : 'Restart Now';
        const later = newLang === 'ar' ? 'لاحقاً' : 'Later';

        if (Platform.OS === 'web') {
          const shouldRestart = window.confirm(`${title}\n\n${message}`);
          if (shouldRestart) {
            await handleLanguageRestart();
          }
        } else {
          Alert.alert(
            title,
            message,
            [
              {
                text: later,
                style: 'cancel',
              },
              {
                text: restartNow,
                style: 'default',
                onPress: () => handleLanguageRestart(),
              },
            ],
            { cancelable: true }
          );
        }
      }
    } catch (error) {
      console.error('[LanguageToggle] Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  // Get display text based on variant
  const getDisplayText = () => {
    const flag = currentLang === 'ar' ? '🇸🇦' : '🇬🇧';
    const text = currentLang === 'ar' ? 'العربية' : 'EN';

    if (showFlag) {
      return `${flag} ${text}`;
    }
    return text;
  };

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <Pressable
        onPress={handleToggle}
        disabled={isChanging}
        className="w-9 h-9 rounded-full bg-background-100 items-center justify-center"
        style={{ opacity: isChanging ? 0.5 : 1 }}
      >
        <GlobeIcon size={18} color="#717171" />
      </Pressable>
    );
  }

  // Button variant
  if (variant === 'button') {
    return (
      <Pressable
        onPress={handleToggle}
        disabled={isChanging}
        className="px-4 py-2 rounded-lg bg-background-100"
        style={{ opacity: isChanging ? 0.5 : 1 }}
      >
        <View className={`flex-row items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <GlobeIcon size={16} color="#717171" />
          <Text className="text-typography-700 font-medium text-sm">
            {getDisplayText()}
          </Text>
        </View>
      </Pressable>
    );
  }

  // Text-only variant (full word, no icon, no background)
  if (variant === 'text') {
    const fullText = currentLang === 'ar' ? 'English' : 'العربية';
    return (
      <Pressable
        onPress={handleToggle}
        disabled={isChanging}
        className="px-2 py-1"
        style={{ opacity: isChanging ? 0.5 : 1 }}
      >
        <Text className="text-white font-medium text-base">
          {fullText}
        </Text>
      </Pressable>
    );
  }

  // Pill variant (default)
  return (
    <Pressable
      onPress={handleToggle}
      disabled={isChanging}
      className="px-3 py-1.5 rounded-full bg-white/20 border border-white/30"
      style={{ opacity: isChanging ? 0.5 : 1 }}
    >
      <View className={`flex-row items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <GlobeIcon size={14} color="#FFFFFF" />
        <Text className="text-white font-medium text-sm">
          {getDisplayText()}
        </Text>
      </View>
    </Pressable>
  );
}
