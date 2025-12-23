# Architecture Document

**Product**: Maid UAE Platform
**Version**: 1.0
**Date**: 2024-12-21
**Status**: Draft

---

## 1. System Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   iOS App   │  │ Android App │  │   Web App   │              │
│  │   (Expo)    │  │   (Expo)    │  │  (Vercel)   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│              ┌───────────▼───────────┐                          │
│              │    Hono RPC Client    │                          │
│              │    (Type-Safe API)    │                          │
│              └───────────┬───────────┘                          │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                    CLOUDFLARE EDGE                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Cloudflare Workers (Hono API)               │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │  Auth   │ │  Maids  │ │ Offices │ │ Quotes  │       │    │
│  │  │ Routes  │ │ Routes  │ │ Routes  │ │ Routes  │       │    │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │    │
│  │       └───────────┴──────────┴───────────┘             │    │
│  │                        │                                │    │
│  │              ┌─────────▼─────────┐                      │    │
│  │              │    Middleware     │                      │    │
│  │              │ Auth │ Tenant │ Rate│                    │    │
│  │              └─────────┬─────────┘                      │    │
│  └────────────────────────┼────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────┼────────────────────────────────┐    │
│  │                        ▼                                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │  R2 Bucket  │  │   KV Store  │  │   Queues    │      │    │
│  │  │  (Images)   │  │  (Cache)    │  │  (Async)    │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Hyperdrive Connection
┌──────────────────────────▼──────────────────────────────────────┐
│                      NEON DATABASE                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              PostgreSQL (Serverless)                     │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │ offices │ │  users  │ │  maids  │ │ quotes  │       │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Twilio    │  │    Expo     │  │   Sentry    │              │
│  │  (SMS OTP)  │  │   (Push)    │  │  (Errors)   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Backend Runtime** | Cloudflare Workers | Latest |
| **API Framework** | Hono | 4.x |
| **Database** | Neon PostgreSQL | 16 |
| **ORM** | Drizzle | 0.38+ |
| **Mobile Framework** | React Native | 0.76+ |
| **Mobile Toolkit** | Expo | SDK 54+ |
| **UI Library** | Gluestack UI | v3 |
| **Styling** | NativeWind | 4.x |
| **State** | Zustand + React Query | Latest |
| **Validation** | Zod | 3.x |
| **Language** | TypeScript | 5.x |

---

## 2. Project Structure

### 2.1 Monorepo Layout

