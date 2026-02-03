import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/lib/api';
import { useToast } from '@/hooks';
import { Icon } from '@/components/icons';

export default function WalletScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const queryClient = useQueryClient();
  const toast = useToast();

  const [topUpAmount, setTopUpAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch wallet balance
  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: () => walletApi.getBalance(),
  });

  // Fetch transactions
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: () => walletApi.getTransactions(1, 20),
  });

  // Top-up mutation
  const topUpMutation = useMutation({
    mutationFn: (amount: number) => walletApi.topUp(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setTopUpAmount('');
      toast.success(isRTL ? 'تم شحن المحفظة بنجاح' : 'Wallet topped up successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل في شحن المحفظة' : 'Failed to top up wallet'));
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBalance(), refetchTransactions()]);
    setRefreshing(false);
  }, [refetchBalance, refetchTransactions]);

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount < 10 || amount > 10000) {
      toast.error(
        isRTL
          ? 'الرجاء إدخال مبلغ بين 10 و 10,000 درهم'
          : 'Please enter an amount between 10 and 10,000 AED'
      );
      return;
    }
    topUpMutation.mutate(amount);
  };

  const balance = balanceData?.data?.balance ?? 0;
  const currency = balanceData?.data?.currency ?? 'AED';
  const transactions = transactionsData?.data?.transactions ?? [];

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-AE' : 'en-AE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return 'plus';
      case 'cv_unlock':
        return 'unlock';
      case 'refund':
        return 'dirham';
      default:
        return 'dirham';
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'topup':
        return isRTL ? 'شحن' : 'Top Up';
      case 'cv_unlock':
        return isRTL ? 'فتح سيرة' : 'CV Unlock';
      case 'refund':
        return isRTL ? 'استرداد' : 'Refund';
      case 'bonus':
        return isRTL ? 'مكافأة' : 'Bonus';
      case 'adjustment':
        return isRTL ? 'تعديل' : 'Adjustment';
      default:
        return type;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className={`text-2xl font-bold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('wallet.title')}
          </Text>
        </View>

        {/* Balance Card */}
        <View className="mx-5 mt-4 bg-[#FF385C] rounded-2xl p-6 shadow-lg">
          <Text className={`text-white/80 text-sm mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('wallet.currentBalance')}
          </Text>
          {balanceLoading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <View className={`flex-row items-baseline ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Text className="text-white text-4xl font-bold">
                {formatAmount(balance)}
              </Text>
              <Text className={`text-white/80 text-lg ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {currency}
              </Text>
            </View>
          )}
        </View>

        {/* Top Up Section */}
        <View className="mx-5 mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <Text className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('wallet.topUp')}
          </Text>

          <View className="mb-3">
            <TextInput
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              placeholder={isRTL ? 'أدخل المبلغ (درهم)' : 'Enter amount (AED)'}
              keyboardType="numeric"
              className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base ${isRTL ? 'text-right' : 'text-left'}`}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text className={`text-xs text-gray-500 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('wallet.topUpRange')}
          </Text>

          <Pressable
            onPress={handleTopUp}
            disabled={topUpMutation.isPending || !topUpAmount}
            className={`py-4 rounded-xl items-center ${
              topUpAmount && !topUpMutation.isPending
                ? 'bg-[#FF385C]'
                : 'bg-gray-200'
            }`}
          >
            {topUpMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`font-semibold text-base ${
                topUpAmount ? 'text-white' : 'text-gray-400'
              }`}>
                {t('wallet.proceedToPayment')}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Transaction History */}
        <View className="mx-5 mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <Text className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('wallet.transactionHistory')}
          </Text>

          {transactionsLoading ? (
            <ActivityIndicator color="#FF385C" />
          ) : transactions.length === 0 ? (
            <View className="py-8 items-center">
              <Icon name="wallet" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-3">
                {t('wallet.noTransactions')}
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {transactions.map((tx: any) => {
                const isPositive = parseFloat(tx.amount) > 0;
                return (
                  <View
                    key={tx.id}
                    className={`flex-row items-center py-3 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${
                      isPositive ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Icon
                        name={getTransactionIcon(tx.type) as any}
                        size={20}
                        color={isPositive ? '#22C55E' : '#EF4444'}
                      />
                    </View>

                    <View className={`flex-1 ${isRTL ? 'mr-3 items-end' : 'ml-3'}`}>
                      <Text className="text-gray-900 font-medium">
                        {tx.description || getTransactionLabel(tx.type)}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-0.5">
                        {formatDate(tx.createdAt)}
                      </Text>
                    </View>

                    <Text className={`font-semibold ${
                      isPositive ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {isPositive ? '+' : ''}{formatAmount(tx.amount)} {currency}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* CV Unlock Info */}
        <View className="mx-5 mt-6 bg-blue-50 rounded-2xl p-5">
          <View className={`flex-row items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Icon name="unlock" size={20} color="#3B82F6" />
            <Text className={`text-blue-900 font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
              {t('wallet.cvUnlockInfo')}
            </Text>
          </View>
          <Text className={`text-blue-700 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('wallet.cvUnlockPrice')}
          </Text>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
