# Demo Authentication

## API Endpoint
```
https://maid-api.osmanabdout.workers.dev
```

## Demo Login Credentials

All demo accounts use OTP code: **123456**

| Role | Phone | Office |
|------|-------|--------|
| Customer | +971555000100 | - |
| Office Admin | +971555000201 | Al Tadbeer Services |
| Office Admin | +971555000202 | Mubarak Recruitment |
| Office Admin | +971555000203 | Emirates Manpower |
| Office Admin | +971555000204 | Gulf Workers Agency |
| Super Admin | +971555000300 | - |

## How to Login

### 1. Request OTP
```bash
curl -X POST https://maid-api.osmanabdout.workers.dev/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phone": "+971555000100"}'
```

Response:
```json
{
  "success": true,
  "message": "Demo mode: Use code 123456",
  "data": { "phone": "+971555000100", "isDemo": true }
}
```

### 2. Verify OTP
```bash
curl -X POST https://maid-api.osmanabdout.workers.dev/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+971555000100", "code": "123456"}'
```

Response:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "uuid",
      "phone": "+971555000100",
      "name": "Demo Customer",
      "role": "customer",
      "officeId": null
    }
  }
}
```

### 3. Use Token
```bash
curl https://maid-api.osmanabdout.workers.dev/auth/me \
  -H "Authorization: Bearer <token>"
```

## Demo Phone Patterns

Any phone matching these patterns will use the fixed OTP code `123456`:

- `+971555000XXX` - UAE demo numbers
- `+1555000XXXX` - US demo numbers
- `demo*` - Any phone starting with "demo"

## OAuth Endpoints (Optional)

```
POST /oauth/google     - Google Sign-In
POST /oauth/apple      - Apple Sign-In
POST /oauth/link-phone - Link phone to OAuth account
```

Requires `GOOGLE_CLIENT_ID` and `APPLE_CLIENT_ID` secrets to be configured.
