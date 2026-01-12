# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Production URLs

| Resource | URL |
|----------|-----|
| Production App | https://maid-xi.vercel.app |
| API | https://maid-api.osmanabdout.workers.dev |
| Vercel Dashboard | https://vercel.com/osman-abdouts-projects/maid |
| GitHub | https://github.com/abdout/maid |

## Commands

### Development
```bash
pnpm dev                    # Start all services (API + Mobile via Turbo)
pnpm --filter api dev       # API only at http://localhost:8787
pnpm --filter mobile dev    # Mobile only (Expo dev server)
```

### Type Checking & Build
```bash
pnpm typecheck              # Type check all packages
pnpm build                  # Build all packages
pnpm --filter api typecheck # API only
pnpm --filter mobile typecheck # Mobile only
```

### Database (Drizzle + Neon)
```bash
pnpm db:generate            # Generate migration from schema changes
pnpm db:migrate             # Apply pending migrations
pnpm db:push                # Push schema directly (dev only)
pnpm db:studio              # Open Drizzle Studio
pnpm --filter api db:seed   # Seed database
```

### Deployment
```bash
pnpm deploy                             # Deploy API to production
pnpm --filter api deploy:staging        # Deploy API to staging
cd apps/mobile && eas build --platform ios --profile development  # Dev build
cd apps/mobile && eas build --platform all --profile production   # Prod build
```

## Architecture

### Monorepo Structure
```
apps/
├── api/          # Hono backend on Cloudflare Workers
└── mobile/       # Expo React Native app
packages/
└── shared/       # Shared TypeScript types
```

### Backend (apps/api)
- **Framework**: Hono 4.x on Cloudflare Workers
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Auth**: Phone OTP (Twilio) + JWT with refresh tokens
- **Storage**: AWS S3 with CloudFront CDN
- **Payments**: Stripe + Tabby (UAE BNPL)

Key files:
- `src/index.ts` - App entry, route mounting, global middleware
- `src/db/schema.ts` - All Drizzle table definitions and relations
- `src/types.ts` - Bindings (env vars) and Variables (context) types
- `src/routes/*.ts` - Route handlers organized by resource
- `src/services/*.ts` - Business logic separated from routes
- `src/validators/*.ts` - Zod schemas for request validation
- `src/middleware/auth.ts` - JWT verification and role guards

### Frontend (apps/mobile)
- **Framework**: Expo SDK 52 with Expo Router
- **UI**: Gluestack UI v3 + NativeWind (Tailwind for RN)
- **State**: Zustand stores + React Query for server state
- **i18n**: i18next with Arabic (RTL) and English

Key directories:
- `app/` - Expo Router file-based routing
- `app/(customer)/` - Customer tab screens
- `app/(office)/` - Office admin tab screens
- `src/components/` - Reusable Gluestack components
- `src/hooks/` - Custom hooks (React Query wrappers)
- `src/lib/api.ts` - API client with auth token refresh
- `src/store/` - Zustand stores (auth, forms)
- `src/locales/` - Translation files (ar.json, en.json)

### API Client Pattern
The mobile app uses a typed API client (`src/lib/api.ts`) that:
1. Auto-injects auth tokens from Zustand store
2. Handles 401 errors with automatic token refresh
3. Forces logout when refresh fails

### Multi-tenant Data Model
- `offices` - Recruitment agencies (tenants)
- `users` - All users with role enum (customer, office_admin, super_admin)
- `maids` - Worker profiles scoped to officeId
- `quotations` - Price quotes linking customer, office, maid

Always include `officeId` in queries for tenant-scoped data.

### Payment System
Two models:
1. **CV Unlock** - One-time payment to view maid contact info
2. **Subscriptions** - Office plans (max maids) and business plans (free unlocks)

Tables: `payments`, `cv_unlocks`, `subscription_plans`, `office_subscriptions`, `business_plans`, `customer_subscriptions`, `wallets`, `wallet_transactions`

## Code Conventions

### File Naming
- Components: `kebab-case.tsx` (maid-card.tsx)
- Hooks: `use-kebab-case.ts` (use-maids.ts)
- Services: `kebab-case.service.ts`
- Validators: `kebab-case.schema.ts`

### Component Pattern (Gluestack)
```typescript
import { Box, Text, Button, ButtonText } from '@/components/ui';

export function MaidCard({ maid, onPress }: Props) {
  return (
    <Box className="p-4 bg-background-0 rounded-xl">
      <Text className="text-typography-900">{maid.name}</Text>
      <Button onPress={onPress}>
        <ButtonText>View</ButtonText>
      </Button>
    </Box>
  );
}
```

### API Route Pattern (Hono)
```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

const maids = new Hono<{ Bindings: Bindings; Variables: Variables }>()
  .get('/', async (c) => {
    const data = await maidService.list(c.env, officeId);
    return c.json({ success: true, data });
  })
  .post('/', zValidator('json', createMaidSchema), async (c) => {
    const data = c.req.valid('json');
    const maid = await maidService.create(c.env, data);
    return c.json({ success: true, data: maid }, 201);
  });
```

### Database Query Pattern
```typescript
// Always scope tenant queries by officeId
const maids = await db.query.maids.findMany({
  where: and(eq(maids.officeId, officeId), eq(maids.status, 'available')),
  with: { nationality: true, languages: { with: { language: true } } },
});
```

## Critical Rules

1. **Validate all inputs** with Zod schemas in validators/
2. **Include officeId** in all tenant-scoped queries
3. **Support RTL** in all components (Arabic is primary)
4. **Export AppType** from api/src/index.ts for RPC type inference
5. **Use Gluestack UI** components, never raw React Native
6. **Add translations** to both ar.json and en.json

## Environment Variables

### API (.dev.vars)
```
DATABASE_URL=postgresql://...@neon.tech/maid
JWT_SECRET=your-secret
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx
STRIPE_SECRET_KEY=sk_xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

### Mobile (app.config.ts extra)
```typescript
apiUrl: process.env.EXPO_PUBLIC_API_URL
```
