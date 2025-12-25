import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function OfficeDashboardScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const stats = [
    { key: 'maids', label: t('office.maids'), value: '0', color: 'bg-primary-500' },
    { key: 'available', label: t('maid.available'), value: '0', color: 'bg-background-900' },
    { key: 'quotations', label: t('office.quotations'), value: '0', color: 'bg-primary-700' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('office.dashboard')}
          </Text>
        </View>

        {/* Stats */}
        <View className={`px-6 flex-row gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {stats.map((stat) => (
            <View key={stat.key} className={`flex-1 p-4 rounded-xl ${stat.color}`}>
              <Text className="text-white text-3xl font-bold">{stat.value}</Text>
              <Text className="text-white/80 mt-1">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className={`text-lg font-semibold text-typography-900 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('office.quickActions')}
          </Text>

          <View className="gap-3">
            {/* Manage Action */}
            <Pressable
              onPress={() => router.push('/(office)/maids')}
              className={`flex-row items-center p-4 bg-primary-500 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Text className="text-2xl">📋</Text>
              <Text className={`text-white font-semibold text-lg ${isRTL ? 'mr-3' : 'ml-3'}`}>
                {t('office.manage')}
              </Text>
            </Pressable>

            {/* Admit Action */}
            <Pressable
              onPress={() => router.push('/maid-onboarding')}
              className={`flex-row items-center p-4 bg-background-900 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Text className="text-2xl">➕</Text>
              <Text className={`text-white font-semibold text-lg ${isRTL ? 'mr-3' : 'ml-3'}`}>
                {t('office.admit')}
              </Text>
            </Pressable>

            {/* View Quotations Action */}
            <Pressable
              onPress={() => router.push('/(office)/quotations')}
              className={`flex-row items-center p-4 bg-primary-700 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Text className="text-2xl">📄</Text>
              <Text className={`text-white font-semibold text-lg ${isRTL ? 'mr-3' : 'ml-3'}`}>
                {t('office.viewQuotations')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-6 mb-6">
          <Text className={`text-lg font-semibold text-typography-900 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            Recent Activity
          </Text>

          <View className="bg-background-50 rounded-xl p-8 items-center">
            <Text className="text-5xl mb-4">📋</Text>
            <Text className="text-typography-500 text-center">
              {t('common.noData')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