```
maid/
├── apps/
│   ├── api/                          # Hono Backend
│   │   ├── src/
│   │   │   ├── index.ts              # Entry point
│   │   │   ├── app.ts                # Hono app setup
│   │   │   ├── routes/
│   │   │   │   ├── index.ts          # Route aggregator
│   │   │   │   ├── auth.ts           # POST /auth/otp/*
│   │   │   │   ├── offices.ts        # /offices/*
│   │   │   │   ├── maids.ts          # /maids/*
│   │   │   │   ├── quotations.ts     # /quotations/*
│   │   │   │   ├── uploads.ts        # /uploads/*
│   │   │   │   └── health.ts         # /health
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           # JWT verification
│   │   │   │   ├── tenant.ts         # Office context
│   │   │   │   ├── rate-limit.ts     # OTP throttling
│   │   │   │   └── error.ts          # Error handler
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── maid.service.ts
│   │   │   │   ├── office.service.ts
│   │   │   │   ├── quotation.service.ts
│   │   │   │   ├── upload.service.ts
│   │   │   │   └── sms.service.ts
│   │   │   ├── db/
│   │   │   │   ├── index.ts          # Drizzle client
│   │   │   │   ├── schema.ts         # All tables
│   │   │   │   └── migrations/
│   │   │   ├── validators/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── maid.ts
│   │   │   │   ├── office.ts
│   │   │   │   └── quotation.ts
│   │   │   ├── lib/
│   │   │   │   ├── constants.ts
│   │   │   │   ├── errors.ts
│   │   │   │   ├── jwt.ts
│   │   │   │   └── otp.ts
│   │   │   └── types/
│   │   │       └── env.ts            # Cloudflare bindings
│   │   ├── drizzle/
│   │   │   └── migrations/
│   │   ├── wrangler.toml
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                       # Expo App
│       ├── app/                      # Expo Router
│       │   ├── _layout.tsx           # Root layout
│       │   ├── index.tsx             # Redirect
│       │   ├── (auth)/
│       │   │   ├── _layout.tsx
│       │   │   ├── login.tsx
│       │   │   └── verify.tsx
│       │   ├── (office)/
│       │   │   ├── _layout.tsx
│       │   │   └── (tabs)/
│       │   │       ├── _layout.tsx
│       │   │       ├── index.tsx     # Dashboard
│       │   │       ├── maids/
│       │   │       │   ├── index.tsx
│       │   │       │   ├── [id].tsx
│       │   │       │   └── create.tsx
│       │   │       ├── quotations.tsx
│       │   │       └── settings.tsx
│       │   ├── (customer)/
│       │   │   ├── _layout.tsx
│       │   │   └── (tabs)/
│       │   │       ├── _layout.tsx
│       │   │       ├── index.tsx     # Home
│       │   │       ├── search.tsx
│       │   │       ├── favorites.tsx
│       │   │       └── profile.tsx
│       │   └── maid/
│       │       └── [id]/
│       │           ├── index.tsx     # Detail
│       │           ├── gallery.tsx
│       │           └── quote.tsx
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/               # Gluestack
│       │   │   ├── maid/
│       │   │   ├── office/
│       │   │   └── common/
│       │   ├── hooks/
│       │   │   ├── use-auth.ts
│       │   │   ├── use-maids.ts
│       │   │   └── use-locale.ts
│       │   ├── lib/
│       │   │   ├── api/
│       │   │   │   └── client.ts     # Hono RPC
│       │   │   ├── i18n/
│       │   │   └── utils/
│       │   ├── store/
│       │   │   ├── auth.ts
│       │   │   └── preferences.ts
│       │   └── locales/
│       │       ├── ar.json
│       │       └── en.json
│       ├── assets/
│       ├── app.config.ts
│       ├── metro.config.js
│       ├── tailwind.config.js
│       ├── global.css
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                       # Shared types
│       ├── types/
│       └── package.json
│
├── docs/
│   ├── project-brief.md
│   ├── PRD.md
│   ├── architecture.md
│   ├── epics/
│   └── stories/
│
├── .claude/                          # Claude Code config
│   ├── CLAUDE.md
│   ├── settings.json
│   ├── mcp.json
│   ├── agents/
│   └── commands/
│
├── _bmad/                            # BMAD templates
│
├── package.json                      # Root package
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐
│    offices      │     │     users       │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │◄────┤ officeId (FK)   │
│ name            │     │ id (PK)         │
│ nameAr          │     │ phone (unique)  │
│ licenseNumber   │     │ role            │
│ phone           │     │ name            │
│ email           │     │ isActive        │
│ emirate         │     └────────┬────────┘
│ logoUrl         │              │
│ isActive        │              │
└────────┬────────┘              │
         │                       │
         │ 1:N                   │ 1:N
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│     maids       │     │   customers     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ officeId (FK)   │     │ userId (FK)     │
│ fullName        │     │ name            │
│ nationalityId   │     │ phone           │
│ age             │     │ emirate         │
│ religion        │     └────────┬────────┘
│ maritalStatus   │              │
│ experienceYears │              │
│ status          │              │
│ photoUrl        │              │ 1:N
│ monthlySalary   │              │
└────────┬────────┘              │
         │                       │
         │ 1:N                   │
         │         ┌─────────────┘
         │         │
         ▼         ▼
┌─────────────────────────┐
│      quotations         │
├─────────────────────────┤
│ id (PK)                 │
│ quotationNumber         │
│ officeId (FK)           │
│ maidId (FK)             │
│ customerId (FK)         │
│ status                  │
│ baseSalary              │
│ totalAmount             │
│ validUntil              │
└─────────────────────────┘
```

### 3.2 Table Definitions (Drizzle)

