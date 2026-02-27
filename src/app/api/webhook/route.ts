import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { sendBookingNotification, sendCustomerConfirmation } from "@/lib/notifications";

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

    // Generate cancel/reschedule tokens
    const cancelToken = randomUUID();
    const rescheduleToken = randomUUID();

    // Update booking in Supabase
    const { data: booking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        stripe_payment_status: "paid",
        status: "confirmed",
        cancel_token: cancelToken,
        reschedule_token: rescheduleToken,
      })
      .eq("stripe_session_id", session.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update booking:", updateError);
    } else if (booking) {
      // Build cancel/reschedule URLs
      const origin = request.headers.get("origin") || request.headers.get("referer")?.replace(/\/api.*/, "") || "https://que.rico.catering";
      const cancelUrl = `${origin}/en/booking/cancel/${cancelToken}`;
      const rescheduleUrl = `${origin}/en/booking/reschedule/${rescheduleToken}`;

      // Send notification to owner + confirmation to customer
      const notificationData = {
        bookingId: booking.id,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        eventDate: booking.event_date,
        serviceType: booking.service_type,
        guestCount: booking.guest_count,
        meats: booking.meats as string[],
        eventAddress: booking.event_address,
        totalPrice: booking.total_price,
        cancelUrl,
        rescheduleUrl,
      };

      await Promise.all([
        sendBookingNotification(notificationData),
        sendCustomerConfirmation(notificationData),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
