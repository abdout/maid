import { View, Text, FlatList, ActivityIndicator, RefreshControl, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useOfficeQuotations, useUpdateQuotationStatus } from '@/hooks/use-quotations';
import { DirhamIcon } from '@/components/icons';

export default function OfficeQuotationsScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { data, isLoading, isRefetching, refetch } = useOfficeQuotations();
  const updateStatus = useUpdateQuotationStatus();
  const quotations = data?.data || [];

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-warning-500/20', text: 'text-warning-600' },
    sent: { bg: 'bg-primary-500/20', text: 'text-primary-600' },
    accepted: { bg: 'bg-success-500/20', text: 'text-success-600' },
    rejected: { bg: 'bg-error-500/20', text: 'text-error-600' },
  };

  const handleStatusChange = async (id: string, newStatus: 'sent' | 'accepted' | 'rejected') => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

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
              Customer: {item.customer?.phone}
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
            <Text className="text-typography-500 text-xs">Contract</Text>
            <Text className="text-typography-900 font-medium">
              {item.contractMonths} months
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
              <Text className="text-white font-medium">Send Quote</Text>
            </Pressable>
            <Pressable
              onPress={() => handleStatusChange(item.id, 'rejected')}
              className="flex-1 py-3 bg-error-500/20 rounded-xl items-center"
            >
              <Text className="text-error-600 font-medium">Reject</Text>
            </Pressable>
          </View>
        )}

        {item.status === 'sent' && (
          <View className={`flex-row mt-4 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Pressable
              onPress={() => handleStatusChange(item.id, 'accepted')}
              className="flex-1 py-3 bg-success-500 rounded-xl items-center"
            >
              <Text className="text-white font-medium">Mark Accepted</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <View className="px-6 pt-4 pb-4">
        <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('office.quotations')}
        </Text>
        <Text className={`text-typography-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          {quotations.length} requests
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      ) : quotations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">📝</Text>
          <Text className="text-typography-500 text-center">
            {t('common.noData')}
          </Text>
          <Text className="text-typography-400 text-sm text-center mt-2">
            Quotation requests from customers will appear here
          </Text>
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
              onRefresh={refetch}
              tintColor="#1e40af"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
