-- Add event address column to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_address TEXT;
