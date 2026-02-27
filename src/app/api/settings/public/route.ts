import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("cc_surcharge_percent, cash_deposit_percent")
    .single();

  if (error) {
    return NextResponse.json({
      cc_surcharge_percent: 10,
      cash_deposit_percent: 50,
    });
  }

  return NextResponse.json({
    cc_surcharge_percent: data.cc_surcharge_percent ?? 10,
    cash_deposit_percent: data.cash_deposit_percent ?? 50,
  });
}
