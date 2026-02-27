-- Day-before reminder tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS day_before_reminder_sent BOOLEAN DEFAULT false;

-- Cancellation tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_fee_charged INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_token TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reschedule_token TEXT;

-- Cancellation fee settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS cancellation_fee_type TEXT DEFAULT 'flat' CHECK (cancellation_fee_type IN ('flat', 'percentage'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS cancellation_fee_flat INTEGER DEFAULT 50;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS cancellation_fee_percent INTEGER DEFAULT 25;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS free_cancellation_days INTEGER DEFAULT 3;

UPDATE settings SET cancellation_fee_type = 'flat', cancellation_fee_flat = 50, cancellation_fee_percent = 25, free_cancellation_days = 3 WHERE id = 1;

CREATE INDEX IF NOT EXISTS idx_bookings_cancel_token ON bookings (cancel_token) WHERE cancel_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_reschedule_token ON bookings (reschedule_token) WHERE reschedule_token IS NOT NULL;
