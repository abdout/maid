import { View, Text, ScrollView, Pressable, Switch, Linking, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Constants from 'expo-constants';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { useAuth } from '@/store/auth';
import { usersApi } from '@/lib/api';
import {
  GlobeIcon,
  BellIcon,
  MessageIcon,
  StarIcon,
  FileTextIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  ShieldIcon,
  HelpCircleIcon,
  XIcon,
} from '@/components/icons';

interface SettingItem {
  icon: React.ReactNode;
  label: string;
  value?: string | boolean;
  onPress?: () => void;
  toggle?: boolean;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { logout } = useAuth();
  const isRTL = i18n.language === 'ar';

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || '1';

  const handleLanguageChange = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    // Persist language preference
    usersApi.update({ preferredLanguage: newLang }).catch(() => {});
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await usersApi.update({ notificationsEnabled: value });
    } catch {
      // Revert on failure
      setNotificationsEnabled(!value);
      Alert.alert(t('common.error'), t('errors.somethingWrong'));
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      t('settings.clearCache'),
      t('settings.deleteAccountWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.clearCache'),
          style: 'destructive',
          onPress: async () => {
            await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
            await storage.deleteItem(STORAGE_KEYS.AUTH_USER);
            Alert.alert(t('common.success'), t('settings.cacheCleared'));
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      Alert.alert(t('common.error'), t('settings.deleteAccountConfirm'));
      return;
    }

    setIsDeleting(true);
    try {
      const response = await usersApi.deleteAccount('DELETE');
      if (response.success) {
        setShowDeleteModal(false);
        Alert.alert(t('common.success'), t('settings.accountDeleted'), [
          {
            text: t('common.ok'),
            onPress: async () => {
              await logout();
              router.replace('/onboarding');
            },
          },
        ]);
      } else {
        Alert.alert(t('common.error'), t('errors.somethingWrong'));
      }
    } catch {
      Alert.alert(t('common.error'), t('errors.somethingWrong'));
    } finally {
      setIsDeleting(false);
    }
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

  const handleHelpCenter = () => {
    Linking.openURL('https://maid.ae/help');
  };

  const handleRateApp = () => {
    // TODO: Add actual store links
    Alert.alert(t('settings.rateApp'), 'Thank you for your feedback!');
  };

  const ChevronIcon = isRTL ? ChevronLeftIcon : ChevronRightIcon;

  const settingsSections: SettingsSection[] = [
    {
      title: t('settings.account'),
      items: [
        {
          icon: <UserIcon size={20} color="#717171" />,
          label: t('profile.editProfile'),
          onPress: () => router.push('/profile-edit'),
        },
        {
          icon: <ShieldIcon size={20} color="#717171" />,
          label: t('settings.security'),
          onPress: () => {}, // Future: Security screen
        },
      ],
    },
    {
      title: t('settings.preferences'),
      items: [
        {
          icon: <GlobeIcon size={20} color="#717171" />,
          label: t('settings.language'),
          value: i18n.language === 'ar' ? 'العربية' : 'English',
          onPress: handleLanguageChange,
        },
        {
          icon: <BellIcon size={20} color="#717171" />,
          label: t('settings.notifications'),
          toggle: true,
          value: notificationsEnabled,
          onToggle: handleNotificationToggle,
        },
      ],
    },
    {
      title: t('settings.supportLegal'),
      items: [
        {
          icon: <HelpCircleIcon size={20} color="#717171" />,
          label: t('settings.helpCenter'),
          onPress: handleHelpCenter,
        },
        {
          icon: <MessageIcon size={20} color="#717171" />,
          label: t('settings.contactSupport'),
          onPress: handleSupport,
        },
        {
          icon: <StarIcon size={20} color="#717171" />,
          label: t('settings.rateApp'),
          onPress: handleRateApp,
        },
        {
          icon: <FileTextIcon size={20} color="#717171" />,
          label: t('settings.privacyPolicy'),
          onPress: handlePrivacyPolicy,
        },
        {
          icon: <FileTextIcon size={20} color="#717171" />,
          label: t('settings.termsOfService'),
          onPress: handleTermsOfService,
        },
      ],
    },
    {
      title: t('settings.data'),
      items: [
        {
          icon: <TrashIcon size={20} color="#717171" />,
          label: t('settings.clearCache'),
          onPress: handleClearCache,
        },
        {
          icon: <XIcon size={20} color="#C13515" />,
          label: t('settings.deleteAccount'),
          onPress: () => setShowDeleteModal(true),
          destructive: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('settings.title'),
          headerStyle: { backgroundColor: '#F9FAFB' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              {isRTL ? (
                <ChevronRightIcon size={20} color="#2563EB" />
              ) : (
                <ChevronLeftIcon size={20} color="#2563EB" />
              )}
              <Text className={`text-primary-500 font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>
                {t('common.back')}
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text className={`px-5 mb-2 text-xs font-semibold text-typography-500 uppercase tracking-wide ${isRTL ? 'text-right' : ''}`}>
              {section.title}
            </Text>

            <View className="mx-4 bg-background-0 rounded-2xl overflow-hidden" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 1,
            }}>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  onPress={item.toggle ? undefined : item.onPress}
                  className={`flex-row items-center px-4 py-3.5 ${
                    itemIndex < section.items.length - 1 ? 'border-b border-outline-100' : ''
                  } ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <View className="w-9 h-9 rounded-full bg-background-50 items-center justify-center">
                    {item.icon}
                  </View>
                  <Text
                    className={`flex-1 ${isRTL ? 'mr-3 text-right' : 'ml-3'} ${
                      item.destructive ? 'text-error-500' : 'text-typography-900'
                    } font-medium`}
                  >
                    {item.label}
                  </Text>

                  {item.toggle ? (
                    <Switch
                      value={item.value as boolean}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#E5E5E5', true: '#2563EB' }}
                      thumbColor="#FFFFFF"
                    />
                  ) : item.value ? (
                    <View className="bg-primary-50 px-3 py-1 rounded-lg">
                      <Text className="text-primary-600 font-medium text-sm">
                        {item.value as string}
                      </Text>
                    </View>
                  ) : !item.destructive ? (
                    <ChevronIcon size={20} color="#B0B0B0" />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="items-center py-8">
          <Text className="text-typography-400 text-sm">
            {t('settings.version')} {appVersion} ({buildNumber})
          </Text>
          <Text className="text-typography-400 text-xs mt-1">
            {t('settings.madeWith')}
          </Text>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center p-6"
          onPress={() => setShowDeleteModal(false)}
        >
          <Pressable
            className="bg-background-0 rounded-2xl w-full max-w-sm p-6"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className={`flex-row items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Text className="text-lg font-bold text-error-500">
                {t('settings.deleteAccountTitle')}
              </Text>
              <Pressable onPress={() => setShowDeleteModal(false)}>
                <XIcon size={24} color="#717171" />
              </Pressable>
            </View>

            {/* Warning */}
            <Text className={`text-typography-700 mb-6 leading-5 ${isRTL ? 'text-right' : ''}`}>
              {t('settings.deleteAccountWarning')}
            </Text>

            {/* Confirmation Input */}
            <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('settings.deleteAccountConfirm')}
            </Text>
            <TextInput
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="DELETE"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="characters"
              className={`bg-background-50 border border-outline-200 rounded-xl px-4 py-3 text-typography-900 mb-6 ${isRTL ? 'text-right' : ''}`}
            />

            {/* Buttons */}
            <View className={`flex-row ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Pressable
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 py-3 rounded-xl bg-background-100 mr-2"
              >
                <Text className="text-center text-typography-700 font-medium">
                  {t('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                className={`flex-1 py-3 rounded-xl ml-2 ${
                  deleteConfirmation === 'DELETE' && !isDeleting
                    ? 'bg-error-500'
                    : 'bg-error-200'
                }`}
              >
                <Text className="text-center text-white font-medium">
                  {isDeleting ? '...' : t('settings.deleteAccountButton')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
