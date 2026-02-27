import { Resend } from "resend";
import { EXTRA_OPTIONS } from "@/lib/pricing";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingNotification {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  serviceType: string;
  guestCount: number;
  meats: string[];
  eventAddress?: string;
  extras?: { name: string; quantity: number; price: string }[];
  totalPrice: number;
  cancelUrl?: string;
  rescheduleUrl?: string;
}

export async function sendBookingNotification(
  booking: BookingNotification
): Promise<void> {
  const formattedPrice = `$${(booking.totalPrice / 100).toFixed(2)}`;
  const formattedDate = new Date(booking.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const extrasText = booking.extras?.length
    ? booking.extras
        .map((e) => `  • ${e.name} x${e.quantity} — ${e.price}`)
        .join("\n")
    : "  None";

  const textMessage = [
    `🎉 New Booking Received!`,
    ``,
    `Customer: ${booking.customerName}`,
    `Email: ${booking.customerEmail}`,
    `Phone: ${booking.customerPhone}`,
    ``,
    `Event Date: ${formattedDate}`,
    `Event Address: ${booking.eventAddress || "Not provided"}`,
    `Package: ${booking.serviceType === "2hr" ? "2-Hour" : "3-Hour"} Service`,
    `Guests: ${booking.guestCount}`,
    ``,
    `Meats:`,
    ...booking.meats.map((m) => `  • ${m}`),
    ``,
    `Extras:`,
    extrasText,
    ``,
    `Total: ${formattedPrice}`,
    ``,
    `Booking ID: ${booking.bookingId}`,
  ].join("\n");

  const htmlMessage = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #E8A935; border-bottom: 2px solid #C45A3C; padding-bottom: 10px;">
        🎉 New Booking Received!
      </h1>
      
      <h3 style="color: #3B2A1E;">Customer Info</h3>
      <p><strong>Name:</strong> ${booking.customerName}</p>
      <p><strong>Email:</strong> <a href="mailto:${booking.customerEmail}">${booking.customerEmail}</a></p>
      <p><strong>Phone:</strong> <a href="tel:${booking.customerPhone}">${booking.customerPhone}</a></p>
      
      <h3 style="color: #3B2A1E;">Event Details</h3>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Address:</strong> ${booking.eventAddress || "Not provided"}</p>
      <p><strong>Package:</strong> ${booking.serviceType === "2hr" ? "2-Hour" : "3-Hour"} Service</p>
      <p><strong>Guests:</strong> ${booking.guestCount}</p>
      
      <h3 style="color: #3B2A1E;">Meats</h3>
      <ul>
        ${booking.meats.map((m) => `<li>${m}</li>`).join("")}
      </ul>
      
      <h3 style="color: #3B2A1E;">Extras</h3>
      ${
        booking.extras?.length
          ? `<ul>${booking.extras.map((e) => `<li>${e.name} x${e.quantity} — ${e.price}</li>`).join("")}</ul>`
          : "<p>None</p>"
      }
      
      <div style="background: #2D2926; color: #FAF5EF; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center;">
        <p style="font-size: 24px; margin: 0; color: #E8A935; font-weight: bold;">${formattedPrice}</p>
        <p style="margin: 5px 0 0; color: #FAF5EF99;">Total Amount</p>
      </div>
      
      <p style="color: #999; font-size: 12px; margin-top: 20px;">Booking ID: ${booking.bookingId}</p>
    </div>
  `;

  try {
    // Send email to owner
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: "constantinoalan98@gmail.com",
      subject: `New Booking — ${booking.customerName} — ${formattedDate}`,
      text: textMessage,
      html: htmlMessage,
    });

    console.log(`✅ Booking notification email sent for ${booking.bookingId}`);
  } catch (error) {
    console.error("❌ Failed to send booking notification email:", error);
  }
}

export async function sendCustomerConfirmation(
  booking: BookingNotification
): Promise<void> {
  const formattedPrice = `$${(booking.totalPrice / 100).toFixed(2)}`;
  const formattedDate = new Date(booking.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const extrasSection = booking.extras?.length
    ? booking.extras
        .map((e) => `<li style="padding: 4px 0;">${e.name} x${e.quantity} — ${e.price}</li>`)
        .join("")
    : "";

  const textMessage = [
    `Thank you for your booking with México Lindo Y Que Rico! 🌮`,
    ``,
    `Here's your booking summary:`,
    ``,
    `Event Date: ${formattedDate}`,
    `Event Address: ${booking.eventAddress || "Not provided"}`,
    `Package: ${booking.serviceType === "2hr" ? "2-Hour" : "3-Hour"} Service`,
    `Guests: ${booking.guestCount}`,
    ``,
    `Meats:`,
    ...booking.meats.map((m) => `  • ${m}`),
    ``,
    ...(booking.extras?.length
      ? [`Extras:`, ...booking.extras.map((e) => `  • ${e.name} x${e.quantity} — ${e.price}`)]
      : []),
    ``,
    `Total Paid: ${formattedPrice}`,
    ``,
    `We'll arrive 1 hour before your event begins to set up.`,
    ``,
    `Questions? Call us at (562) 235-9361 or (562) 746-3998.`,
    ``,
    ...(booking.rescheduleUrl ? [`Need to reschedule? ${booking.rescheduleUrl}`] : []),
    ...(booking.cancelUrl ? [`Need to cancel? ${booking.cancelUrl}`] : []),
    ``,
    `¡Gracias! — México Lindo Y Que Rico`,
  ].join("\n");

  const htmlMessage = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF5EF; border-radius: 16px; overflow: hidden;">
      <!-- Header -->
      <div style="background: #2D2926; padding: 40px 30px; text-align: center;">
        <h1 style="color: #E8A935; margin: 0; font-size: 28px;">México Lindo Y Que Rico</h1>
        <p style="color: #FAF5EF99; margin: 8px 0 0; font-size: 14px;">Aquí la panza es primero.</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #2D2926; margin: 0 0 8px;">¡Gracias, ${booking.customerName}! 🎉</h2>
        <p style="color: #555; margin: 0 0 24px; font-size: 16px;">
          Your booking is confirmed. Here's everything you need to know:
        </p>

        <!-- Event Details Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #E8A935;">
          <h3 style="color: #2D2926; margin: 0 0 16px; font-size: 18px;">📅 Event Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Date</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Address</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${booking.eventAddress || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Package</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${booking.serviceType === "2hr" ? "2-Hour" : "3-Hour"} Service</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Guests</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${booking.guestCount}</td>
            </tr>
          </table>
        </div>

        <!-- Meats Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #C45A3C;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">🥩 Your Meats</h3>
          <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
            ${booking.meats.map((m) => `<li style="padding: 4px 0;">${m}</li>`).join("")}
          </ul>
        </div>

        ${
          booking.extras?.length
            ? `
        <!-- Extras Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #7A8B6F;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">✨ Extras</h3>
          <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
            ${extrasSection}
          </ul>
        </div>`
            : ""
        }

        <!-- Total -->
        <div style="background: #2D2926; color: #FAF5EF; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #FAF5EF99; font-size: 14px;">Total Paid</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #E8A935;">${formattedPrice}</p>
        </div>

        <!-- Setup Note -->
        <div style="background: #E8A93520; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #2D2926; font-size: 14px;">
            ⏰ <strong>Setup:</strong> Our team will arrive 1 hour before your event begins to get everything ready. No action needed on your end!
          </p>
        </div>

        ${booking.cancelUrl || booking.rescheduleUrl ? `
        <!-- Manage Booking -->
        <div style="background: #f5f0eb; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 8px; color: #2D2926; font-size: 13px; font-weight: 600;">Manage Your Booking</p>
          <p style="margin: 0; font-size: 13px;">
            ${booking.rescheduleUrl ? `<a href="${booking.rescheduleUrl}" style="color: #C45A3C; text-decoration: none; font-weight: 600;">Reschedule</a>` : ""}
            ${booking.cancelUrl && booking.rescheduleUrl ? ' &nbsp;·&nbsp; ' : ""}
            ${booking.cancelUrl ? `<a href="${booking.cancelUrl}" style="color: #888; text-decoration: none;">Cancel Booking</a>` : ""}
          </p>
        </div>
        ` : ""}

        <!-- Contact -->
        <p style="color: #555; font-size: 14px; text-align: center; margin: 0;">
          Questions? Call us at <a href="tel:5622359361" style="color: #C45A3C; text-decoration: none; font-weight: 600;">(562) 235-9361</a>
          or <a href="tel:5627463998" style="color: #C45A3C; text-decoration: none; font-weight: 600;">(562) 746-3998</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #2D2926; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; color: #FAF5EF66; font-size: 12px;">
          México Lindo Y Que Rico · Greater Los Angeles · 20+ Years of Flavor
        </p>
        <p style="margin: 4px 0 0; color: #FAF5EF44; font-size: 11px;">Booking ID: ${booking.bookingId}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: booking.customerEmail,
      subject: `Booking Confirmed — ${formattedDate} 🌮`,
      text: textMessage,
      html: htmlMessage,
    });

    console.log(`✅ Customer confirmation email sent to ${booking.customerEmail}`);
  } catch (error) {
    console.error("❌ Failed to send customer confirmation email:", error);
  }
}

