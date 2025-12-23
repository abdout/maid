import { View, Text, ScrollView, Pressable, Switch, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, Dispatch, SetStateAction } from 'react';
import Constants from 'expo-constants';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { GlobeIcon, BellIcon, MessageIcon, StarIcon, FileTextIcon, TrashIcon, BuildingIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

interface SettingItem {
  icon: React.ReactNode;
  label: string;
  value?: string | boolean;
  onPress?: () => void;
  toggle?: boolean;
  onToggle?: Dispatch<SetStateAction<boolean>>;
  destructive?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || '1';

  const handleLanguageChange = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. You may need to login again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Clear all storage items
            await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
            await storage.deleteItem(STORAGE_KEYS.AUTH_USER);
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://maid.ae/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://maid.ae/terms');
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@maid.ae?subject=App Support');
  };

  const handleRateApp = () => {
    // TODO: Add actual store links
    Alert.alert('Rate App', 'Thank you for your feedback!');
  };

  const settingsSections: SettingsSection[] = [
    {
      title: isRTL ? 'عام' : 'General',
      items: [
        {
          icon: <GlobeIcon size={22} color="#717171" />,
          label: t('profile.language'),
          value: i18n.language === 'ar' ? 'العربية' : 'English',
          onPress: handleLanguageChange,
        },
        {
          icon: <BellIcon size={22} color="#717171" />,
          label: isRTL ? 'الإشعارات' : 'Notifications',
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
      ],
    },
    {
      title: isRTL ? 'الدعم' : 'Support',
      items: [
        {
          icon: <MessageIcon size={22} color="#717171" />,
          label: isRTL ? 'تواصل معنا' : 'Contact Support',
          onPress: handleSupport,
        },
        {
          icon: <StarIcon size={22} color="#717171" />,
          label: isRTL ? 'قيم التطبيق' : 'Rate App',
          onPress: handleRateApp,
        },
      ],
    },
    {
      title: isRTL ? 'قانوني' : 'Legal',
      items: [
        {
          icon: <FileTextIcon size={22} color="#717171" />,
          label: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy',
          onPress: handlePrivacyPolicy,
        },
        {
          icon: <FileTextIcon size={22} color="#717171" />,
          label: isRTL ? 'شروط الخدمة' : 'Terms of Service',
          onPress: handleTermsOfService,
        },
      ],
    },
    {
      title: isRTL ? 'البيانات' : 'Data',
      items: [
        {
          icon: <TrashIcon size={22} color="#C13515" />,
          label: isRTL ? 'مسح الكاش' : 'Clear Cache',
          onPress: handleClearCache,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          headerShown: true,
          title: isRTL ? 'الإعدادات' : 'Settings',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="flex-row items-center">
              {isRTL ? (
                <ChevronRightIcon size={20} color="#FF385C" />
              ) : (
                <ChevronLeftIcon size={20} color="#FF385C" />
              )}
              <Text className={`text-primary-500 font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>Back</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text className={`px-6 mb-2 text-typography-500 text-sm font-medium ${isRTL ? 'text-right' : ''}`}>
              {section.title}
            </Text>

            <View className="mx-6 bg-background-50 rounded-xl overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  onPress={item.toggle ? undefined : item.onPress}
                  className={`flex-row items-center p-4 ${
                    itemIndex < section.items.length - 1 ? 'border-b border-background-100' : ''
                  } ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <View className="w-10 h-10 rounded-full bg-background-100 items-center justify-center">
                    {item.icon}
                  </View>
                  <Text
                    className={`flex-1 ${isRTL ? 'mr-4 text-right' : 'ml-4'} ${
                      item.destructive ? 'text-error-500' : 'text-typography-900'
                    } font-medium`}
                  >
                    {item.label}
                  </Text>

                  {item.toggle ? (
                    <Switch
                      value={item.value as boolean}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#DDDDDD', true: '#FF385C' }}
                      thumbColor="white"
                    />
                  ) : item.value ? (
                    <Text className="text-primary-500">{item.value as string}</Text>
                  ) : isRTL ? (
                    <ChevronLeftIcon size={20} color="#B0B0B0" />
                  ) : (
                    <ChevronRightIcon size={20} color="#B0B0B0" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="items-center py-8">
          <View className="w-16 h-16 bg-primary-500 rounded-2xl items-center justify-center mb-4">
            <BuildingIcon size={32} color="#FFFFFF" />
          </View>
          <Text className="text-typography-900 font-bold text-lg">Maid UAE</Text>
          <Text className="text-typography-400 text-sm">
            Version {appVersion} ({buildNumber})
          </Text>
          <Text className="text-typography-400 text-xs mt-2">
            Made in UAE
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
