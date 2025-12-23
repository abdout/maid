CREATE TYPE "public"."maid_status" AS ENUM('available', 'busy', 'reserved', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'divorced', 'widowed');--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('pending', 'sent', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."religion" AS ENUM('muslim', 'non_muslim');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'office_admin', 'super_admin');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"emirate" varchar(50),
	"preferred_language" varchar(5) DEFAULT 'ar',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"maid_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(5) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	CONSTRAINT "languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "maid_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"maid_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maid_languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"maid_id" uuid NOT NULL,
	"language_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"office_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"nationality_id" uuid NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"marital_status" "marital_status" NOT NULL,
	"religion" "religion" NOT NULL,
	"experience_years" integer DEFAULT 0 NOT NULL,
	"salary" numeric(10, 2) NOT NULL,
	"photo_url" text,
	"status" "maid_status" DEFAULT 'available' NOT NULL,
	"bio" text,
	"bio_ar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nationalities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(3) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	CONSTRAINT "nationalities_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "offices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"address" text,
	"address_ar" text,
	"logo_url" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "offices_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"office_id" uuid NOT NULL,
	"maid_id" uuid NOT NULL,
	"salary" numeric(10, 2) NOT NULL,
	"contract_months" integer DEFAULT 24 NOT NULL,
	"notes" text,
	"status" "quotation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"name" varchar(255),
	"name_ar" varchar(255),
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"office_id" uuid,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_maid_id_maids_id_fk" FOREIGN KEY ("maid_id") REFERENCES "public"."maids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maid_documents" ADD CONSTRAINT "maid_documents_maid_id_maids_id_fk" FOREIGN KEY ("maid_id") REFERENCES "public"."maids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maid_languages" ADD CONSTRAINT "maid_languages_maid_id_maids_id_fk" FOREIGN KEY ("maid_id") REFERENCES "public"."maids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maid_languages" ADD CONSTRAINT "maid_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maids" ADD CONSTRAINT "maids_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maids" ADD CONSTRAINT "maids_nationality_id_nationalities_id_fk" FOREIGN KEY ("nationality_id") REFERENCES "public"."nationalities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_maid_id_maids_id_fk" FOREIGN KEY ("maid_id") REFERENCES "public"."maids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favorites_user_idx" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "maid_documents_maid_idx" ON "maid_documents" USING btree ("maid_id");--> statement-breakpoint
CREATE INDEX "maid_languages_maid_idx" ON "maid_languages" USING btree ("maid_id");--> statement-breakpoint
CREATE INDEX "maids_office_idx" ON "maids" USING btree ("office_id");--> statement-breakpoint
CREATE INDEX "maids_status_idx" ON "maids" USING btree ("status");--> statement-breakpoint
CREATE INDEX "maids_nationality_idx" ON "maids" USING btree ("nationality_id");--> statement-breakpoint
CREATE INDEX "otp_phone_idx" ON "otp_codes" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "quotations_customer_idx" ON "quotations" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "quotations_office_idx" ON "quotations" USING btree ("office_id");--> statement-breakpoint
CREATE INDEX "quotations_maid_idx" ON "quotations" USING btree ("maid_id");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_office_idx" ON "users" USING btree ("office_id");