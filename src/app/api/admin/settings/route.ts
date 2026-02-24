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
          min_notice_days: 3,
          notification_email: "constantinoalan98@gmail.com",
          notification_phone: "562-688-7250",
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
      notification_email,
      notification_phone,
    } = body;

    // Try to update existing row first
    const { data: existing } = await supabaseAdmin
      .from("settings")
      .select("id")
      .single();

    let result;
    if (existing) {
      result = await supabaseAdmin
        .from("settings")
        .update({
          max_events_per_day,
          min_notice_days,
          notification_email,
          notification_phone,
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from("settings")
        .insert({
          max_events_per_day,
          min_notice_days,
          notification_email,
          notification_phone,
        })
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
