-- Migration: Add business plans for customer subscriptions
-- This creates the business plans system separate from office subscriptions

-- Add billing_cycle enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create business_plans table
CREATE TABLE IF NOT EXISTS "business_plans" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tier" "subscription_tier" NOT NULL UNIQUE,
    "name_en" varchar(100) NOT NULL,
    "name_ar" varchar(100) NOT NULL,
    "description_en" text,
    "description_ar" text,
    "price_monthly" integer DEFAULT 0 NOT NULL,
    "price_yearly" integer,
    "free_unlocks_per_month" integer DEFAULT 0 NOT NULL,
    "discount_percent" integer DEFAULT 0 NOT NULL,
    "features" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "stripe_price_id_monthly" varchar(255),
    "stripe_price_id_yearly" varchar(255),
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create customer_subscriptions table
CREATE TABLE IF NOT EXISTS "customer_subscriptions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "customer_id" uuid NOT NULL UNIQUE REFERENCES "users"("id"),
    "plan_id" uuid NOT NULL REFERENCES "business_plans"("id"),
    "status" "subscription_status" DEFAULT 'active' NOT NULL,
    "billing_cycle" "billing_cycle" DEFAULT 'monthly' NOT NULL,
    "stripe_customer_id" varchar(255),
    "stripe_subscription_id" varchar(255),
    "current_period_start" timestamp,
    "current_period_end" timestamp,
    "cancel_at_period_end" boolean DEFAULT false NOT NULL,
    "free_unlocks_used" integer DEFAULT 0 NOT NULL,
    "free_unlocks_reset_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for customer_subscriptions
CREATE INDEX IF NOT EXISTS "customer_subscriptions_customer_idx" ON "customer_subscriptions" ("customer_id");
CREATE INDEX IF NOT EXISTS "customer_subscriptions_status_idx" ON "customer_subscriptions" ("status");
CREATE INDEX IF NOT EXISTS "customer_subscriptions_plan_idx" ON "customer_subscriptions" ("plan_id");

-- Seed default business plans
INSERT INTO "business_plans" ("tier", "name_en", "name_ar", "description_en", "description_ar", "price_monthly", "price_yearly", "free_unlocks_per_month", "discount_percent", "features", "is_active")
VALUES
    ('free', 'Free', 'مجاني', 'Pay per CV unlock', 'ادفع مقابل كل فتح سيرة ذاتية', 0, 0, 0, 0, '["Pay 99 AED per unlock", "Basic support"]', true),
    ('basic', 'Basic', 'أساسي', '10 free unlocks/month + 20% off', '10 فتح مجاني شهرياً + خصم 20%', 149, 1490, 10, 20, '["10 free CV unlocks/month", "20% off additional unlocks", "Priority support"]', true),
    ('pro', 'Pro', 'احترافي', '30 free unlocks/month + 40% off', '30 فتح مجاني شهرياً + خصم 40%', 349, 3490, 30, 40, '["30 free CV unlocks/month", "40% off additional unlocks", "Dedicated account manager", "Priority support"]', true),
    ('enterprise', 'Enterprise', 'مؤسسي', 'Unlimited unlocks + best pricing', 'فتح غير محدود + أفضل الأسعار', 999, 9990, 999, 50, '["Unlimited CV unlocks", "50% off if exceeded", "Dedicated account manager", "Custom solutions", "24/7 support"]', true)
ON CONFLICT (tier) DO NOTHING;