// ─── Event Reminder Emails ───────────────────────────────────────

interface ReminderData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  serviceType: string;
  guestCount: number;
  meats: string[];
  eventAddress?: string;
  extras?: { id: string; quantity: number; flavors?: string[] }[];
  totalPrice: number;
  reminderDays: number;
  cancelUrl?: string;
  rescheduleUrl?: string;
}

interface DayBeforeReminderData extends ReminderData {
  cancellationFee: number;
  cancelUrl: string;
}

function formatExtrasForReminder(
  extras?: { id: string; quantity: number; flavors?: string[] }[]
): { html: string; text: string } {
  if (!extras || extras.length === 0) return { html: "", text: "" };

  const lines = extras.map((e) => {
    const option = EXTRA_OPTIONS.find((o) => o.id === e.id);
    const name = e.id.charAt(0).toUpperCase() + e.id.slice(1);
    const price = option ? `$${(e.quantity * option.price).toLocaleString()}` : "";
    const flavorNote =
      e.id === "agua" && e.flavors?.length
        ? ` (${e.flavors.join(", ")})`
        : "";
    return { name: `${name}${flavorNote}`, qty: e.quantity, price };
  });

  const html = `
    <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #7A8B6F;">
      <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">✨ Extras</h3>
      <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
        ${lines.map((l) => `<li style="padding: 4px 0;">${l.name} x${l.qty} — ${l.price}</li>`).join("")}
      </ul>
    </div>`;

  const text = lines.map((l) => `  • ${l.name} x${l.qty} — ${l.price}`).join("\n");

  return { html, text };
}

