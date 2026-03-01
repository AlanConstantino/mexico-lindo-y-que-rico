import { Resend } from "resend";
import { EXTRA_OPTIONS } from "@/lib/pricing";
import { getTranslations, emailTranslations, type SupportedLocale } from "@/lib/email-translations";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Map DB extras format to display format for emails */
export function mapExtrasForEmail(
  dbExtras?: { id: string; quantity: number; flavors?: Record<string, number> | string[] }[]
): { name: string; quantity: number; price: string }[] {
  if (!dbExtras || dbExtras.length === 0) return [];
  return dbExtras.map((e) => {
    const option = EXTRA_OPTIONS.find((o) => o.id === e.id);
    const name = e.id.charAt(0).toUpperCase() + e.id.slice(1);
    const unitPrice = option?.price ?? 0;
    const total = option?.perUnit ? unitPrice * e.quantity : unitPrice;
    return {
      name,
      quantity: e.quantity,
      price: `$${total}`,
    };
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

function formatSetupTime(eventTime: string): string {
  const [h, m] = eventTime.split(':');
  let hour = parseInt(h) - 1;
  if (hour < 0) hour = 0;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

interface BookingNotification {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventTime?: string;
  serviceType: string;
  guestCount: number;
  meats: string[];
  eventAddress?: string;
  extras?: { name: string; quantity: number; price: string }[];
  totalPrice: number;
  paymentType?: string;
  cancelUrl?: string;
  rescheduleUrl?: string;
}

// ─── Owner Notification (always English) ─────────────────────────

export async function sendBookingNotification(
  booking: BookingNotification
): Promise<void> {
  const formattedPrice = `$${(booking.totalPrice / 100).toFixed(2)}`;
  const formattedDate = new Date(booking.eventDate).toLocaleDateString("es-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const extrasText = booking.extras?.length
    ? booking.extras
        .map((e) => `  • ${e.name} x${e.quantity} — ${e.price}`)
        .join("\n")
    : "  Ninguno";

  const timeDisplay = booking.eventTime ? formatTime(booking.eventTime) : null;
  const isCash = booking.paymentType === "cash";
  const adminUrl = "https://que.rico.catering/es/admin";

  // Payment status text for text email
  const paymentStatusText = isCash
    ? [
        `⚠️ PAGO: EFECTIVO — Acción Requerida`,
        `  1. Llama al cliente al ${booking.customerPhone} para confirmar los detalles`,
        `  2. Coordina el pago — ${formattedPrice} en efectivo el día del evento`,
        `  3. Entra al panel de admin (${adminUrl}) y haz clic en "Confirmar"`,
      ].join("\n")
    : `✅ PAGO: TARJETA — Pagado en su totalidad. No necesitas hacer nada.`;

  const textMessage = [
    `🎉 ¡Nueva Reservación Recibida!`,
    ``,
    paymentStatusText,
    ``,
    `Cliente: ${booking.customerName}`,
    `Correo: ${booking.customerEmail}`,
    `Teléfono: ${booking.customerPhone}`,
    ``,
    `Fecha del Evento: ${formattedDate}`,
    ...(timeDisplay ? [`Hora del Evento: ${timeDisplay}`] : []),
    `Dirección del Evento: ${booking.eventAddress || "No proporcionada"}`,
    `Paquete: Servicio de ${booking.serviceType === "2hr" ? "2" : "3"} Horas`,
    `Invitados: ${booking.guestCount}`,
    ``,
    `Carnes:`,
    ...booking.meats.map((m) => `  • ${m}`),
    ``,
    `Extras:`,
    extrasText,
    ``,
    `Total: ${formattedPrice}`,
    ``,
    `ID de Reservación: ${booking.bookingId}`,
  ].join("\n");

  // Payment status banner for HTML email
  const paymentBannerHtml = isCash
    ? `<div style="background: #FFF3CD; border: 2px solid #E8A935; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #856404;">⚠️ Pago en Efectivo — Acción Requerida</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #856404;">El cliente eligió pagar en <strong>efectivo</strong>. Sigue estos pasos:</p>
        <ol style="margin: 12px 0 0; padding-left: 20px; font-size: 14px; color: #856404; line-height: 1.8;">
          <li><strong>Llama al cliente</strong> al <a href="tel:${booking.customerPhone}" style="color: #856404;">${booking.customerPhone}</a> para confirmar los detalles del evento</li>
          <li><strong>Coordina el pago</strong> — el monto total de <strong>${formattedPrice}</strong> se paga en efectivo el día del evento</li>
          <li><strong>Confirma la reservación</strong> — entra al panel de administración y haz clic en "Confirmar" para enviarle un correo de confirmación al cliente</li>
        </ol>
        <div style="margin-top: 14px; text-align: center;">
          <a href="${adminUrl}" style="display: inline-block; background: #856404; color: #fff; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Ir al Panel de Administración →</a>
        </div>
      </div>`
    : `<div style="background: #D4EDDA; border: 2px solid #28A745; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #155724;">✅ Pagado con Tarjeta — Todo Listo</p>
        <p style="margin: 8px 0 0; font-size: 14px; color: #155724;">El cliente ya pagó en su totalidad con tarjeta. No necesitas hacer nada — solo prepárate para el evento. El cliente ya recibió su correo de confirmación.</p>
      </div>`;

  const htmlMessage = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #E8A935; border-bottom: 2px solid #C45A3C; padding-bottom: 10px;">
        🎉 ¡Nueva Reservación Recibida!
      </h1>

      ${paymentBannerHtml}
      
      <h3 style="color: #3B2A1E;">Info del Cliente</h3>
      <p><strong>Nombre:</strong> ${booking.customerName}</p>
      <p><strong>Correo:</strong> <a href="mailto:${booking.customerEmail}">${booking.customerEmail}</a></p>
      <p><strong>Teléfono:</strong> <a href="tel:${booking.customerPhone}">${booking.customerPhone}</a></p>
      
      <h3 style="color: #3B2A1E;">Detalles del Evento</h3>
      <p><strong>Fecha:</strong> ${formattedDate}</p>
      ${timeDisplay ? `<p><strong>Hora:</strong> ${timeDisplay}</p>` : ""}
      <p><strong>Dirección:</strong> ${booking.eventAddress || "No proporcionada"}</p>
      <p><strong>Paquete:</strong> Servicio de ${booking.serviceType === "2hr" ? "2" : "3"} Horas</p>
      <p><strong>Invitados:</strong> ${booking.guestCount}</p>
      
      <h3 style="color: #3B2A1E;">Carnes</h3>
      <ul>
        ${booking.meats.map((m) => `<li>${m}</li>`).join("")}
      </ul>
      
      <h3 style="color: #3B2A1E;">Extras</h3>
      ${
        booking.extras?.length
          ? `<ul>${booking.extras.map((e) => `<li>${e.name} x${e.quantity} — ${e.price}</li>`).join("")}</ul>`
          : "<p>Ninguno</p>"
      }
      
      <div style="background: #2D2926; color: #FAF5EF; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center;">
        <p style="font-size: 24px; margin: 0; color: #E8A935; font-weight: bold;">${formattedPrice}</p>
        <p style="margin: 5px 0 0; color: #FAF5EF99;">Monto Total</p>
      </div>
      
      <p style="color: #999; font-size: 12px; margin-top: 20px;">ID de Reservación: ${booking.bookingId}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: "constantinoalan98@gmail.com",
      subject: `${isCash ? "⚠️" : "✅"} Nueva Reservación — ${booking.customerName} — ${formattedDate} — ${isCash ? "Efectivo (Llamar)" : "Tarjeta (Pagado)"}`,
      text: textMessage,
      html: htmlMessage,
    });

    console.log(`✅ Booking notification email sent for ${booking.bookingId}`);
  } catch (error) {
    console.error("❌ Failed to send booking notification email:", error);
  }
}

// ─── Customer Confirmation (i18n) ────────────────────────────────

export async function sendCustomerConfirmation(
  booking: BookingNotification,
  locale: SupportedLocale = "en"
): Promise<void> {
  const t = getTranslations(locale);
  const formattedPrice = `$${(booking.totalPrice / 100).toFixed(2)}`;
  const formattedDate = emailTranslations.formatDate(booking.eventDate, locale);
  const svcLabel = emailTranslations.serviceLabel(booking.serviceType, locale);
  const custTimeDisplay = booking.eventTime ? formatTime(booking.eventTime) : null;

  const extrasSection = booking.extras?.length
    ? booking.extras
        .map((e) => `<li style="padding: 4px 0;">${e.name} x${e.quantity} — ${e.price}</li>`)
        .join("")
    : "";

  const textMessage = [
    `${t.confirmation.greeting(booking.customerName)}`,
    ``,
    `${t.confirmation.subtitle}`,
    ``,
    `${t.confirmation.date}: ${formattedDate}`,
    ...(custTimeDisplay ? [`Event Time: ${custTimeDisplay}`] : []),
    `${t.confirmation.address}: ${booking.eventAddress || t.confirmation.notProvided}`,
    `${t.confirmation.package}: ${svcLabel}`,
    `${t.confirmation.guests}: ${booking.guestCount}`,
    ``,
    ...booking.meats.map((m) => `  • ${m}`),
    ``,
    ...(booking.extras?.length
      ? booking.extras.map((e) => `  • ${e.name} x${e.quantity} — ${e.price}`)
      : []),
    ``,
    `${t.confirmation.totalPaid}: ${formattedPrice}`,
    ``,
    `${t.confirmation.questionsCall} (562) 235-9361 / (562) 746-3998.`,
    ``,
    `— México Lindo Y Que Rico`,
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
        <h2 style="color: #2D2926; margin: 0 0 8px;">${t.confirmation.greeting(booking.customerName)}</h2>
        <p style="color: #555; margin: 0 0 24px; font-size: 16px;">
          ${t.confirmation.subtitle}
        </p>

        <!-- Event Details Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #E8A935;">
          <h3 style="color: #2D2926; margin: 0 0 16px; font-size: 18px;">${t.confirmation.eventDetails}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.date}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${formattedDate}${custTimeDisplay ? ` · ${custTimeDisplay}` : ""}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.address}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${booking.eventAddress || t.confirmation.notProvided}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.package}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${svcLabel}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.guests}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${booking.guestCount}</td>
            </tr>
          </table>
        </div>

        <!-- Meats Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #C45A3C;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">${t.confirmation.yourMeats}</h3>
          <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
            ${booking.meats.map((m) => `<li style="padding: 4px 0;">${m}</li>`).join("")}
          </ul>
        </div>

        ${
          booking.extras?.length
            ? `
        <!-- Extras Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #7A8B6F;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">${t.confirmation.extras}</h3>
          <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
            ${extrasSection}
          </ul>
        </div>`
            : ""
        }

        <!-- Total -->
        <div style="background: #2D2926; color: #FAF5EF; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #FAF5EF99; font-size: 14px;">${t.confirmation.totalPaid}</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #E8A935;">${formattedPrice}</p>
        </div>

        <!-- Setup Note -->
        <div style="background: #E8A93520; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #2D2926; font-size: 14px;">
            ${t.confirmation.setupNote}
          </p>
        </div>

        ${booking.cancelUrl || booking.rescheduleUrl ? `
        <!-- Manage Booking -->
        <div style="background: #f5f0eb; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 8px; color: #2D2926; font-size: 13px; font-weight: 600;">${t.confirmation.manageBooking}</p>
          <p style="margin: 0; font-size: 13px;">
            ${booking.rescheduleUrl ? `<a href="${booking.rescheduleUrl}" style="color: #C45A3C; text-decoration: none; font-weight: 600;">${t.confirmation.reschedule}</a>` : ""}
            ${booking.cancelUrl && booking.rescheduleUrl ? ' &nbsp;·&nbsp; ' : ""}
            ${booking.cancelUrl ? `<a href="${booking.cancelUrl}" style="color: #888; text-decoration: none;">${t.confirmation.cancelBooking}</a>` : ""}
          </p>
        </div>
        ` : ""}

        <!-- Contact -->
        <p style="color: #555; font-size: 14px; text-align: center; margin: 0;">
          ${t.confirmation.questionsCall} <a href="tel:5622359361" style="color: #C45A3C; text-decoration: none; font-weight: 600;">(562) 235-9361</a>
          or <a href="tel:5627463998" style="color: #C45A3C; text-decoration: none; font-weight: 600;">(562) 746-3998</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #2D2926; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; color: #FAF5EF66; font-size: 12px;">
          ${t.confirmation.footer}
        </p>
        <p style="margin: 4px 0 0; color: #FAF5EF44; font-size: 11px;">Booking ID: ${booking.bookingId}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: booking.customerEmail,
      subject: t.confirmation.subject(formattedDate),
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
  eventTime?: string;
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
  data: ReminderData,
  locale: SupportedLocale = "en"
): Promise<void> {
  const t = getTranslations(locale);
  const formattedDate = emailTranslations.formatDate(data.eventDate, locale);
  const formattedPrice = `$${(data.totalPrice / 100).toFixed(2)}`;
  const svcLabel = emailTranslations.serviceLabel(data.serviceType, locale);
  const { html: extrasHtml, text: extrasText } = formatExtrasForReminder(data.extras);
  const reminderTimeDisplay = data.eventTime ? formatTime(data.eventTime) : null;

  const textMessage = [
    `${t.reminder.heading(data.reminderDays)}`,
    ``,
    `${t.reminder.subtitle(data.customerName)}`,
    ``,
    `${t.confirmation.date}: ${formattedDate}${reminderTimeDisplay ? ` · ${reminderTimeDisplay}` : ""}`,
    `${t.confirmation.address}: ${data.eventAddress || t.confirmation.notProvided}`,
    `${t.confirmation.package}: ${svcLabel}`,
    `${t.confirmation.guests}: ${data.guestCount}`,
    ``,
    ...data.meats.map((m) => `  • ${m}`),
    ...(extrasText ? [``, extrasText] : []),
    ``,
    `${t.confirmation.totalPaid}: ${formattedPrice}`,
    ``,
    `${t.confirmation.questionsCall} (562) 235-9361 / (562) 746-3998.`,
    ``,
    `— México Lindo Y Que Rico`,
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
        <h2 style="color: #2D2926; margin: 0 0 8px;">${t.reminder.heading(data.reminderDays)}</h2>
        <p style="color: #555; margin: 0 0 24px; font-size: 16px;">
          ${t.reminder.subtitle(data.customerName)}
        </p>

        <!-- Event Details Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #E8A935;">
          <h3 style="color: #2D2926; margin: 0 0 16px; font-size: 18px;">${t.confirmation.eventDetails}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.date}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${formattedDate}${reminderTimeDisplay ? ` · ${reminderTimeDisplay}` : ""}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.address}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${data.eventAddress || t.confirmation.notProvided}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.package}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${svcLabel}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.guests}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${data.guestCount}</td>
            </tr>
          </table>
        </div>

        <!-- Meats Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #C45A3C;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">${t.confirmation.yourMeats}</h3>
          <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
            ${data.meats.map((m) => `<li style="padding: 4px 0;">${m}</li>`).join("")}
          </ul>
        </div>

        ${extrasHtml}

        <!-- Total -->
        <div style="background: #2D2926; color: #FAF5EF; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #FAF5EF99; font-size: 14px;">${t.confirmation.totalPaid}</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #E8A935;">${formattedPrice}</p>
        </div>

        <!-- Setup Note -->
        <div style="background: #E8A93520; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #2D2926; font-size: 14px;">
            ${t.confirmation.setupNote}
          </p>
        </div>

        ${data.cancelUrl || data.rescheduleUrl ? `
        <div style="text-align: center; margin-bottom: 24px;">
          ${data.cancelUrl ? `<a href="${data.cancelUrl}" style="display: inline-block; padding: 12px 24px; background: #C45A3C; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 8px 8px 0;">${t.confirmation.cancelBooking}</a>` : ""}
          ${data.rescheduleUrl ? `<a href="${data.rescheduleUrl}" style="display: inline-block; padding: 12px 24px; background: #E8A935; color: #2D2926; text-decoration: none; border-radius: 8px; font-weight: 600;">${t.confirmation.reschedule}</a>` : ""}
        </div>` : ""}

        <!-- Contact -->
        <p style="color: #555; font-size: 14px; text-align: center; margin: 0;">
          ${t.confirmation.questionsCall}
          <a href="tel:5622359361" style="color: #C45A3C; text-decoration: none; font-weight: 600;">(562) 235-9361</a>
          or <a href="tel:5627463998" style="color: #C45A3C; text-decoration: none; font-weight: 600;">(562) 746-3998</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #2D2926; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; color: #FAF5EF66; font-size: 12px;">
          ${t.confirmation.footer}
        </p>
        <p style="margin: 4px 0 0; color: #FAF5EF44; font-size: 11px;">Booking ID: ${data.bookingId}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.customerEmail,
      subject: t.reminder.subject(data.reminderDays),
      text: textMessage,
      html: htmlMessage,
    });
    console.log(`✅ Event reminder sent to ${data.customerEmail}`);
  } catch (error) {
    console.error("❌ Failed to send event reminder:", error);
  }
}

