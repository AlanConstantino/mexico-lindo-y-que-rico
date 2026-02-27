-- Payment settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS cc_surcharge_percent INTEGER DEFAULT 10;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS cash_deposit_percent INTEGER DEFAULT 50;
UPDATE settings SET cc_surcharge_percent = 10, cash_deposit_percent = 50 WHERE id = 1;

-- Booking payment fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'card' CHECK (payment_type IN ('card', 'cash'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS balance_due INTEGER DEFAULT 0;
