-- Migration: Add client feedback fields for offices and maids tables
-- Date: 2026-01-12

-- ==========================================
-- NEW ENUMS
-- ==========================================

-- Package type for maids
CREATE TYPE "package_type" AS ENUM ('traditional', 'flexible', 'hourly');

-- Cooking skills level
CREATE TYPE "cooking_skills" AS ENUM ('good', 'average', 'willing_to_learn', 'none');

-- Availability location
CREATE TYPE "availability_type" AS ENUM ('inside_uae', 'outside_uae');

-- Sex/Gender
CREATE TYPE "sex" AS ENUM ('male', 'female');

-- Education level
CREATE TYPE "education_level" AS ENUM ('college', 'high_school', 'primary', 'none');

-- Job type
CREATE TYPE "job_type" AS ENUM ('domestic_worker', 'nurse_caregiver', 'driver');

-- ==========================================
-- OFFICES TABLE ADDITIONS
-- ==========================================

-- License information
ALTER TABLE "offices" ADD COLUMN "license_number" varchar(100);
ALTER TABLE "offices" ADD COLUMN "license_expiry" date;
ALTER TABLE "offices" ADD COLUMN "license_image_url" text;

-- Manager contact info
ALTER TABLE "offices" ADD COLUMN "manager_phone_1" varchar(20);
ALTER TABLE "offices" ADD COLUMN "manager_phone_2" varchar(20);

-- Location info
ALTER TABLE "offices" ADD COLUMN "google_maps_url" text;
ALTER TABLE "offices" ADD COLUMN "emirate" varchar(50);
ALTER TABLE "offices" ADD COLUMN "website" varchar(255);

-- ==========================================
-- MAIDS TABLE ADDITIONS
-- ==========================================

-- Basic profile additions
ALTER TABLE "maids" ADD COLUMN "sex" "sex" DEFAULT 'female';
ALTER TABLE "maids" ADD COLUMN "education_level" "education_level";
ALTER TABLE "maids" ADD COLUMN "has_children" boolean DEFAULT false;

-- Job and package info
ALTER TABLE "maids" ADD COLUMN "job_type" "job_type" DEFAULT 'domestic_worker';
ALTER TABLE "maids" ADD COLUMN "package_type" "package_type" DEFAULT 'traditional';

-- Experience and skills
ALTER TABLE "maids" ADD COLUMN "has_experience" boolean DEFAULT false;
ALTER TABLE "maids" ADD COLUMN "experience_details" varchar(70);
ALTER TABLE "maids" ADD COLUMN "skills_details" varchar(70);
ALTER TABLE "maids" ADD COLUMN "cooking_skills" "cooking_skills";
ALTER TABLE "maids" ADD COLUMN "baby_sitter" boolean DEFAULT false;

-- Pricing and availability
ALTER TABLE "maids" ADD COLUMN "office_fees" decimal(10, 2);
ALTER TABLE "maids" ADD COLUMN "availability" "availability_type" DEFAULT 'inside_uae';

-- Contact info
ALTER TABLE "maids" ADD COLUMN "whatsapp_number" varchar(20);
ALTER TABLE "maids" ADD COLUMN "contact_number" varchar(20);
ALTER TABLE "maids" ADD COLUMN "cv_reference" varchar(50);

-- ==========================================
-- INDEXES
-- ==========================================

-- Index for filtering by job type
CREATE INDEX "maids_job_type_idx" ON "maids" ("job_type");

-- Index for filtering by package type
CREATE INDEX "maids_package_type_idx" ON "maids" ("package_type");

-- Index for filtering by availability
CREATE INDEX "maids_availability_idx" ON "maids" ("availability");

-- Index for CV reference lookups
CREATE INDEX "maids_cv_reference_idx" ON "maids" ("cv_reference");

-- Index for offices by emirate
CREATE INDEX "offices_emirate_idx" ON "offices" ("emirate");
