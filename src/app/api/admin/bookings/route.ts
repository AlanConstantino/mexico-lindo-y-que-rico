import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidToken } from "../auth/route";
import { sendCustomerConfirmation } from "@/lib/notifications";

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

    // Send confirmation email when a cash booking is confirmed by the owner
    if (status === "confirmed" && data.payment_type === "cash") {
      const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://que.rico.catering";
      const cancelUrl = data.cancel_token ? `${BASE_URL}/en/booking/cancel/${data.cancel_token}` : undefined;
      const rescheduleUrl = data.reschedule_token ? `${BASE_URL}/en/booking/reschedule/${data.reschedule_token}` : undefined;

      await sendCustomerConfirmation({
        bookingId: data.id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        eventDate: data.event_date,
        serviceType: data.service_type,
        guestCount: data.guest_count,
        meats: data.meats as string[],
        eventAddress: data.event_address,
        totalPrice: data.total_price,
        cancelUrl,
        rescheduleUrl,
      }).catch((err) => console.error("Failed to send cash confirmation email:", err));
    }

    return NextResponse.json({ booking: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
