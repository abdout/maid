import { View, Text, ScrollView, Pressable, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { showContactOptions } from '@/lib/contact';
import { DirhamIcon } from '@/components/icons';

export default function QuotationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';
  const isOffice = user?.role === 'office_admin';

  const { data, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => quotationsApi.getById(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => quotationsApi.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      queryClient.invalidateQueries({ queryKey: ['office-quotations'] });
      queryClient.invalidateQueries({ queryKey: ['my-quotations'] });
      Alert.alert('Success', 'Quotation status updated');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update status');
    },
  });

  const quotation = (data as { data?: {
    id: string;
    maid: { id: string; name: string; photoUrl: string | null } | null;
    office: { id: string; name: string } | null;
    customer: { phone: string } | null;
    salary: string;
    contractMonths: number;
    notes: string | null;
    status: string;
    createdAt: string;
  } })?.data;

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-warning-500/20', text: 'text-warning-600', label: t('quotation.pending') },
    sent: { bg: 'bg-primary-500/20', text: 'text-primary-600', label: t('quotation.sent') },
    accepted: { bg: 'bg-success-500/20', text: 'text-success-600', label: t('quotation.accepted') },
    rejected: { bg: 'bg-error-500/20', text: 'text-error-600', label: t('quotation.rejected') },
    expired: { bg: 'bg-typography-500/20', text: 'text-typography-600', label: t('quotation.expired') },
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color="#1e40af" />
      </SafeAreaView>
    );
  }

  if (!quotation) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <Text className="text-typography-500">Quotation not found</Text>
      </SafeAreaView>
    );
  }

  const status = statusColors[quotation.status] || statusColors.pending;

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Quotation Details',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text className="text-primary-500 text-lg">← Back</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View className={`mx-6 mt-4 p-4 rounded-xl ${status.bg}`}>
          <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-lg font-semibold ${status.text}`}>
              {status.label}
            </Text>
            <Text className="text-typography-500 text-sm">
              {new Date(quotation.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Maid Info */}
        <Pressable
          onPress={() => quotation.maid && router.push(`/maid/${quotation.maid.id}`)}
          className="mx-6 mt-4 p-4 bg-background-50 rounded-xl"
        >
          <Text className={`text-typography-500 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
            Maid
          </Text>
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {quotation.maid?.photoUrl ? (
              <Image
                source={{ uri: quotation.maid.photoUrl }}
                className="w-16 h-16 rounded-xl"
              />
            ) : (
              <View className="w-16 h-16 rounded-xl bg-background-200 items-center justify-center">
                <Text className="text-2xl">👩</Text>
              </View>
            )}
            <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
              <Text className="text-typography-900 font-semibold text-lg">
                {quotation.maid?.name || 'Unknown'}
              </Text>
              <Text className="text-primary-500 text-sm">
                View Profile →
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Office Info */}
        <View className="mx-6 mt-4 p-4 bg-background-50 rounded-xl">
          <Text className={`text-typography-500 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isOffice ? 'Customer' : 'Office'}
          </Text>
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
              <Text className="text-xl">{isOffice ? '👤' : '🏢'}</Text>
            </View>
            <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
              <Text className="text-typography-900 font-semibold">
                {isOffice ? quotation.customer?.phone : quotation.office?.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Contract Details */}
        <View className="mx-6 mt-4 p-4 bg-background-50 rounded-xl">
          <Text className={`text-typography-500 text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>
            Contract Details
          </Text>

          <View className={`flex-row mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="flex-1">
              <Text className="text-typography-500 text-xs">{t('filters.salary')}</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-typography-900 font-semibold text-lg">
                  {parseInt(quotation.salary).toLocaleString()}
                </Text>
                <DirhamIcon size={16} color="#222222" />
              </View>
              <Text className="text-typography-500 text-xs">per month</Text>
            </View>
            <View className="flex-1">
              <Text className="text-typography-500 text-xs">Contract Duration</Text>
              <Text className="text-typography-900 font-semibold text-lg">
                {quotation.contractMonths} months
              </Text>
            </View>
          </View>

          <View className="border-t border-background-200 pt-3 mt-2">
            <View className={`flex-row justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Text className="text-typography-500">Total Contract Value</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-typography-900 font-bold text-lg">
                  {(parseInt(quotation.salary) * quotation.contractMonths).toLocaleString()}
                </Text>
                <DirhamIcon size={16} color="#222222" />
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        {quotation.notes && (
          <View className="mx-6 mt-4 p-4 bg-background-50 rounded-xl">
            <Text className={`text-typography-500 text-sm mb-2 ${isRTL ? 'text-right' : ''}`}>
              Notes
            </Text>
            <Text className={`text-typography-700 ${isRTL ? 'text-right' : ''}`}>
              {quotation.notes}
            </Text>
          </View>
        )}

        {/* Actions */}
        {isOffice && quotation.status === 'pending' && (
          <View className="mx-6 mt-6 mb-10">
            <Pressable
              onPress={() => updateStatusMutation.mutate('sent')}
              disabled={updateStatusMutation.isPending}
              className="py-4 bg-primary-500 rounded-xl items-center mb-3"
            >
              <Text className="text-white font-semibold">
                {updateStatusMutation.isPending ? 'Sending...' : 'Send Quotation'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => updateStatusMutation.mutate('rejected')}
              disabled={updateStatusMutation.isPending}
              className="py-4 bg-error-500/20 rounded-xl items-center"
            >
              <Text className="text-error-600 font-semibold">Reject</Text>
            </Pressable>
          </View>
        )}

        {isOffice && quotation.status === 'sent' && (
          <View className="mx-6 mt-6 mb-10">
            <Pressable
              onPress={() => updateStatusMutation.mutate('accepted')}
              disabled={updateStatusMutation.isPending}
              className="py-4 bg-success-500 rounded-xl items-center"
            >
              <Text className="text-white font-semibold">
                {updateStatusMutation.isPending ? 'Updating...' : 'Mark as Accepted'}
              </Text>
            </Pressable>
          </View>
        )}

        {!isOffice && quotation.status === 'sent' && (
          <View className="mx-6 mt-6 mb-10 p-4 bg-primary-50 rounded-xl">
            <Text className="text-primary-700 text-center">
              The office has sent you a quotation. Please contact them to proceed.
            </Text>
            <Pressable
              onPress={() => {
                // Get office phone from the quotation
                const officePhone = '+971501234567'; // TODO: Get from office data
                showContactOptions(officePhone, {
                  whatsappMessage: `Hi, I'm interested in the quotation for ${quotation.maid?.name}`,
                });
              }}
              className="mt-4 py-3 bg-primary-500 rounded-xl items-center"
            >
              <Text className="text-white font-semibold">Contact Office</Text>
            </Pressable>
          </View>
        )}

        {quotation.status === 'accepted' && (
          <View className="mx-6 mt-6 mb-10 p-4 bg-success-500/20 rounded-xl">
            <Text className="text-success-700 text-center font-medium">
              🎉 This quotation has been accepted!
            </Text>
          </View>
        )}

        {quotation.status === 'rejected' && (
          <View className="mx-6 mt-6 mb-10 p-4 bg-error-500/20 rounded-xl">
            <Text className="text-error-700 text-center">
              This quotation was rejected.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