// ─── Owner Reminder (always English) ─────────────────────────────

export async function sendOwnerReminder(
  data: ReminderData & { ownerEmail: string }
): Promise<void> {
  const formattedDate = new Date(data.eventDate).toLocaleDateString("es-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedPrice = `$${(data.totalPrice / 100).toFixed(2)}`;
  const { text: extrasText } = formatExtrasForReminder(data.extras);
  const ownerTimeDisplay = data.eventTime ? formatTime(data.eventTime) : null;

  const textMessage = [
    `📋 Recordatorio de Evento Próximo`,
    ``,
    `Tienes un evento de catering en ${data.reminderDays} días:`,
    ``,
    `Cliente: ${data.customerName}`,
    `Teléfono: ${data.customerPhone}`,
    `Correo: ${data.customerEmail}`,
    ``,
    `Fecha del Evento: ${formattedDate}`,
    ...(ownerTimeDisplay ? [`Hora del Evento: ${ownerTimeDisplay}`] : []),
    `Dirección: ${data.eventAddress || "No proporcionada"}`,
    `Paquete: Servicio de ${data.serviceType === "2hr" ? "2" : "3"} Horas`,
    `Invitados: ${data.guestCount}`,
    ``,
    `Carnes:`,
    ...data.meats.map((m) => `  • ${m}`),
    ...(extrasText ? [``, `Extras:`, extrasText] : []),
    ``,
    `Total: ${formattedPrice}`,
    `ID de Reservación: ${data.bookingId}`,
  ].join("\n");

  const htmlMessage = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #E8A935; border-bottom: 2px solid #C45A3C; padding-bottom: 10px;">
        📋 Evento Próximo — En ${data.reminderDays} Días
      </h1>

      <h3 style="color: #3B2A1E;">Cliente</h3>
      <p><strong>Nombre:</strong> ${data.customerName}</p>
      <p><strong>Teléfono:</strong> <a href="tel:${data.customerPhone}">${data.customerPhone}</a></p>
      <p><strong>Correo:</strong> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>

      <h3 style="color: #3B2A1E;">Detalles del Evento</h3>
      <p><strong>Fecha:</strong> ${formattedDate}</p>
      ${ownerTimeDisplay ? `<p><strong>Hora:</strong> ${ownerTimeDisplay}</p>` : ""}
      <p><strong>Dirección:</strong> ${data.eventAddress || "No proporcionada"}</p>
      <p><strong>Paquete:</strong> Servicio de ${data.serviceType === "2hr" ? "2" : "3"} Horas</p>
      <p><strong>Invitados:</strong> ${data.guestCount}</p>

      <h3 style="color: #3B2A1E;">Carnes</h3>
      <ul>${data.meats.map((m) => `<li>${m}</li>`).join("")}</ul>

      <div style="background: #2D2926; color: #FAF5EF; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center;">
        <p style="font-size: 24px; margin: 0; color: #E8A935; font-weight: bold;">${formattedPrice}</p>
        <p style="margin: 5px 0 0; color: #FAF5EF99;">Monto Total</p>
      </div>

      <p style="color: #999; font-size: 12px; margin-top: 20px;">ID de Reservación: ${data.bookingId}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.ownerEmail,
      subject: `Evento Próximo — ${data.customerName} — ${formattedDate}`,
      text: textMessage,
      html: htmlMessage,
    });
    console.log(`✅ Owner reminder sent to ${data.ownerEmail}`);
  } catch (error) {
    console.error("❌ Failed to send owner reminder:", error);
  }
}


