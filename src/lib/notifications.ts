interface BookingNotification {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  serviceType: string;
  guestCount: number;
  meats: string[];
  totalPrice: number;
}

export async function sendBookingNotification(
  booking: BookingNotification
): Promise<void> {
  const message = [
    `New Booking Received!`,
    `---`,
    `Booking ID: ${booking.bookingId}`,
    `Customer: ${booking.customerName}`,
    `Email: ${booking.customerEmail}`,
    `Phone: ${booking.customerPhone}`,
    `Event Date: ${booking.eventDate}`,
    `Package: ${booking.serviceType} service for ${booking.guestCount} guests`,
    `Meats: ${booking.meats.join(", ")}`,
    `Total: $${(booking.totalPrice / 100).toFixed(2)}`,
  ].join("\n");

  // TODO: Plug in email provider (Resend, SendGrid, or nodemailer with Gmail SMTP)
  // For now, log to console
  console.log("=== BOOKING NOTIFICATION ===");
  console.log(message);
  console.log("============================");

  // Example: send email via Resend
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     from: 'bookings@querico.catering',
  //     to: process.env.NOTIFICATION_EMAIL,
  //     subject: `New Booking - ${booking.customerName} - ${booking.eventDate}`,
  //     text: message,
  //   }),
  // });
}
