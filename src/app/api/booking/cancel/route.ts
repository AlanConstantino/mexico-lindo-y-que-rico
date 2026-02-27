import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendCancellationConfirmation,
  sendOwnerCancellationNotice,
} from "@/lib/notifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const { data: booking, error: lookupErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("cancel_token", token)
      .single();

    if (lookupErr || !booking) {
      return NextResponse.json({ error: "Invalid or expired cancellation link" }, { status: 404 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "This booking has already been cancelled" }, { status: 400 });
    }

    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("cancellation_fee_type, cancellation_fee_flat, cancellation_fee_percent, free_cancellation_days, notification_email")
      .single();

    const freeCancellationDays = settings?.free_cancellation_days ?? 3;
    const ownerEmail = settings?.notification_email ?? "constantinoalan98@gmail.com";

    const eventDate = new Date(booking.event_date + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let cancellationFee = 0;
    if (daysUntil < freeCancellationDays) {
      const feeType = settings?.cancellation_fee_type ?? "flat";
      if (feeType === "flat") {
        cancellationFee = (settings?.cancellation_fee_flat ?? 50) * 100;
      } else {
        const percent = settings?.cancellation_fee_percent ?? 25;
        cancellationFee = Math.round((booking.total_price * percent) / 100);
      }
    }

    const refundAmount = Math.max(0, booking.total_price - cancellationFee);

    if (booking.stripe_session_id && booking.stripe_payment_status === "paid") {
      try {
        const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
        const paymentIntentId = session.payment_intent as string;
        if (paymentIntentId && refundAmount > 0) {
          await stripe.refunds.create({ payment_intent: paymentIntentId, amount: refundAmount });
        }
      } catch (stripeErr) {
        console.error("❌ Stripe refund error:", stripeErr);
        return NextResponse.json({ error: "Failed to process refund. Please contact us." }, { status: 500 });
      }
    }

    await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_fee_charged: cancellationFee,
        refund_amount: refundAmount,
        cancel_token: null,
        reschedule_token: null,
      })
      .eq("id", booking.id);

    await Promise.all([
      sendCancellationConfirmation({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        eventDate: booking.event_date,
        refundAmount,
        cancellationFee,
        bookingId: booking.id,
      }),
      sendOwnerCancellationNotice({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        eventDate: booking.event_date,
        refundAmount,
        cancellationFee,
        bookingId: booking.id,
        ownerEmail,
      }),
    ]);

    return NextResponse.json({ success: true, refundAmount, cancellationFee });
  } catch (err) {
    console.error("❌ Cancel error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
