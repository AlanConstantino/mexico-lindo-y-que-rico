-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  event_date DATE NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('2hr', '3hr')),
  guest_count INTEGER NOT NULL,
  meats JSONB NOT NULL,
  extras JSONB DEFAULT '[]'::jsonb,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_price INTEGER NOT NULL, -- stored in cents
  stripe_session_id TEXT,
  stripe_payment_status TEXT DEFAULT 'unpaid',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  max_events_per_day INTEGER DEFAULT 3,
  min_notice_days INTEGER DEFAULT 3,
  notification_email TEXT,
  notification_phone TEXT
);

-- Default settings
INSERT INTO settings (id, max_events_per_day, min_notice_days, notification_email, notification_phone)
VALUES (1, 3, 3, 'constantinoalan98@gmail.com', '5626887250')
ON CONFLICT (id) DO NOTHING;

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings (event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON bookings (stripe_session_id);
