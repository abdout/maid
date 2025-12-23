import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMaid } from '@/hooks';
import {
  useCreatePaymentIntent,
  useConfirmPayment,
  useCreateTabbyCheckout,
  useConfirmTabbyPayment,
} from '@/hooks/use-payments';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LockClosedIcon,
  CheckIcon,
  UserIcon,
} from '@/components/icons';

type PaymentMethod = 'stripe' | 'tabby';

interface TabbySession {
  paymentId: string;
  sessionId: string;
}

export default function CvUnlockPaymentScreen() {
  const { maidId, tabbyPaymentId, paymentId: returnedPaymentId } = useLocalSearchParams<{
    maidId: string;
    tabbyPaymentId?: string;
    paymentId?: string;
  }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: maidData, isLoading: isMaidLoading, refetch: refetchMaid } = useMaid(maidId);
  const createPaymentIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();
  const createTabbyCheckout = useCreateTabbyCheckout();
  const confirmTabbyPayment = useConfirmTabbyPayment();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tabbySession, setTabbySession] = useState<TabbySession | null>(null);

  const maid = maidData?.data?.maid;
  const nationality = maidData?.data?.nationality;
  const unlockPrice = maidData?.data?.unlockPrice || 99;
  const unlockCurrency = maidData?.data?.unlockCurrency || 'AED';
  const isUnlocked = maidData?.data?.isUnlocked;

  // Handle returning from Tabby checkout
  const handleTabbyReturn = useCallback(async () => {
    // If we have both tabbyPaymentId and paymentId from URL params (deep link return)
    if (tabbyPaymentId && returnedPaymentId) {
      setIsProcessing(true);
      try {
        const result = await confirmTabbyPayment.mutateAsync({
          paymentId: returnedPaymentId,
          tabbyPaymentId,
        });

        if (result.success && (result.data.confirmed || result.data.alreadyConfirmed)) {
          await refetchMaid();
          Alert.alert(
            t('payment.paymentSuccess'),
            t('payment.cvUnlocked'),
            [
              {
                text: t('common.ok'),
                onPress: () => router.replace(`/maid/${maidId}`),
              },
            ]
          );
        }
      } catch (error) {
        console.error('Tabby confirmation error:', error);
        Alert.alert(
          t('payment.paymentFailed'),
          t('errors.somethingWrong'),
          [{ text: t('common.ok') }]
        );
      } finally {
        setIsProcessing(false);
        setTabbySession(null);
      }
    }
  }, [tabbyPaymentId, returnedPaymentId, confirmTabbyPayment, refetchMaid, maidId, router, t]);

  // Check for Tabby return on mount and app state change
  useEffect(() => {
    handleTabbyReturn();
  }, [handleTabbyReturn]);

  // Handle app coming to foreground (for when user returns from Tabby browser)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && tabbySession) {
        // User might have completed payment in browser, check status
        handleCheckTabbyStatus();
      }
    });

    return () => subscription.remove();
  }, [tabbySession]);

  const handleCheckTabbyStatus = async () => {
    if (!tabbySession) return;

    setIsProcessing(true);
    try {
      // Try to confirm - if payment was successful, this will work
      // If not, it will fail and we can show appropriate message
      const result = await confirmTabbyPayment.mutateAsync({
        paymentId: tabbySession.paymentId,
        tabbyPaymentId: tabbySession.sessionId,
      });

      if (result.success && (result.data.confirmed || result.data.alreadyConfirmed)) {
        await refetchMaid();
        Alert.alert(
          t('payment.paymentSuccess'),
          t('payment.cvUnlocked'),
          [
            {
              text: t('common.ok'),
              onPress: () => router.replace(`/maid/${maidId}`),
            },
          ]
        );
        setTabbySession(null);
      }
    } catch {
      // Payment not completed yet - that's ok, user can try again
      Alert.alert(
        t('payment.paymentPending'),
        t('payment.tabbyPendingDescription'),
        [
          {
            text: t('payment.retryTabby'),
            onPress: () => tabbySession && openTabbyCheckout(tabbySession),
          },
          {
            text: t('common.cancel'),
            style: 'cancel',
            onPress: () => setTabbySession(null),
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const openTabbyCheckout = async (session: TabbySession & { checkoutUrl?: string | null }) => {
    if (session.checkoutUrl) {
      await Linking.openURL(session.checkoutUrl);
    }
  };

  const handlePayment = async () => {
    if (!maidId) return;

    setIsProcessing(true);

    try {
      if (selectedMethod === 'stripe') {
        // Create payment intent
        const result = await createPaymentIntent.mutateAsync(maidId);

        if (result.success && result.data) {
          // In a real app, you would use Stripe's payment sheet here
          // For now, we'll simulate a successful payment
          // TODO: Integrate @stripe/stripe-react-native

          // Confirm the payment
          const confirmResult = await confirmPayment.mutateAsync({
            paymentId: result.data.paymentId,
            stripePaymentIntentId: 'pi_simulated', // This would come from Stripe
          });

          if (confirmResult.success) {
            await refetchMaid();
            Alert.alert(
              t('payment.paymentSuccess'),
              t('payment.cvUnlocked'),
              [
                {
                  text: t('common.ok'),
                  onPress: () => router.back(),
                },
              ]
            );
          }
        }
      } else if (selectedMethod === 'tabby') {
        // Create Tabby checkout session
        const result = await createTabbyCheckout.mutateAsync(maidId);

        if (result.success && result.data) {
          const session: TabbySession = {
            paymentId: result.data.paymentId,
            sessionId: result.data.sessionId,
          };
          setTabbySession(session);

          if (result.data.checkoutUrl) {
            // Open Tabby checkout in browser
            await Linking.openURL(result.data.checkoutUrl);
          } else {
            Alert.alert(
              t('common.error'),
              t('payment.tabbyUnavailable'),
              [{ text: t('common.ok') }]
            );
            setTabbySession(null);
          }
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        t('payment.paymentFailed'),
        t('errors.somethingWrong'),
        [{ text: t('common.ok') }]
      );
    } finally {
      if (selectedMethod !== 'tabby') {
        setIsProcessing(false);
      }
    }
  };

  // If already unlocked, redirect back
  useEffect(() => {
    if (isUnlocked) {
      Alert.alert(
        t('payment.alreadyUnlocked'),
        t('payment.alreadyUnlockedDescription'),
        [
          {
            text: t('common.ok'),
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [isUnlocked, router, t]);

  if (isMaidLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color="#FF385C" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('payment.unlockCv'),
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
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

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Maid Preview */}
        <View className="mt-4 p-4 bg-background-50 rounded-xl">
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {maid?.photoUrl ? (
              <Image
                source={{ uri: maid.photoUrl }}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-background-200 items-center justify-center">
                <UserIcon size={32} color="#717171" />
              </View>
            )}
            <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
              <Text
                className={`text-lg font-semibold text-typography-900 ${isRTL ? 'text-right' : ''}`}
              >
                {isRTL && maid?.nameAr ? maid.nameAr : maid?.name}
              </Text>
              {nationality && (
                <Text className={`text-typography-500 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? nationality.nameAr : nationality.nameEn}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Unlock Info */}
        <View className="mt-6 p-4 bg-primary-50 rounded-xl">
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
              <LockClosedIcon size={24} color="#FF385C" />
            </View>
            <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
              <Text
                className={`text-typography-900 font-medium ${isRTL ? 'text-right' : ''}`}
              >
                {t('payment.unlockDescription')}
              </Text>
            </View>
          </View>
        </View>

        {/* Price */}
        <View className="mt-6 items-center">
          <Text className="text-typography-500">{t('payment.unlockPrice')}</Text>
          <Text className="text-4xl font-bold text-typography-900 mt-1">
            {unlockPrice.toLocaleString()} {unlockCurrency}
          </Text>
        </View>

        {/* Payment Methods */}
        <View className="mt-8">
          <Text className={`text-lg font-semibold text-typography-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
            {t('payment.selectMethod')}
          </Text>

          {/* Stripe Card */}
          <Pressable
            onPress={() => setSelectedMethod('stripe')}
            className={`p-4 rounded-xl border-2 mb-3 ${
              selectedMethod === 'stripe' ? 'border-primary-500 bg-primary-50' : 'border-background-200 bg-background-0'
            }`}
          >
            <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 rounded-lg bg-[#635BFF] items-center justify-center">
                  <Text className="text-white font-bold text-sm">S</Text>
                </View>
                <View className={isRTL ? 'mr-3' : 'ml-3'}>
                  <Text className={`font-medium text-typography-900 ${isRTL ? 'text-right' : ''}`}>
                    {t('payment.card')}
                  </Text>
                  <Text className={`text-sm text-typography-500 ${isRTL ? 'text-right' : ''}`}>
                    Visa, Mastercard, Amex
                  </Text>
                </View>
              </View>
              {selectedMethod === 'stripe' && (
                <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                  <CheckIcon size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          </Pressable>

          {/* Tabby */}
          <Pressable
            onPress={() => setSelectedMethod('tabby')}
            className={`p-4 rounded-xl border-2 ${
              selectedMethod === 'tabby' ? 'border-primary-500 bg-primary-50' : 'border-background-200 bg-background-0'
            }`}
          >
            <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 rounded-lg bg-[#3BFCC0] items-center justify-center">
                  <Text className="text-black font-bold text-sm">T</Text>
                </View>
                <View className={isRTL ? 'mr-3' : 'ml-3'}>
                  <Text className={`font-medium text-typography-900 ${isRTL ? 'text-right' : ''}`}>
                    {t('payment.tabby')}
                  </Text>
                  <Text className={`text-sm text-typography-500 ${isRTL ? 'text-right' : ''}`}>
                    {t('payment.tabbyDescription')}
                  </Text>
                </View>
              </View>
              {selectedMethod === 'tabby' && (
                <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                  <CheckIcon size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          </Pressable>
        </View>

        {/* Tabby Pending Banner */}
        {tabbySession && (
          <View className="mt-4 p-4 bg-warning-50 rounded-xl border border-warning-200">
            <Text className={`text-warning-800 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('payment.tabbyPending')}
            </Text>
            <Text className={`text-warning-600 text-sm mt-1 ${isRTL ? 'text-right' : ''}`}>
              {t('payment.tabbyPendingHint')}
            </Text>
            <Pressable
              onPress={handleCheckTabbyStatus}
              className="mt-3 py-2 px-4 bg-warning-500 rounded-lg self-start"
            >
              <Text className="text-white font-medium">{t('payment.checkStatus')}</Text>
            </Pressable>
          </View>
        )}

        {/* Spacer */}
        <View className="h-32" />
      </ScrollView>

      {/* Pay Button */}
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
        <Pressable
          onPress={handlePayment}
          disabled={isProcessing}
          className={`py-4 rounded-xl items-center ${
            isProcessing ? 'bg-primary-300' : 'bg-primary-500'
          }`}
        >
          {isProcessing ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-white font-semibold text-base ml-2">
                {t('payment.processing')}
              </Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-base">
              {t('payment.unlockNow')} - {unlockPrice.toLocaleString()} {unlockCurrency}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