// ─── Day-Before Reminder Email (i18n) ────────────────────────────

export async function sendDayBeforeReminder(
  data: DayBeforeReminderData,
  locale: SupportedLocale = "en"
): Promise<void> {
  const t = getTranslations(locale);
  const formattedDate = emailTranslations.formatDate(data.eventDate, locale);
  const formattedPrice = `$${(data.totalPrice / 100).toFixed(2)}`;
  const formattedFee = `$${(data.cancellationFee / 100).toFixed(2)}`;
  const svcLabel = emailTranslations.serviceLabel(data.serviceType, locale);
  const { html: extrasHtml, text: extrasText } = formatExtrasForReminder(data.extras);
  const dayBeforeTimeDisplay = data.eventTime ? formatTime(data.eventTime) : null;

  const textMessage = [
    `${t.dayBefore.heading}`,
    ``,
    `${t.dayBefore.subtitle(data.customerName)}`,
    ``,
    `${t.confirmation.date}: ${formattedDate}${dayBeforeTimeDisplay ? ` · ${dayBeforeTimeDisplay}` : ""}`,
    `${t.confirmation.address}: ${data.eventAddress || t.confirmation.notProvided}`,
    `${t.confirmation.package}: ${svcLabel}`,
    `${t.confirmation.guests}: ${data.guestCount}`,
    ``,
    ...data.meats.map((m: string) => `  • ${m}`),
    ...(extrasText ? [``, extrasText] : []),
    ``,
    `${t.confirmation.totalPaid}: ${formattedPrice}`,
    ``,
    `${t.confirmation.questionsCall} (562) 235-9361 / (562) 746-3998.`,
    ``,
    `— México Lindo Y Que Rico`,
  ].join("\n");

  const htmlMessage = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF5EF; border-radius: 16px; overflow: hidden;">
      <div style="background: #2D2926; padding: 40px 30px; text-align: center;">
        <h1 style="color: #E8A935; margin: 0; font-size: 28px;">México Lindo Y Que Rico</h1>
        <p style="color: #FAF5EF99; margin: 8px 0 0; font-size: 14px;">Aquí la panza es primero.</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #2D2926; margin: 0 0 8px;">${t.dayBefore.heading}</h2>
        <p style="color: #555; margin: 0 0 24px; font-size: 16px;">
          ${t.dayBefore.subtitle(data.customerName)}
        </p>
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #E8A935;">
          <h3 style="color: #2D2926; margin: 0 0 16px; font-size: 18px;">${t.confirmation.eventDetails}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #888;">${t.confirmation.date}</td><td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${formattedDate}${dayBeforeTimeDisplay ? ` · ${dayBeforeTimeDisplay}` : ""}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">${t.confirmation.address}</td><td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${data.eventAddress || t.confirmation.notProvided}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">${t.confirmation.package}</td><td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${svcLabel}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">${t.confirmation.guests}</td><td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${data.guestCount}</td></tr>
          </table>
        </div>
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #C45A3C;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">${t.confirmation.yourMeats}</h3>
          <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
            ${data.meats.map((m: string) => `<li style="padding: 4px 0;">${m}</li>`).join("")}
          </ul>
        </div>
        ${extrasHtml}
        <div style="background: #2D2926; color: #FAF5EF; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #FAF5EF99; font-size: 14px;">${t.confirmation.totalPaid}</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #E8A935;">${formattedPrice}</p>
        </div>
        <div style="background: #E8A93520; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #2D2926; font-size: 14px;">${t.dayBefore.setupNote}</p>
        </div>
        <div style="background: #C45A3C15; border: 1px solid #C45A3C30; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: #C45A3C; font-size: 14px; font-weight: 600;">${t.dayBefore.needToCancel}</p>
          <p style="margin: 0 0 12px; color: #555; font-size: 13px;">${t.dayBefore.cancelWarning(formattedFee)}</p>
          <a href="${data.cancelUrl}" style="display: inline-block; padding: 10px 20px; background: #C45A3C; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px;">${t.confirmation.cancelBooking}</a>
        </div>
        <div style="background: #E8A93520; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #2D2926; font-size: 14px;">${t.dayBefore.needToReschedule(locale)} <a href="tel:5622359361" style="color: #C45A3C;">(562) 235-9361</a> or <a href="tel:5627463998" style="color: #C45A3C;">(562) 746-3998</a></p>
        </div>
      </div>
      <div style="background: #2D2926; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; color: #FAF5EF66; font-size: 12px;">${t.confirmation.footer}</p>
        <p style="margin: 4px 0 0; color: #FAF5EF44; font-size: 11px;">Booking ID: ${data.bookingId}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.customerEmail,
      subject: t.dayBefore.subject(),
      text: textMessage,
      html: htmlMessage,
    });
    console.log(`✅ Day-before reminder sent to ${data.customerEmail}`);
  } catch (error) {
    console.error("❌ Failed to send day-before reminder:", error);
  }
}