export async function sendEventReminder(
  data: ReminderData
): Promise<void> {
  const formattedDate = new Date(data.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedPrice = `$${(data.totalPrice / 100).toFixed(2)}`;
  const { html: extrasHtml, text: extrasText } = formatExtrasForReminder(data.extras);

  const textMessage = [
    `🌮 Reminder: Your Catering Event is Coming Up!`,
    ``,
    `Hey ${data.customerName},`,
    ``,
    `Just a friendly reminder that your taco catering is in ${data.reminderDays} days!`,
    ``,
    `Event Date: ${formattedDate}`,
    `Location: ${data.eventAddress || "Not provided"}`,
    `Package: ${data.serviceType === "2hr" ? "2-Hour" : "3-Hour"} Service`,
    `Guests: ${data.guestCount}`,
    ``,
    `Meats:`,
    ...data.meats.map((m) => `  • ${m}`),
    ...(extrasText ? [``, `Extras:`, extrasText] : []),
    ``,
    `Total Paid: ${formattedPrice}`,
    ``,
    `Our team will arrive 1 hour before your event begins to set up.`,
    ``,
    `Questions or changes? Call us at (562) 235-9361 or (562) 746-3998.`,
    ...(data.cancelUrl ? [``, `Cancel your booking: ${data.cancelUrl}`] : []),
    ...(data.rescheduleUrl ? [`Reschedule your booking: ${data.rescheduleUrl}`] : []),
    ``,
    `See you soon! — México Lindo Y Que Rico`,
  ].join("\n");

  const htmlMessage = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF5EF; border-radius: 16px; overflow: hidden;">
      <!-- Header -->
      <div style="background: #2D2926; padding: 40px 30px; text-align: center;">
        <h1 style="color: #E8A935; margin: 0; font-size: 28px;">México Lindo Y Que Rico</h1>
        <p style="color: #FAF5EF99; margin: 8px 0 0; font-size: 14px;">Aquí la panza es primero.</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #2D2926; margin: 0 0 8px;">Your event is in ${data.reminderDays} days! 🎉</h2>
        <p style="color: #555; margin: 0 0 24px; font-size: 16px;">
          Hey ${data.customerName}, just a friendly reminder about your upcoming taco catering:
        </p>

        <!-- Event Details Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #E8A935;">
          <h3 style="color: #2D2926; margin: 0 0 16px; font-size: 18px;">📅 Event Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Date</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Address</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${data.eventAddress || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Package</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${data.serviceType === "2hr" ? "2-Hour" : "3-Hour"} Service</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Guests</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${data.guestCount}</td>
            </tr>
          </table>
        </div>

        <!-- Meats Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #C45A3C;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">🥩 Your Meats</h3>
          <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
            ${data.meats.map((m) => `<li style="padding: 4px 0;">${m}</li>`).join("")}
          </ul>
        </div>

        ${extrasHtml}

        <!-- Total -->
        <div style="background: #2D2926; color: #FAF5EF; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #FAF5EF99; font-size: 14px;">Total Paid</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #E8A935;">${formattedPrice}</p>
        </div>

        <!-- Setup Note -->
        <div style="background: #E8A93520; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #2D2926; font-size: 14px;">
            ⏰ <strong>Setup:</strong> Our team will arrive 1 hour before your event begins to get everything ready. No action needed on your end!
          </p>
        </div>

        ${data.cancelUrl || data.rescheduleUrl ? `
        <div style="text-align: center; margin-bottom: 24px;">
          ${data.cancelUrl ? `<a href="${data.cancelUrl}" style="display: inline-block; padding: 12px 24px; background: #C45A3C; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 8px 8px 0;">Cancel Booking</a>` : ""}
          ${data.rescheduleUrl ? `<a href="${data.rescheduleUrl}" style="display: inline-block; padding: 12px 24px; background: #E8A935; color: #2D2926; text-decoration: none; border-radius: 8px; font-weight: 600;">Reschedule</a>` : ""}
        </div>` : ""}

        <!-- Contact -->
        <p style="color: #555; font-size: 14px; text-align: center; margin: 0;">
          Questions or need to make changes? Call us at
          <a href="tel:5622359361" style="color: #C45A3C; text-decoration: none; font-weight: 600;">(562) 235-9361</a>
          or <a href="tel:5627463998" style="color: #C45A3C; text-decoration: none; font-weight: 600;">(562) 746-3998</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #2D2926; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; color: #FAF5EF66; font-size: 12px;">
          México Lindo Y Que Rico · Greater Los Angeles · 20+ Years of Flavor
        </p>
        <p style="margin: 4px 0 0; color: #FAF5EF44; font-size: 11px;">Booking ID: ${data.bookingId}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.customerEmail,
      subject: `Reminder: Your Catering Event is in ${data.reminderDays} Days! 🌮`,
      text: textMessage,
      html: htmlMessage,
    });
    console.log(`✅ Event reminder sent to ${data.customerEmail}`);
  } catch (error) {
    console.error("❌ Failed to send event reminder:", error);
  }
}

