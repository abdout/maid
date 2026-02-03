# Payment & Storage

## Stripe Integration

### UAE Support

| Method | Support | Notes |
|--------|---------|-------|
| Visa/Mastercard | Yes | Primary method |
| Apple Pay | Yes | Requires merchant certificate |
| Google Pay | Yes | Enabled in config |
| Tabby (BNPL) | Yes | Buy Now Pay Later |

**Transaction Fee:** 2.9% + AED 1.10

### Mobile Setup

```typescript
// app/_layout.tsx - wrapped with AppStripeProvider
// hooks/use-payment-sheet.ts - payment sheet hook

const { initializePaymentSheet, openPaymentSheet } = usePaymentSheet();

// Initialize with client secret from API
await initializePaymentSheet({
  clientSecret,
  customerId,
  customerSessionClientSecret,
  merchantDisplayName: 'Maid UAE',
  applePay: { merchantCountryCode: 'AE' },
  googlePay: { merchantCountryCode: 'AE', testEnv: __DEV__ },
});

// Open native payment sheet
const { success, error } = await openPaymentSheet();
```

### Environment

**Mobile (`apps/mobile/.env`):**
```bash
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**API (Cloudflare secrets):**
```bash
wrangler secret put STRIPE_SECRET_KEY      # sk_test_... or sk_live_...
wrangler secret put STRIPE_WEBHOOK_SECRET  # whsec_... from Stripe Dashboard
wrangler secret put STRIPE_PUBLISHABLE_KEY # pk_test_... or pk_live_...
```

### Webhook Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://maid-api.osmanabdout.workers.dev/payments/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret
5. Run: `wrangler secret put STRIPE_WEBHOOK_SECRET`

### Testing

Stripe SDK requires native build (not Expo Go):
```bash
eas build --profile development --platform ios
```

**Test Cards:**
- Success: `4242 4242 4242 4242`
- 3D Secure: `4000 0000 0000 3220`
- Decline: `4000 0000 0000 0002`

### Apple Pay Setup

1. Register Apple Merchant ID in Apple Developer
2. Get CSR from Stripe Dashboard > iOS Certificate Settings
3. Upload certificate to Apple Developer
4. Xcode: Add Apple Pay capability with your Merchant ID

---

## AWS S3 + CloudFront

### Secrets (Cloudflare Dashboard)

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret |
| `CLOUDFRONT_PRIVATE_KEY` | RSA private key |

### File Paths

| Folder | Access | URL |
|--------|--------|-----|
| `maids/` | Public | CloudFront direct |
| `logos/` | Public | CloudFront direct |
| `documents/` | Private | Signed URL (24h) |

### API

```http
POST /uploads/presigned-url   # Get upload URL
POST /uploads                 # Direct upload
GET  /uploads/signed/:key     # Get signed URL
DELETE /uploads/:key          # Delete file
```
