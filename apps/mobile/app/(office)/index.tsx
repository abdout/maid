import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useOfficeStats, useOfficeQuotations } from '@/hooks';
import { LanguageToggle } from '@/components';

export default function OfficeDashboardScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: statsData, isLoading: statsLoading } = useOfficeStats();
  const { data: quotationsData } = useOfficeQuotations(1);

  const stats = statsData?.data;
  const recentQuotations = (quotationsData?.data || []).slice(0, 3);

  const statItems = [
    { key: 'maids', label: t('office.maids'), value: stats?.maids?.total ?? 0, color: 'bg-primary-500' },
    { key: 'available', label: t('maid.available'), value: stats?.maids?.available ?? 0, color: 'bg-background-900' },
    { key: 'quotations', label: t('office.quotations'), value: stats?.quotations?.pending ?? 0, color: 'bg-primary-700' },
  ];

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-warning-500/20', text: 'text-warning-600' },
    sent: { bg: 'bg-primary-500/20', text: 'text-primary-600' },
    accepted: { bg: 'bg-success-500/20', text: 'text-success-600' },
    rejected: { bg: 'bg-error-500/20', text: 'text-error-600' },
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d`;
    }
    if (diffHours > 0) {
      return `${diffHours}h`;
    }
    return t('common.now') || 'now';
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className={`px-6 pt-4 pb-6 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className={`text-2xl font-bold text-typography-900`}>
            {t('office.dashboard')}
          </Text>
          <LanguageToggle variant="button" />
        </View>

        {/* Stats */}
        <View className={`px-6 flex-row gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {statItems.map((stat) => (
            <View key={stat.key} className={`flex-1 p-4 rounded-xl ${stat.color}`}>
              {statsLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-3xl font-bold">{stat.value}</Text>
              )}
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
          <View className={`flex-row justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-lg font-semibold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('office.recentActivity')}
            </Text>
            {recentQuotations.length > 0 && (
              <Pressable onPress={() => router.push('/(office)/quotations')}>
                <Text className="text-primary-500 font-medium">{t('common.seeAll')}</Text>
              </Pressable>
            )}
          </View>

          {recentQuotations.length === 0 ? (
            <View className="bg-background-50 rounded-xl p-8 items-center">
              <Text className="text-5xl mb-4">📋</Text>
              <Text className="text-typography-500 text-center">
                {t('common.noData')}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {recentQuotations.map((quotation) => {
                const status = statusColors[quotation.status] || statusColors.pending;
                return (
                  <Pressable
                    key={quotation.id}
                    onPress={() => router.push('/(office)/quotations')}
                    className="bg-background-0 border border-background-200 rounded-xl p-4"
                  >
                    <View className={`flex-row justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <View className={`flex-1 ${isRTL ? 'items-end' : ''}`}>
                        <Text className="text-typography-900 font-medium">
                          {quotation.maid?.name || t('common.noData')}
                        </Text>
                        <Text className="text-typography-500 text-sm mt-1">
                          {t('office.customer')}: {quotation.customer?.phone}
                        </Text>
                      </View>
                      <View className={`flex-row items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <View className={`px-2 py-1 rounded-full ${status.bg}`}>
                          <Text className={`text-xs font-medium ${status.text}`}>
                            {t(`quotation.${quotation.status}`)}
                          </Text>
                        </View>
                        <Text className="text-typography-400 text-xs">
                          {formatTime(quotation.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
