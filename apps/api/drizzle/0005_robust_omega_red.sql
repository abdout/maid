CREATE TYPE "public"."payment_provider" AS ENUM('stripe', 'tabby');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('cv_unlock', 'subscription');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'basic', 'pro', 'enterprise');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" uuid NOT NULL,
	"details" text,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cv_unlock_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nationality_id" uuid,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'AED' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cv_unlocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"maid_id" uuid NOT NULL,
	"payment_id" uuid,
	"unlocked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"title" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"body" text NOT NULL,
	"body_ar" text,
	"target_role" "user_role",
	"sent_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "office_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"office_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "office_subscriptions_office_id_unique" UNIQUE("office_id")
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"stripe_payment_method_id" varchar(255),
	"card_last4" varchar(4),
	"card_brand" varchar(20),
	"expiry_month" integer,
	"expiry_year" integer,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "payment_type" NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'AED' NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"stripe_charge_id" varchar(255),
	"tabby_payment_id" varchar(255),
	"metadata" text,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"platform" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "subscription_tier" NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"description_en" text,
	"description_ar" text,
	"price_monthly" numeric(10, 2) NOT NULL,
	"price_yearly" numeric(10, 2),
	"max_maids" integer NOT NULL,
	"stripe_price_id_monthly" varchar(255),
	"stripe_price_id_yearly" varchar(255),
	"features" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plans_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_unlock_pricing" ADD CONSTRAINT "cv_unlock_pricing_nationality_id_nationalities_id_fk" FOREIGN KEY ("nationality_id") REFERENCES "public"."nationalities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_unlocks" ADD CONSTRAINT "cv_unlocks_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_unlocks" ADD CONSTRAINT "cv_unlocks_maid_id_maids_id_fk" FOREIGN KEY ("maid_id") REFERENCES "public"."maids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_unlocks" ADD CONSTRAINT "cv_unlocks_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_subscriptions" ADD CONSTRAINT "office_subscriptions_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_subscriptions" ADD CONSTRAINT "office_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_admin_idx" ON "audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "audit_logs_target_idx" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "cv_unlock_pricing_nationality_idx" ON "cv_unlock_pricing" USING btree ("nationality_id");--> statement-breakpoint
CREATE INDEX "cv_unlocks_customer_idx" ON "cv_unlocks" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "cv_unlocks_maid_idx" ON "cv_unlocks" USING btree ("maid_id");--> statement-breakpoint
CREATE INDEX "cv_unlocks_customer_maid_idx" ON "cv_unlocks" USING btree ("customer_id","maid_id");--> statement-breakpoint
CREATE INDEX "notifications_admin_idx" ON "notifications" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "office_subscriptions_office_idx" ON "office_subscriptions" USING btree ("office_id");--> statement-breakpoint
CREATE INDEX "office_subscriptions_status_idx" ON "office_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_methods_user_idx" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_type_idx" ON "payments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "payments_stripe_intent_idx" ON "payments" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "push_tokens_user_idx" ON "push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "push_tokens_token_idx" ON "push_tokens" USING btree ("token");