```typescript
// apps/api/src/db/schema.ts

import { pgTable, uuid, varchar, text, timestamp,
         boolean, integer, decimal, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ========== ENUMS ==========

export const userRoleEnum = pgEnum('user_role', [
  'super_admin', 'office_admin', 'office_staff', 'customer'
]);

export const maidStatusEnum = pgEnum('maid_status', [
  'available', 'busy', 'reserved', 'inactive'
]);

export const maritalStatusEnum = pgEnum('marital_status', [
  'single', 'married', 'divorced', 'widowed'
]);

export const religionEnum = pgEnum('religion', [
  'muslim', 'non_muslim'
]);

export const quotationStatusEnum = pgEnum('quotation_status', [
  'pending', 'sent', 'accepted', 'rejected', 'expired'
]);

// ========== TABLES ==========

export const offices = pgTable('offices', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  licenseNumber: varchar('license_number', { length: 100 }).unique(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  addressAr: text('address_ar'),
  emirate: varchar('emirate', { length: 100 }),
  logoUrl: varchar('logo_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  phoneIdx: index('offices_phone_idx').on(t.phone),
}));

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  phoneVerified: boolean('phone_verified').default(false),
  name: varchar('name', { length: 255 }),
  role: userRoleEnum('role').default('customer'),
  officeId: uuid('office_id').references(() => offices.id),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  phoneIdx: index('users_phone_idx').on(t.phone),
  officeIdx: index('users_office_idx').on(t.officeId),
}));

export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: varchar('phone', { length: 20 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  attempts: integer('attempts').default(0),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  phoneIdx: index('otp_phone_idx').on(t.phone),
}));

export const nationalities = pgTable('nationalities', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 3 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }),
  isActive: boolean('is_active').default(true),
});

export const languages = pgTable('languages', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 5 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }),
  isActive: boolean('is_active').default(true),
});

export const maids = pgTable('maids', {
  id: uuid('id').defaultRandom().primaryKey(),
  officeId: uuid('office_id').references(() => offices.id).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  fullNameAr: varchar('full_name_ar', { length: 255 }),
  dateOfBirth: timestamp('date_of_birth'),
  age: integer('age'),
  nationalityId: uuid('nationality_id').references(() => nationalities.id),
  passportNumber: varchar('passport_number', { length: 50 }),
  passportExpiry: timestamp('passport_expiry'),
  status: maidStatusEnum('status').default('available'),
  maritalStatus: maritalStatusEnum('marital_status'),
  religion: religionEnum('religion'),
  numberOfChildren: integer('number_of_children').default(0),
  experienceYears: integer('experience_years').default(0),
  skills: text('skills'), // JSON array
  height: integer('height'),
  weight: integer('weight'),
  photoUrl: varchar('photo_url', { length: 500 }),
  monthlySalary: decimal('monthly_salary', { precision: 10, scale: 2 }),
  contractFee: decimal('contract_fee', { precision: 10, scale: 2 }),
  notes: text('notes'),
  notesAr: text('notes_ar'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  officeIdx: index('maids_office_idx').on(t.officeId),
  statusIdx: index('maids_status_idx').on(t.status),
  nationalityIdx: index('maids_nationality_idx').on(t.nationalityId),
}));

export const maidLanguages = pgTable('maid_languages', {
  id: uuid('id').defaultRandom().primaryKey(),
  maidId: uuid('maid_id').references(() => maids.id).notNull(),
  languageId: uuid('language_id').references(() => languages.id).notNull(),
  proficiency: varchar('proficiency', { length: 20 }).default('basic'),
});

export const maidDocuments = pgTable('maid_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  maidId: uuid('maid_id').references(() => maids.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }),
  url: varchar('url', { length: 500 }).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  emirate: varchar('emirate', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const quotations = pgTable('quotations', {
  id: uuid('id').defaultRandom().primaryKey(),
  quotationNumber: varchar('quotation_number', { length: 50 }).notNull().unique(),
  officeId: uuid('office_id').references(() => offices.id).notNull(),
  customerId: uuid('customer_id').references(() => customers.id),
  maidId: uuid('maid_id').references(() => maids.id),
  status: quotationStatusEnum('status').default('pending'),
  baseSalary: decimal('base_salary', { precision: 10, scale: 2 }),
  contractFee: decimal('contract_fee', { precision: 10, scale: 2 }),
  visaFee: decimal('visa_fee', { precision: 10, scale: 2 }),
  medicalFee: decimal('medical_fee', { precision: 10, scale: 2 }),
  otherFees: decimal('other_fees', { precision: 10, scale: 2 }),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  notes: text('notes'),
  validUntil: timestamp('valid_until'),
  sentAt: timestamp('sent_at'),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  officeIdx: index('quotations_office_idx').on(t.officeId),
  statusIdx: index('quotations_status_idx').on(t.status),
}));

export const favorites = pgTable('favorites', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  maidId: uuid('maid_id').references(() => maids.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 4. API Design

### 4.1 API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Auth** ||||
| POST | `/auth/otp/request` | Request OTP | No |
| POST | `/auth/otp/verify` | Verify OTP, get tokens | No |
| POST | `/auth/refresh` | Refresh access token | Yes |
| GET | `/auth/me` | Get current user | Yes |
| **Offices** ||||
| GET | `/offices/:id` | Get office details | Partial |
| PUT | `/offices/:id` | Update office | Office |
| **Maids** ||||
| GET | `/maids` | List maids (public) | Partial |
| GET | `/maids/:id` | Get maid detail | Partial |
| POST | `/maids` | Create maid | Office |
| PUT | `/maids/:id` | Update maid | Office |
| PATCH | `/maids/:id/status` | Update status | Office |
| DELETE | `/maids/:id` | Delete maid | Office |
| **Quotations** ||||
| GET | `/quotations` | List quotations | Yes |
| POST | `/quotations` | Create quotation request | Customer |
| GET | `/quotations/:id` | Get quotation | Yes |
| PATCH | `/quotations/:id` | Update quotation | Office |
| POST | `/quotations/:id/send` | Send to customer | Office |
| POST | `/quotations/:id/accept` | Accept quotation | Customer |
| **Uploads** ||||
| POST | `/uploads/presigned` | Get presigned URL | Yes |
| **Health** ||||
| GET | `/health` | Health check | No |

### 4.2 Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  }
}

// Paginated Response
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 4.3 Authentication Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Client  │                    │   API   │                    │ Twilio  │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ POST /auth/otp/request       │                              │
     │ { phone: "+971..." }         │                              │
     │─────────────────────────────>│                              │
     │                              │                              │
     │                              │ Generate OTP                 │
     │                              │ Store in DB                  │
     │                              │                              │
     │                              │ Send SMS                     │
     │                              │─────────────────────────────>│
     │                              │<─────────────────────────────│
     │                              │                              │
     │ { success: true }            │                              │
     │<─────────────────────────────│                              │
     │                              │                              │
     │ POST /auth/otp/verify        │                              │
     │ { phone, code }              │                              │
     │─────────────────────────────>│                              │
     │                              │                              │
     │                              │ Verify OTP                   │
     │                              │ Create/Find User             │
     │                              │ Generate JWT                 │
     │                              │                              │
     │ { accessToken,               │                              │
     │   refreshToken, user }       │                              │
     │<─────────────────────────────│                              │
     │                              │                              │
```

