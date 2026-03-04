import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidToken } from "../../auth/route";

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

    // Fetch the booking first to check cash_payment_option
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("cash_payment_option, payment_type")
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

    if (booking.cash_payment_option === "full") {
      update.balance_due = 0;
    }

    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update(update)
      .eq("id", bookingId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
