import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEventReminder, sendOwnerReminder } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get reminder_days from settings
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("reminder_days, notification_email")
      .single();

    const reminderDays = settings?.reminder_days ?? 5;
    const ownerEmail = settings?.notification_email ?? "constantinoalan98@gmail.com";

    // 2. Calculate the target date (today + reminderDays)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + reminderDays);
    const targetDateStr = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // 3. Find confirmed, paid bookings on that date that haven't been reminded yet
    const { data: bookings, error: queryError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("event_date", targetDateStr)
      .eq("status", "confirmed")
      .eq("stripe_payment_status", "paid")
      .eq("reminder_sent", false);

    if (queryError) {
      console.error("❌ Reminder query error:", queryError);
      return NextResponse.json(
        { error: "Failed to query bookings" },
        { status: 500 }
      );
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        message: "No reminders to send",
        targetDate: targetDateStr,
        reminderDays,
      });
    }

    // 4. Send reminders for each booking
    const results = [];
    for (const booking of bookings) {
      try {
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
          extras: booking.extras as { id: string; quantity: number; flavors?: string[] }[],
          totalPrice: booking.total_price,
          reminderDays,
        };

        // Send both customer reminder and owner reminder
        await Promise.all([
          sendEventReminder(reminderData),
          sendOwnerReminder({ ...reminderData, ownerEmail }),
        ]);

        // Mark as reminded
        await supabaseAdmin
          .from("bookings")
          .update({ reminder_sent: true })
          .eq("id", booking.id);

        results.push({ bookingId: booking.id, status: "sent" });
      } catch (err) {
        console.error(`❌ Failed to send reminder for ${booking.id}:`, err);
        results.push({ bookingId: booking.id, status: "failed" });
      }
    }

    return NextResponse.json({
      message: `Processed ${bookings.length} reminder(s)`,
      targetDate: targetDateStr,
      reminderDays,
      results,
    });
  } catch (err) {
    console.error("❌ Cron error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
