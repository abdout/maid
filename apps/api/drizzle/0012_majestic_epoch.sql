CREATE TYPE "public"."availability_type" AS ENUM('inside_uae', 'outside_uae');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('typing_office', 'visa_transfer');--> statement-breakpoint
CREATE TYPE "public"."cooking_skills" AS ENUM('good', 'average', 'willing_to_learn', 'none');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('college', 'high_school', 'primary', 'none');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('domestic_worker', 'nurse_caregiver', 'driver');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('traditional', 'flexible', 'hourly');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "business_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"phone" varchar(20) NOT NULL,
	"whatsapp" varchar(20),
	"email" varchar(255),
	"address" text,
	"address_ar" text,
	"logo_url" text,
	"cover_photo_url" text,
	"description" text,
	"description_ar" text,
	"emirate" varchar(50),
	"google_maps_url" text,
	"services" text,
	"services_ar" text,
	"price_range" varchar(50),
	"working_hours" varchar(100),
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "sex" "sex" DEFAULT 'female';--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "education_level" "education_level";--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "has_children" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "job_type" "job_type" DEFAULT 'domestic_worker';--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "package_type" "package_type" DEFAULT 'traditional';--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "has_experience" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "experience_details" varchar(70);--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "skills_details" varchar(70);--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "cooking_skills" "cooking_skills";--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "baby_sitter" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "office_fees" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "availability" "availability_type" DEFAULT 'inside_uae';--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "whatsapp_number" varchar(20);--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "contact_number" varchar(20);--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "cv_reference" varchar(50);--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "license_number" varchar(100);--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "license_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "license_image_url" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "manager_phone_1" varchar(20);--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "manager_phone_2" varchar(20);--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "google_maps_url" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "emirate" varchar(50);--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "website" varchar(255);--> statement-breakpoint
CREATE INDEX "businesses_type_idx" ON "businesses" USING btree ("type");--> statement-breakpoint
CREATE INDEX "businesses_emirate_idx" ON "businesses" USING btree ("emirate");--> statement-breakpoint
CREATE INDEX "businesses_active_idx" ON "businesses" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "maids_job_type_idx" ON "maids" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "maids_package_type_idx" ON "maids" USING btree ("package_type");--> statement-breakpoint
CREATE INDEX "maids_availability_idx" ON "maids" USING btree ("availability");--> statement-breakpoint
CREATE INDEX "maids_cv_reference_idx" ON "maids" USING btree ("cv_reference");--> statement-breakpoint
CREATE INDEX "offices_emirate_idx" ON "offices" USING btree ("emirate");