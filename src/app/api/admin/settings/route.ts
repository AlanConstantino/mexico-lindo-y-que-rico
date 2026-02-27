import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidToken } from "../auth/route";

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

  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("*")
    .single();

  if (error) {
    // If no settings row exists, return defaults
    if (error.code === "PGRST116") {
      return NextResponse.json({
        settings: {
          max_events_per_day: 3,
          min_notice_days: 7,
          reminder_days: 5,
          notification_email: "constantinoalan98@gmail.com",
          notification_phone: "562-688-7250",
          cc_surcharge_percent: 10,
          cash_deposit_percent: 50,
        },
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}

export async function PUT(request: NextRequest) {
  const token = getToken(request);
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      max_events_per_day,
      min_notice_days,
      reminder_days,
      notification_email,
      notification_phone,
      cc_surcharge_percent,
      cash_deposit_percent,
      cancellation_fee_type,
      cancellation_fee_flat,
      cancellation_fee_percent,
      free_cancellation_days,
    } = body;

    const payload = {
      max_events_per_day,
      min_notice_days,
      reminder_days,
      notification_email,
      notification_phone,
      ...(cc_surcharge_percent !== undefined && { cc_surcharge_percent }),
      ...(cash_deposit_percent !== undefined && { cash_deposit_percent }),
      ...(cancellation_fee_type !== undefined && { cancellation_fee_type }),
      ...(cancellation_fee_flat !== undefined && { cancellation_fee_flat }),
      ...(cancellation_fee_percent !== undefined && { cancellation_fee_percent }),
      ...(free_cancellation_days !== undefined && { free_cancellation_days }),
    };

    // Try to update existing row first
    const { data: existing } = await supabaseAdmin
      .from("settings")
      .select("id")
      .single();

    let result;
    if (existing) {
      result = await supabaseAdmin
        .from("settings")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from("settings")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings: result.data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
