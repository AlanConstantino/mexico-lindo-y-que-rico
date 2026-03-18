import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendAutoCancelEmail } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("payment_type", "cash")
      .eq("deposit_confirmed", false)
      .neq("status", "cancelled")
      .lt("deposit_deadline", new Date().toISOString());

    if (error) {
      console.error("❌ Auto-cancel query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results = [];
    for (const booking of bookings || []) {
      try {
        await supabaseAdmin
          .from("bookings")
          .update({ status: "cancelled", event_status: "cancelled" })
          .eq("id", booking.id);

        const locale = (booking.locale || "en") as "en" | "es";
        const amountDue = booking.cash_payment_option === "full"
          ? booking.total_price
          : (booking.deposit_amount ?? booking.total_price);

        await sendAutoCancelEmail({
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          eventDate: booking.event_date,
          bookingId: booking.id,
          bookingNumber: booking.booking_number,
          amountDue,
        }, locale);

        results.push({ bookingId: booking.id, status: "cancelled" });
      } catch (err) {
        console.error(`❌ Failed to auto-cancel ${booking.id}:`, err);
        results.push({ bookingId: booking.id, status: "failed" });
      }
    }

    return NextResponse.json({
      message: `Auto-cancelled ${results.filter(r => r.status === "cancelled").length} booking(s)`,
      results,
    });
  } catch (err) {
    console.error("❌ Auto-cancel cron error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
