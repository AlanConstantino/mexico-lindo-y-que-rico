import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidToken } from "../auth/route";
import { sendCustomerConfirmation, sendOwnerInitiatedCancellation, sendOwnerCancellationNotice, sendEventConfirmedEmail, mapExtrasForEmail } from "@/lib/notifications";

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

// Map event_status back to legacy status for backward compat
function legacyStatus(eventStatus: string): string {
  switch (eventStatus) {
    case "cancelled": return "cancelled";
    case "confirmed":
    case "completed": return "confirmed";
    default: return "pending";
  }
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

  // Support both old status filter and new event_status filter
  if (status && status !== "all") {
    if (["unconfirmed", "confirmed", "completed"].includes(status)) {
      query = query.eq("event_status", status);
    } else {
      query = query.eq("status", status);
    }
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
    const body = await request.json();
    const { id, status, event_status, payment_status } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Fetch current booking
    const { data: current, error: fetchErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !current) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const update: Record<string, unknown> = {};

    // Handle new two-track updates
    if (event_status) {
      const validEventStatuses = ["unconfirmed", "confirmed", "completed", "cancelled"];
      if (!validEventStatuses.includes(event_status)) {
        return NextResponse.json({ error: "Invalid event_status" }, { status: 400 });
      }
      update.event_status = event_status;
      update.status = legacyStatus(event_status); // keep legacy in sync
    }

    if (payment_status) {
      const validPaymentStatuses = ["unpaid", "deposit_received", "paid_in_full"];
      if (!validPaymentStatuses.includes(payment_status)) {
        return NextResponse.json({ error: "Invalid payment_status" }, { status: 400 });
      }
      update.payment_status = payment_status;

      // Keep legacy deposit_confirmed in sync
      if (payment_status === "unpaid") {
        update.deposit_confirmed = false;
      } else {
        update.deposit_confirmed = true;
      }

      // Update balance_due
      if (payment_status === "paid_in_full") {
        update.balance_due = 0;
      } else if (payment_status === "deposit_received") {
        update.balance_due = Math.max(0, (current.total_price || 0) - (current.deposit_amount || 0));
      } else {
        // unpaid — restore full balance
        update.balance_due = current.cash_payment_option === "deposit"
          ? Math.max(0, (current.total_price || 0) - (current.deposit_amount || 0))
          : current.total_price || 0;
      }
    }

    // Legacy status update (for backward compat with old UI if needed)
    if (status && !event_status) {
      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      update.status = status;
      // Sync event_status from legacy
      if (status === "cancelled") update.event_status = "cancelled";
      else if (status === "confirmed") update.event_status = "confirmed";
      else update.event_status = "unconfirmed";
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Determine effective event status
    const effectiveEventStatus = event_status || (status === "cancelled" ? "cancelled" : null);

    // Send event confirmed email when event is confirmed (both card and cash)
    if (effectiveEventStatus === "confirmed" && current.event_status !== "confirmed") {
      const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://que.rico.catering";
      const locale = (data.locale || "en") as "en" | "es";
      const cancelUrl = data.cancel_token ? `${BASE_URL}/${locale}/booking/cancel/${data.cancel_token}` : undefined;
      const rescheduleUrl = data.reschedule_token ? `${BASE_URL}/${locale}/booking/reschedule/${data.reschedule_token}` : undefined;

      await sendEventConfirmedEmail({
        bookingId: data.id,
        bookingNumber: data.booking_number,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        eventDate: data.event_date,
        eventTime: (data.event_time as string | null) ?? undefined,
        serviceType: data.service_type,
        guestCount: data.guest_count,
        meats: data.meats as string[],
        eventAddress: data.event_address,
        totalPrice: data.total_price,
        depositAmount: data.deposit_amount,
        cancelUrl,
        rescheduleUrl,
        extras: data.extras as { id: string; quantity: number; flavors?: Record<string, number> }[] | undefined,
      }, locale).catch((err) => console.error("Failed to send event confirmed email:", err));
    }

    // Auto-refund via Stripe when cancelled
    if (effectiveEventStatus === "cancelled" && current.event_status !== "cancelled") {
      if (data.stripe_session_id && data.stripe_payment_status === "paid") {
        try {
          const session = await stripe.checkout.sessions.retrieve(data.stripe_session_id);
          const paymentIntentId = session.payment_intent as string;
          if (paymentIntentId) {
            await stripe.refunds.create({ payment_intent: paymentIntentId });
            console.log(`✅ Full refund issued for booking ${data.id}`);
          }
        } catch (stripeErr) {
          console.error("❌ Stripe refund error on admin cancel:", stripeErr);
        }
      }

      // Send cancellation emails
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

      const { data: settings } = await supabaseAdmin
        .from("settings")
        .select("notification_email")
        .single();
      const ownerEmail = settings?.notification_email ?? "mx.lindo.y.que.rico.catering@gmail.com";

      await sendOwnerCancellationNotice({
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        eventDate: data.event_date,
        refundAmount: data.total_price,
        cancellationFee: 0,
        bookingId: data.id,
        ownerEmail,
      }).catch((err) => console.error("Failed to send owner cancellation notice:", err));
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
