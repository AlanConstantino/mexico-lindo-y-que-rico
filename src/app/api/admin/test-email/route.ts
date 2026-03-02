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
  mapExtrasForEmail,
} from "@/lib/notifications";

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

// Randomized sample data for realistic test emails
function getSampleBooking(targetEmail: string) {
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

  // Random extras in DB format (for reminder emails)
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

  return {
    bookingId: `test-${crypto.randomUUID().slice(0, 8)}`,
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
    // DB-format extras for reminder functions
    dbExtras,
  };
}

export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { emailType, locale = "en", recipientEmail } = await request.json();
    const emailLocale = (locale === "es" ? "es" : "en") as "en" | "es";

    // Get notification email from settings
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("notification_email, reminder_days, cancellation_fee_type, cancellation_fee_flat, cancellation_fee_percent")
      .single();

    const notificationEmail = settings?.notification_email || "mx.lindo.y.que.rico.catering@gmail.com";
    const targetEmail = recipientEmail?.trim() || notificationEmail;
    const reminderDays = settings?.reminder_days ?? 5;
    const sample = getSampleBooking(targetEmail);

    // Mapped extras for confirmation/notification emails (display format)
    const emailExtras = mapExtrasForEmail(sample.dbExtras as { id: string; quantity: number; flavors?: Record<string, number> }[], emailLocale);
    const ownerExtras = mapExtrasForEmail(sample.dbExtras as { id: string; quantity: number; flavors?: Record<string, number> }[], "es");

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
        const dayBeforeFeeType = settings?.cancellation_fee_type || "flat";
        const dayBeforeFee = dayBeforeFeeType === "flat"
          ? (settings?.cancellation_fee_flat || 50) * 100
          : Math.round(sample.totalPrice * ((settings?.cancellation_fee_percent || 25) / 100));

        await sendDayBeforeReminder({
          ...sample,
          extras: sample.dbExtras,
          reminderDays: 1,
          cancelUrl: sample.cancelUrl,
          cancellationFee: dayBeforeFee,
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

      default:
        return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, sentTo: targetEmail, emailType });
  } catch (err) {
    console.error("❌ Test email error:", err);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