export async function sendOwnerReminder(
  data: ReminderData & { ownerEmail: string }
): Promise<void> {
  const formattedDate = new Date(data.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedPrice = `$${(data.totalPrice / 100).toFixed(2)}`;
  const { text: extrasText } = formatExtrasForReminder(data.extras);

  const textMessage = [
    `📋 Upcoming Event Reminder`,
    ``,
    `You have a catering event in ${data.reminderDays} days:`,
    ``,
    `Customer: ${data.customerName}`,
    `Phone: ${data.customerPhone}`,
    `Email: ${data.customerEmail}`,
    ``,
    `Event Date: ${formattedDate}`,
    `Address: ${data.eventAddress || "Not provided"}`,
    `Package: ${data.serviceType === "2hr" ? "2-Hour" : "3-Hour"} Service`,
    `Guests: ${data.guestCount}`,
    ``,
    `Meats:`,
    ...data.meats.map((m) => `  • ${m}`),
    ...(extrasText ? [``, `Extras:`, extrasText] : []),
    ``,
    `Total: ${formattedPrice}`,
    `Booking ID: ${data.bookingId}`,
  ].join("\n");

  const htmlMessage = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #E8A935; border-bottom: 2px solid #C45A3C; padding-bottom: 10px;">
        📋 Upcoming Event — ${data.reminderDays} Days Away
      </h1>

      <h3 style="color: #3B2A1E;">Customer</h3>
      <p><strong>Name:</strong> ${data.customerName}</p>
      <p><strong>Phone:</strong> <a href="tel:${data.customerPhone}">${data.customerPhone}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>

      <h3 style="color: #3B2A1E;">Event Details</h3>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Address:</strong> ${data.eventAddress || "Not provided"}</p>
      <p><strong>Package:</strong> ${data.serviceType === "2hr" ? "2-Hour" : "3-Hour"} Service</p>
      <p><strong>Guests:</strong> ${data.guestCount}</p>

      <h3 style="color: #3B2A1E;">Meats</h3>
      <ul>${data.meats.map((m) => `<li>${m}</li>`).join("")}</ul>

      <div style="background: #2D2926; color: #FAF5EF; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center;">
        <p style="font-size: 24px; margin: 0; color: #E8A935; font-weight: bold;">${formattedPrice}</p>
        <p style="margin: 5px 0 0; color: #FAF5EF99;">Total Amount</p>
      </div>

      <p style="color: #999; font-size: 12px; margin-top: 20px;">Booking ID: ${data.bookingId}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.ownerEmail,
      subject: `Upcoming Event — ${data.customerName} — ${formattedDate}`,
      text: textMessage,
      html: htmlMessage,
    });
    console.log(`✅ Owner reminder sent to ${data.ownerEmail}`);
  } catch (error) {
    console.error("❌ Failed to send owner reminder:", error);
  }
}


