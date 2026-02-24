import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // format: "2026-03"

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month format" }, { status: 400 });
  }

  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr);
  const monthNum = parseInt(monthStr);

  // Start and end of month
  const startDate = `${year}-${String(monthNum).padStart(2, "0")}-01`;
  const endDate =
    monthNum === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(monthNum + 1).padStart(2, "0")}-01`;

  try {
    // Get settings
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("max_events_per_day, min_notice_days")
      .eq("id", 1)
      .single();

    // Get bookings for this month (only non-cancelled)
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("event_date")
      .gte("event_date", startDate)
      .lt("event_date", endDate)
      .neq("status", "cancelled");

    // Count bookings per date
    const bookedDates: Record<string, number> = {};
    if (bookings) {
      for (const booking of bookings) {
        const date = booking.event_date;
        bookedDates[date] = (bookedDates[date] || 0) + 1;
      }
    }

    return NextResponse.json({
      maxEventsPerDay: settings?.max_events_per_day ?? 3,
      minNoticeDays: settings?.min_notice_days ?? 3,
      bookedDates,
    });
  } catch {
    // Return defaults if Supabase is not set up yet
    return NextResponse.json({
      maxEventsPerDay: 3,
      minNoticeDays: 3,
      bookedDates: {},
    });
  }
}
