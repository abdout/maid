CREATE TYPE "public"."service_type" AS ENUM('individual', 'business', 'cleaning', 'cooking', 'babysitter', 'elderly', 'driver');--> statement-breakpoint
ALTER TABLE "maids" ADD COLUMN "service_type" "service_type" DEFAULT 'individual' NOT NULL;--> statement-breakpoint
CREATE INDEX "maids_service_type_idx" ON "maids" USING btree ("service_type");