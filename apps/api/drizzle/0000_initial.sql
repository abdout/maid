-- Enums
CREATE TYPE "user_role" AS ENUM ('customer', 'office_admin', 'super_admin');
CREATE TYPE "maid_status" AS ENUM ('available', 'busy', 'reserved', 'inactive');
CREATE TYPE "marital_status" AS ENUM ('single', 'married', 'divorced', 'widowed');
CREATE TYPE "religion" AS ENUM ('muslim', 'non_muslim');
CREATE TYPE "quotation_status" AS ENUM ('pending', 'sent', 'accepted', 'rejected', 'expired');

-- Offices (Recruitment Agencies)
CREATE TABLE "offices" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "name_ar" VARCHAR(255),
  "phone" VARCHAR(20) NOT NULL UNIQUE,
  "email" VARCHAR(255),
  "address" TEXT,
  "address_ar" TEXT,
  "logo_url" TEXT,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "phone" VARCHAR(20) NOT NULL UNIQUE,
  "name" VARCHAR(255),
  "name_ar" VARCHAR(255),
  "role" "user_role" NOT NULL DEFAULT 'customer',
  "office_id" UUID REFERENCES "offices"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "users_phone_idx" ON "users"("phone");
CREATE INDEX "users_office_idx" ON "users"("office_id");

-- OTP Codes
CREATE TABLE "otp_codes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "phone" VARCHAR(20) NOT NULL,
  "code" VARCHAR(6) NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "otp_phone_idx" ON "otp_codes"("phone");

-- Nationalities
CREATE TABLE "nationalities" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" VARCHAR(3) NOT NULL UNIQUE,
  "name_en" VARCHAR(100) NOT NULL,
  "name_ar" VARCHAR(100) NOT NULL
);

-- Languages
CREATE TABLE "languages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" VARCHAR(5) NOT NULL UNIQUE,
  "name_en" VARCHAR(100) NOT NULL,
  "name_ar" VARCHAR(100) NOT NULL
);

-- Maids
CREATE TABLE "maids" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "office_id" UUID NOT NULL REFERENCES "offices"("id"),
  "name" VARCHAR(255) NOT NULL,
  "name_ar" VARCHAR(255),
  "nationality_id" UUID NOT NULL REFERENCES "nationalities"("id"),
  "date_of_birth" TIMESTAMP NOT NULL,
  "marital_status" "marital_status" NOT NULL,
  "religion" "religion" NOT NULL,
  "experience_years" INTEGER NOT NULL DEFAULT 0,
  "salary" DECIMAL(10, 2) NOT NULL,
  "photo_url" TEXT,
  "status" "maid_status" NOT NULL DEFAULT 'available',
  "bio" TEXT,
  "bio_ar" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "maids_office_idx" ON "maids"("office_id");
CREATE INDEX "maids_status_idx" ON "maids"("status");
CREATE INDEX "maids_nationality_idx" ON "maids"("nationality_id");

-- Maid Languages (many-to-many)
CREATE TABLE "maid_languages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "maid_id" UUID NOT NULL REFERENCES "maids"("id") ON DELETE CASCADE,
  "language_id" UUID NOT NULL REFERENCES "languages"("id")
);

CREATE INDEX "maid_languages_maid_idx" ON "maid_languages"("maid_id");

-- Maid Documents
CREATE TABLE "maid_documents" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "maid_id" UUID NOT NULL REFERENCES "maids"("id") ON DELETE CASCADE,
  "type" VARCHAR(50) NOT NULL,
  "url" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "maid_documents_maid_idx" ON "maid_documents"("maid_id");

-- Customers
CREATE TABLE "customers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id"),
  "emirate" VARCHAR(50),
  "preferred_language" VARCHAR(5) DEFAULT 'ar',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Quotations
CREATE TABLE "quotations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" UUID NOT NULL REFERENCES "users"("id"),
  "office_id" UUID NOT NULL REFERENCES "offices"("id"),
  "maid_id" UUID NOT NULL REFERENCES "maids"("id"),
  "salary" DECIMAL(10, 2) NOT NULL,
  "contract_months" INTEGER NOT NULL DEFAULT 24,
  "notes" TEXT,
  "status" "quotation_status" NOT NULL DEFAULT 'pending',
  "expires_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "quotations_customer_idx" ON "quotations"("customer_id");
CREATE INDEX "quotations_office_idx" ON "quotations"("office_id");
CREATE INDEX "quotations_maid_idx" ON "quotations"("maid_id");

-- Favorites
CREATE TABLE "favorites" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "maid_id" UUID NOT NULL REFERENCES "maids"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("user_id", "maid_id")
);

CREATE INDEX "favorites_user_idx" ON "favorites"("user_id");
