import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  useSubscriptionPlans,
  useCurrentSubscription,
  useCanPublish,
  useSubscribe,
  useCancelSubscription,
} from '@/hooks/use-subscriptions';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  StarIcon,
} from '@/components/icons';

type BillingCycle = 'monthly' | 'yearly';

export default function SubscriptionScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentData, isLoading: currentLoading } = useCurrentSubscription();
  const { data: canPublishData } = useCanPublish();

  const subscribe = useSubscribe();
  const cancelSubscription = useCancelSubscription();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const plans = plansData?.data || [];
  const currentSubscription = currentData?.data;
  const canPublish = canPublishData?.data;

  const isLoading = plansLoading || currentLoading;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-AE' : 'en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const result = await subscribe.mutateAsync({ planId, billingCycle });

      if (result.data?.checkoutUrl) {
        // Open Stripe checkout in browser
        Linking.openURL(result.data.checkoutUrl);
      } else {
        // Free plan - subscription created directly
        Alert.alert(
          t('common.success'),
          t('subscription.subscribe'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      Alert.alert(t('common.error'), t('errors.somethingWrong'));
    }
  };

  const handleCancel = () => {
    Alert.alert(
      t('subscription.cancelConfirm'),
      t('subscription.cancelDescription'),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription.mutateAsync();
              Alert.alert(t('common.success'), t('subscription.cancel'));
            } catch (error) {
              console.error('Cancel error:', error);
              Alert.alert(t('common.error'), t('errors.somethingWrong'));
            }
          },
        },
      ]
    );
  };

  const getTierName = (tier: string) => {
    const tierMap: Record<string, string> = {
      free: t('subscription.free'),
      basic: t('subscription.basic'),
      pro: t('subscription.pro'),
      enterprise: t('subscription.enterprise'),
    };
    return tierMap[tier] || tier;
  };

  const getPrice = (plan: typeof plans[0]) => {
    if (billingCycle === 'yearly' && plan.priceYearly) {
      return parseInt(plan.priceYearly);
    }
    return parseInt(plan.priceMonthly);
  };

  const getYearlySavings = (plan: typeof plans[0]) => {
    if (!plan.priceYearly) return 0;
    const monthlyTotal = parseInt(plan.priceMonthly) * 12;
    const yearlyPrice = parseInt(plan.priceYearly);
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color="#FF385C" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('subscription.title'),
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Current Usage */}
        {canPublish && (
          <View className="mx-4 mt-4 p-4 bg-background-0 rounded-xl">
            <Text className={`text-typography-500 text-sm ${isRTL ? 'text-right' : ''}`}>
              {t('subscription.usage', {
                current: canPublish.currentCount,
                limit: canPublish.limit,
              })}
            </Text>
            <View className="mt-2 h-2 bg-background-200 rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${
                  canPublish.needsUpgrade ? 'bg-warning-500' : 'bg-success-500'
                }`}
                style={{
                  width: `${Math.min((canPublish.currentCount / canPublish.limit) * 100, 100)}%`,
                }}
              />
            </View>
            {canPublish.needsUpgrade && (
              <Text className={`text-warning-600 text-sm mt-2 ${isRTL ? 'text-right' : ''}`}>
                {t('subscription.upgradeToPublish')}
              </Text>
            )}
          </View>
        )}

        {/* Billing Cycle Toggle */}
        <View className="mx-4 mt-4 p-1 bg-background-200 rounded-xl flex-row">
          <Pressable
            onPress={() => setBillingCycle('monthly')}
            className={`flex-1 py-3 rounded-lg items-center ${
              billingCycle === 'monthly' ? 'bg-background-0' : ''
            }`}
          >
            <Text
              className={`font-medium ${
                billingCycle === 'monthly' ? 'text-typography-900' : 'text-typography-500'
              }`}
            >
              {t('subscription.billedMonthly')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setBillingCycle('yearly')}
            className={`flex-1 py-3 rounded-lg items-center ${
              billingCycle === 'yearly' ? 'bg-background-0' : ''
            }`}
          >
            <Text
              className={`font-medium ${
                billingCycle === 'yearly' ? 'text-typography-900' : 'text-typography-500'
              }`}
            >
              {t('subscription.billedYearly')}
            </Text>
          </Pressable>
        </View>

        {/* Plans */}
        <View className="px-4 mt-4">
          {plans.map((plan, index) => {
            const isCurrent = currentSubscription?.plan?.tier === plan.tier;
            const isRecommended = plan.tier === 'pro';
            const price = getPrice(plan);
            const savings = getYearlySavings(plan);

            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlanId(plan.id)}
                className={`p-4 rounded-xl mb-3 border-2 ${
                  selectedPlanId === plan.id
                    ? 'border-primary-500 bg-primary-50'
                    : isCurrent
                    ? 'border-success-500 bg-success-50'
                    : 'border-background-200 bg-background-0'
                }`}
              >
                {/* Plan Header */}
                <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Text className="text-lg font-bold text-typography-900">
                      {isRTL && plan.nameAr ? plan.nameAr : plan.name}
                    </Text>
                    {isCurrent && (
                      <View className={`${isRTL ? 'mr-2' : 'ml-2'} px-2 py-0.5 bg-success-500 rounded-full`}>
                        <Text className="text-white text-xs font-medium">
                          {t('subscription.currentPlanBadge')}
                        </Text>
                      </View>
                    )}
                    {isRecommended && !isCurrent && (
                      <View className={`${isRTL ? 'mr-2' : 'ml-2'} flex-row items-center px-2 py-0.5 bg-primary-500 rounded-full`}>
                        <StarIcon size={12} color="#FFFFFF" />
                        <Text className="text-white text-xs font-medium ml-1">
                          {t('subscription.recommended')}
                        </Text>
                      </View>
                    )}
                  </View>
                  {selectedPlanId === plan.id && (
                    <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                      <CheckIcon size={16} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                {/* Price */}
                <View className={`mt-2 flex-row items-baseline ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Text className="text-2xl font-bold text-typography-900">
                    {price.toLocaleString()} {plan.currency}
                  </Text>
                  <Text className="text-typography-500 ml-1">
                    {billingCycle === 'yearly' ? t('subscription.perYear') : t('subscription.perMonth')}
                  </Text>
                  {billingCycle === 'yearly' && savings > 0 && (
                    <View className={`${isRTL ? 'mr-2' : 'ml-2'} px-2 py-0.5 bg-success-100 rounded-full`}>
                      <Text className="text-success-700 text-xs font-medium">
                        {t('subscription.saveYearly', { percent: savings })}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Maid Limit */}
                <Text className={`text-typography-600 mt-2 ${isRTL ? 'text-right' : ''}`}>
                  {plan.maxMaids >= 999
                    ? t('subscription.unlimited')
                    : t('subscription.maidsLimit', { count: plan.maxMaids })}
                </Text>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <View className="mt-3 pt-3 border-t border-background-200">
                    {plan.features.map((feature, fIndex) => (
                      <View
                        key={fIndex}
                        className={`flex-row items-center mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <CheckIcon size={14} color="#16A34A" />
                        <Text className={`text-typography-600 text-sm ${isRTL ? 'mr-2' : 'ml-2'}`}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Current Subscription Info */}
        {currentSubscription && currentSubscription.status !== 'canceled' && (
          <View className="mx-4 mt-2 p-4 bg-background-0 rounded-xl">
            <Text className={`text-typography-500 text-sm ${isRTL ? 'text-right' : ''}`}>
              {currentSubscription.cancelAtPeriodEnd
                ? t('subscription.expiresOn', { date: formatDate(currentSubscription.currentPeriodEnd) })
                : t('subscription.renewsOn', { date: formatDate(currentSubscription.currentPeriodEnd) })}
            </Text>
          </View>
        )}

        {/* Spacer */}
        <View className="h-32" />
      </ScrollView>

      {/* Bottom Actions */}
      <View
        className="absolute bottom-0 left-0 right-0 p-4 bg-background-0"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View className={`flex-row gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {currentSubscription &&
            currentSubscription.plan?.tier !== 'free' &&
            currentSubscription.status === 'active' &&
            !currentSubscription.cancelAtPeriodEnd && (
              <Pressable
                onPress={handleCancel}
                disabled={cancelSubscription.isPending}
                className="flex-1 py-4 border border-background-300 rounded-xl items-center"
              >
                <Text className="text-typography-700 font-medium">
                  {t('subscription.cancel')}
                </Text>
              </Pressable>
            )}
          <Pressable
            onPress={() => selectedPlanId && handleSubscribe(selectedPlanId)}
            disabled={!selectedPlanId || subscribe.isPending || selectedPlanId === currentSubscription?.planId}
            className={`flex-1 py-4 rounded-xl items-center ${
              !selectedPlanId || selectedPlanId === currentSubscription?.planId
                ? 'bg-primary-300'
                : 'bg-primary-500'
            }`}
          >
            {subscribe.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">
                {currentSubscription?.plan
                  ? t('subscription.upgrade')
                  : t('subscription.subscribe')}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
