import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendEventReminder,
  sendOwnerReminder,
  sendDayBeforeReminder,
} from "@/lib/notifications";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://que.rico.catering";

/** Get today's date in Los Angeles timezone as YYYY-MM-DD */
function getTodayPST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

/** Add days to today in PST and return YYYY-MM-DD */
function addDaysPST(days: number): string {
  const today = new Date(getTodayPST() + "T12:00:00");
  today.setDate(today.getDate() + days);
  return today.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select(
        "reminder_days, notification_email, cancellation_fee_type, cancellation_fee_flat, cancellation_fee_percent, free_cancellation_days"
      )
      .single();

    const reminderDays = settings?.reminder_days ?? 5;
    const ownerEmail = settings?.notification_email ?? "constantinoalan98@gmail.com";
    const freeCancellationDays = settings?.free_cancellation_days ?? 3;

    // ── Part 1: N-days-before reminders ──
    const targetDateStr = addDaysPST(reminderDays);

    const { data: firstReminders, error: firstErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("event_date", targetDateStr)
      .eq("status", "confirmed")
      .eq("stripe_payment_status", "paid")
      .eq("reminder_sent", false);

    if (firstErr) console.error("❌ First reminder query error:", firstErr);

    const firstResults = [];
    for (const booking of firstReminders || []) {
      try {
        // Use existing tokens (generated at booking time) or create new ones as fallback
        const cancelToken = (booking.cancel_token as string) || crypto.randomUUID();
        const rescheduleToken = (booking.reschedule_token as string) || crypto.randomUUID();

        if (!booking.cancel_token || !booking.reschedule_token) {
          await supabaseAdmin
            .from("bookings")
            .update({ cancel_token: cancelToken, reschedule_token: rescheduleToken })
            .eq("id", booking.id);
        }

        const bookingLocale = (booking.locale || "en") as "en" | "es";
        const cancelUrl = `${BASE_URL}/${bookingLocale}/booking/cancel/${cancelToken}`;
        const rescheduleUrl = `${BASE_URL}/${bookingLocale}/booking/reschedule/${rescheduleToken}`;

        const reminderData = {
          bookingId: booking.id,
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          customerPhone: booking.customer_phone,
          eventDate: booking.event_date,
          serviceType: booking.service_type,
          guestCount: booking.guest_count,
          meats: booking.meats as string[],
          eventAddress: booking.event_address,
          extras: booking.extras as { id: string; quantity: number; flavors?: string[] }[] | undefined,
          totalPrice: booking.total_price,
          reminderDays,
          cancelUrl,
          rescheduleUrl,
        };

        await Promise.all([
          sendEventReminder(reminderData, bookingLocale),
          sendOwnerReminder({ ...reminderData, ownerEmail }),
        ]);

        await supabaseAdmin
          .from("bookings")
          .update({ reminder_sent: true })
          .eq("id", booking.id);

        firstResults.push({ bookingId: booking.id, status: "sent" });
      } catch (err) {
        console.error(`❌ Failed first reminder for ${booking.id}:`, err);
        firstResults.push({ bookingId: booking.id, status: "failed" });
      }
    }

    // ── Part 2: Day-before reminders ──
    const tomorrowStr = addDaysPST(1);

    const { data: dayBeforeBookings, error: dayBeforeErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("event_date", tomorrowStr)
      .eq("status", "confirmed")
      .eq("stripe_payment_status", "paid")
      .eq("day_before_reminder_sent", false);

    if (dayBeforeErr) console.error("❌ Day-before query error:", dayBeforeErr);

    const dayBeforeResults = [];
    for (const booking of dayBeforeBookings || []) {
      try {
        let cancelToken = booking.cancel_token as string | null;
        if (!cancelToken) {
          cancelToken = crypto.randomUUID();
          await supabaseAdmin
            .from("bookings")
            .update({ cancel_token: cancelToken })
            .eq("id", booking.id);
        }

        let cancellationFee = 0;
        if (1 < freeCancellationDays) {
          const feeType = settings?.cancellation_fee_type ?? "flat";
          if (feeType === "flat") {
            cancellationFee = (settings?.cancellation_fee_flat ?? 50) * 100;
          } else {
            const percent = settings?.cancellation_fee_percent ?? 25;
            cancellationFee = Math.round((booking.total_price * percent) / 100);
          }
        }

        const dayBeforeLocale = (booking.locale || "en") as "en" | "es";
        const cancelUrl = `${BASE_URL}/${dayBeforeLocale}/booking/cancel/${cancelToken}`;

        await sendDayBeforeReminder({
          bookingId: booking.id,
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          customerPhone: booking.customer_phone,
          eventDate: booking.event_date,
          serviceType: booking.service_type,
          guestCount: booking.guest_count,
          meats: booking.meats as string[],
          eventAddress: booking.event_address,
          extras: booking.extras as { id: string; quantity: number; flavors?: string[] }[] | undefined,
          totalPrice: booking.total_price,
          reminderDays: 1,
          cancellationFee,
          cancelUrl,
        }, dayBeforeLocale);

        await sendOwnerReminder({
          bookingId: booking.id,
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          customerPhone: booking.customer_phone,
          eventDate: booking.event_date,
          serviceType: booking.service_type,
          guestCount: booking.guest_count,
          meats: booking.meats as string[],
          eventAddress: booking.event_address,
          extras: booking.extras as { id: string; quantity: number; flavors?: string[] }[] | undefined,
          totalPrice: booking.total_price,
          reminderDays: 1,
          ownerEmail,
        });

        await supabaseAdmin
          .from("bookings")
          .update({ day_before_reminder_sent: true })
          .eq("id", booking.id);

        dayBeforeResults.push({ bookingId: booking.id, status: "sent" });
      } catch (err) {
        console.error(`❌ Failed day-before reminder for ${booking.id}:`, err);
        dayBeforeResults.push({ bookingId: booking.id, status: "failed" });
      }
    }

    return NextResponse.json({
      message: `Processed ${firstResults.length} first reminder(s) and ${dayBeforeResults.length} day-before reminder(s)`,
      targetDate: targetDateStr,
      tomorrowDate: tomorrowStr,
      reminderDays,
      firstResults,
      dayBeforeResults,
    });
  } catch (err) {
    console.error("❌ Cron error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
