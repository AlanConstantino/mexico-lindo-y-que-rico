import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendEventReminder,
  sendOwnerReminder,
  sendDayBeforeReminder,
  sendAutoConfirmRequest,
  sendEventConfirmedEmail,
  sendOwnerNoResponseNotice,
  mapExtrasForEmail,
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
    const ownerEmail = settings?.notification_email ?? "mx.lindo.y.que.rico.catering@gmail.com";
    const freeCancellationDays = settings?.free_cancellation_days ?? 7;

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
          eventTime: (booking.event_time as string | null) ?? undefined,
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
          eventTime: (booking.event_time as string | null) ?? undefined,
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
          eventTime: (booking.event_time as string | null) ?? undefined,
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

    // ── Part 3: Auto-confirm request for unconfirmed events at threshold ──
    const autoConfirmDateStr = addDaysPST(freeCancellationDays);

    const { data: unconfirmedBookings, error: unconfirmedErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("event_date", autoConfirmDateStr)
      .eq("event_status", "unconfirmed")
      .neq("status", "cancelled")
      .is("auto_confirm_sent_at", null);

    if (unconfirmedErr) console.error("❌ Auto-confirm query error:", unconfirmedErr);

    const autoConfirmResults = [];
    for (const booking of unconfirmedBookings || []) {
      try {
        // Generate confirm event token
        const confirmToken = randomUUID();
        const cancelToken = (booking.cancel_token as string) || randomUUID();

        await supabaseAdmin
          .from("bookings")
          .update({
            confirm_event_token: confirmToken,
            cancel_token: cancelToken,
            auto_confirm_sent_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        const bookingLocale = (booking.locale || "en") as "en" | "es";
        const confirmUrl = `${BASE_URL}/api/booking/confirm-event?token=${confirmToken}`;
        const cancelUrl = `${BASE_URL}/${bookingLocale}/booking/cancel/${cancelToken}`;

        await sendAutoConfirmRequest({
          bookingId: booking.id,
          bookingNumber: booking.booking_number,
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          eventDate: booking.event_date,
          eventTime: (booking.event_time as string | null) ?? undefined,
          serviceType: booking.service_type,
          guestCount: booking.guest_count,
          meats: booking.meats as string[],
          eventAddress: booking.event_address,
          totalPrice: booking.total_price,
          confirmUrl,
          cancelUrl,
          daysUntilEvent: freeCancellationDays,
          extras: booking.extras as { id: string; quantity: number; flavors?: Record<string, number> }[] | undefined,
        }, bookingLocale);

        autoConfirmResults.push({ bookingId: booking.id, status: "sent" });
      } catch (err) {
        console.error(`❌ Failed auto-confirm request for ${booking.id}:`, err);
        autoConfirmResults.push({ bookingId: booking.id, status: "failed" });
      }
    }

    // ── Part 3b: Reminder email for already-confirmed events at threshold ──
    const { data: confirmedAtThreshold } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("event_date", autoConfirmDateStr)
      .eq("event_status", "confirmed")
      .neq("status", "cancelled")
      .eq("reminder_sent", false);

    const confirmedReminderResults = [];
    for (const booking of confirmedAtThreshold || []) {
      try {
        const bookingLocale = (booking.locale || "en") as "en" | "es";
        const cancelToken = (booking.cancel_token as string) || randomUUID();
        const rescheduleToken = (booking.reschedule_token as string) || randomUUID();
        const cancelUrl = `${BASE_URL}/${bookingLocale}/booking/cancel/${cancelToken}`;
        const rescheduleUrl = `${BASE_URL}/${bookingLocale}/booking/reschedule/${rescheduleToken}`;

        // Send as "event confirmed" reminder (no confirm/cancel buttons, just details)
        await sendEventConfirmedEmail({
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          eventDate: booking.event_date,
          eventTime: (booking.event_time as string | null) ?? undefined,
          serviceType: booking.service_type,
          guestCount: booking.guest_count,
          meats: booking.meats as string[],
          eventAddress: booking.event_address,
          totalPrice: booking.total_price,
          bookingId: booking.id,
          bookingNumber: booking.booking_number,
          depositAmount: booking.deposit_amount,
          cancelUrl,
          rescheduleUrl,
          extras: booking.extras as { id: string; quantity: number; flavors?: Record<string, number> }[] | undefined,
        }, bookingLocale);

        await supabaseAdmin
          .from("bookings")
          .update({ reminder_sent: true })
          .eq("id", booking.id);

        confirmedReminderResults.push({ bookingId: booking.id, status: "sent" });
      } catch (err) {
        console.error(`❌ Failed confirmed reminder for ${booking.id}:`, err);
        confirmedReminderResults.push({ bookingId: booking.id, status: "failed" });
      }
    }

    // ── Part 4: Owner no-response notification (2 days after auto-confirm sent, still unconfirmed) ──
    const noResponseDateStr = addDaysPST(freeCancellationDays - 2); // Events in freeCancellationDays-2 days

    const { data: noResponseBookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("event_date", noResponseDateStr)
      .eq("event_status", "unconfirmed")
      .neq("status", "cancelled")
      .not("auto_confirm_sent_at", "is", null);

    const noResponseResults = [];
    for (const booking of noResponseBookings || []) {
      try {
        await sendOwnerNoResponseNotice({
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          customerPhone: booking.customer_phone,
          eventDate: booking.event_date,
          bookingId: booking.id,
          bookingNumber: booking.booking_number,
          ownerEmail,
        });
        noResponseResults.push({ bookingId: booking.id, status: "sent" });
      } catch (err) {
        console.error(`❌ Failed no-response notice for ${booking.id}:`, err);
        noResponseResults.push({ bookingId: booking.id, status: "failed" });
      }
    }

    return NextResponse.json({
      message: `Processed ${firstResults.length} reminder(s), ${dayBeforeResults.length} day-before(s), ${autoConfirmResults.length} auto-confirm(s), ${confirmedReminderResults.length} confirmed reminder(s), ${noResponseResults.length} no-response notice(s)`,
      targetDate: targetDateStr,
      tomorrowDate: tomorrowStr,
      autoConfirmDate: autoConfirmDateStr,
      reminderDays,
      firstResults,
      dayBeforeResults,
      autoConfirmResults,
      confirmedReminderResults,
      noResponseResults,
    });
  } catch (err) {
    console.error("❌ Cron error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
