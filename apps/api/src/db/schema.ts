import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'office_admin', 'super_admin']);
export const maidStatusEnum = pgEnum('maid_status', ['available', 'busy', 'reserved', 'inactive']);
export const maritalStatusEnum = pgEnum('marital_status', ['single', 'married', 'divorced', 'widowed']);
export const religionEnum = pgEnum('religion', ['muslim', 'non_muslim']);
export const quotationStatusEnum = pgEnum('quotation_status', ['pending', 'sent', 'accepted', 'rejected', 'expired']);
export const oauthProviderEnum = pgEnum('oauth_provider', ['google', 'apple']);
export const serviceTypeEnum = pgEnum('service_type', ['individual', 'business', 'cleaning', 'cooking', 'babysitter', 'elderly', 'driver']);

// New enums for client feedback
export const packageTypeEnum = pgEnum('package_type', ['traditional', 'flexible', 'hourly']);
export const cookingSkillsEnum = pgEnum('cooking_skills', ['good', 'average', 'willing_to_learn', 'none']);
export const availabilityTypeEnum = pgEnum('availability_type', ['inside_uae', 'outside_uae']);
export const sexEnum = pgEnum('sex', ['male', 'female']);
export const educationLevelEnum = pgEnum('education_level', ['college', 'high_school', 'primary', 'none']);
export const jobTypeEnum = pgEnum('job_type', ['domestic_worker', 'nurse_caregiver', 'driver']);

// Offices (Recruitment Agencies)
export const offices = pgTable('offices', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  addressAr: text('address_ar'),
  logoUrl: text('logo_url'),
  isVerified: boolean('is_verified').default(false).notNull(),
  // License info
  licenseNumber: varchar('license_number', { length: 100 }),
  licenseExpiry: timestamp('license_expiry'),
  licenseImageUrl: text('license_image_url'),
  // Manager contact
  managerPhone1: varchar('manager_phone_1', { length: 20 }),
  managerPhone2: varchar('manager_phone_2', { length: 20 }),
  // Location
  googleMapsUrl: text('google_maps_url'),
  emirate: varchar('emirate', { length: 50 }),
  website: varchar('website', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  emirateIdx: index('offices_emirate_idx').on(t.emirate),
}));

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: varchar('phone', { length: 20 }).unique(),
  email: varchar('email', { length: 255 }),
  emailVerified: boolean('email_verified').default(false).notNull(),
  password: varchar('password', { length: 255 }),
  name: varchar('name', { length: 255 }),
  nameAr: varchar('name_ar', { length: 255 }),
  role: userRoleEnum('role').default('customer').notNull(),
  officeId: uuid('office_id').references(() => offices.id),
  isDemo: boolean('is_demo').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  phoneIdx: index('users_phone_idx').on(t.phone),
  emailIdx: index('users_email_idx').on(t.email),
  officeIdx: index('users_office_idx').on(t.officeId),
}));

// OAuth Accounts (for Google/Apple sign-in)
export const oauthAccounts = pgTable('oauth_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  provider: oauthProviderEnum('provider').notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: index('oauth_accounts_user_idx').on(t.userId),
  providerIdx: index('oauth_accounts_provider_idx').on(t.provider, t.providerAccountId),
}));

// OTP Codes
export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: varchar('phone', { length: 20 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  phoneIdx: index('otp_phone_idx').on(t.phone),
}));

// Password Reset Tokens
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: index('password_reset_user_idx').on(t.userId),
  tokenIdx: index('password_reset_token_idx').on(t.tokenHash),
}));

// Nationalities
export const nationalities = pgTable('nationalities', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 3 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }).notNull(),
});

// Languages
export const languages = pgTable('languages', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 5 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }).notNull(),
});

