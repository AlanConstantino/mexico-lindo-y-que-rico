import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { sendBookingNotification, sendCustomerConfirmation, mapExtrasForEmail } from "@/lib/notifications";

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
    const isSetupMode = session.mode === "setup";

    // Generate cancel/reschedule tokens
    const cancelToken = randomUUID();
    const rescheduleToken = randomUUID();

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      stripe_payment_status: isSetupMode ? "card_on_file" : "paid",
      status: "confirmed",
      cancel_token: cancelToken,
      reschedule_token: rescheduleToken,
    };

    // For setup mode (cash), save the Stripe customer ID and setup intent for future charges
    if (isSetupMode && session.customer) {
      updatePayload.stripe_customer_id = typeof session.customer === "string"
        ? session.customer
        : session.customer.id;
    }
    if (isSetupMode && session.setup_intent) {
      const setupIntentId = typeof session.setup_intent === "string"
        ? session.setup_intent
        : session.setup_intent.id;
      // Retrieve the setup intent to get the payment method
      const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
      if (setupIntent.payment_method) {
        updatePayload.stripe_payment_method_id = typeof setupIntent.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent.payment_method.id;
      }
    }

    // Update booking in Supabase
    const { data: booking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update(updatePayload)
      .eq("stripe_session_id", session.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update booking:", updateError);
    } else if (booking) {
      // Build cancel/reschedule URLs
      const origin = request.headers.get("origin") || request.headers.get("referer")?.replace(/\/api.*/, "") || "https://que.rico.catering";
      const bookingLocale = (session.metadata?.locale || booking.locale || "en") as "en" | "es";
      const cancelUrl = `${origin}/${bookingLocale}/booking/cancel/${cancelToken}`;
      const rescheduleUrl = `${origin}/${bookingLocale}/booking/reschedule/${rescheduleToken}`;

      // Send notification to owner + confirmation to customer
      const notificationData = {
        bookingId: booking.id,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        eventDate: booking.event_date,
        eventTime: (booking.event_time as string | null) ?? (session.metadata?.eventTime as string | undefined) ?? undefined,
        serviceType: booking.service_type,
        guestCount: booking.guest_count,
        meats: booking.meats as string[],
        extras: mapExtrasForEmail(booking.extras as { id: string; quantity: number }[] | undefined),
        eventAddress: booking.event_address,
        totalPrice: booking.total_price,
        paymentType: booking.payment_type as string || "card",
        cancelUrl,
        rescheduleUrl,
      };

      await Promise.all([
        sendBookingNotification(notificationData),
        sendCustomerConfirmation(notificationData, bookingLocale),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
