import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import {
  calculateTotal,
  getBasePrice,
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
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventAddress: string;
  totalPrice: number;
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

    // Recalculate price on server side (never trust client price)
    const basePrice = getBasePrice(serviceType, guestCount);
    const serverTotal = calculateTotal(serviceType, guestCount, extras);
    const totalCents = serverTotal * 100;

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
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: EXTRA_NAMES[extra.id],
            },
            unit_amount: extra.price * 100,
          },
          quantity: qty,
        });
      }
    }

    // Determine origin for redirect URLs
    const origin =
      request.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
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
      },
    });

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
          .map(([id, qty]) => ({ id, quantity: qty })),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        event_address: eventAddress,
        total_price: totalCents,
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
