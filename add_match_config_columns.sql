-- Add configuration columns to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS overs INTEGER DEFAULT 20;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS enable_free_hit BOOLEAN DEFAULT true;
