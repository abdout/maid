CREATE TYPE "public"."office_scope" AS ENUM('recruitment', 'leasing', 'typing');--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "scopes" "office_scope"[] DEFAULT '{"recruitment"}' NOT NULL;