// ─── Cancellation Confirmation Email (i18n) ──────────────────────

export async function sendCancellationConfirmation(data: {
  customerName: string;
  customerEmail: string;
  eventDate: string;
  refundAmount: number;
  cancellationFee: number;
  bookingId: string;
}, locale: SupportedLocale = "en"): Promise<void> {
  const t = getTranslations(locale);
  const formattedDate = emailTranslations.formatDate(data.eventDate, locale);
  const formattedRefund = `$${(data.refundAmount / 100).toFixed(2)}`;
  const formattedFee = `$${(data.cancellationFee / 100).toFixed(2)}`;

  const htmlMessage = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF5EF; border-radius: 16px; overflow: hidden;">
      <div style="background: #2D2926; padding: 40px 30px; text-align: center;">
        <h1 style="color: #E8A935; margin: 0; font-size: 28px;">México Lindo Y Que Rico</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #2D2926; margin: 0 0 8px;">${t.cancellation.heading}</h2>
        <p style="color: #555; margin: 0 0 24px;">${t.cancellation.message(data.customerName, formattedDate)}</p>
        ${data.cancellationFee > 0 ? `<p style="color: #555;">${t.cancellation.cancellationFee}: <strong>${formattedFee}</strong></p>` : ""}
        <p style="color: #555;">${t.cancellation.refundAmount}: <strong>${formattedRefund}</strong></p>
        <p style="color: #888; font-size: 13px;">${t.cancellation.refundNote}</p>
        <p style="color: #555; font-size: 14px; margin-top: 24px;">${t.cancellation.hopeToServe} <a href="tel:5622359361" style="color: #C45A3C;">(562) 235-9361</a> or <a href="tel:5627463998" style="color: #C45A3C;">(562) 746-3998</a>.</p>
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
      subject: t.cancellation.subject(formattedDate),
      text: `${t.cancellation.heading} — ${formattedDate}. ${t.cancellation.refundAmount}: ${formattedRefund}. ${t.cancellation.cancellationFee}: ${formattedFee}.`,
      html: htmlMessage,
    });
  } catch (error) {
    console.error("❌ Failed to send cancellation confirmation:", error);
  }
}