---

## 5. Mobile Architecture

### 5.1 Navigation Structure

```
RootNavigator
├── AuthStack (unauthenticated)
│   ├── LoginScreen
│   └── VerifyScreen
│
├── OfficeStack (role: office_admin)
│   └── OfficeTabs
│       ├── DashboardTab
│       │   └── DashboardScreen
│       ├── MaidsTab
│       │   ├── MaidListScreen
│       │   ├── MaidDetailScreen
│       │   └── MaidFormScreen
│       ├── QuotationsTab
│       │   ├── QuotationListScreen
│       │   └── QuotationDetailScreen
│       └── SettingsTab
│           └── OfficeSettingsScreen
│
└── CustomerStack (role: customer)
    └── CustomerTabs
        ├── HomeTab
        │   └── HomeScreen
        ├── SearchTab
        │   ├── SearchScreen
        │   └── FilterSheet
        ├── FavoritesTab
        │   └── FavoritesScreen
        └── ProfileTab
            └── ProfileScreen
    └── SharedScreens
        ├── MaidDetailScreen
        ├── GalleryScreen
        └── QuoteRequestScreen
```

### 5.2 State Management

```typescript
// Zustand Stores

// Auth Store
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => SecureStore) }
  )
);

// Preferences Store
const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: 'ar',
      theme: 'light',
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'preferences-storage' }
  )
);

// React Query for Server State
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
    },
  },
});
```

