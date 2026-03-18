import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidToken } from "../../auth/route";
import { sendCustomerConfirmation, sendBookingNotification, mapExtrasForEmail } from "@/lib/notifications";

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
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

    // Fetch the full booking
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.payment_type !== "cash") {
      return NextResponse.json({ error: "Not a cash booking" }, { status: 400 });
    }

    // Build the update object
    const update: Record<string, unknown> = {
      deposit_confirmed: true,
      status: "confirmed",
    };

    // Set new payment_status based on payment option
    if (booking.cash_payment_option === "full") {
      update.balance_due = 0;
      update.payment_status = "paid_in_full";
    } else {
      update.payment_status = "deposit_received";
    }

    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update(update)
      .eq("id", bookingId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Fetch cancellation policy settings for the confirmation email
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("free_cancellation_days, cancellation_fee_type, cancellation_fee_flat, cancellation_fee_percent")
      .single();

    const cancellationPolicy = {
      freeCancellationDays: settings?.free_cancellation_days ?? 7,
      feeType: (settings?.cancellation_fee_type ?? "flat") as "flat" | "percentage",
      feeFlat: settings?.cancellation_fee_flat ?? 50,
      feePercent: settings?.cancellation_fee_percent ?? 25,
      cashDepositNonRefundable: false,
    };

    // Send confirmation emails to both customer and owner
    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://que.rico.catering";
    const locale = (booking.locale || "en") as "en" | "es";
    const cancelUrl = booking.cancel_token ? `${BASE_URL}/${locale}/booking/cancel/${booking.cancel_token}` : undefined;
    const rescheduleUrl = booking.reschedule_token ? `${BASE_URL}/${locale}/booking/reschedule/${booking.reschedule_token}` : undefined;

    const baseData = {
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      eventDate: booking.event_date,
      eventTime: booking.event_time ?? undefined,
      serviceType: booking.service_type,
      guestCount: booking.guest_count,
      meats: (booking.meats || []) as string[],
      eventAddress: booking.event_address,
      totalPrice: booking.total_price,
      paymentType: "cash",
      cancelUrl,
      rescheduleUrl,
      cancellationPolicy,
    };
    const dbExtras = booking.extras as { id: string; quantity: number; flavors?: Record<string, number> }[] | undefined;

    await Promise.all([
      sendCustomerConfirmation({ ...baseData, extras: mapExtrasForEmail(dbExtras, locale) }, locale),
      sendBookingNotification({ ...baseData, extras: mapExtrasForEmail(dbExtras, "es") }),
    ]).catch((err) => console.error("Failed to send payment confirmation emails:", err));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