// ─── Day-Before Reminder Email ───────────────────────────────────

export async function sendDayBeforeReminder(
  data: DayBeforeReminderData
): Promise<void> {
  const formattedDate = new Date(data.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedPrice = `$${(data.totalPrice / 100).toFixed(2)}`;
  const formattedFee = `$${(data.cancellationFee / 100).toFixed(2)}`;
  const { html: extrasHtml, text: extrasText } = formatExtrasForReminder(data.extras);

  const textMessage = [
    `🌮 Your Catering Event is TOMORROW!`,
    ``,
    `Hey ${data.customerName},`,
    ``,
    `Just a reminder — your taco catering is tomorrow!`,
    ``,
    `Event Date: ${formattedDate}`,
    `Location: ${data.eventAddress || "Not provided"}`,
    `Package: ${data.serviceType === "2hr" ? "2-Hour" : "3-Hour"} Service`,
    `Guests: ${data.guestCount}`,
    ``,
    `Meats:`,
    ...data.meats.map((m: string) => `  • ${m}`),
    ...(extrasText ? [``, `Extras:`, extrasText] : []),
    ``,
    `Total Paid: ${formattedPrice}`,
    ``,
    `Our team will arrive 1 hour before your event begins to set up.`,
    ``,
    `Need to cancel? Cancelling at this point will incur a fee of ${formattedFee}.`,
    `Cancel here: ${data.cancelUrl}`,
    ``,
    `To reschedule, please call us at (562) 235-9361 or (562) 746-3998.`,
    ``,
    `See you tomorrow! — México Lindo Y Que Rico`,
  ].join("\n");

  const htmlMessage = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF5EF; border-radius: 16px; overflow: hidden;">
      <div style="background: #2D2926; padding: 40px 30px; text-align: center;">
        <h1 style="color: #E8A935; margin: 0; font-size: 28px;">México Lindo Y Que Rico</h1>
        <p style="color: #FAF5EF99; margin: 8px 0 0; font-size: 14px;">Aquí la panza es primero.</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #2D2926; margin: 0 0 8px;">Your event is TOMORROW! 🎉</h2>
        <p style="color: #555; margin: 0 0 24px; font-size: 16px;">
          Hey ${data.customerName}, we're excited to cater your event tomorrow!
        </p>
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #E8A935;">
          <h3 style="color: #2D2926; margin: 0 0 16px; font-size: 18px;">📅 Event Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #888;">Date</td><td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${formattedDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Address</td><td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${data.eventAddress || "Not provided"}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Package</td><td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${data.serviceType === "2hr" ? "2-Hour" : "3-Hour"} Service</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Guests</td><td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${data.guestCount}</td></tr>
          </table>
        </div>
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #C45A3C;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">🥩 Your Meats</h3>
          <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
            ${data.meats.map((m: string) => `<li style="padding: 4px 0;">${m}</li>`).join("")}
          </ul>
        </div>
        ${extrasHtml}
        <div style="background: #2D2926; color: #FAF5EF; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #FAF5EF99; font-size: 14px;">Total Paid</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #E8A935;">${formattedPrice}</p>
        </div>
        <div style="background: #E8A93520; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #2D2926; font-size: 14px;">⏰ <strong>Setup:</strong> Our team will arrive 1 hour before your event begins!</p>
        </div>
        <div style="background: #C45A3C15; border: 1px solid #C45A3C30; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: #C45A3C; font-size: 14px; font-weight: 600;">⚠️ Need to cancel?</p>
          <p style="margin: 0 0 12px; color: #555; font-size: 13px;">Cancelling at this point will incur a cancellation fee of <strong>${formattedFee}</strong>.</p>
          <a href="${data.cancelUrl}" style="display: inline-block; padding: 10px 20px; background: #C45A3C; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px;">Cancel Booking</a>
        </div>
        <div style="background: #E8A93520; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #2D2926; font-size: 14px;">📞 <strong>Need to reschedule?</strong> Please call us at <a href="tel:5622359361" style="color: #C45A3C;">(562) 235-9361</a> or <a href="tel:5627463998" style="color: #C45A3C;">(562) 746-3998</a></p>
        </div>
      </div>
      <div style="background: #2D2926; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; color: #FAF5EF66; font-size: 12px;">México Lindo Y Que Rico · Greater Los Angeles · 20+ Years of Flavor</p>
        <p style="margin: 4px 0 0; color: #FAF5EF44; font-size: 11px;">Booking ID: ${data.bookingId}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.customerEmail,
      subject: `Tomorrow: Your Catering Event! 🌮`,
      text: textMessage,
      html: htmlMessage,
    });
    console.log(`✅ Day-before reminder sent to ${data.customerEmail}`);
  } catch (error) {
    console.error("❌ Failed to send day-before reminder:", error);
  }
}

