import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidToken } from "../auth/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // Get booking
    const { data: booking, error: bookingErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.payment_type !== "cash") {
      return NextResponse.json({ error: "Not a cash booking" }, { status: 400 });
    }

    if (!booking.stripe_customer_id || !booking.stripe_payment_method_id) {
      return NextResponse.json({ error: "No card on file for this booking" }, { status: 400 });
    }

    if (booking.noshow_fee_charged > 0) {
      return NextResponse.json({ error: "No-show fee already charged" }, { status: 400 });
    }

    // Get no-show fee settings
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("noshow_fee_type, noshow_fee_flat, noshow_fee_percent")
      .single();

    const feeType = settings?.noshow_fee_type ?? "flat";
    let feeAmountCents: number;

    if (feeType === "flat") {
      feeAmountCents = (settings?.noshow_fee_flat ?? 100) * 100;
    } else {
      const percent = settings?.noshow_fee_percent ?? 50;
      feeAmountCents = Math.round((booking.total_price * percent) / 100);
    }

    if (feeAmountCents <= 0) {
      return NextResponse.json({ error: "Fee amount is zero" }, { status: 400 });
    }

    // Charge the saved card
    const paymentIntent = await stripe.paymentIntents.create({
      amount: feeAmountCents,
      currency: "usd",
      customer: booking.stripe_customer_id,
      payment_method: booking.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      description: `No-show fee for booking ${booking.id} — ${booking.customer_name}`,
      metadata: {
        bookingId: booking.id,
        type: "noshow_fee",
      },
    });

    // Update booking
    await supabaseAdmin
      .from("bookings")
      .update({
        noshow_fee_charged: feeAmountCents,
        status: "cancelled",
      })
      .eq("id", booking.id);

    return NextResponse.json({
      success: true,
      charged: feeAmountCents / 100,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("❌ No-show charge error:", err);
    const message = err instanceof Error ? err.message : "Failed to charge no-show fee";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
