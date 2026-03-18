import { NextRequest, NextResponse } from "next/server";
import { isValidToken } from "../auth/route";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendBookingNotification,
  sendCustomerConfirmation,
  sendEventReminder,
  sendOwnerReminder,
  sendDayBeforeReminder,
  sendCashPendingConfirmation,
  sendCancellationConfirmation,
  sendOwnerCancellationNotice,
  sendRescheduleConfirmation,
  sendOwnerRescheduleNotice,
  sendOwnerInitiatedCancellation,
  sendEventConfirmedEmail,
  sendAutoConfirmRequest,
  sendOwnerNoResponseNotice,
  sendAutoCancelEmail,
  mapExtrasForEmail,
} from "@/lib/notifications";

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

// Randomized sample data for realistic test emails
function getSampleBooking(targetEmail: string, customData?: Record<string, unknown>) {
  const firstNames = ["María", "Carlos", "Jessica", "Roberto", "Ana", "David", "Sofia", "Miguel"];
  const lastNames = ["García", "Rodriguez", "Martinez", "Lopez", "Hernandez", "Rivera", "Torres", "Ramirez"];
  const streets = ["123 Sunset Blvd", "456 Whittier Blvd", "789 Atlantic Ave", "321 Pacific Coast Hwy", "555 Olvera St", "1200 Spring St"];
  const cities = ["Los Angeles, CA 90001", "Whittier, CA 90602", "Long Beach, CA 90802", "Downey, CA 90241", "Montebello, CA 90640"];
  const meatOptions = ["Carne Asada", "Al Pastor", "Pollo", "Chorizo", "Carnitas", "Birria"];
  const serviceTypes = ["2hr", "3hr"];
  const guestCounts = [50, 75, 100, 120, 150, 200];
  const times = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

  // Random future date 7-30 days out
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7 + Math.floor(Math.random() * 23));
  const dateStr = futureDate.toISOString().split("T")[0];

  const firstName = pick(firstNames);
  const lastName = pick(lastNames);
  const customerName = `${firstName} ${lastName}`;
  const phone = `(${562 + Math.floor(Math.random() * 100)}) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const selectedMeats = shuffle(meatOptions).slice(0, 4);
  const serviceType = pick(serviceTypes);
  const guestCount = pick(guestCounts);
  const eventTime = pick(times);

  // Random extras in DB format
  const dbExtras = [
    { id: "rice", quantity: 1 },
    { id: "beans", quantity: 1 },
    { id: "agua", quantity: 3, flavors: { horchata: 1, jamaica: 1, tamarindo: 1 } },
  ];

  // Base price calculation (rough)
  const basePrice = serviceType === "2hr"
    ? (guestCount <= 100 ? 495 : guestCount <= 200 ? 795 : 995)
    : (guestCount <= 100 ? 695 : guestCount <= 200 ? 995 : 1295);
  const extrasPrice = 40 + 40 + 75; // rice + beans + 3 aguas
  const totalPrice = (basePrice + extrasPrice) * 100; // in cents

  const bookingNumber = `QR-${dateStr.replace(/-/g, "")}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

  // Build base sample, then override with custom data
  const sample = {
    bookingId: `test-${crypto.randomUUID().slice(0, 8)}`,
    bookingNumber,
    customerName,
    customerEmail: targetEmail,
    customerPhone: phone,
    eventDate: dateStr,
    eventTime,
    serviceType,
    guestCount,
    meats: selectedMeats,
    eventAddress: `${pick(streets)}, ${pick(cities)}`,
    totalPrice,
    cancelUrl: "https://que.rico.catering/en/booking/cancel/test-token",
    rescheduleUrl: "https://que.rico.catering/en/booking/reschedule/test-token",
    dbExtras,
  };

  // Apply custom overrides
  if (customData) {
    if (customData.customerName) sample.customerName = customData.customerName as string;
    if (customData.customerPhone) sample.customerPhone = customData.customerPhone as string;
    if (customData.eventDate) sample.eventDate = customData.eventDate as string;
    if (customData.eventTime) sample.eventTime = customData.eventTime as string;
    if (customData.guestCount) sample.guestCount = customData.guestCount as number;
    if (customData.eventAddress) sample.eventAddress = customData.eventAddress as string;
    if (customData.totalPrice) sample.totalPrice = (customData.totalPrice as number) * 100; // convert dollars to cents
    if (customData.serviceType) sample.serviceType = customData.serviceType as string;
  }

  return sample;
}

