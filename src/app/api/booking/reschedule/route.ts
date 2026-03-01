import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendRescheduleConfirmation,
  sendOwnerRescheduleNotice,
} from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const { token, newDate } = await request.json();

    if (!token || !newDate) {
      return NextResponse.json({ error: "Token and new date are required" }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const { data: booking, error: lookupErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("reschedule_token", token)
      .single();

    if (lookupErr || !booking) {
      return NextResponse.json({ error: "Invalid or expired reschedule link" }, { status: 404 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "This booking has been cancelled" }, { status: 400 });
    }

    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("max_events_per_day, min_notice_days, notification_email")
      .single();

    const maxEventsPerDay = settings?.max_events_per_day ?? 3;
    const minNoticeDays = settings?.min_notice_days ?? 3;
    const ownerEmail = settings?.notification_email ?? "constantinoalan98@gmail.com";

    const newEventDate = new Date(newDate + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((newEventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < minNoticeDays) {
      return NextResponse.json({ error: `New date must be at least ${minNoticeDays} days from now` }, { status: 400 });
    }

    const { data: existingBookings } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("event_date", newDate)
      .neq("status", "cancelled")
      .neq("id", booking.id);

    if ((existingBookings?.length ?? 0) >= maxEventsPerDay) {
      return NextResponse.json({ error: "Selected date is fully booked" }, { status: 400 });
    }

    const oldDate = booking.event_date;
    const newCancelToken = crypto.randomUUID();
    const newRescheduleToken = crypto.randomUUID();

    await supabaseAdmin
      .from("bookings")
      .update({
        event_date: newDate,
        reminder_sent: false,
        day_before_reminder_sent: false,
        cancel_token: newCancelToken,
        reschedule_token: newRescheduleToken,
      })
      .eq("id", booking.id);

    const bookingLocale = (booking.locale || "en") as "en" | "es";

    await Promise.all([
      sendRescheduleConfirmation({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        oldDate,
        newDate,
        bookingId: booking.id,
      }, bookingLocale),
      sendOwnerRescheduleNotice({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        oldDate,
        newDate,
        bookingId: booking.id,
        ownerEmail,
      }),
    ]);

    return NextResponse.json({ success: true, newDate });
  } catch (err) {
    console.error("❌ Reschedule error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
