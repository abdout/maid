import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/store/auth';
import { officesApi } from '@/lib/api';
import { UsersIcon, FileTextIcon, GlobeIcon, BuildingIcon, LogOutIcon, ChevronRightIcon, ChevronLeftIcon } from '@/components/icons';

export default function OfficeProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const isRTL = i18n.language === 'ar';

  const { data: officeData, isLoading } = useQuery({
    queryKey: ['office-me'],
    queryFn: () => officesApi.getMe(),
  });

  const office = (officeData as { data?: { name?: string; nameAr?: string; phone?: string; email?: string; address?: string } })?.data;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: office?.name || '',
    nameAr: office?.nameAr || '',
    email: office?.email || '',
    address: office?.address || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => officesApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-me'] });
      setIsEditing(false);
      Alert.alert('Success', 'Office profile updated');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update profile');
    },
  });

  const menuItems = [
    { key: 'maids', icon: 'users', label: t('office.maids'), route: '/(office)/maids' as const },
    { key: 'quotations', icon: 'file-text', label: t('office.quotations'), route: '/(office)/quotations' as const },
    { key: 'language', icon: 'globe', label: t('profile.language'), route: null },
  ];

  const renderIcon = (iconName: string) => {
    const iconProps = { size: 22, color: '#717171' };
    switch (iconName) {
      case 'users': return <UsersIcon {...iconProps} />;
      case 'file-text': return <FileTextIcon {...iconProps} />;
      case 'globe': return <GlobeIcon {...iconProps} />;
      default: return null;
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/onboarding');
  };

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color="#FF385C" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row justify-between items-center">
          <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('profile.title')}
          </Text>
          {!isEditing && (
            <Pressable
              onPress={() => setIsEditing(true)}
              className="bg-primary-100 px-4 py-2 rounded-lg"
            >
              <Text className="text-primary-600 font-medium">Edit</Text>
            </Pressable>
          )}
        </View>

        {/* Office Info */}
        <View className="mx-6 mb-6 p-6 bg-primary-500 rounded-2xl">
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
              <BuildingIcon size={32} color="#FFFFFF" />
            </View>
            <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
              <Text className="text-white font-semibold text-lg">
                {office?.name || 'Office Name'}
              </Text>
              <Text className="text-white/80">
                {user?.phone}
              </Text>
              {office?.email && (
                <Text className="text-white/80 text-sm">
                  {office.email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Edit Form */}
        {isEditing && (
          <View className="mx-6 mb-6 p-4 bg-background-50 rounded-xl">
            <Text className="text-typography-700 font-medium mb-2">Office Name (English)</Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Office name"
              className="bg-background-0 rounded-lg px-4 py-3 mb-4 text-typography-900"
            />

            <Text className="text-typography-700 font-medium mb-2">اسم المكتب (بالعربي)</Text>
            <TextInput
              value={form.nameAr}
              onChangeText={(v) => setForm((f) => ({ ...f, nameAr: v }))}
              placeholder="اسم المكتب"
              className="bg-background-0 rounded-lg px-4 py-3 mb-4 text-typography-900 text-right"
            />

            <Text className="text-typography-700 font-medium mb-2">Email</Text>
            <TextInput
              value={form.email}
              onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
              placeholder="office@example.com"
              keyboardType="email-address"
              className="bg-background-0 rounded-lg px-4 py-3 mb-4 text-typography-900"
            />

            <Text className="text-typography-700 font-medium mb-2">Address</Text>
            <TextInput
              value={form.address}
              onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
              placeholder="Office address"
              multiline
              className="bg-background-0 rounded-lg px-4 py-3 mb-4 text-typography-900 min-h-[80px]"
              textAlignVertical="top"
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setIsEditing(false)}
                className="flex-1 py-3 bg-background-200 rounded-xl items-center"
              >
                <Text className="text-typography-700 font-medium">{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 py-3 bg-primary-500 rounded-xl items-center"
              >
                <Text className="text-white font-medium">
                  {updateMutation.isPending ? t('common.loading') : t('common.save')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View className="mx-6">
          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => {
                if (item.key === 'language') {
                  toggleLanguage();
                } else if (item.route) {
                  router.push(item.route);
                }
              }}
              className={`flex-row items-center p-4 bg-background-0 rounded-xl mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 rounded-full bg-background-50 items-center justify-center">
                {renderIcon(item.icon)}
              </View>
              <Text className={`flex-1 text-typography-900 font-medium ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}>
                {item.label}
              </Text>
              {item.key === 'language' && (
                <Text className="text-primary-500 font-medium">
                  {i18n.language === 'ar' ? 'العربية' : 'English'}
                </Text>
              )}
              {isRTL ? (
                <ChevronLeftIcon size={20} color="#B0B0B0" />
              ) : (
                <ChevronRightIcon size={20} color="#B0B0B0" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className={`mx-6 mt-6 mb-10 p-4 bg-error-50 rounded-xl flex-row items-center justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
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
