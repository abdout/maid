import { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useOfficeQuotations, useUpdateQuotationStatus } from '@/hooks/use-quotations';
import { DirhamIcon } from '@/components/icons';

type QuotationStatus = 'all' | 'pending' | 'sent' | 'accepted' | 'rejected';

export default function OfficeQuotationsScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [statusFilter, setStatusFilter] = useState<QuotationStatus>('all');
  const { data, isLoading, isRefetching, refetch } = useOfficeQuotations();
  const updateStatus = useUpdateQuotationStatus();

  const allQuotations = data?.data || [];
  const quotations = statusFilter === 'all'
    ? allQuotations
    : allQuotations.filter((q) => q.status === statusFilter);

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-warning-500/20', text: 'text-warning-600' },
    sent: { bg: 'bg-primary-500/20', text: 'text-primary-600' },
    accepted: { bg: 'bg-success-500/20', text: 'text-success-600' },
    rejected: { bg: 'bg-error-500/20', text: 'text-error-600' },
  };

  const statusTabs: { key: QuotationStatus; label: string }[] = [
    { key: 'all', label: t('common.all') },
    { key: 'pending', label: t('quotation.pending') },
    { key: 'sent', label: t('quotation.sent') },
    { key: 'accepted', label: t('quotation.accepted') },
    { key: 'rejected', label: t('quotation.rejected') },
  ];

  const handleStatusChange = async (id: string, newStatus: 'sent' | 'accepted' | 'rejected') => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.somethingWrong'));
    }
  };

  const handleStatusFilterChange = (status: QuotationStatus) => {
    setStatusFilter(status);
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderQuotation = ({ item }: { item: typeof quotations[0] }) => {
    const status = statusColors[item.status] || statusColors.pending;

    return (
      <View className="bg-background-0 rounded-xl border border-background-200 p-4 mb-3">
        <View className={`flex-row justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <View className={isRTL ? 'items-end' : ''}>
            <Text className="text-lg font-semibold text-typography-900">
              {item.maid?.name}
            </Text>
            <Text className="text-typography-500 text-sm">
              {t('office.customer')}: {item.customer?.phone}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${status.bg}`}>
            <Text className={`text-sm font-medium ${status.text}`}>
              {t(`quotation.${item.status}`)}
            </Text>
          </View>
        </View>

        <View className={`flex-row mt-4 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <View>
            <Text className="text-typography-500 text-xs">{t('filters.salary')}</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-typography-900 font-medium">
                {parseInt(item.salary).toLocaleString()}
              </Text>
              <DirhamIcon size={12} color="#222222" />
            </View>
          </View>
          <View>
            <Text className="text-typography-500 text-xs">{t('quotation.contract')}</Text>
            <Text className="text-typography-900 font-medium">
              {item.contractMonths} {t('quotation.months')}
            </Text>
          </View>
        </View>

        {item.notes && (
          <View className="mt-3 p-3 bg-background-50 rounded-lg">
            <Text className={`text-typography-700 ${isRTL ? 'text-right' : ''}`}>
              {item.notes}
            </Text>
          </View>
        )}

        {/* Actions for pending quotations */}
        {item.status === 'pending' && (
          <View className={`flex-row mt-4 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Pressable
              onPress={() => handleStatusChange(item.id, 'sent')}
              className="flex-1 py-3 bg-primary-500 rounded-xl items-center"
            >
              <Text className="text-white font-medium">{t('quotation.sendQuote')}</Text>
            </Pressable>
            <Pressable
              onPress={() => handleStatusChange(item.id, 'rejected')}
              className="flex-1 py-3 bg-error-500/20 rounded-xl items-center"
            >
              <Text className="text-error-600 font-medium">{t('common.reject')}</Text>
            </Pressable>
          </View>
        )}

        {item.status === 'sent' && (
          <View className={`flex-row mt-4 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Pressable
              onPress={() => handleStatusChange(item.id, 'accepted')}
              className="flex-1 py-3 bg-success-500 rounded-xl items-center"
            >
              <Text className="text-white font-medium">{t('quotation.markAccepted')}</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <View className="px-6 pt-4 pb-2">
        <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('office.quotations')}
        </Text>
        <Text className={`text-typography-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          {quotations.length} {t('office.requests')}
        </Text>
      </View>

      {/* Status Filter Tabs */}
      <View className="px-6 py-3">
        <FlatList
          horizontal
          data={statusTabs}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          inverted={isRTL}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleStatusFilterChange(item.key)}
              className={`px-4 py-2 rounded-full mr-2 ${
                statusFilter === item.key
                  ? 'bg-primary-500'
                  : 'bg-background-100'
              }`}
            >
              <Text
                className={`font-medium ${
                  statusFilter === item.key
                    ? 'text-white'
                    : 'text-typography-700'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      ) : quotations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">📝</Text>
          <Text className="text-typography-500 text-center">
            {statusFilter !== 'all' ? t('search.noResults') : t('common.noData')}
          </Text>
          {statusFilter === 'all' && (
            <Text className="text-typography-400 text-sm text-center mt-2">
              {t('office.quotationRequestsAppear')}
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={quotations}
          keyExtractor={(item) => item.id}
          renderItem={renderQuotation}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#FF385C"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
