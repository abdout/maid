import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/auth';
import { usersApi } from '@/lib/api';
import { UserIcon, XIcon, LockClosedIcon } from '@/components/icons';

interface UserProfile {
  id: string;
  name: string | null;
  nameAr: string | null;
  phone: string;
  email: string | null;
  role: string;
  customer: {
    emirate: string | null;
    preferredLanguage: string | null;
    notificationsEnabled: boolean;
  } | null;
}

export default function ProfileEditScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getMe();
      if (response.success && response.data) {
        setName(response.data.name || '');
        setEmail(response.data.email || '');
        setPhone(response.data.phone || user?.phone || '');
      } else {
        // Fallback to auth store data
        setName(user?.name || '');
        setPhone(user?.phone || '');
      }
    } catch {
      // Fallback to auth store data
      setName(user?.name || '');
      setPhone(user?.phone || '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('errors.validation'));
      return;
    }

    setIsSaving(true);
    try {
      const updateData: { name?: string; email?: string | null } = {};

      if (name.trim()) {
        updateData.name = name.trim();
      }

      // Only include email if it's changed and valid
      if (email.trim()) {
        updateData.email = email.trim();
      } else {
        updateData.email = null;
      }

      const response = await usersApi.update(updateData);

      if (response.success) {
        Alert.alert(t('common.success'), t('profile.profileUpdated'), [
          { text: t('common.ok'), onPress: () => router.back() }
        ]);
      } else {
        Alert.alert(t('common.error'), t('errors.somethingWrong'));
      }
    } catch {
      Alert.alert(t('common.error'), t('errors.somethingWrong'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className={`px-4 py-3 flex-row items-center justify-between border-b border-outline-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <XIcon size={24} color="#222222" />
          </Pressable>
          <Text className="text-lg font-semibold text-typography-900">
            {t('profile.editProfile')}
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={isSaving || isLoading}
            className={`px-4 py-2 rounded-lg ${isSaving || isLoading ? 'bg-primary-200' : 'bg-primary-500'}`}
          >
            <Text className="text-white font-medium">
              {isSaving ? '...' : t('common.save')}
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View className="items-center py-8">
            <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center">
              <UserIcon size={48} color="#2563EB" />
            </View>
          </View>

          {/* Form Fields */}
          <View className="px-6 pb-8">
            {/* Name Field */}
            <View className="mb-5">
              <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {t('profile.name')}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('form.namePlaceholder')}
                placeholderTextColor="#A0A0A0"
                className={`bg-background-50 border border-outline-200 rounded-xl px-4 py-3.5 text-typography-900 ${isRTL ? 'text-right' : ''}`}
                editable={!isLoading}
              />
            </View>

            {/* Email Field */}
            <View className="mb-5">
              <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {t('profile.email')}
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('login.emailPlaceholder')}
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                className={`bg-background-50 border border-outline-200 rounded-xl px-4 py-3.5 text-typography-900 ${isRTL ? 'text-right' : ''}`}
                editable={!isLoading}
              />
            </View>

            {/* Phone Field (Read-only) */}
            <View className="mb-5">
              <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {t('profile.phone')}
              </Text>
              <View className={`bg-background-100 border border-outline-100 rounded-xl px-4 py-3.5 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Text className={`flex-1 text-typography-500 ${isRTL ? 'text-right' : ''}`}>
                  {phone}
                </Text>
                <LockClosedIcon size={18} color="#A0A0A0" />
              </View>
              <Text className={`text-xs text-typography-400 mt-1.5 ${isRTL ? 'text-right' : ''}`}>
                {t('profile.phoneLocked')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
