-- Update cash deposit to 10%
UPDATE settings SET cash_deposit_percent = 10 WHERE id = 1;

-- Add auto-cancel hours setting
ALTER TABLE settings ADD COLUMN IF NOT EXISTS cash_auto_cancel_hours INTEGER DEFAULT 48;

-- Add cash payment tracking to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cash_payment_method TEXT CHECK (cash_payment_method IN ('zelle', 'paypal', 'cashapp', 'venmo', 'cash_in_person'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cash_payment_option TEXT CHECK (cash_payment_option IN ('deposit', 'full'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_deadline TIMESTAMPTZ;
