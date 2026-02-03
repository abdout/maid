ALTER TABLE "maids" ADD COLUMN "emirate_id" varchar(50);--> statement-breakpoint
CREATE INDEX "maids_emirate_idx" ON "maids" USING btree ("emirate_id");