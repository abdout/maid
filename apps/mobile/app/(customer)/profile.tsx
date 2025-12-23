import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/auth';
import { HeartIcon, FileTextIcon, GlobeIcon, MessageIcon, LogOutIcon, UserIcon, PencilIcon, CheckIcon, ChevronRightIcon, ChevronLeftIcon } from '@/components/icons';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isRTL = i18n.language === 'ar';
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const menuItems = [
    { key: 'favorites', icon: 'heart', label: t('profile.favorites'), route: '/(customer)/favorites' as const },
    { key: 'quotations', icon: 'file-text', label: t('profile.bookings'), route: '/(customer)/quotations' as const },
    { key: 'language', icon: 'globe', label: t('profile.language'), route: null },
    { key: 'support', icon: 'message', label: t('profile.settings'), route: null },
  ];

  const renderIcon = (iconName: string) => {
    const iconProps = { size: 22, color: '#717171' };
    switch (iconName) {
      case 'heart': return <HeartIcon {...iconProps} />;
      case 'file-text': return <FileTextIcon {...iconProps} />;
      case 'globe': return <GlobeIcon {...iconProps} />;
      case 'message': return <MessageIcon {...iconProps} />;
      default: return null;
    }
  };

  const handleSaveName = async () => {
    // TODO: API call to update name
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('profile.title')}
          </Text>
        </View>

        {/* User Info */}
        <View className="mx-6 mb-6 p-6 bg-primary-500 rounded-2xl">
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
              <UserIcon size={32} color="#FFFFFF" />
            </View>
            <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
              {isEditing ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  className="text-white font-semibold text-lg bg-white/20 px-3 py-1 rounded-lg"
                  autoFocus
                />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  {user?.name || t('home.welcome')}
                </Text>
              )}
              <Text className="text-white/80 mt-1">
                {user?.phone}
              </Text>
            </View>
            <Pressable
              onPress={() => isEditing ? handleSaveName() : setIsEditing(true)}
              className="bg-white/20 px-3 py-2 rounded-lg flex-row items-center"
            >
              {isEditing ? (
                <>
                  <CheckIcon size={16} color="#FFFFFF" />
                  <Text className={`text-white text-sm ${isRTL ? 'mr-1' : 'ml-1'}`}>Save</Text>
                </>
              ) : (
                <>
                  <PencilIcon size={16} color="#FFFFFF" />
                  <Text className={`text-white text-sm ${isRTL ? 'mr-1' : 'ml-1'}`}>Edit</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

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
          className={`mx-6 mt-6 p-4 bg-error-50 rounded-xl flex-row items-center justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
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
