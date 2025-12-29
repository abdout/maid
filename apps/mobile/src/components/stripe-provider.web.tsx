import React from 'react';

interface Props {
  children: React.ReactElement | React.ReactElement[];
}

// Web stub - Stripe native SDK not available on web
export function AppStripeProvider({ children }: Props): React.JSX.Element {
  return <>{children}</>;
}
