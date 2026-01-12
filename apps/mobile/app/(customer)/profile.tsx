import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Switch, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/auth';
import { usersApi } from '@/lib/api';
import {
  HeartIcon,
  FileTextIcon,
  GlobeIcon,
  BellIcon,
  LogOutIcon,
  UserIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  SettingsIcon,
  UnlockIcon,
  CreditCardIcon,
  BuildingIcon,
} from '@/components/icons';

interface UserProfile {
  user: {
    id: string;
    phone: string | null;
    email: string | null;
    emailVerified: boolean;
    name: string | null;
    nameAr: string | null;
    role: string;
  };
  customer: {
    emirate: string | null;
    preferredLanguage: string | null;
    notificationsEnabled: boolean;
  } | null;
}

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const isRTL = i18n.language === 'ar';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // Fetch profile on mount and focus (only if authenticated)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchProfile();
      }
    }, [isAuthenticated])
  );

  const fetchProfile = async () => {
    try {
      const response = await usersApi.getMe();
      if (response.success && response.data) {
        setProfile(response.data);
        setNotificationsEnabled(response.data.customer?.notificationsEnabled ?? true);
      }
    } catch {
      // Silent fail - user may not have complete profile
    }
  };

  // Guest mode: show login prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
        <View className="px-6 pt-4 pb-4">
          <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('profile.title')}
          </Text>
        </View>

        {/* Guest Card */}
        <View className="mx-4 mb-6 p-5 bg-primary-500 rounded-2xl">
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
              <UserIcon size={32} color="#FFFFFF" />
            </View>
            <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
              <Text className="text-white font-semibold text-lg">
                {t('auth.guest', 'Guest')}
              </Text>
              <Text className="text-white/80 mt-1">
                {t('auth.loginForFullAccess', 'Login for full access')}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/login')}
              className="bg-white px-4 py-2.5 rounded-xl"
            >
              <Text className="text-primary-500 font-medium text-sm">
                {t('auth.login')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Language Toggle (available for guests) */}
        <View className="mx-4 mb-6">
          <Text className={`text-xs font-semibold text-typography-500 uppercase tracking-wide mb-3 ${isRTL ? 'text-right mr-1' : 'ml-1'}`}>
            {t('profile.quickSettings')}
          </Text>
          <View className="bg-background-0 rounded-2xl overflow-hidden" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
          }}>
            <Pressable
              onPress={() => {
                const newLang = i18n.language === 'ar' ? 'en' : 'ar';
                i18n.changeLanguage(newLang);
              }}
              className={`flex-row items-center px-4 py-3.5 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <View className="w-9 h-9 rounded-full bg-background-50 items-center justify-center">
                <GlobeIcon size={20} color="#717171" />
              </View>
              <Text className={`flex-1 text-typography-900 font-medium ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}>
                {t('profile.language')}
              </Text>
              <View className="bg-primary-50 px-3 py-1 rounded-lg">
                <Text className="text-primary-600 font-medium text-sm">
                  {i18n.language === 'ar' ? 'العربية' : 'EN'}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Login CTA */}
        <View className="mx-4 px-4 py-6 bg-background-0 rounded-2xl items-center" style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 1,
        }}>
          <Text className="text-typography-900 font-semibold text-lg text-center mb-2">
            {t('auth.loginBenefits', 'Login to access all features')}
          </Text>
          <Text className="text-typography-500 text-sm text-center mb-4">
            {t('auth.loginBenefitsDesc', 'Save favorites, get quotations, and more')}
          </Text>
          <Pressable
            onPress={() => router.push('/login')}
            className="bg-primary-500 px-8 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">{t('auth.login')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    setIsUpdatingNotifications(true);
    try {
      await usersApi.update({ notificationsEnabled: value });
    } catch {
      // Revert on failure
      setNotificationsEnabled(!value);
      Alert.alert(t('common.error'), t('errors.somethingWrong'));
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    // Persist language preference
    usersApi.update({ preferredLanguage: newLang }).catch(() => {});
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/onboarding');
  };

  const displayName = profile?.user.name || user?.name || t('home.welcome');
  const displayPhone = profile?.user.phone || user?.phone || '';

  const accountItems = [
    { key: 'favorites', icon: HeartIcon, label: t('profile.favorites'), route: '/(customer)/favorites' as const },
    { key: 'quotations', icon: FileTextIcon, label: t('profile.myQuotations'), route: '/(customer)/quotations' as const },
    { key: 'unlockedCvs', icon: UnlockIcon, label: t('profile.unlockedCvs'), route: '/(customer)/unlocked-cvs' as const },
    { key: 'businessPlans', icon: BuildingIcon, label: t('businessPlans.title'), route: '/(customer)/plans' as const },
    { key: 'paymentHistory', icon: CreditCardIcon, label: t('profile.paymentHistory'), route: '/payment-history' as const },
  ];

  const ChevronIcon = isRTL ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className={`px-6 pt-4 pb-4 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className={`text-2xl font-bold text-typography-900`}>
            {t('profile.title')}
          </Text>
          <Pressable
            onPress={() => router.push('/settings')}
            className="w-10 h-10 items-center justify-center rounded-full bg-background-0"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <SettingsIcon size={22} color="#717171" />
          </Pressable>
        </View>

        {/* User Card */}
        <View className="mx-4 mb-6 p-5 bg-primary-500 rounded-2xl">
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
              <UserIcon size={32} color="#FFFFFF" />
            </View>
            <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
              <Text className="text-white font-semibold text-lg">
                {displayName}
              </Text>
              <Text className="text-white/80 mt-1">
                {displayPhone}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/profile-edit')}
              className="bg-white/20 px-4 py-2.5 rounded-xl"
            >
              <Text className="text-white font-medium text-sm">
                {t('profile.editProfile')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Account Section */}
        <View className="mx-4 mb-6">
          <Text className={`text-xs font-semibold text-typography-500 uppercase tracking-wide mb-3 ${isRTL ? 'text-right mr-1' : 'ml-1'}`}>
            {t('profile.account')}
          </Text>
          <View className="bg-background-0 rounded-2xl overflow-hidden" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
          }}>
            {accountItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => router.push(item.route)}
                  className={`flex-row items-center px-4 py-3.5 ${isRTL ? 'flex-row-reverse' : ''}`}
                  style={index < accountItems.length - 1 ? styles.divider : undefined}
                >
                  <View className="w-9 h-9 rounded-full bg-background-50 items-center justify-center">
                    <IconComponent size={20} color="#717171" />
                  </View>
                  <Text className={`flex-1 text-typography-900 font-medium ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}>
                    {item.label}
                  </Text>
                  <ChevronIcon size={20} color="#B0B0B0" />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Quick Settings Section */}
        <View className="mx-4 mb-6">
          <Text className={`text-xs font-semibold text-typography-500 uppercase tracking-wide mb-3 ${isRTL ? 'text-right mr-1' : 'ml-1'}`}>
            {t('profile.quickSettings')}
          </Text>
          <View className="bg-background-0 rounded-2xl overflow-hidden" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
          }}>
            {/* Language Toggle */}
            <Pressable
              onPress={toggleLanguage}
              className={`flex-row items-center px-4 py-3.5 ${isRTL ? 'flex-row-reverse' : ''}`}
              style={styles.divider}
            >
              <View className="w-9 h-9 rounded-full bg-background-50 items-center justify-center">
                <GlobeIcon size={20} color="#717171" />
              </View>
              <Text className={`flex-1 text-typography-900 font-medium ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}>
                {t('profile.language')}
              </Text>
              <View className="bg-primary-50 px-3 py-1 rounded-lg">
                <Text className="text-primary-600 font-medium text-sm">
                  {i18n.language === 'ar' ? 'العربية' : 'EN'}
                </Text>
              </View>
            </Pressable>

            {/* Notifications Toggle */}
            <View className={`flex-row items-center px-4 py-3.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View className="w-9 h-9 rounded-full bg-background-50 items-center justify-center">
                <BellIcon size={20} color="#717171" />
              </View>
              <Text className={`flex-1 text-typography-900 font-medium ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}>
                {t('profile.notifications')}
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                disabled={isUpdatingNotifications}
                trackColor={{ false: '#E5E5E5', true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Settings Button */}
        <Pressable
          onPress={() => router.push('/settings')}
          className={`mx-4 mb-4 p-4 bg-background-0 rounded-xl flex-row items-center justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
          }}
        >
          <SettingsIcon size={20} color="#717171" />
          <Text className={`text-typography-700 font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
            {t('profile.settings')}
          </Text>
        </Pressable>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className={`mx-4 mb-8 p-4 bg-error-50 rounded-xl flex-row items-center justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <LogOutIcon size={20} color="#C13515" />
          <Text className={`text-error-500 font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
            {t('profile.logout')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
});
