import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("booking_number, total_price, deposit_amount, balance_due, cash_payment_method, cash_payment_option, deposit_deadline, customer_name")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking: data });
}
