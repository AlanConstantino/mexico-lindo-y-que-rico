import { Resend } from "resend";

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
  extras?: { name: string; quantity: number; price: string }[];
  totalPrice: number;
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
      from: "México Lindo Y Que Rico <onboarding@resend.dev>",
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
