# Story: E2-S1 Create OTP Request Endpoint

## Description

As a **user**, I want to request an OTP via SMS so that I can verify my phone number and login.

## Acceptance Criteria

- [ ] POST `/auth/otp/request` accepts phone number
- [ ] Phone number validated for UAE format (+971)
- [ ] 6-digit OTP generated
- [ ] OTP stored in database with 5-minute expiry
- [ ] SMS sent via Twilio
- [ ] Rate limiting: max 3 requests per phone per hour
- [ ] Returns success response without exposing OTP

## Technical Notes

### API Endpoint

```typescript
// POST /auth/otp/request
// Request:
{
  "phone": "+971501234567"
}

// Response (success):
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}

// Response (rate limited):
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Try again in 15 minutes."
  }
}
```

### Zod Schema

```typescript
const otpRequestSchema = z.object({
  phone: z.string()
    .regex(/^\+971[0-9]{9}$/, 'Invalid UAE phone number')
});
```

### Service Implementation

```typescript
// services/auth.service.ts
async requestOTP(phone: string): Promise<{ success: boolean }> {
  // 1. Check rate limit
  const attempts = await this.checkRateLimit(phone);
  if (attempts >= 3) {
    throw new RateLimitError();
  }

  // 2. Generate OTP
  const code = generateOTP(6);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 3. Store in database
  await db.insert(otpCodes).values({
    phone,
    code,
    expiresAt,
  });

  // 4. Send SMS
  await this.sendSMS(phone, `Your verification code is: ${code}`);

  // 5. Increment rate limit
  await this.incrementRateLimit(phone);

  return { success: true };
}
```

### Database Table

```typescript
export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: varchar('phone', { length: 20 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  attempts: integer('attempts').default(0),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
```

## Dependencies

- E1-S2 (API setup)
- E1-S4 (database)
- Twilio account configured

## Blocks

- E2-S2 (OTP verification)

## Estimates

- **Points**: 3
- **Priority**: P0
- **Sprint**: 1
