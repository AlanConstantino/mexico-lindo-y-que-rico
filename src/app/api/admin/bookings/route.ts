import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidToken } from "../auth/route";
import { sendCustomerConfirmation, sendOwnerInitiatedCancellation, mapExtrasForEmail } from "@/lib/notifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const token = getToken(request);
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  let query = supabaseAdmin
    .from("bookings")
    .select("*")
    .order("event_date", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (dateFrom) {
    query = query.gte("event_date", dateFrom);
  }
  if (dateTo) {
    query = query.lte("event_date", dateTo);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

export async function PATCH(request: NextRequest) {
  const token = getToken(request);
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send confirmation email when a pending booking (cash) is confirmed by the owner
    if (status === "confirmed" && data.payment_type === "cash") {
      const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://que.rico.catering";
      const locale = data.locale || "en";
      const cancelUrl = data.cancel_token ? `${BASE_URL}/${locale}/booking/cancel/${data.cancel_token}` : undefined;
      const rescheduleUrl = data.reschedule_token ? `${BASE_URL}/${locale}/booking/reschedule/${data.reschedule_token}` : undefined;

      await sendCustomerConfirmation({
        bookingId: data.id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        eventDate: data.event_date,
        serviceType: data.service_type,
        guestCount: data.guest_count,
        meats: data.meats as string[],
        extras: mapExtrasForEmail(data.extras as { id: string; quantity: number; flavors?: Record<string, number> }[] | undefined, locale as "en" | "es"),
        eventAddress: data.event_address,
        totalPrice: data.total_price,
        cancelUrl,
        rescheduleUrl,
      }).catch((err) => console.error("Failed to send confirmation email:", err));
    }

    // Auto-refund via Stripe when owner cancels a card booking
    if (status === "cancelled" && data.stripe_session_id && data.stripe_payment_status === "paid") {
      try {
        const session = await stripe.checkout.sessions.retrieve(data.stripe_session_id);
        const paymentIntentId = session.payment_intent as string;
        if (paymentIntentId) {
          await stripe.refunds.create({ payment_intent: paymentIntentId });
          console.log(`✅ Full refund issued for booking ${data.id}`);
        }
      } catch (stripeErr) {
        console.error("❌ Stripe refund error on admin cancel:", stripeErr);
        // Don't block the cancellation — log the error, owner can refund manually
      }
    }

    // Send cancellation email when owner cancels a booking
    if (status === "cancelled") {
      const locale = (data.locale || "en") as "en" | "es";
      await sendOwnerInitiatedCancellation({
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        eventDate: data.event_date,
        bookingId: data.id,
        bookingNumber: data.booking_number,
        paymentType: data.payment_type,
        depositAmount: data.deposit_amount,
        totalPrice: data.total_price,
      }, locale).catch((err) => console.error("Failed to send cancellation email:", err));
    }

    return NextResponse.json({ booking: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const token = getToken(request);
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
