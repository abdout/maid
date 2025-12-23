import { View, Text, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUnlockedCvs } from '@/hooks/use-payments';
import { ChevronLeftIcon, ChevronRightIcon, UserIcon, CheckBadgeIcon } from '@/components/icons';

export default function UnlockedCvsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data, isLoading } = useUnlockedCvs();
  const unlockedCvs = data?.data || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-AE' : 'en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: typeof unlockedCvs[0] }) => {
    const maid = item.maid;
    if (!maid) return null;

    return (
      <Pressable
        onPress={() => router.push(`/maid/${maid.id}`)}
        className="bg-background-0 rounded-xl p-4 mb-3"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          {maid.photoUrl ? (
            <Image
              source={{ uri: maid.photoUrl }}
              className="w-16 h-16 rounded-xl"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-background-100 items-center justify-center">
              <UserIcon size={28} color="#B0B0B0" />
            </View>
          )}

          <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
            <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Text
                className={`font-semibold text-typography-900 text-base ${isRTL ? 'text-right' : ''}`}
              >
                {isRTL && maid.nameAr ? maid.nameAr : maid.name}
              </Text>
              <CheckBadgeIcon size={18} color="#22C55E" style={{ marginLeft: 4 }} />
            </View>

            {maid.nationality && (
              <Text className={`text-typography-500 text-sm ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? maid.nationality.nameAr : maid.nationality.nameEn}
              </Text>
            )}

            <Text className={`text-typography-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
              {t('payment.cvUnlocked')} {formatDate(item.unlockedAt)}
            </Text>
          </View>

          {isRTL ? (
            <ChevronLeftIcon size={20} color="#B0B0B0" />
          ) : (
            <ChevronRightIcon size={20} color="#B0B0B0" />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('payment.cvUnlocked'),
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F7F7F7' },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              {isRTL ? (
                <ChevronRightIcon size={24} color="#222222" />
              ) : (
                <ChevronLeftIcon size={24} color="#222222" />
              )}
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      ) : unlockedCvs.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-background-100 items-center justify-center mb-4">
            <CheckBadgeIcon size={40} color="#B0B0B0" />
          </View>
          <Text className="text-typography-500 text-center">
            {t('common.noData')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={unlockedCvs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
