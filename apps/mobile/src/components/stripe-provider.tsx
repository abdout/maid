import React, { useMemo } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

interface Props {
  children: React.ReactElement | React.ReactElement[];
}

export function AppStripeProvider({ children }: Props): React.JSX.Element {
  const publishableKey = Constants.expoConfig?.extra?.stripePublishableKey;

  // Get proper URL scheme for payment method redirects
  // Expo Go uses different scheme than production builds
  const urlScheme = useMemo(() => {
    return Constants.appOwnership === 'expo'
      ? Linking.createURL('/--/')
      : Linking.createURL('');
  }, []);

  if (!publishableKey) {
    console.warn('Stripe publishable key not configured');
    return <>{children}</>;
  }

  return (
    <StripeProvider
      publishableKey={publishableKey}
      urlScheme={urlScheme}
      merchantIdentifier="merchant.ae.maid.app"
    >
      {children}
    </StripeProvider>
  );
}
