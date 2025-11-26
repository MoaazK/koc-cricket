-- Add new_batter_id column to balls table
ALTER TABLE balls ADD COLUMN IF NOT EXISTS new_batter_id UUID REFERENCES players(id);