// ─── Owner Cancellation Notice (always English) ──────────────────

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
  const formattedDate = new Date(data.eventDate).toLocaleDateString("es-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.ownerEmail,
      subject: `Reservación Cancelada — ${data.customerName} — ${formattedDate}`,
      text: [
        `❌ Reservación Cancelada`,
        ``,
        `Cliente: ${data.customerName}`,
        `Correo: ${data.customerEmail}`,
        `Teléfono: ${data.customerPhone}`,
        `Fecha del Evento: ${formattedDate}`,
        `Cargo por Cancelación: $${(data.cancellationFee / 100).toFixed(2)}`,
        `Reembolso Emitido: $${(data.refundAmount / 100).toFixed(2)}`,
        `ID de Reservación: ${data.bookingId}`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("❌ Failed to send owner cancellation notice:", error);
  }
}

// ─── Reschedule Confirmation Email (i18n) ────────────────────────

export async function sendRescheduleConfirmation(data: {
  customerName: string;
  customerEmail: string;
  oldDate: string;
  newDate: string;
  bookingId: string;
}, locale: SupportedLocale = "en"): Promise<void> {
  const t = getTranslations(locale);
  const oldFormatted = emailTranslations.formatDate(data.oldDate, locale);
  const newFormatted = emailTranslations.formatDate(data.newDate, locale);

  const htmlMessage = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF5EF; border-radius: 16px; overflow: hidden;">
      <div style="background: #2D2926; padding: 40px 30px; text-align: center;">
        <h1 style="color: #E8A935; margin: 0; font-size: 28px;">México Lindo Y Que Rico</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #2D2926; margin: 0 0 8px;">${t.reschedule.heading}</h2>
        <p style="color: #555; margin: 0 0 24px;">${t.reschedule.message(data.customerName)}</p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="color: #888; margin: 0 0 4px; font-size: 13px;">${t.reschedule.previousDate}</p>
          <p style="color: #C45A3C; margin: 0 0 16px; text-decoration: line-through;">${oldFormatted}</p>
          <p style="color: #888; margin: 0 0 4px; font-size: 13px;">${t.reschedule.newDate}</p>
          <p style="color: #2D2926; margin: 0; font-weight: 600; font-size: 18px;">${newFormatted}</p>
        </div>
        <p style="color: #555; font-size: 14px;">${t.reschedule.questionsCall} <a href="tel:5622359361" style="color: #C45A3C;">(562) 235-9361</a> or <a href="tel:5627463998" style="color: #C45A3C;">(562) 746-3998</a>.</p>
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
      subject: t.reschedule.subject(newFormatted),
      text: `${t.reschedule.heading} ${t.reschedule.previousDate} ${oldFormatted} → ${t.reschedule.newDate} ${newFormatted}`,
      html: htmlMessage,
    });
  } catch (error) {
    console.error("❌ Failed to send reschedule confirmation:", error);
  }
}