// Maids
export const maids = pgTable('maids', {
  id: uuid('id').defaultRandom().primaryKey(),
  officeId: uuid('office_id').references(() => offices.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  nationalityId: uuid('nationality_id').references(() => nationalities.id).notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  maritalStatus: maritalStatusEnum('marital_status').notNull(),
  religion: religionEnum('religion').notNull(),
  experienceYears: integer('experience_years').default(0).notNull(),
  salary: decimal('salary', { precision: 10, scale: 2 }).notNull(),
  photoUrl: text('photo_url'),
  status: maidStatusEnum('status').default('available').notNull(),
  serviceType: serviceTypeEnum('service_type').default('individual').notNull(),
  bio: text('bio'),
  bioAr: text('bio_ar'),
  // New fields from client feedback
  sex: sexEnum('sex').default('female'),
  educationLevel: educationLevelEnum('education_level'),
  hasChildren: boolean('has_children').default(false),
  jobType: jobTypeEnum('job_type').default('domestic_worker'),
  packageType: packageTypeEnum('package_type').default('traditional'),
  hasExperience: boolean('has_experience').default(false),
  experienceDetails: varchar('experience_details', { length: 70 }),
  skillsDetails: varchar('skills_details', { length: 70 }),
  cookingSkills: cookingSkillsEnum('cooking_skills'),
  babySitter: boolean('baby_sitter').default(false),
  officeFees: decimal('office_fees', { precision: 10, scale: 2 }),
  availability: availabilityTypeEnum('availability').default('inside_uae'),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }),
  contactNumber: varchar('contact_number', { length: 20 }),
  cvReference: varchar('cv_reference', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  officeIdx: index('maids_office_idx').on(t.officeId),
  statusIdx: index('maids_status_idx').on(t.status),
  nationalityIdx: index('maids_nationality_idx').on(t.nationalityId),
  serviceTypeIdx: index('maids_service_type_idx').on(t.serviceType),
  jobTypeIdx: index('maids_job_type_idx').on(t.jobType),
  packageTypeIdx: index('maids_package_type_idx').on(t.packageType),
  availabilityIdx: index('maids_availability_idx').on(t.availability),
  cvReferenceIdx: index('maids_cv_reference_idx').on(t.cvReference),
}));

// Maid Languages (many-to-many)
export const maidLanguages = pgTable('maid_languages', {
  id: uuid('id').defaultRandom().primaryKey(),
  maidId: uuid('maid_id').references(() => maids.id).notNull(),
  languageId: uuid('language_id').references(() => languages.id).notNull(),
}, (t) => ({
  maidIdx: index('maid_languages_maid_idx').on(t.maidId),
}));

// Maid Documents (photos, passport, etc.)
export const maidDocuments = pgTable('maid_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  maidId: uuid('maid_id').references(() => maids.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'photo', 'passport', 'visa', etc.
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  maidIdx: index('maid_documents_maid_idx').on(t.maidId),
}));

// Customers (additional customer profile data)
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  emirate: varchar('emirate', { length: 50 }),
  preferredLanguage: varchar('preferred_language', { length: 5 }).default('ar'),
  notificationsEnabled: boolean('notifications_enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quotations
export const quotations = pgTable('quotations', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  officeId: uuid('office_id').references(() => offices.id).notNull(),
  maidId: uuid('maid_id').references(() => maids.id).notNull(),
  salary: decimal('salary', { precision: 10, scale: 2 }).notNull(),
  contractMonths: integer('contract_months').default(24).notNull(),
  notes: text('notes'),
  status: quotationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  customerIdx: index('quotations_customer_idx').on(t.customerId),
  officeIdx: index('quotations_office_idx').on(t.officeId),
  maidIdx: index('quotations_maid_idx').on(t.maidId),
}));

// Favorites (customer saved maids)
export const favorites = pgTable('favorites', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  maidId: uuid('maid_id').references(() => maids.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: index('favorites_user_idx').on(t.userId),
}));

// Relations
export const officesRelations = relations(offices, ({ many }) => ({
  users: many(users),
  maids: many(maids),
  quotations: many(quotations),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  office: one(offices, { fields: [users.officeId], references: [offices.id] }),
  customer: one(customers, { fields: [users.id], references: [customers.userId] }),
  oauthAccounts: many(oauthAccounts),
  favorites: many(favorites),
  quotations: many(quotations),
}));

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, { fields: [oauthAccounts.userId], references: [users.id] }),
}));

export const maidsRelations = relations(maids, ({ one, many }) => ({
  office: one(offices, { fields: [maids.officeId], references: [offices.id] }),
  nationality: one(nationalities, { fields: [maids.nationalityId], references: [nationalities.id] }),
  languages: many(maidLanguages),
  documents: many(maidDocuments),
  quotations: many(quotations),
  favorites: many(favorites),
}));

export const maidLanguagesRelations = relations(maidLanguages, ({ one }) => ({
  maid: one(maids, { fields: [maidLanguages.maidId], references: [maids.id] }),
  language: one(languages, { fields: [maidLanguages.languageId], references: [languages.id] }),
}));

