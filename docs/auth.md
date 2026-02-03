# Authentication System

**API**: `https://maid-api.osmanabdout.workers.dev`

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/login` | Email/password login |
| GET | `/auth/me` | Get current user |
| POST | `/auth/refresh` | Refresh tokens |
| POST | `/auth/logout` | Invalidate token |
| POST | `/auth/logout-all` | Invalidate all sessions |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset with token |

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| `customer@hotmail.com` | `Test123456` | customer |
| `office@hotmail.com` | `Test123456` | office_admin |
| `admin@hotmail.com` | `Test123456` | super_admin |

## Tokens

- **Access**: 15 min, HS256, `jti` for revocation
- **Refresh**: 7 days, single-use
- **Reset**: 64-char hex, 1 hour, SHA-256 hashed

## Roles

- `customer` - Browse maids, create quotations
- `office_admin` - Manage own office's maids
- `super_admin` - Full system access

## Security

- Account lockout: 5 fails → 30min lock
- Token blacklist via Cloudflare KV
- Rate limiting via KV
- bcrypt (12 rounds)
- Audit logging (PII masked)

## Setup

### Secrets
```bash
wrangler secret put JWT_SECRET
```

### KV Namespaces
```bash
wrangler kv:namespace create "RATE_LIMIT_KV"
wrangler kv:namespace create "TOKEN_BLACKLIST_KV"
# Update wrangler.toml with returned IDs
```

### Cloudflare Token
```bash
# Create at https://dash.cloudflare.com/profile/api-tokens
# Template: "Edit Cloudflare Workers"
echo 'export CLOUDFLARE_API_TOKEN="your-token"' >> ~/.zshrc
source ~/.zshrc
wrangler whoami  # verify
```

## Middleware

```typescript
import { authMiddleware, requireRole, officeMiddleware } from '../middleware';

app.get('/profile', authMiddleware, handler);
app.get('/admin', authMiddleware, requireRole('super_admin'), handler);
app.get('/office/maids', authMiddleware, officeMiddleware, handler);
```

## Mobile

- Store tokens: `expo-secure-store`
- Auto-refresh on 401 with `code: 'TOKEN_EXPIRED'`
- See: `apps/mobile/src/lib/api.ts`

## DB Tables

- `users` - Accounts with roles
- `password_reset_tokens` - Reset tokens
- `audit_logs` - Event tracking

## Troubleshooting

| Error | Fix |
|-------|-----|
| Invalid/expired token | Use refresh token |
| Account locked | Wait 30 min |

## Checklist

- [x] KV namespaces configured
- [x] Cloudflare token in `~/.zshrc`
- [x] Test credentials working
- [ ] Set JWT_SECRET via `wrangler secret put`
- [ ] Implement password reset email

---

## Future / Beyond MVP

### Phone OTP Authentication
- `POST /auth/otp/request` - Request 4-digit OTP
- `POST /auth/otp/verify` - Verify OTP → tokens
- Requires Twilio credentials:
  ```bash
  wrangler secret put TWILIO_ACCOUNT_SID
  wrangler secret put TWILIO_AUTH_TOKEN
  wrangler secret put TWILIO_PHONE_NUMBER
  ```

### OAuth (Google/Apple)
- Google Sign-In
- Apple Sign-In
- DB table `oauth_accounts` ready
