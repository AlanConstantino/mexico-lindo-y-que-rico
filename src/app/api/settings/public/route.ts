import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("cc_surcharge_percent, cash_deposit_percent, stripe_fee_percent, stripe_fee_flat, zelle_handle, zelle_enabled, venmo_handle, venmo_enabled, cashapp_handle, cashapp_enabled, paypal_email, paypal_enabled, cash_auto_cancel_hours")
    .single();

  if (error) {
    return NextResponse.json({
      cc_surcharge_percent: 10,
      cash_deposit_percent: 50,
      stripe_fee_percent: 2.9,
      stripe_fee_flat: 30,
    });
  }

  return NextResponse.json({
    cc_surcharge_percent: data.cc_surcharge_percent ?? 10,
    cash_deposit_percent: data.cash_deposit_percent ?? 10,
    stripe_fee_percent: data.stripe_fee_percent ?? 2.9,
    stripe_fee_flat: data.stripe_fee_flat ?? 30,
    zelle_handle: data.zelle_handle ?? "",
    zelle_enabled: data.zelle_enabled ?? true,
    venmo_handle: data.venmo_handle ?? "",
    venmo_enabled: data.venmo_enabled ?? true,
    cashapp_handle: data.cashapp_handle ?? "",
    cashapp_enabled: data.cashapp_enabled ?? true,
    paypal_email: data.paypal_email ?? "",
    paypal_enabled: data.paypal_enabled ?? true,
    cash_auto_cancel_hours: data.cash_auto_cancel_hours ?? 48,
  });
}
