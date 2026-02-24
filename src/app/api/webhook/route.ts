import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { sendBookingNotification } from "@/lib/notifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  // Verify webhook signature if secret is configured
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  } else {
    // In development without webhook secret, parse the event directly
    console.warn(
      "STRIPE_WEBHOOK_SECRET not set — skipping signature verification"
    );
    event = JSON.parse(body) as Stripe.Event;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Update booking in Supabase
    const { data: booking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        stripe_payment_status: "paid",
        status: "confirmed",
      })
      .eq("stripe_session_id", session.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update booking:", updateError);
    } else if (booking) {
      // Send notification
      await sendBookingNotification({
        bookingId: booking.id,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        eventDate: booking.event_date,
        serviceType: booking.service_type,
        guestCount: booking.guest_count,
        meats: booking.meats as string[],
        totalPrice: booking.total_price,
      });
    }
  }

  return NextResponse.json({ received: true });
}
