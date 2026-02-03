CREATE INDEX "office_subscriptions_status_period_end_idx" ON "office_subscriptions" USING btree ("status","current_period_end");--> statement-breakpoint
CREATE INDEX "quotations_office_maid_idx" ON "quotations" USING btree ("office_id","maid_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");