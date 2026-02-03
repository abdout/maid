# Free Mode vs Full Mode Switch Guide

This document explains how to switch between **Free Mode** (no auth, no CV lock, no payment) and **Full Mode** (auth required, CV locked, payment enabled).

**Current Status:** Free Mode (January 2026 - April 2026)

---

## Quick Reference

| Feature | Free Mode | Full Mode |
|---------|-----------|-----------|
| Authentication | Optional (guest access) | Required |
| CV Contact Info | Always visible | Locked until payment |
| Payment | Disabled | Enabled (99 AED) |
| Office Details | Full access | Masked until unlock |

---

## Files to Modify

| File | Purpose |
|------|---------|
| `apps/api/src/services/maid.service.ts` | CV lock logic |
| `apps/mobile/src/lib/api.ts` | Auth token handling |
| `apps/mobile/app/index.tsx` | Entry point routing |

---

## Switch to Full Mode (Enable Auth + Payment)

### Step 1: Enable CV Lock in API

**File:** `apps/api/src/services/maid.service.ts`

**Change imports (line 3):**

```typescript
// FROM (Free Mode):
import { maids, maidLanguages, maidDocuments, nationalities, languages, offices } from '../db/schema';

// TO (Full Mode):
import { maids, maidLanguages, maidDocuments, nationalities, languages, offices, cvUnlocks, cvUnlockPricing } from '../db/schema';
```

**Replace the `getByIdWithUnlockStatus` method body (after line 230, after getting documents):**

```typescript
// FROM (Free Mode):
    // Free access phase: Always show full office info without payment
    // Build office info - always return full details (no masking)
    let officeInfo: OfficeInfo | null = null;
    if (result.office) {
      officeInfo = {
        id: result.office.id,
        name: result.office.name,
        nameAr: result.office.nameAr,
        phone: result.office.phone,
        email: result.office.email,
        address: result.office.address,
        addressAr: result.office.addressAr,
        logoUrl: result.office.logoUrl,
        isVerified: result.office.isVerified,
      };
    }

    return {
      maid: result.maid,
      nationality: result.nationality,
      languages: maidLangs.map((l) => l.language),
      documents: docs,
      office: officeInfo,
      isUnlocked: true, // Always unlocked in free access phase
    };
```

```typescript
// TO (Full Mode):
    // Check if unlocked by this customer
    let isUnlocked = false;
    if (customerId) {
      const [unlock] = await this.db
        .select()
        .from(cvUnlocks)
        .where(
          and(
            eq(cvUnlocks.customerId, customerId),
            eq(cvUnlocks.maidId, id)
          )
        )
        .limit(1);
      isUnlocked = !!unlock;
    }

    // Get unlock price
    let unlockPrice = 99; // Default price
    let unlockCurrency = 'AED';

    // Try nationality-specific pricing first
    let pricing = await this.db
      .select()
      .from(cvUnlockPricing)
      .where(
        and(
          eq(cvUnlockPricing.nationalityId, result.maid.nationalityId),
          eq(cvUnlockPricing.isActive, true)
        )
      )
      .limit(1);

    // Fall back to default pricing
    if (pricing.length === 0) {
      pricing = await this.db
        .select()
        .from(cvUnlockPricing)
        .where(eq(cvUnlockPricing.isActive, true))
        .limit(1);
    }

    if (pricing.length > 0) {
      unlockPrice = parseFloat(pricing[0].price);
      unlockCurrency = pricing[0].currency;
    }

    // Build office info - mask contact details if not unlocked
    let officeInfo: OfficeInfo | null = null;
    if (result.office) {
      if (isUnlocked) {
        // Full office info for unlocked CVs
        officeInfo = {
          id: result.office.id,
          name: result.office.name,
          nameAr: result.office.nameAr,
          phone: result.office.phone,
          email: result.office.email,
          address: result.office.address,
          addressAr: result.office.addressAr,
          logoUrl: result.office.logoUrl,
          isVerified: result.office.isVerified,
        };
      } else {
        // Masked office info for locked CVs
        officeInfo = {
          id: result.office.id,
          name: result.office.name,
          nameAr: result.office.nameAr,
          phone: null, // Hidden
          email: null, // Hidden
          address: null, // Hidden
          addressAr: null, // Hidden
          logoUrl: result.office.logoUrl,
          isVerified: result.office.isVerified,
        };
      }
    }

    return {
      maid: result.maid,
      nationality: result.nationality,
      languages: maidLangs.map((l) => l.language),
      documents: docs,
      office: officeInfo,
      isUnlocked,
      unlockPrice: isUnlocked ? undefined : unlockPrice,
      unlockCurrency: isUnlocked ? undefined : unlockCurrency,
    };
```

