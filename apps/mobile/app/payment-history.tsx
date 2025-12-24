import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { paymentsApi } from '@/lib/api';
import { CreditCardIcon, XIcon, UserIcon, ChevronRightIcon, ChevronLeftIcon } from '@/components/icons';

interface PaymentHistoryItem {
  id: string;
  type: string;
  provider: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  maid: {
    id: string;
    name: string;
    photoUrl: string | null;
  } | null;
}

export default function PaymentHistoryScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (pageNum = 1, refresh = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    }
    try {
      const response = await paymentsApi.getPaymentHistory(pageNum, 20);
      if (response.success && response.data) {
        const newPayments = response.data.items;
        if (refresh || pageNum === 1) {
          setPayments(newPayments);
        } else {
          setPayments((prev) => [...prev, ...newPayments]);
        }
        setHasMore(pageNum < response.data.totalPages);
        setPage(pageNum);
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPayments(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchPayments(page + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'confirmed':
        return 'bg-success-100 text-success-700';
      case 'pending':
        return 'bg-warning-100 text-warning-700';
      case 'failed':
        return 'bg-error-100 text-error-700';
      case 'refunded':
        return 'bg-info-100 text-info-700';
      default:
        return 'bg-background-100 text-typography-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'confirmed':
        return t('payment.succeeded');
      case 'pending':
        return t('payment.pending');
      case 'failed':
        return t('payment.failed');
      case 'refunded':
        return t('payment.refunded');
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cv_unlock':
        return t('payment.cvUnlockType');
      case 'subscription':
        return t('payment.subscriptionType');
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-AE' : 'en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    return `${numAmount.toFixed(0)} ${currency === 'AED' ? t('common.aed') : currency}`;
  };

  const ChevronIcon = isRTL ? ChevronLeftIcon : ChevronRightIcon;

  const renderPaymentItem = ({ item }: { item: PaymentHistoryItem }) => (
    <Pressable
      onPress={() => item.maid && router.push(`/maid/${item.maid.id}`)}
      className={`mx-4 mb-3 bg-background-0 rounded-xl p-4 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      {/* Icon/Photo */}
      <View className="w-12 h-12 rounded-full bg-primary-50 items-center justify-center overflow-hidden">
        {item.maid?.photoUrl ? (
          <Image
            source={{ uri: item.maid.photoUrl }}
            className="w-12 h-12"
            resizeMode="cover"
          />
        ) : (
          <CreditCardIcon size={24} color="#2563EB" />
        )}
      </View>

      {/* Content */}
      <View className={`flex-1 ${isRTL ? 'mr-3 items-end' : 'ml-3'}`}>
        <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-typography-900 font-semibold">
            {getTypeLabel(item.type)}
          </Text>
          <Text className="text-primary-600 font-bold">
            +{formatAmount(item.amount, item.currency)}
          </Text>
        </View>

        {item.maid && (
          <Text className={`text-typography-500 text-sm mt-0.5 ${isRTL ? 'text-right' : ''}`}>
            {item.maid.name}
          </Text>
        )}

        <View className={`flex-row items-center mt-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className={`text-typography-400 text-xs ${isRTL ? 'ml-2' : 'mr-2'}`}>
            {formatDate(item.createdAt)}
          </Text>
          <View className={`px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
            <Text className="text-xs font-medium">
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
      </View>

      {item.maid && <ChevronIcon size={18} color="#B0B0B0" />}
    </Pressable>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 rounded-full bg-background-100 items-center justify-center mb-4">
        <CreditCardIcon size={40} color="#A0A0A0" />
      </View>
      <Text className="text-typography-700 font-semibold text-lg mb-2">
        {t('payment.noPayments')}
      </Text>
      <Text className="text-typography-500 text-center px-8">
        {t('payment.noPaymentsDesc')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-3 flex-row items-center justify-between border-b border-outline-100 bg-background-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <XIcon size={24} color="#222222" />
        </Pressable>
        <Text className="text-lg font-semibold text-typography-900">
          {t('payment.history')}
        </Text>
        <View className="w-10" />
      </View>

      {/* Payment List */}
      {isLoading && payments.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-typography-500">{t('common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#2563EB"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  );
}
