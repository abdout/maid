-- Add is_suspended column to offices table
ALTER TABLE offices ADD COLUMN is_suspended BOOLEAN DEFAULT false NOT NULL;
