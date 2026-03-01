import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("cc_surcharge_percent, cash_deposit_percent, stripe_fee_percent, stripe_fee_flat, zelle_handle")
    .single();

  if (error) {
    return NextResponse.json({
      cc_surcharge_percent: 10,
      cash_deposit_percent: 50,
      stripe_fee_percent: 2.9,
      stripe_fee_flat: 30,
      zelle_handle: "(562) 746-3998",
    });
  }

  return NextResponse.json({
    cc_surcharge_percent: data.cc_surcharge_percent ?? 10,
    cash_deposit_percent: data.cash_deposit_percent ?? 50,
    stripe_fee_percent: data.stripe_fee_percent ?? 2.9,
    stripe_fee_flat: data.stripe_fee_flat ?? 30,
    zelle_handle: data.zelle_handle ?? "(562) 746-3998",
  });
}