// ─── Owner Reschedule Notice (always English) ────────────────────

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
    new Date(d).toLocaleDateString("es-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: data.ownerEmail,
      subject: `Reservación Reprogramada — ${data.customerName} — ${formatDate(data.newDate)}`,
      text: [
        `📅 Reservación Reprogramada`,
        ``,
        `Cliente: ${data.customerName}`,
        `Correo: ${data.customerEmail}`,
        `Teléfono: ${data.customerPhone}`,
        `Fecha Anterior: ${formatDate(data.oldDate)}`,
        `Nueva Fecha: ${formatDate(data.newDate)}`,
        `ID de Reservación: ${data.bookingId}`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("❌ Failed to send owner reschedule notice:", error);
  }
}

// ─── Cash Booking Pending Confirmation (i18n) ────────────────────

export async function sendCashPendingConfirmation(
  booking: BookingNotification,
  locale: SupportedLocale = "en"
): Promise<void> {
  const t = getTranslations(locale);
  const formattedDate = emailTranslations.formatDate(booking.eventDate, locale);
  const formattedPrice = `$${(booking.totalPrice / 100).toFixed(2)}`;
  const svcLabel = emailTranslations.serviceLabel(booking.serviceType, locale);
  const cashTimeDisplay = booking.eventTime ? formatTime(booking.eventTime) : null;

  const textMessage = [
    `${t.cashPending.heading}`,
    ``,
    `${t.cashPending.subtitle(booking.customerName)}`,
    ``,
    `${t.confirmation.date}: ${formattedDate}${cashTimeDisplay ? ` · ${cashTimeDisplay}` : ""}`,
    `${t.confirmation.address}: ${booking.eventAddress || t.confirmation.notProvided}`,
    `${t.confirmation.package}: ${svcLabel}`,
    `${t.confirmation.guests}: ${booking.guestCount}`,
    ``,
    ...booking.meats.map((m) => `  • ${m}`),
    ...(booking.extras?.length
      ? [``, `${t.confirmation.extras}:`, ...booking.extras.map((e) => `  • ${e.name} x${e.quantity} — ${e.price}`)]
      : []),
    ``,
    `${t.cashPending.estimatedTotal}: ${formattedPrice}`,
    `${t.cashPending.dueCash}`,
    ``,
    `${t.confirmation.questionsCall} (562) 235-9361 / (562) 746-3998.`,
    ``,
    `— México Lindo Y Que Rico`,
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
        <h2 style="color: #2D2926; margin: 0 0 8px;">${t.cashPending.heading}</h2>
        <p style="color: #555; margin: 0 0 24px; font-size: 16px;">
          ${t.cashPending.subtitle(booking.customerName)}
        </p>

        <!-- What's Next -->
        <div style="background: #E8A93520; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 16px;">${t.cashPending.whatNext}</h3>
          <ol style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
            <li>${t.cashPending.step1}</li>
            <li>${t.cashPending.step2}</li>
            <li>${t.cashPending.step3}</li>
          </ol>
        </div>

        <!-- Event Details Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #E8A935;">
          <h3 style="color: #2D2926; margin: 0 0 16px; font-size: 18px;">${t.cashPending.yourEventDetails}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.date}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${formattedDate}${cashTimeDisplay ? ` · ${cashTimeDisplay}` : ""}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.address}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${booking.eventAddress || t.confirmation.notProvided}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.package}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${svcLabel}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">${t.confirmation.guests}</td>
              <td style="padding: 6px 0; color: #2D2926; font-weight: 600; text-align: right;">${booking.guestCount}</td>
            </tr>
          </table>
        </div>

        <!-- Meats Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #C45A3C;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">${t.confirmation.yourMeats}</h3>
          <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
            ${booking.meats.map((m) => `<li style="padding: 4px 0;">${m}</li>`).join("")}
          </ul>
        </div>

        ${booking.extras?.length ? `
        <!-- Extras Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; border-left: 4px solid #E8A935;">
          <h3 style="color: #2D2926; margin: 0 0 12px; font-size: 18px;">${t.confirmation.extras}</h3>
          <ul style="margin: 0; padding-left: 20px; color: #2D2926;">
            ${booking.extras.map((e) => `<li style="padding: 4px 0;">${e.name} x${e.quantity} — ${e.price}</li>`).join("")}
          </ul>
        </div>
        ` : ""}

        <!-- Total -->
        <div style="background: #2D2926; color: #FAF5EF; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #FAF5EF99; font-size: 14px;">${t.cashPending.estimatedTotal}</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #E8A935;">${formattedPrice}</p>
          <p style="margin: 8px 0 0; color: #FAF5EF66; font-size: 12px;">${t.cashPending.dueCash}</p>
        </div>

        <!-- Contact -->
        <p style="color: #555; font-size: 14px; text-align: center; margin: 0;">
          ${t.confirmation.questionsCall}
          <a href="tel:5622359361" style="color: #C45A3C; text-decoration: none; font-weight: 600;">(562) 235-9361</a>
          or <a href="tel:5627463998" style="color: #C45A3C; text-decoration: none; font-weight: 600;">(562) 746-3998</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #2D2926; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; color: #FAF5EF66; font-size: 12px;">
          ${t.confirmation.footer}
        </p>
        <p style="margin: 4px 0 0; color: #FAF5EF44; font-size: 11px;">Booking ID: ${booking.bookingId}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "México Lindo Y Que Rico <bookings@booking.que.rico.catering>",
      to: booking.customerEmail,
      subject: t.cashPending.subject(),
      text: textMessage,
      html: htmlMessage,
    });
    console.log(`✅ Cash pending confirmation sent to ${booking.customerEmail}`);
  } catch (error) {
    console.error("❌ Failed to send cash pending confirmation:", error);
  }
}
