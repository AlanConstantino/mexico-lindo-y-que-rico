import { NextRequest, NextResponse } from "next/server";
import { isValidToken } from "../auth/route";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendBookingNotification,
  sendCustomerConfirmation,
  sendEventReminder,
  sendOwnerReminder,
  sendDayBeforeReminder,
} from "@/lib/notifications";

function getToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

// Sample booking data for test emails
function getSampleBooking(notificationEmail: string) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 14);
  const dateStr = futureDate.toISOString().split("T")[0];

  return {
    bookingId: "test-00000000-0000-0000-0000-000000000000",
    customerName: "Test Customer",
    customerEmail: notificationEmail,
    customerPhone: "(555) 123-4567",
    eventDate: dateStr,
    serviceType: "3hr",
    guestCount: 100,
    meats: ["Carne Asada", "Al Pastor", "Pollo", "Chorizo"],
    eventAddress: "123 Test Street, Los Angeles, CA 90001",
    extras: [
      { name: "Rice", quantity: 1, price: "$40" },
      { name: "Agua Fresca", quantity: 3, price: "$75" },
    ],
    totalPrice: 81000, // $810.00 in cents
    cancelUrl: "https://que.rico.catering/en/booking/cancel/test-token",
    rescheduleUrl: "https://que.rico.catering/en/booking/reschedule/test-token",
  };
}

export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { emailType } = await request.json();

    // Get notification email from settings
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("notification_email, reminder_days, cancellation_fee_type, cancellation_fee_flat, cancellation_fee_percent")
      .single();

    const notificationEmail = settings?.notification_email || "constantinoalan98@gmail.com";
    const reminderDays = settings?.reminder_days ?? 5;
    const sample = getSampleBooking(notificationEmail);

    switch (emailType) {
      case "owner_booking":
        await sendBookingNotification(sample);
        break;

      case "customer_confirmation":
        await sendCustomerConfirmation(sample);
        break;

      case "customer_reminder": {
        await sendEventReminder({
          ...sample,
          extras: sample.extras as unknown as { id: string; quantity: number; flavors?: string[] }[],
          reminderDays,
          cancelUrl: sample.cancelUrl,
          rescheduleUrl: sample.rescheduleUrl,
        });
        break;
      }

      case "owner_reminder":
        await sendOwnerReminder({
          ...sample,
          extras: sample.extras as unknown as { id: string; quantity: number; flavors?: string[] }[],
          reminderDays,
          ownerEmail: notificationEmail,
        });
        break;

      case "day_before": {
        const dayBeforeFeeType = settings?.cancellation_fee_type || "flat";
        const dayBeforeFee = dayBeforeFeeType === "flat"
          ? (settings?.cancellation_fee_flat || 50) * 100
          : Math.round(sample.totalPrice * ((settings?.cancellation_fee_percent || 25) / 100));

        await sendDayBeforeReminder({
          ...sample,
          extras: sample.extras as unknown as { id: string; quantity: number; flavors?: string[] }[],
          reminderDays: 1,
          cancelUrl: sample.cancelUrl,
          cancellationFee: dayBeforeFee,
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, sentTo: notificationEmail, emailType });
  } catch (err) {
    console.error("❌ Test email error:", err);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
