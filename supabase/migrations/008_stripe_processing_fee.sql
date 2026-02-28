-- Stripe processing fee settings (so business can adjust if their rate changes)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stripe_fee_percent NUMERIC(4,2) DEFAULT 2.9;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stripe_fee_flat INTEGER DEFAULT 30;

UPDATE settings SET stripe_fee_percent = 2.9, stripe_fee_flat = 30 WHERE id = 1;
