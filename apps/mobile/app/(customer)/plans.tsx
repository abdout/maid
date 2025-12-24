import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useBusinessPlans, useCustomerSubscription, useSubscribeToBusinessPlan } from '@/hooks';
import { useAuth } from '@/store/auth';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  StarIcon,
} from '@/components/icons';

type BillingCycle = 'monthly' | 'yearly';

export default function PlansScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const isRTL = i18n.language === 'ar';

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const { data: plansData, isLoading: plansLoading } = useBusinessPlans();
  const { data: subscriptionData, isLoading: subLoading } = useCustomerSubscription();
  const subscribeMutation = useSubscribeToBusinessPlan();

  const plans = plansData?.data || [];
  const currentSubscription = subscriptionData?.data;
  const currentPlanTier = currentSubscription?.plan?.tier;

  const BackIcon = isRTL ? ChevronRightIcon : ChevronLeftIcon;

  const handleSubscribe = async (planId: string, tier: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (tier === 'enterprise') {
      // Open contact form or WhatsApp
      Alert.alert(
        t('businessPlans.contactSales'),
        t('businessInquiry.success'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    try {
      const result = await subscribeMutation.mutateAsync({
        planId,
        billingCycle,
      });

      if (result.data?.checkoutUrl) {
        // Open Stripe checkout
        Linking.openURL(result.data.checkoutUrl);
      } else {
        Alert.alert(t('common.success'), t('businessPlans.subscribe'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.somethingWrong'));
    }
  };

  const getPlanName = (tier: string) => {
    return t(`businessPlans.${tier}`);
  };

  const getButtonText = (tier: string) => {
    if (tier === currentPlanTier) {
      return t('businessPlans.currentPlan');
    }
    if (tier === 'enterprise') {
      return t('businessPlans.contactSales');
    }
    if (currentPlanTier && tier !== 'free') {
      return t('businessPlans.upgrade');
    }
    return t('businessPlans.subscribe');
  };

  const isCurrentPlan = (tier: string) => tier === currentPlanTier;
  const isRecommended = (tier: string) => tier === 'pro';

  if (plansLoading || subLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
      {/* Header */}
      <View
        className={`px-4 py-3 flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-background-0"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <BackIcon size={20} color="#222222" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-typography-900">
            {t('businessPlans.title')}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <Text
          className={`px-6 text-typography-500 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {t('businessPlans.subtitle')}
        </Text>

        {/* Billing Cycle Toggle */}
        <View className="mx-6 mb-6">
          <View className="flex-row bg-background-100 rounded-xl p-1">
            <Pressable
              onPress={() => setBillingCycle('monthly')}
              className={`flex-1 py-3 rounded-lg items-center ${
                billingCycle === 'monthly' ? 'bg-background-0' : ''
              }`}
              style={
                billingCycle === 'monthly'
                  ? {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }
                  : undefined
              }
            >
              <Text
                className={`font-medium ${
                  billingCycle === 'monthly'
                    ? 'text-typography-900'
                    : 'text-typography-500'
                }`}
              >
                {t('businessPlans.monthly')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setBillingCycle('yearly')}
              className={`flex-1 py-3 rounded-lg items-center ${
                billingCycle === 'yearly' ? 'bg-background-0' : ''
              }`}
              style={
                billingCycle === 'yearly'
                  ? {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }
                  : undefined
              }
            >
              <Text
                className={`font-medium ${
                  billingCycle === 'yearly'
                    ? 'text-typography-900'
                    : 'text-typography-500'
                }`}
              >
                {t('businessPlans.yearly')}
              </Text>
              <Text className="text-xs text-success-600 mt-0.5">
                {t('businessPlans.saveYearly', { percent: 17 })}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Current Subscription Usage */}
        {currentSubscription && currentSubscription.status === 'active' && currentSubscription.plan && (
          <View className="mx-6 mb-6 p-4 bg-primary-50 rounded-xl">
            <Text
              className={`text-sm font-semibold text-primary-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {t('businessPlans.usage.title')}
            </Text>
            <View className="bg-background-0 rounded-lg h-2 overflow-hidden">
              <View
                className="h-full bg-primary-500"
                style={{
                  width: `${Math.min(
                    100,
                    (currentSubscription.freeUnlocksUsed /
                      Math.max(1, currentSubscription.plan.freeUnlocksPerMonth)) *
                      100
                  )}%`,
                }}
              />
            </View>
            <Text
              className={`text-sm text-primary-600 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {t('businessPlans.usage.used', {
                used: currentSubscription.freeUnlocksUsed,
                total: currentSubscription.plan.freeUnlocksPerMonth,
              })}
            </Text>
          </View>
        )}

        {/* Plan Cards */}
        <View className="px-6 pb-8">
          {plans.map((plan) => {
            const isCurrent = isCurrentPlan(plan.tier);
            const isRec = isRecommended(plan.tier);
            const price =
              billingCycle === 'yearly' && plan.priceYearly
                ? plan.priceYearly
                : plan.priceMonthly;

            return (
              <View
                key={plan.id}
                className={`mb-4 bg-background-0 rounded-2xl overflow-hidden ${
                  isRec ? 'border-2 border-primary-500' : ''
                }`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Recommended Badge */}
                {isRec && (
                  <View className="bg-primary-500 py-2 items-center">
                    <View className={`flex-row items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <StarIcon size={14} color="#FFFFFF" />
                      <Text className="text-white text-xs font-semibold">
                        {t('subscription.recommended')}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Current Plan Badge */}
                {isCurrent && !isRec && (
                  <View className="bg-success-500 py-2 items-center">
                    <Text className="text-white text-xs font-semibold">
                      {t('businessPlans.currentPlan')}
                    </Text>
                  </View>
                )}

                <View className="p-5">
                  {/* Plan Header */}
                  <View className={`flex-row items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <View>
                      <Text
                        className={`text-xl font-bold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}
                      >
                        {isRTL ? plan.nameAr : plan.nameEn}
                      </Text>
                      <Text
                        className={`text-sm text-typography-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}
                      >
                        {isRTL ? plan.descriptionAr : plan.descriptionEn}
                      </Text>
                    </View>
                  </View>

                  {/* Price */}
                  <View className={`mb-4 ${isRTL ? 'items-end' : 'items-start'}`}>
                    {plan.tier === 'enterprise' ? (
                      <Text className="text-2xl font-bold text-typography-900">
                        {t('businessPlans.contactSales')}
                      </Text>
                    ) : (
                      <View className={`flex-row items-baseline ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Text className="text-3xl font-bold text-typography-900">
                          {price}
                        </Text>
                        <Text className="text-lg text-typography-500 ml-1">
                          {t('common.aed')}
                        </Text>
                        <Text className="text-sm text-typography-500 ml-1">
                          {billingCycle === 'yearly'
                            ? t('businessPlans.perYear')
                            : t('businessPlans.perMonth')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Features */}
                  <View className="mb-4">
                    {/* Free Unlocks */}
                    <View
                      className={`flex-row items-center py-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <View className="w-5 h-5 rounded-full bg-success-100 items-center justify-center">
                        <CheckIcon size={12} color="#22C55E" />
                      </View>
                      <Text
                        className={`flex-1 text-typography-700 ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}
                      >
                        {plan.freeUnlocksPerMonth === 0
                          ? t('businessPlans.payPerUnlock')
                          : plan.freeUnlocksPerMonth >= 999
                          ? t('businessPlans.unlimitedUnlocks')
                          : t('businessPlans.freeUnlocks', {
                              count: plan.freeUnlocksPerMonth,
                            })}
                      </Text>
                    </View>

                    {/* Discount */}
                    {plan.discountPercent > 0 && (
                      <View
                        className={`flex-row items-center py-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <View className="w-5 h-5 rounded-full bg-success-100 items-center justify-center">
                          <CheckIcon size={12} color="#22C55E" />
                        </View>
                        <Text
                          className={`flex-1 text-typography-700 ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}
                        >
                          {t('businessPlans.discountExtra', {
                            percent: plan.discountPercent,
                          })}
                        </Text>
                      </View>
                    )}

                    {/* Additional Features */}
                    {plan.features?.map((feature, index) => (
                      <View
                        key={index}
                        className={`flex-row items-center py-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <View className="w-5 h-5 rounded-full bg-success-100 items-center justify-center">
                          <CheckIcon size={12} color="#22C55E" />
                        </View>
                        <Text
                          className={`flex-1 text-typography-700 ${isRTL ? 'mr-3 text-right' : 'ml-3'}`}
                        >
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Subscribe Button */}
                  <Pressable
                    onPress={() => handleSubscribe(plan.id, plan.tier)}
                    disabled={isCurrent || subscribeMutation.isPending}
                    className={`py-4 rounded-xl items-center ${
                      isCurrent
                        ? 'bg-background-100'
                        : isRec
                        ? 'bg-primary-500'
                        : 'bg-typography-900'
                    }`}
                  >
                    {subscribeMutation.isPending ? (
                      <ActivityIndicator
                        color={isCurrent ? '#717171' : '#FFFFFF'}
                      />
                    ) : (
                      <Text
                        className={`font-semibold ${
                          isCurrent ? 'text-typography-500' : 'text-white'
                        }`}
                      >
                        {getButtonText(plan.tier)}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
