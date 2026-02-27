import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("id, customer_name, event_date, service_type, guest_count, total_price, status")
    .eq("reschedule_token", token)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "Booking cancelled" }, { status: 400 });
  }

  return NextResponse.json({ booking });
}
