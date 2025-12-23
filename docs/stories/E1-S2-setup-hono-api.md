# Story: E1-S2 Setup Hono API Project

## Description

As a **developer**, I want a Hono API project configured for Cloudflare Workers so that I can build type-safe backend endpoints.

## Acceptance Criteria

- [ ] Hono app initialized with TypeScript
- [ ] Wrangler configured for local development
- [ ] Health check endpoint responds at `/health`
- [ ] CORS middleware configured
- [ ] Error handler middleware configured
- [ ] Environment types defined
- [ ] API responds at `localhost:8787`

## Technical Notes

### Key Files

```
apps/api/
├── src/
│   ├── index.ts          # Entry point
│   ├── app.ts            # Hono app setup
│   ├── routes/
│   │   ├── index.ts
│   │   └── health.ts
│   ├── middleware/
│   │   ├── cors.ts
│   │   └── error.ts
│   └── types/
│       └── env.ts
├── wrangler.toml
├── package.json
└── tsconfig.json
```

### Main App (src/index.ts)
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { routes } from './routes';
import { errorHandler } from './middleware/error';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('*', cors());
app.route('/api/v1', routes);
app.onError(errorHandler);

export default app;
export type AppType = typeof app;
```

### Environment Types (src/types/env.ts)
```typescript
export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  RATE_LIMIT: KVNamespace;
  UPLOADS: R2Bucket;
  HYPERDRIVE: Hyperdrive;
}
```

### wrangler.toml
```toml
name = "maid-api"
main = "src/index.ts"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[dev]
port = 8787
```

## Dependencies

- E1-S1 (monorepo setup)

## Blocks

- E1-S4 (database), E2-S1 (auth)

## Estimates

- **Points**: 3
- **Priority**: P0
- **Sprint**: 1
