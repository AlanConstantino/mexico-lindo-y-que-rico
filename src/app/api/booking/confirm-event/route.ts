import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEventConfirmedEmail, mapExtrasForEmail } from "@/lib/notifications";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://que.rico.catering";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/en?error=missing_token`);
  }

  // Find booking by confirm_event_token
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("confirm_event_token", token)
    .single();

  if (error || !booking) {
    return NextResponse.redirect(`${BASE_URL}/en?error=invalid_token`);
  }

  if (booking.event_status === "cancelled") {
    const locale = booking.locale || "en";
    return NextResponse.redirect(`${BASE_URL}/${locale}?error=already_cancelled`);
  }

  if (booking.event_status === "confirmed" || booking.event_status === "completed") {
    const locale = booking.locale || "en";
    return NextResponse.redirect(`${BASE_URL}/${locale}?confirmed=already`);
  }

  const locale = (booking.locale || "en") as "en" | "es";

  // Update booking to confirmed
  const { error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({
      event_status: "confirmed",
      status: "confirmed",
      confirm_event_token: null, // Invalidate token after use
    })
    .eq("id", booking.id);

  if (updateError) {
    console.error("❌ Failed to confirm event:", updateError);
    return NextResponse.redirect(`${BASE_URL}/${locale}?error=update_failed`);
  }

  // Send event confirmed email
  const cancelUrl = booking.cancel_token ? `${BASE_URL}/${locale}/booking/cancel/${booking.cancel_token}` : undefined;
  const rescheduleUrl = booking.reschedule_token ? `${BASE_URL}/${locale}/booking/reschedule/${booking.reschedule_token}` : undefined;

  await sendEventConfirmedEmail({
    customerName: booking.customer_name,
    customerEmail: booking.customer_email,
    eventDate: booking.event_date,
    eventTime: booking.event_time ?? undefined,
    serviceType: booking.service_type,
    guestCount: booking.guest_count,
    meats: booking.meats as string[],
    eventAddress: booking.event_address,
    totalPrice: booking.total_price,
    bookingId: booking.id,
    bookingNumber: booking.booking_number,
    depositAmount: booking.deposit_amount,
    cancelUrl,
    rescheduleUrl,
    extras: booking.extras as { id: string; quantity: number; flavors?: Record<string, number> }[] | undefined,
  }, locale).catch((err) => console.error("Failed to send event confirmed email:", err));

  // Redirect to a success page
  return NextResponse.redirect(`${BASE_URL}/${locale}?confirmed=true`);
}
