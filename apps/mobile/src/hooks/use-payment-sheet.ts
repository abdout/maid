import { useState, useCallback } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

interface PaymentSheetParams {
  clientSecret: string;
  merchantDisplayName?: string;
  customerId?: string;
  customerSessionClientSecret?: string;
  applePay?: {
    merchantCountryCode: string;
  };
  googlePay?: {
    merchantCountryCode: string;
    testEnv?: boolean;
  };
}

interface UsePaymentSheetResult {
  isLoading: boolean;
  initializePaymentSheet: (params: PaymentSheetParams) => Promise<boolean>;
  openPaymentSheet: () => Promise<{ success: boolean; error?: string }>;
}

export function usePaymentSheet(): UsePaymentSheetResult {
  const { t } = useTranslation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isLoading, setIsLoading] = useState(false);

  const initializePaymentSheet = useCallback(
    async (params: PaymentSheetParams): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Get proper return URL for payment method redirects
        const returnURL = Constants.appOwnership === 'expo'
          ? Linking.createURL('/--/payment-complete')
          : Linking.createURL('payment-complete');

        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: params.clientSecret,
          merchantDisplayName: params.merchantDisplayName || 'Maid UAE',
          // CustomerSession for secure payment method management
          customerId: params.customerId,
          customerEphemeralKeySecret: params.customerSessionClientSecret,
          // Apple Pay / Google Pay for UAE
          applePay: params.applePay,
          googlePay: params.googlePay,
          // UI settings
          style: 'automatic',
          returnURL,
          // Default billing address to UAE
          defaultBillingDetails: {
            address: {
              country: 'AE',
            },
          },
          // Allow delayed payment methods (bank transfers, etc.)
          allowsDelayedPaymentMethods: false,
        });

        if (error) {
          console.error('Error initializing payment sheet:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Payment sheet initialization failed:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [initPaymentSheet]
  );

  const openPaymentSheet = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setIsLoading(true);
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          return { success: false, error: 'canceled' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('errors.somethingWrong');
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [presentPaymentSheet, t]);

  return {
    isLoading,
    initializePaymentSheet,
    openPaymentSheet,
  };
}
