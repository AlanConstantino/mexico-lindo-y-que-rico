-- Add reminder_days setting (how many days before event to send reminder)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS reminder_days INTEGER DEFAULT 5;

-- Update existing settings row with default
UPDATE settings SET reminder_days = 5 WHERE id = 1;

-- Add reminder tracking to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Index for the cron query: find confirmed bookings needing reminders
CREATE INDEX IF NOT EXISTS idx_bookings_reminder
  ON bookings (event_date, reminder_sent)
  WHERE status = 'confirmed' AND stripe_payment_status = 'paid' AND reminder_sent = false;
