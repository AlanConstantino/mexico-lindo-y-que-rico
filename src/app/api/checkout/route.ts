import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import {
  calculateTotal,
  getBasePrice,
  calculateSurcharge,
  calculateDeposit,
  calculateProcessingFee,
  EXTRA_OPTIONS,
  type ServiceType,
  type MeatId,
  type ExtraId,
} from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

interface CheckoutBody {
  eventDate: string;
  serviceType: ServiceType;
  guestCount: number;
  meats: MeatId[];
  extras: Partial<Record<ExtraId, number>>;
  aguaFlavors?: Record<string, number>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventAddress: string;
  totalPrice: number;
  paymentMethod?: "card" | "cash";
  ccSurchargePercent?: number;
  cashDepositPercent?: number;
  locale?: string;
}

// Extra display names for Stripe line items
const EXTRA_NAMES: Record<ExtraId, string> = {
  rice: "Rice",
  beans: "Beans",
  quesadillas: "Quesadillas (Flour Tortilla)",
  jalapenos: "Jalapeños & Grilled Onions",
  guacamole: "Fresh Guacamole & Chips",
  salsa: "Fresh Salsa & Chips",
  agua: "Agua Fresca",
  salad: "Salad",
  burgers: "Cheeseburgers",
  hotdogs: "Hot Dogs",
};

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json();

    const {
      eventDate,
      serviceType,
      guestCount,
      meats,
      extras,
      customerName,
      customerEmail,
      customerPhone,
      eventAddress,
      aguaFlavors = {},
      paymentMethod = "card",
      ccSurchargePercent = 10,
      cashDepositPercent = 50,
      locale = "en",
    } = body;

    // Validate required fields
    if (
      !eventDate ||
      !serviceType ||
      !guestCount ||
      !meats ||
      meats.length !== 4 ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !eventAddress
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch payment settings from DB (server-side truth)
    const { data: paySettings } = await supabaseAdmin
      .from("settings")
      .select("cc_surcharge_percent, cash_deposit_percent, stripe_fee_percent, stripe_fee_flat")
      .single();

    const serverSurchargePercent = paySettings?.cc_surcharge_percent ?? 10;
    const serverStripeFeePercent = paySettings?.stripe_fee_percent ?? 2.9;
    const serverStripeFeeFlatCents = paySettings?.stripe_fee_flat ?? 30;

    // Recalculate price on server side (never trust client price)
    const basePrice = getBasePrice(serviceType, guestCount);
    const serverTotal = calculateTotal(serviceType, guestCount, extras);

    let chargeAmount: number;
    let surchargeAmount = 0;
    let processingFee = 0;
    let depositAmount = 0;
    let balanceDue = 0;

    if (paymentMethod === "cash") {
      chargeAmount = 0; // No charge for cash — just save card on file
      balanceDue = serverTotal;
    } else {
      surchargeAmount = calculateSurcharge(serverTotal, serverSurchargePercent);
      processingFee = calculateProcessingFee(serverTotal, serverStripeFeePercent, serverStripeFeeFlatCents);
      chargeAmount = serverTotal + surchargeAmount + processingFee;
    }

    const totalCents = chargeAmount * 100;

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${serviceType === "2hr" ? "2-Hour" : "3-Hour"} Taco Catering`,
            description: `${guestCount} guests · ${meats.join(", ")}`,
          },
          unit_amount: basePrice * 100,
        },
        quantity: 1,
      },
    ];

    // Add extras as line items
    for (const extra of EXTRA_OPTIONS) {
      const qty = extras[extra.id] || 0;
      if (qty > 0) {
        const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
          name: EXTRA_NAMES[extra.id],
        };
        // Add flavor info to Agua Fresca line item
        const flavorEntries = Object.entries(aguaFlavors).filter(([, q]) => (q || 0) > 0);
        if (extra.id === "agua" && flavorEntries.length > 0) {
          productData.description = `Flavors: ${flavorEntries.map(([f, q]) => `${f} ×${q}`).join(", ")}`;
        }
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: productData,
            unit_amount: extra.price * 100,
          },
          quantity: qty,
        });
      }
    }

    // Add surcharge and processing fee line items for card payments
    if (paymentMethod === "card") {
      if (surchargeAmount > 0) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Credit Card Surcharge (${serverSurchargePercent}%)`,
            },
            unit_amount: surchargeAmount * 100,
          },
          quantity: 1,
        });
      }
      if (processingFee > 0) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Payment Processing Fee (${serverStripeFeePercent}% + $${(serverStripeFeeFlatCents / 100).toFixed(2)})`,
            },
            unit_amount: Math.round(processingFee * 100),
          },
          quantity: 1,
        });
      }
    }

    // Determine origin for redirect URLs
    const origin =
      request.headers.get("origin") || "http://localhost:3000";

    let session;

    if (paymentMethod === "cash") {
      // Cash: save card on file only (no charge) via Stripe Setup mode
      session = await stripe.checkout.sessions.create({
        mode: "setup",
        success_url: `${origin}/${locale}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/${locale}/booking/cancel`,
        customer_email: customerEmail,
        metadata: {
          eventDate,
          serviceType,
          guestCount: String(guestCount),
          meats: JSON.stringify(meats),
          customerName,
          customerPhone,
          eventAddress,
          ...(Object.keys(aguaFlavors).length > 0 && { aguaFlavors: JSON.stringify(aguaFlavors) }),
          paymentMethod,
        },
      });
    } else {
      // Card: normal payment checkout (Stripe auto-enables Apple Pay, Google Pay, etc.)
      session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/${locale}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/${locale}/booking/cancel`,
        customer_email: customerEmail,
        metadata: {
          eventDate,
          serviceType,
          guestCount: String(guestCount),
          meats: JSON.stringify(meats),
          customerName,
          customerPhone,
          eventAddress,
          ...(Object.keys(aguaFlavors).length > 0 && { aguaFlavors: JSON.stringify(aguaFlavors) }),
          paymentMethod,
        },
      });
    }

    // Save booking to Supabase
    const { data: booking, error: dbError } = await supabaseAdmin
      .from("bookings")
      .insert({
        event_date: eventDate,
        service_type: serviceType,
        guest_count: guestCount,
        meats: meats,
        extras: Object.entries(extras)
          .filter(([, qty]) => (qty || 0) > 0)
          .map(([id, qty]) => ({
            id,
            quantity: qty,
            ...(id === "agua" && Object.keys(aguaFlavors).length > 0 && { flavors: aguaFlavors }),
          })),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        event_address: eventAddress,
        total_price: totalCents,
        payment_type: paymentMethod,
        deposit_amount: 0,
        balance_due: paymentMethod === "cash" ? totalCents : 0,
        stripe_session_id: session.id,
        stripe_payment_status: "unpaid",
        status: "pending",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      // Still return checkout URL — the webhook will handle the rest
    }

    return NextResponse.json({
      url: session.url,
      bookingId: booking?.id || null,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
