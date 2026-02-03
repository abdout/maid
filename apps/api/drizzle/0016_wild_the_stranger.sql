ALTER TABLE "offices" ADD COLUMN "created_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "offices" ADD CONSTRAINT "offices_created_by_admin_id_users_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "offices_created_by_admin_idx" ON "offices" USING btree ("created_by_admin_id");