### Step 2: Require Authentication in Mobile App

**File:** `apps/mobile/app/index.tsx`

Find the guest mode bypass and remove or disable it. The app should redirect unauthenticated users to the login screen instead of allowing guest access.

### Step 3: Deploy

```bash
# Verify changes
pnpm --filter api typecheck

# Deploy API
cd apps/api && pnpm run deploy

# Rebuild mobile app
cd apps/mobile && eas build --platform all --profile production
```

---

## Switch to Free Mode (Disable Auth + Payment)

### Step 1: Disable CV Lock in API

**File:** `apps/api/src/services/maid.service.ts`

**Change imports (line 3):**

```typescript
// FROM (Full Mode):
import { maids, maidLanguages, maidDocuments, nationalities, languages, offices, cvUnlocks, cvUnlockPricing } from '../db/schema';

// TO (Free Mode):
import { maids, maidLanguages, maidDocuments, nationalities, languages, offices } from '../db/schema';
```

**Replace the `getByIdWithUnlockStatus` method body with free access version:**

```typescript
    // Free access phase: Always show full office info without payment
    // Build office info - always return full details (no masking)
    let officeInfo: OfficeInfo | null = null;
    if (result.office) {
      officeInfo = {
        id: result.office.id,
        name: result.office.name,
        nameAr: result.office.nameAr,
        phone: result.office.phone,
        email: result.office.email,
        address: result.office.address,
        addressAr: result.office.addressAr,
        logoUrl: result.office.logoUrl,
        isVerified: result.office.isVerified,
      };
    }

    return {
      maid: result.maid,
      nationality: result.nationality,
      languages: maidLangs.map((l) => l.language),
      documents: docs,
      office: officeInfo,
      isUnlocked: true, // Always unlocked in free access phase
    };
```

### Step 2: Enable Guest Mode in Mobile App

Guest mode is already implemented. Ensure `apps/mobile/app/index.tsx` allows guest access.

### Step 3: Deploy

```bash
pnpm --filter api typecheck
cd apps/api && pnpm run deploy
```

---

## Database Tables (Reference)

These tables exist and are functional. They are simply bypassed in Free Mode:

| Table | Purpose |
|-------|---------|
| `cvUnlocks` | Tracks customer-maid unlock records |
| `cvUnlockPricing` | Nationality-specific pricing (default 99 AED) |
| `payments` | All payment transactions |

**Schema location:** `apps/api/src/db/schema.ts`

---

## API Endpoints (Reference)

All payment endpoints remain functional and can be used immediately when switching to Full Mode:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/payments/cv-unlock/price/:maidId` | GET | Get unlock price |
| `/payments/cv-unlock/check/:maidId` | GET | Check if unlocked |
| `/payments/cv-unlock/create-intent` | POST | Create Stripe payment |
| `/payments/cv-unlock/confirm` | POST | Confirm payment |
| `/payments/cv-unlock/tabby/create` | POST | Create Tabby BNPL |
| `/payments/cv-unlock/tabby/confirm` | POST | Confirm Tabby |

---

## Mobile Components (Reference)

These components are built and ready for Full Mode:

| Component | File |
|-----------|------|
| Locked Contact Section | `src/components/locked-contact-section.tsx` |
| CV Unlock Payment | `app/payment/cv-unlock.tsx` |
| Payment History | `app/payment-history.tsx` |
| Unlocked CVs List | `app/(customer)/unlocked-cvs.tsx` |

---

## Environment Variables Required for Full Mode

Ensure these are set in `apps/api/.dev.vars` and Cloudflare Workers secrets:

```
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
TABBY_SECRET_KEY=sk_test_xxx
TABBY_MERCHANT_CODE=xxx
```

---

## Verification Checklist

### Free Mode
- [ ] Can browse maids without login
- [ ] All maid CVs show full office contact info
- [ ] No "Unlock CV" button or payment prompts
- [ ] `isUnlocked` always returns `true` from API

### Full Mode
- [ ] Login required to view maid details
- [ ] Office contact info hidden until payment
- [ ] "Unlock CV" button shows price (99 AED)
- [ ] Stripe/Tabby payment flow works
- [ ] Unlocked CVs persist across sessions
