CREATE TYPE "public"."hiring_type" AS ENUM('customer_visa', 'monthly_yearly', 'hourly_daily');--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "hiring_type" "hiring_type" DEFAULT 'monthly_yearly';--> statement-breakpoint
CREATE INDEX "maids_hiring_type_idx" ON "maids" USING btree ("hiring_type");