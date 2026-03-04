import { createClient } from "@supabase/supabase-js";

// Browser client — uses publishable key (new format: sb_publishable_...)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// Server client — uses secret key (new format: sb_secret_...)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

/**
 * Generate a short, human-readable booking reference number.
 * Format: QR-YYYYMMDD-XXXXXX (e.g., QR-20260301-A3F2B7)
 */
export function generateBookingNumber(eventDate: string): string {
  const datePart = eventDate.replace(/-/g, "");
  const hex = Math.random().toString(16).substring(2, 8).toUpperCase().padEnd(6, "0");
  return `QR-${datePart}-${hex}`;
}