export const quotationsRelations = relations(quotations, ({ one }) => ({
  customer: one(users, { fields: [quotations.customerId], references: [users.id] }),
  office: one(offices, { fields: [quotations.officeId], references: [offices.id] }),
  maid: one(maids, { fields: [quotations.maidId], references: [maids.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  maid: one(maids, { fields: [favorites.maidId], references: [maids.id] }),
}));

// ==========================================
// PAYMENT & SUBSCRIPTION SYSTEM
// ==========================================

// Payment & Subscription Enums
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'basic', 'pro', 'enterprise']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'past_due', 'canceled', 'trialing']);
export const billingCycleEnum = pgEnum('billing_cycle', ['monthly', 'yearly']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'succeeded', 'failed', 'refunded']);
export const paymentProviderEnum = pgEnum('payment_provider', ['stripe', 'tabby']);
export const paymentTypeEnum = pgEnum('payment_type', ['cv_unlock', 'subscription', 'business_subscription']);

// Subscription Plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  tier: subscriptionTierEnum('tier').notNull().unique(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }).notNull(),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  priceMonthly: decimal('price_monthly', { precision: 10, scale: 2 }).notNull(),
  priceYearly: decimal('price_yearly', { precision: 10, scale: 2 }),
  maxMaids: integer('max_maids').notNull(), // -1 for unlimited
  stripePriceIdMonthly: varchar('stripe_price_id_monthly', { length: 255 }),
  stripePriceIdYearly: varchar('stripe_price_id_yearly', { length: 255 }),
  features: text('features'), // JSON array of feature strings
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Office Subscriptions
export const officeSubscriptions = pgTable('office_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  officeId: uuid('office_id').references(() => offices.id).notNull().unique(),
  planId: uuid('plan_id').references(() => subscriptionPlans.id).notNull(),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  officeIdx: index('office_subscriptions_office_idx').on(t.officeId),
  statusIdx: index('office_subscriptions_status_idx').on(t.status),
}));

// ==========================================
// BUSINESS CUSTOMER SUBSCRIPTION SYSTEM
// ==========================================

// Business Plans (for customer companies/schools)
export const businessPlans = pgTable('business_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  tier: subscriptionTierEnum('tier').notNull().unique(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }).notNull(),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  priceMonthly: integer('price_monthly').notNull().default(0),
  priceYearly: integer('price_yearly'),
  freeUnlocksPerMonth: integer('free_unlocks_per_month').notNull().default(0),
  discountPercent: integer('discount_percent').notNull().default(0), // % off extra unlocks
  features: text('features'), // JSON array of feature strings
  isActive: boolean('is_active').default(true).notNull(),
  stripePriceIdMonthly: varchar('stripe_price_id_monthly', { length: 255 }),
  stripePriceIdYearly: varchar('stripe_price_id_yearly', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customer Subscriptions (business plan subscriptions)
export const customerSubscriptions = pgTable('customer_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => users.id).notNull().unique(),
  planId: uuid('plan_id').references(() => businessPlans.id).notNull(),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  billingCycle: billingCycleEnum('billing_cycle').default('monthly').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  freeUnlocksUsed: integer('free_unlocks_used').notNull().default(0),
  freeUnlocksResetAt: timestamp('free_unlocks_reset_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  customerIdx: index('customer_subscriptions_customer_idx').on(t.customerId),
  statusIdx: index('customer_subscriptions_status_idx').on(t.status),
  planIdx: index('customer_subscriptions_plan_idx').on(t.planId),
}));

// CV Unlock Pricing (per nationality or flat rate)
export const cvUnlockPricing = pgTable('cv_unlock_pricing', {
  id: uuid('id').defaultRandom().primaryKey(),
  nationalityId: uuid('nationality_id').references(() => nationalities.id), // null = default price
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('AED').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  nationalityIdx: index('cv_unlock_pricing_nationality_idx').on(t.nationalityId),
}));

// Payments (unified for CV unlock + subscription) - defined before cvUnlocks
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: paymentTypeEnum('type').notNull(),
  provider: paymentProviderEnum('provider').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('AED').notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripeChargeId: varchar('stripe_charge_id', { length: 255 }),
  tabbyPaymentId: varchar('tabby_payment_id', { length: 255 }),
  metadata: text('metadata'), // JSON for additional data (maidId, planId, etc.)
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: index('payments_user_idx').on(t.userId),
  statusIdx: index('payments_status_idx').on(t.status),
  typeIdx: index('payments_type_idx').on(t.type),
  stripeIntentIdx: index('payments_stripe_intent_idx').on(t.stripePaymentIntentId),
}));

