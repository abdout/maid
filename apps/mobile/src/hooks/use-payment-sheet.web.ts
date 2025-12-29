// Web stub - Stripe native SDK not available on web
interface PaymentSheetParams {
  clientSecret: string;
  merchantDisplayName?: string;
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
  return {
    isLoading: false,
    initializePaymentSheet: async () => {
      console.warn('Stripe payment sheet not available on web');
      return false;
    },
    openPaymentSheet: async () => {
      console.warn('Stripe payment sheet not available on web');
      return { success: false, error: 'Not available on web' };
    },
  };
}