// ─── Cancellation Confirmation Email ─────────────────────────────

export async function sendCancellationConfirmation(data: {
  customerName: string;
  customerEmail: string;
  eventDate: string;
  refundAmount: number;
  cancellationFee: number;
  bookingId: string;
}): Promise<void> {
  const formattedDate = new Date(data.eventDate).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedRefund = `$${(data.refundAmount / 100).toFixed(2)}`;
  const formattedFee = `$${(data.cancellationFee / 100).toFixed(2)}`;

  const htmlMessage = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF5EF; border-radius: 16px; overflow: hidden;">
      <div style="background: #2D2926; padding: 40px 30px; text-align: center;">
        <h1 style="color: #E8A935; margin: 0; font-size: 28px;">México Lindo Y Que Rico</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #2D2926; margin: 0 0 8px;">Booking Cancelled</h2>
        <p style="color: #555; margin: 0 0 24px;">Hey ${data.customerName}, your booking for <strong>${formattedDate}</strong> has been cancelled.</p>
        ${data.cancellationFee > 0 ? `<p style="color: #555;">Cancellation fee: <strong>${formattedFee}</strong></p>` : ""}
        <p style="color: #555;">Refund amount: <strong>${formattedRefund}</strong></p>
        <p style="color: #888; font-size: 13px;">Refunds typically take 5-10 business days to appear on your statement.</p>
        <p style="color: #555; font-size: 14px; margin-top: 24px;">We hope to serve you in the future! Call us at <a href="tel:5622359361" style="color: #C45A3C;">(562) 235-9361</a> or <a href="tel:5627463998" style="color: #C45A3C;">(562) 746-3998</a>.</p>
      </div>
      <div style="background: #2D2926; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; color: #FAF5EF44; font-size: 11px;">Booking ID: ${data.bookingId}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.customerEmail,
      subject: `Booking Cancelled — ${formattedDate}`,
      text: `Your booking for ${formattedDate} has been cancelled. Refund: ${formattedRefund}. Fee: ${formattedFee}.`,
      html: htmlMessage,
    });
  } catch (error) {
    console.error("❌ Failed to send cancellation confirmation:", error);
  }
}