// CV Unlocks (track which CVs each customer has unlocked)
export const cvUnlocks = pgTable('cv_unlocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  maidId: uuid('maid_id').references(() => maids.id).notNull(),
  paymentId: uuid('payment_id').references(() => payments.id),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
}, (t) => ({
  customerIdx: index('cv_unlocks_customer_idx').on(t.customerId),
  maidIdx: index('cv_unlocks_maid_idx').on(t.maidId),
  customerMaidIdx: index('cv_unlocks_customer_maid_idx').on(t.customerId, t.maidId),
}));

// Payment Methods (saved cards for recurring use)
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  provider: paymentProviderEnum('provider').notNull(),
  stripePaymentMethodId: varchar('stripe_payment_method_id', { length: 255 }),
  cardLast4: varchar('card_last4', { length: 4 }),
  cardBrand: varchar('card_brand', { length: 20 }),
  expiryMonth: integer('expiry_month'),
  expiryYear: integer('expiry_year'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: index('payment_methods_user_idx').on(t.userId),
}));

// Push Tokens (for notifications)
export const pushTokens = pgTable('push_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  token: text('token').notNull(),
  platform: varchar('platform', { length: 10 }).notNull(), // 'ios', 'android'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: index('push_tokens_user_idx').on(t.userId),
  tokenIdx: index('push_tokens_token_idx').on(t.token),
}));

// Audit Logs (admin action tracking)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(), // 'publish_maid', 'suspend_office', etc.
  targetType: varchar('target_type', { length: 50 }).notNull(), // 'maid', 'office', 'user'
  targetId: uuid('target_id').notNull(),
  details: text('details'), // JSON with before/after data
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  adminIdx: index('audit_logs_admin_idx').on(t.adminId),
  targetIdx: index('audit_logs_target_idx').on(t.targetType, t.targetId),
  actionIdx: index('audit_logs_action_idx').on(t.action),
}));

// Platform Settings (global settings)
export const platformSettings = pgTable('platform_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mass Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id').references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  body: text('body').notNull(),
  bodyAr: text('body_ar'),
  targetRole: userRoleEnum('target_role'), // null = all users
  sentCount: integer('sent_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  adminIdx: index('notifications_admin_idx').on(t.adminId),
}));

// ==========================================
// ADDITIONAL RELATIONS
// ==========================================

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(officeSubscriptions),
}));

export const officeSubscriptionsRelations = relations(officeSubscriptions, ({ one }) => ({
  office: one(offices, { fields: [officeSubscriptions.officeId], references: [offices.id] }),
  plan: one(subscriptionPlans, { fields: [officeSubscriptions.planId], references: [subscriptionPlans.id] }),
}));

export const businessPlansRelations = relations(businessPlans, ({ many }) => ({
  subscriptions: many(customerSubscriptions),
}));

export const customerSubscriptionsRelations = relations(customerSubscriptions, ({ one }) => ({
  customer: one(users, { fields: [customerSubscriptions.customerId], references: [users.id] }),
  plan: one(businessPlans, { fields: [customerSubscriptions.planId], references: [businessPlans.id] }),
}));

export const cvUnlocksRelations = relations(cvUnlocks, ({ one }) => ({
  customer: one(users, { fields: [cvUnlocks.customerId], references: [users.id] }),
  maid: one(maids, { fields: [cvUnlocks.maidId], references: [maids.id] }),
  payment: one(payments, { fields: [cvUnlocks.paymentId], references: [payments.id] }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  cvUnlocks: many(cvUnlocks),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, { fields: [paymentMethods.userId], references: [users.id] }),
}));

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, { fields: [pushTokens.userId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(users, { fields: [auditLogs.adminId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  admin: one(users, { fields: [notifications.adminId], references: [users.id] }),
}));

// ==========================================
// WALLET SYSTEM
// ==========================================

export const walletTransactionTypeEnum = pgEnum('wallet_transaction_type', [
  'topup', 'cv_unlock', 'refund', 'bonus', 'adjustment',
]);

// Customer Wallets
export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  balance: decimal('balance', { precision: 10, scale: 2 }).default('0').notNull(),
  currency: varchar('currency', { length: 3 }).default('AED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: index('wallets_user_idx').on(t.userId),
}));

// Wallet Transactions
export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletId: uuid('wallet_id').references(() => wallets.id).notNull(),
  type: walletTransactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  referenceId: uuid('reference_id'), // maidId for cv_unlock, paymentId for topup
  referenceType: varchar('reference_type', { length: 50 }), // 'maid', 'payment'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  walletIdx: index('wallet_transactions_wallet_idx').on(t.walletId),
  typeIdx: index('wallet_transactions_type_idx').on(t.type),
}));

// Wallet Relations
export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(wallets, { fields: [walletTransactions.walletId], references: [wallets.id] }),
}));
