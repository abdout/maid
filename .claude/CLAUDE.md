# Maid UAE Platform - Claude Code Instructions

## ⚠️ PRODUCTION URLS - MEMORIZE THIS

| Resource | URL |
|----------|-----|
| **Production App** | https://maid-xi.vercel.app |
| **Vercel Dashboard** | https://vercel.com/osman-abdouts-projects/maid |
| **GitHub Repo** | https://github.com/abdout/maid |
| **API** | https://maid-api.osmanabdout.workers.dev |

**ONE REPO → ONE VERCEL PROJECT → ONE URL: `maid-xi.vercel.app`**

---

## Project Overview

UAE maid hiring platform connecting recruitment offices with customers seeking domestic workers.

**Tech Stack**: Hono + Cloudflare Workers | Expo + React Native | Gluestack UI | Neon PostgreSQL | Drizzle ORM

---

## Tech Stack Reference

| Layer | Technology | Docs |
|-------|------------|------|
| Backend | Hono 4.x | https://hono.dev |
| Runtime | Cloudflare Workers | https://developers.cloudflare.com/workers |
| Database | Neon PostgreSQL | https://neon.tech/docs |
| ORM | Drizzle | https://orm.drizzle.team |
| Mobile | Expo SDK 54+ | https://docs.expo.dev |
| Framework | React Native 0.76+ | https://reactnative.dev |
| UI | Gluestack UI v3 | https://gluestack.io |
| Styling | NativeWind 4.x | https://nativewind.dev |
| Validation | Zod 3.x | https://zod.dev |
| State | Zustand + React Query | - |

---

## Project Structure

```
maid/
├── apps/
│   ├── api/                 # Hono backend
│   │   ├── src/
│   │   │   ├── routes/     # API endpoints
│   │   │   ├── services/   # Business logic
│   │   │   ├── middleware/ # Auth, tenant, etc.
│   │   │   ├── db/         # Drizzle schema
│   │   │   └── validators/ # Zod schemas
│   │   └── wrangler.toml
│   └── mobile/              # Expo app
│       ├── app/            # Expo Router
│       └── src/
│           ├── components/ # Gluestack UI
│           ├── hooks/      # Custom hooks
│           ├── lib/        # API client, i18n
│           └── store/      # Zustand stores
├── packages/shared/         # Shared types
├── docs/                    # BMAD documents
└── .claude/                 # This config
```

---

## Code Conventions

### File Naming
- **Components**: `kebab-case.tsx` (maid-card.tsx)
- **Screens**: `kebab-case.tsx` in app/ (search.tsx)
- **Hooks**: `use-kebab-case.ts` (use-maids.ts)
- **API Routes**: `kebab-case.ts` (auth.ts, maids.ts)
- **Services**: `kebab-case.service.ts`
- **Validators**: `kebab-case.schema.ts`

### Component Pattern (Gluestack)
```typescript
import { Box, Text, Button, ButtonText } from '@/components/ui';

interface Props {
  maid: Maid;
  onPress: () => void;
}

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
import { createMaidSchema } from '../validators/maid.schema';

const maids = new Hono()
  .get('/', async (c) => {
    const maids = await maidService.list();
    return c.json({ success: true, data: maids });
  })
  .post('/', zValidator('json', createMaidSchema), async (c) => {
    const data = c.req.valid('json');
    const maid = await maidService.create(data);
    return c.json({ success: true, data: maid }, 201);
  });

export default maids;
```

### Database Query Pattern (Drizzle)
```typescript
// Always include officeId for multi-tenant queries
const maids = await db.query.maids.findMany({
  where: and(
    eq(maids.officeId, officeId),
    eq(maids.status, 'available')
  ),
  with: { nationality: true },
});
```

---

## Keyword Triggers

| Keyword | Agents | Commands |
|---------|--------|----------|
| `component` | gluestack | /component |
| `screen` | expo | /screen |
| `api` | hono | /api |
| `migration` | neon | /migration |
| `deploy` | cloudflare | /deploy |
| `build` | - | /build |
| `test` | - | /test |
| `rtl` | rtl | - |

---

## Agent Mapping

| Technology | Primary Agent |
|------------|---------------|
| Hono | hono |
| Expo | expo |
| Gluestack | gluestack |
| Drizzle/Neon | neon |
| RTL/Arabic | rtl |
| Cloudflare | cloudflare |

---

## MCP Servers

| MCP | Purpose |
|-----|---------|
| expo | Expo development, screenshots, device automation |
| browser | E2E testing with Playwright |

---

## Quick Commands

| Command | Purpose |
|---------|---------|
| `/component <name>` | Generate Gluestack component |
| `/screen <path>` | Generate Expo Router screen |
| `/api <resource>` | Generate Hono API route |
| `/migration <name>` | Create Drizzle migration |
| `/deploy` | Deploy to Cloudflare |
| `/build` | Build all packages |

---

## Development Workflow

1. Read the story from `docs/stories/`
2. Check architecture in `docs/architecture.md`
3. Implement backend first (API, database)
4. Implement frontend (screens, components)
5. Test manually
6. Mark story complete

---

## Important Rules

1. **Always validate inputs** with Zod schemas
2. **Include officeId** in all tenant-scoped queries
3. **Support RTL** in all new components
4. **Export AppType** from API for RPC client
5. **Use Gluestack UI** components, not raw RN
6. **Translations** in both ar.json and en.json

---

## Environment Variables

### API (.dev.vars)
```
DATABASE_URL=postgresql://...@neon.tech/maid
JWT_SECRET=your-secret
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx
```

### Mobile (app.config.ts)
```typescript
extra: {
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
}
```

---

## Documentation References

- Project Brief: `docs/project-brief.md`
- PRD: `docs/PRD.md`
- Architecture: `docs/architecture.md`
- Epics: `docs/epics/README.md`
- Stories: `docs/stories/`