export async function sendOwnerCancellationNotice(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  refundAmount: number;
  cancellationFee: number;
  bookingId: string;
  ownerEmail: string;
}): Promise<void> {
  const formattedDate = new Date(data.eventDate).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.ownerEmail,
      subject: `Booking Cancelled — ${data.customerName} — ${formattedDate}`,
      text: [
        `❌ Booking Cancelled`,
        ``,
        `Customer: ${data.customerName}`,
        `Email: ${data.customerEmail}`,
        `Phone: ${data.customerPhone}`,
        `Event Date: ${formattedDate}`,
        `Cancellation Fee: $${(data.cancellationFee / 100).toFixed(2)}`,
        `Refund Issued: $${(data.refundAmount / 100).toFixed(2)}`,
        `Booking ID: ${data.bookingId}`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("❌ Failed to send owner cancellation notice:", error);
  }
}

// ─── Reschedule Confirmation Email ───────────────────────────────

export async function sendRescheduleConfirmation(data: {
  customerName: string;
  customerEmail: string;
  oldDate: string;
  newDate: string;
  bookingId: string;
}): Promise<void> {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  const htmlMessage = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF5EF; border-radius: 16px; overflow: hidden;">
      <div style="background: #2D2926; padding: 40px 30px; text-align: center;">
        <h1 style="color: #E8A935; margin: 0; font-size: 28px;">México Lindo Y Que Rico</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #2D2926; margin: 0 0 8px;">Booking Rescheduled! 📅</h2>
        <p style="color: #555; margin: 0 0 24px;">Hey ${data.customerName}, your booking has been rescheduled.</p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="color: #888; margin: 0 0 4px; font-size: 13px;">Previous date:</p>
          <p style="color: #C45A3C; margin: 0 0 16px; text-decoration: line-through;">${formatDate(data.oldDate)}</p>
          <p style="color: #888; margin: 0 0 4px; font-size: 13px;">New date:</p>
          <p style="color: #2D2926; margin: 0; font-weight: 600; font-size: 18px;">${formatDate(data.newDate)}</p>
        </div>
        <p style="color: #555; font-size: 14px;">Questions? Call us at <a href="tel:5622359361" style="color: #C45A3C;">(562) 235-9361</a> or <a href="tel:5627463998" style="color: #C45A3C;">(562) 746-3998</a>.</p>
      </div>
      <div style="background: #2D2926; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; color: #FAF5EF44; font-size: 11px;">Booking ID: ${data.bookingId}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.customerEmail,
      subject: `Booking Rescheduled — ${formatDate(data.newDate)} 🌮`,
      text: `Your booking has been rescheduled from ${formatDate(data.oldDate)} to ${formatDate(data.newDate)}.`,
      html: htmlMessage,
    });
  } catch (error) {
    console.error("❌ Failed to send reschedule confirmation:", error);
  }
}

export async function sendOwnerRescheduleNotice(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  oldDate: string;
  newDate: string;
  bookingId: string;
  ownerEmail: string;
}): Promise<void> {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.ownerEmail,
      subject: `Booking Rescheduled — ${data.customerName} — ${formatDate(data.newDate)}`,
      text: [
        `📅 Booking Rescheduled`,
        ``,
        `Customer: ${data.customerName}`,
        `Email: ${data.customerEmail}`,
        `Phone: ${data.customerPhone}`,
        `Previous Date: ${formatDate(data.oldDate)}`,
        `New Date: ${formatDate(data.newDate)}`,
        `Booking ID: ${data.bookingId}`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("❌ Failed to send owner reschedule notice:", error);
  }
}
