-- Store Stripe customer and payment method for card-on-file (cash bookings)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS noshow_fee_charged INTEGER DEFAULT 0;

-- No-show fee settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS noshow_fee_type TEXT DEFAULT 'flat' CHECK (noshow_fee_type IN ('flat', 'percentage'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS noshow_fee_flat INTEGER DEFAULT 100;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS noshow_fee_percent INTEGER DEFAULT 50;

UPDATE settings SET noshow_fee_type = 'flat', noshow_fee_flat = 100, noshow_fee_percent = 50 WHERE id = 1;
