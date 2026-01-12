/**
 * Auth Configuration
 *
 * Toggle GUEST_MODE to switch between:
 * - true: Customers can browse without login (free trial period)
 * - false: Customers must login to access the app
 *
 * For testing, simply change GUEST_MODE value and reload the app.
 */

// ============================================
// TOGGLE THIS VALUE TO SWITCH AUTH MODES
// ============================================
export const GUEST_MODE = true; // Set to false to require auth
// ============================================

// Auth configuration based on mode
export const authConfig = {
  // Whether customers can browse without login
  guestModeEnabled: GUEST_MODE,

  // Whether to require auth for customer screens
  requireCustomerAuth: !GUEST_MODE,

  // Whether to require auth for office screens
  // Set to !GUEST_MODE to bypass auth during testing
  requireOfficeAuth: !GUEST_MODE,

  // Features that always require auth even in guest mode
  authRequiredFeatures: [
    'favorites',      // Saving favorites
    'quotations',     // Requesting quotations
    'wallet',         // Wallet/payments
    'profile-edit',   // Editing profile
  ] as const,
};

// Helper to check if a feature requires auth
export function requiresAuth(feature: string): boolean {
  if (!GUEST_MODE) return true; // All features require auth when guest mode is off
  return authConfig.authRequiredFeatures.includes(feature as never);
}

// Helper to check if user can access feature (for UI hints)
export function canAccessFeature(feature: string, isAuthenticated: boolean): boolean {
  if (isAuthenticated) return true;
  return !requiresAuth(feature);
}
