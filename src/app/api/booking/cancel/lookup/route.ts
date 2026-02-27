import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("id, customer_name, event_date, service_type, guest_count, meats, event_address, total_price, status")
    .eq("cancel_token", token)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
  }

  const { data: settings } = await supabaseAdmin
    .from("settings")
    .select("cancellation_fee_type, cancellation_fee_flat, cancellation_fee_percent, free_cancellation_days")
    .single();

  const freeCancellationDays = settings?.free_cancellation_days ?? 3;
  const eventDate = new Date(booking.event_date + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let cancellationFee = 0;
  const isFree = daysUntil >= freeCancellationDays;

  if (!isFree) {
    const feeType = settings?.cancellation_fee_type ?? "flat";
    if (feeType === "flat") {
      cancellationFee = (settings?.cancellation_fee_flat ?? 50) * 100;
    } else {
      const percent = settings?.cancellation_fee_percent ?? 25;
      cancellationFee = Math.round((booking.total_price * percent) / 100);
    }
  }

  const refundAmount = Math.max(0, booking.total_price - cancellationFee);

  return NextResponse.json({
    booking,
    feeInfo: { cancellationFee, refundAmount, isFree },
  });
}