export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { emailType, locale = "en", recipientEmail, customData } = await request.json();
    const emailLocale = (locale === "es" ? "es" : "en") as "en" | "es";

    // Get notification email from settings
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("notification_email, reminder_days, cancellation_fee_type, cancellation_fee_flat, cancellation_fee_percent, free_cancellation_days, cash_deposit_percent")
      .single();

    const notificationEmail = settings?.notification_email || "mx.lindo.y.que.rico.catering@gmail.com";
    const targetEmail = recipientEmail?.trim() || notificationEmail;
    const reminderDays = settings?.reminder_days ?? 5;
    const sample = getSampleBooking(targetEmail, customData);

    // Mapped extras for confirmation/notification emails (display format)
    const emailExtras = mapExtrasForEmail(sample.dbExtras as { id: string; quantity: number; flavors?: Record<string, number> }[], emailLocale);
    const ownerExtras = mapExtrasForEmail(sample.dbExtras as { id: string; quantity: number; flavors?: Record<string, number> }[], "es");

    // Calculate cancellation fee
    const feeType = settings?.cancellation_fee_type || "flat";
    const cancellationFee = feeType === "flat"
      ? (settings?.cancellation_fee_flat || 50) * 100
      : Math.round(sample.totalPrice * ((settings?.cancellation_fee_percent || 25) / 100));
    const depositPercent = settings?.cash_deposit_percent || 10;
    const depositAmount = Math.round(sample.totalPrice * (depositPercent / 100));

    switch (emailType) {
      case "owner_booking":
        await sendBookingNotification({
          ...sample,
          extras: ownerExtras,
          paymentType: Math.random() > 0.5 ? "card" : "cash",
          overrideRecipient: targetEmail,
        });
        break;

      case "customer_confirmation":
        await sendCustomerConfirmation({
          ...sample,
          extras: emailExtras,
        }, emailLocale);
        break;

      case "customer_reminder":
        await sendEventReminder({
          ...sample,
          extras: sample.dbExtras,
          reminderDays,
        }, emailLocale);
        break;

      case "owner_reminder":
        await sendOwnerReminder({
          ...sample,
          extras: sample.dbExtras,
          reminderDays,
          ownerEmail: targetEmail,
        });
        break;

      case "day_before": {
        await sendDayBeforeReminder({
          ...sample,
          extras: sample.dbExtras,
          reminderDays: 1,
          cancelUrl: sample.cancelUrl,
          cancellationFee,
        }, emailLocale);
        break;
      }

      case "cash_pending":
        await sendCashPendingConfirmation({
          ...sample,
          extras: emailExtras,
          paymentType: "cash",
        }, emailLocale);
        break;

      case "customer_cancellation":
        await sendCancellationConfirmation({
          ...sample,
          refundAmount: Math.max(0, sample.totalPrice - cancellationFee),
          cancellationFee,
          paymentType: Math.random() > 0.5 ? "card" : "cash",
          depositAmount,
          cashPaymentMethod: "zelle",
        }, emailLocale);
        break;

      case "owner_cancellation":
        await sendOwnerCancellationNotice({
          ...sample,
          refundAmount: Math.max(0, sample.totalPrice - cancellationFee),
          cancellationFee,
          ownerEmail: targetEmail,
        });
        break;

      case "customer_reschedule": {
        // Generate a different date for the "new" date
        const newDate = new Date(sample.eventDate);
        newDate.setDate(newDate.getDate() + 7);
        await sendRescheduleConfirmation({
          ...sample,
          oldDate: sample.eventDate,
          oldTime: sample.eventTime,
          newDate: newDate.toISOString().split("T")[0],
          newTime: "15:00",
        }, emailLocale);
        break;
      }

      case "owner_reschedule": {
        const newDate2 = new Date(sample.eventDate);
        newDate2.setDate(newDate2.getDate() + 7);
        await sendOwnerRescheduleNotice({
          ...sample,
          oldDate: sample.eventDate,
          oldTime: sample.eventTime,
          newDate: newDate2.toISOString().split("T")[0],
          newTime: "15:00",
          ownerEmail: targetEmail,
        });
        break;
      }

      case "owner_initiated_cancel":
        await sendOwnerInitiatedCancellation({
          ...sample,
          paymentType: Math.random() > 0.5 ? "card" : "cash",
          depositAmount,
          totalPrice: sample.totalPrice,
        }, emailLocale);
        break;

      case "auto_cancel":
        await sendAutoCancelEmail({
          ...sample,
          amountDue: depositAmount,
        }, emailLocale);
        break;

      case "event_confirmed":
        await sendEventConfirmedEmail({
          ...sample,
          depositAmount,
          extras: sample.dbExtras as { id: string; quantity: number; flavors?: Record<string, number> }[],
        }, emailLocale);
        break;

      case "auto_confirm_request":
        await sendAutoConfirmRequest({
          ...sample,
          confirmUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://que.rico.catering"}/api/booking/confirm-event?token=test-token`,
          daysUntilEvent: settings?.free_cancellation_days ?? 7,
          extras: sample.dbExtras as { id: string; quantity: number; flavors?: Record<string, number> }[],
        }, emailLocale);
        break;

      case "owner_no_response":
        await sendOwnerNoResponseNotice({
          customerName: sample.customerName,
          customerEmail: sample.customerEmail,
          customerPhone: sample.customerPhone,
          eventDate: sample.eventDate,
          bookingId: sample.bookingId,
          bookingNumber: sample.bookingNumber,
          ownerEmail: targetEmail,
        });
        break;

      default:
        return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, sentTo: targetEmail, emailType });
  } catch (err) {
    console.error("❌ Test email error:", err);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