### 5.3 API Client Setup

```typescript
// src/lib/api/client.ts
import { hc } from 'hono/client';
import type { AppType } from '@maid/api';
import { useAuthStore } from '@/store/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = hc<AppType>(API_URL, {
  fetch: async (input, init) => {
    const token = useAuthStore.getState().token;
    const headers = new Headers(init?.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(input, { ...init, headers });
  },
});

// Usage:
// const maids = await api.maids.$get({ query: { status: 'available' } });
// const maid = await api.maids[':id'].$get({ param: { id: '123' } });
```

---

## 6. Security Architecture

### 6.1 Authentication

- **Method**: Phone OTP (no passwords)
- **Tokens**: JWT with short expiry (15 min access, 7 day refresh)
- **Storage**: SecureStore (iOS Keychain / Android Keystore)
- **Rate Limiting**: 3 OTP requests per hour per phone

### 6.2 Authorization

| Role | Permissions |
|------|-------------|
| `super_admin` | All operations |
| `office_admin` | Manage own office, maids, quotations |
| `office_staff` | View/edit maids, respond to quotations |
| `customer` | Browse maids, create quotations, manage profile |

### 6.3 Data Security

- All API traffic over HTTPS
- Database connections via Hyperdrive (encrypted)
- Sensitive data encrypted at rest (Neon)
- PII minimization in logs
- R2 presigned URLs for secure uploads

---

## 7. Deployment Architecture

### 7.1 Environments

| Environment | API URL | Database | Purpose |
|-------------|---------|----------|---------|
| Development | localhost:8787 | Neon dev branch | Local development |
| Staging | api-staging.maid.ae | Neon staging branch | Testing |
| Production | api.maid.ae | Neon main branch | Live |

### 7.2 CI/CD Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────>│   Actions   │────>│  Cloudflare │
│   (Push)    │     │   (Build)   │     │  (Deploy)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Vercel    │
                    │   (Web)     │
                    └─────────────┘
```

### 7.3 Cloudflare Configuration

```toml
# wrangler.toml
name = "maid-api"
main = "src/index.ts"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "..."

[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "maid-uploads"

[[hyperdrive]]
binding = "HYPERDRIVE"
id = "..."

[env.staging]
name = "maid-api-staging"

[env.production]
name = "maid-api-production"
```

---

## 8. Monitoring & Observability

### 8.1 Logging

- **API**: Cloudflare Workers Logs
- **Mobile**: Sentry for errors
- **Database**: Neon query logs

### 8.2 Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API latency (p95) | < 500ms | > 1s |
| Error rate | < 1% | > 5% |
| Database connections | < 100 | > 80 |
| R2 storage | < 10GB | > 8GB |

### 8.3 Alerting

- Sentry for error tracking
- Cloudflare analytics for traffic
- Neon dashboard for database health

---

## 9. Scalability Considerations

### 9.1 Current Capacity

| Component | Limit | Expected Load |
|-----------|-------|---------------|
| Workers requests | 100K/day (free) | 10K/day |
| Neon compute | 0.25 CU | 0.1 CU |
| R2 storage | 10GB | 2GB |

### 9.2 Scaling Path

1. **Phase 1 (MVP)**: Free tiers sufficient
2. **Phase 2 (Growth)**: Workers Paid ($5/mo), Neon Scale
3. **Phase 3 (Scale)**: Workers Enterprise, Neon Pro

---

## 10. Technical Decisions Log

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Backend framework | Hono | Type-safe RPC, edge-native | 2024-12-21 |
| Database | Neon PostgreSQL | Serverless, Hyperdrive support | 2024-12-21 |
| ORM | Drizzle | Lightweight, type-safe | 2024-12-21 |
| Mobile framework | Expo | Cross-platform, web deploy | 2024-12-21 |
| UI library | Gluestack | RTL support, NativeWind | 2024-12-21 |
| Auth method | Phone OTP | UAE standard, no passwords | 2024-12-21 |
| File storage | Cloudflare R2 | Integrated, CDN included | 2024-12-21 |
