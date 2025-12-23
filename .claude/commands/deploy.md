# Deploy to Cloudflare

Deploy the API to Cloudflare Workers.

## Usage
`/deploy` - Deploy to production
`/deploy staging` - Deploy to staging

## Argument: $ARGUMENTS

## Instructions

### Pre-Deploy
```bash
cd apps/api
pnpm tsc --noEmit
npx drizzle-kit generate
```

### Deploy
```bash
# Production
wrangler deploy

# Staging
wrangler deploy --env staging
```

### Verify
```bash
# Check health
curl https://api.maid.ae/health

# Monitor logs
wrangler tail
```

## Secrets Setup
```bash
wrangler secret put DATABASE_URL
wrangler secret put JWT_SECRET
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
```

## Requirements

- TypeScript compiles without errors
- Migrations are up to date
- All secrets configured
- Health check passes
