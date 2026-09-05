import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin, generateBookingNumber } from "@/lib/supabase";
import {
  calculateTotal,
  calculateDeposit,
  isValidPackage,
  getBasePrice,
  calculateSurcharge,
  calculateProcessingFee,
  EXTRA_OPTIONS,
  type ServiceType,
  type MeatId,
  type ExtraId,
} from "@/lib/pricing";

import { getExtraName } from "@/lib/extra-labels";
import { isEventTime } from "@/lib/event-time";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

interface CheckoutBody {
  eventDate: string;
  eventTime?: string | null;
  serviceType: ServiceType;
  guestCount: number;
  meats: MeatId[];
  extras: Partial<Record<ExtraId, number>>;
  aguaFlavors?: Record<string, number>;
  extraMeatSelections?: Record<string, number>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventAddress: string;
  totalPrice: number;
  paymentMethod?: "card" | "cash";
  cashPaymentMethod?: "zelle" | "paypal" | "cashapp" | "venmo" | "cash_in_person" | null;
  cashPaymentOption?: "deposit" | "full" | null;
  locale?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json();

    const {
      eventDate,
      eventTime = null,
      serviceType,
      guestCount,
      meats,
      extras,
      customerName,
      customerEmail,
      customerPhone,
      eventAddress,
      aguaFlavors = {},
      extraMeatSelections = {},
      paymentMethod = "card",
      cashPaymentMethod = null,
      cashPaymentOption = null,
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

    if (!isValidPackage(serviceType, guestCount)) {
      return NextResponse.json({ error: "Invalid package", code: "INVALID_PACKAGE" }, { status: 400 });
    }
    if (!isEventTime(eventTime)) {
      return NextResponse.json({ error: "Invalid event time", code: "INVALID_TIME" }, { status: 400 });
    }
    if (!extras || typeof extras !== "object" || Array.isArray(extras) ||
      Object.entries(extras).some(([id, quantity]) =>
        !EXTRA_OPTIONS.some((extra) => extra.id === id) || !Number.isSafeInteger(quantity) || quantity! < 0)) {
      return NextResponse.json({ error: "Invalid extras", code: "INVALID_EXTRAS" }, { status: 400 });
    }

    // Fetch payment settings from DB (server-side truth)
    const { data: paySettings } = await supabaseAdmin
      .from("settings")
      .select("cc_surcharge_percent, cash_deposit_percent, stripe_fee_percent, stripe_fee_flat, cash_auto_cancel_hours, zelle_handle, venmo_handle, cashapp_handle, paypal_email, free_cancellation_days, cancellation_fee_type, cancellation_fee_flat, cancellation_fee_percent")
      .single();

    const serverSurchargePercent = paySettings?.cc_surcharge_percent ?? 10;
    const serverStripeFeePercent = paySettings?.stripe_fee_percent ?? 2.9;
    const serverStripeFeeFlatCents = paySettings?.stripe_fee_flat ?? 30;
    const serverCashDepositPercent = paySettings?.cash_deposit_percent ?? 10;
    const serverCashAutoCancelHours = paySettings?.cash_auto_cancel_hours ?? 48;

    // Recalculate price on server side (never trust client price)
    const basePrice = getBasePrice(serviceType, guestCount);
    const serverTotal = calculateTotal(serviceType, guestCount, extras);

    let chargeAmount: number;
    let surchargeAmount = 0;
    let processingFee = 0;
    let depositAmount = 0;
    let balanceDue = 0;

    if (paymentMethod === "cash") {
      chargeAmount = 0;
      if (cashPaymentOption === "deposit") {
        depositAmount = calculateDeposit(serverTotal, serverCashDepositPercent);
        balanceDue = serverTotal - depositAmount;
      } else {
        // full payment
        depositAmount = serverTotal;
        balanceDue = 0;
      }
    } else {
      surchargeAmount = calculateSurcharge(serverTotal, serverSurchargePercent);
      processingFee = calculateProcessingFee(serverTotal, serverStripeFeePercent, serverStripeFeeFlatCents);
      chargeAmount = serverTotal + surchargeAmount + processingFee;
    }

    const totalCents = Math.round(chargeAmount * 100);

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: locale === "es"
              ? `Taquiza de ${serviceType === "2hr" ? 2 : 3} Horas`
              : `${serviceType === "2hr" ? "2-Hour" : "3-Hour"} Taco Catering`,
            description: `${guestCount} ${locale === "es" ? "invitados" : "guests"} · ${meats.join(", ")}`,
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
          name: getExtraName(extra.id, locale),
        };
        // Add flavor info to Agua Fresca line item
        const flavorEntries = Object.entries(aguaFlavors).filter(([, q]) => (q || 0) > 0);
        if (extra.id === "agua" && flavorEntries.length > 0) {
          productData.description = `${locale === "es" ? "Sabores" : "Flavors"}: ${flavorEntries.map(([f, q]) => `${f} ×${q}`).join(", ")}`;
        }
        const meatEntries = Object.entries(extraMeatSelections).filter(([, q]) => (q || 0) > 0);
        if (extra.id === "extraMeat" && meatEntries.length > 0) {
          productData.description = `${locale === "es" ? "Carnes" : "Meats"}: ${meatEntries.map(([m, q]) => `${m} ×${q}`).join(", ")}`;
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

    const extrasData = Object.entries(extras)
      .filter(([, qty]) => (qty || 0) > 0)
      .map(([id, qty]) => ({
        id,
        quantity: qty,
        unitPrice: EXTRA_OPTIONS.find((extra) => extra.id === id)!.price,
        ...(id === "agua" && Object.keys(aguaFlavors).length > 0 && { flavors: aguaFlavors }),
        ...(id === "extraMeat" && Object.keys(extraMeatSelections).length > 0 && { meatSelections: extraMeatSelections }),
      }));

    if (paymentMethod === "cash") {
      // Cash: no Stripe at all. Save booking as Pending, owner confirms manually.
      const cancelToken = crypto.randomUUID();
      const rescheduleToken = crypto.randomUUID();

      const bookingNumber = generateBookingNumber(eventDate);

      const { data: booking, error: dbError } = await supabaseAdmin
        .from("bookings")
        .insert({
          event_date: eventDate,
          event_time: eventTime,
          service_type: serviceType,
          guest_count: guestCount,
          meats,
          extras: extrasData,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          event_address: eventAddress,
          total_price: serverTotal * 100,
          payment_type: "cash",
          deposit_amount: Math.round(depositAmount * 100),
          balance_due: Math.round(balanceDue * 100),
          cash_payment_method: cashPaymentMethod,
          cash_payment_option: cashPaymentOption || "full",
          deposit_confirmed: false,
          deposit_deadline: new Date(Date.now() + serverCashAutoCancelHours * 60 * 60 * 1000).toISOString(),
          locale,
          stripe_payment_status: "not_applicable",
          status: "pending",
          event_status: "unconfirmed",
          payment_status: "unpaid",
          cancel_token: cancelToken,
          reschedule_token: rescheduleToken,
          booking_number: bookingNumber,
        })
        .select("id, booking_number")
        .single();

      if (dbError) {
        console.error("Supabase insert error:", dbError);
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
      }

      // Resolve the payment handle for the chosen method
      const paymentHandleMap: Record<string, string | null> = {
        zelle: paySettings?.zelle_handle ?? "(562) 746-3998",
        paypal: paySettings?.paypal_email ?? null,
        cashapp: paySettings?.cashapp_handle ?? null,
        venmo: paySettings?.venmo_handle ?? null,
        cash_in_person: null,
      };
      const paymentHandle = paymentHandleMap[cashPaymentMethod || ""] ?? null;
      const depositDeadline = new Date(Date.now() + serverCashAutoCancelHours * 60 * 60 * 1000).toISOString();

      // Build cancel/reschedule URLs
      const cancelUrl = `${origin}/${locale}/booking/cancel/${cancelToken}`;
      const rescheduleUrl = `${origin}/${locale}/booking/reschedule/${rescheduleToken}`;

      // Notify owner + send pending confirmation to customer
      const { sendBookingNotification, sendCashPendingConfirmation, mapExtrasForEmail } = await import("@/lib/notifications");
      const baseNotifData = {
        bookingId: booking.id,
        bookingNumber: booking.booking_number,
        customerName,
        customerEmail,
        customerPhone,
        eventDate,
        eventTime: eventTime ?? undefined,
        serviceType,
        guestCount,
        meats,
        eventAddress,
        totalPrice: serverTotal * 100,
        paymentType: "cash",
        cancelUrl,
        rescheduleUrl,
        depositAmount: Math.round(depositAmount * 100),
        balanceDue: Math.round(balanceDue * 100),
        cashPaymentMethod: cashPaymentMethod || undefined,
        cashPaymentOption: cashPaymentOption || "full",
        depositDeadline,
        paymentHandle: paymentHandle || undefined,
        depositPercent: serverCashDepositPercent,
        cancellationPolicy: {
          freeCancellationDays: paySettings?.free_cancellation_days ?? 7,
          feeType: (paySettings?.cancellation_fee_type ?? "flat") as "flat" | "percentage",
          feeFlat: paySettings?.cancellation_fee_flat ?? 50,
          feePercent: paySettings?.cancellation_fee_percent ?? 25,
          cashDepositNonRefundable: true,
        },
      };
      await Promise.all([
        sendBookingNotification({ ...baseNotifData, extras: mapExtrasForEmail(extrasData, "es") }),
        sendCashPendingConfirmation({ ...baseNotifData, extras: mapExtrasForEmail(extrasData, locale as "en" | "es") }, locale as "en" | "es"),
      ]);

      // Redirect to success page with booking ID instead of Stripe session
      return NextResponse.json({
        url: `${origin}/${locale}/booking/success?session_id=cash_${booking.id}&ref=${booking.booking_number}&cash=true`,
        bookingId: booking.id,
      });
    }

    // Card payment: normal Stripe checkout
    if (process.env.APP_ENV === "sandbox" && process.env.STRIPE_SECRET_KEY === "sk_test_not_configured") {
      return NextResponse.json({ error: "Stripe test key required", code: "SANDBOX_STRIPE_REQUIRED" }, { status: 503 });
    }
    const cardBookingNumber = generateBookingNumber(eventDate);
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/${locale}/booking/success?session_id={CHECKOUT_SESSION_ID}&ref=${cardBookingNumber}`,
      cancel_url: `${origin}/${locale}/booking/cancel`,
      customer_email: customerEmail,
      metadata: {
        eventDate,
        ...(eventTime && { eventTime }),
        serviceType,
        guestCount: String(guestCount),
        meats: JSON.stringify(meats),
        customerName,
        customerPhone,
        eventAddress,
        ...(Object.keys(aguaFlavors).length > 0 && { aguaFlavors: JSON.stringify(aguaFlavors) }),
        ...(Object.keys(extraMeatSelections).length > 0 && { extraMeatSelections: JSON.stringify(extraMeatSelections) }),
        paymentMethod,
        locale,
      },
    });

    // Save booking to Supabase
    const { data: booking, error: dbError } = await supabaseAdmin
      .from("bookings")
      .insert({
        event_date: eventDate,
        event_time: eventTime,
        service_type: serviceType,
        guest_count: guestCount,
        meats,
        extras: extrasData,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        event_address: eventAddress,
        total_price: totalCents,
        locale,
        payment_type: "card",
        deposit_amount: 0,
        balance_due: 0,
        stripe_session_id: session.id,
        stripe_payment_status: "unpaid",
        status: "pending",
        event_status: "unconfirmed",
        payment_status: "unpaid",
        booking_number: cardBookingNumber,
      })
      .select("id, booking_number")
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
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
