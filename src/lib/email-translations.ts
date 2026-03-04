export type SupportedLocale = "en" | "es";

function formatDate(dateStr: string, locale: SupportedLocale): string {
  const dateLocale = locale === "es" ? "es-US" : "en-US";
  return new Date(dateStr).toLocaleDateString(dateLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function serviceLabel(serviceType: string, locale: SupportedLocale): string {
  const hours = serviceType === "2hr" ? "2" : "3";
  return locale === "es" ? `Servicio de ${hours} Horas` : `${hours}-Hour Service`;
}

export const emailTranslations = {
  formatDate,
  serviceLabel,

  en: {
    confirmation: {
      subject: (date: string) => `Booking Confirmed — ${date} 🌮`,
      greeting: (name: string) => `¡Gracias, ${name}! 🎉`,
      subtitle: "Your booking is confirmed. Here's everything you need to know:",
      eventDetails: "📅 Event Details",
      date: "Date",
      address: "Address",
      package: "Package",
      guests: "Guests",
      notProvided: "Not provided",
      yourMeats: "🥩 Your Meats",
      extras: "✨ Extras",
      whatsIncluded: "📦 What's Included",
      includedItems: [
        "Corn & flour tortillas",
        "Homemade salsas (red, green, raw verde)",
        "Onion, cilantro & lime garnish",
        "Plates & napkins",
        "Forks & serving utensils",
        "Aguas frescas setup",
      ],
      totalPaid: "Total Paid",
      setupNote: `⏰ <strong>Setup:</strong> Our team will arrive 1 hour before your event begins to get everything ready. No action needed on your end!`,
      manageBooking: "Manage Your Booking",
      reschedule: "Reschedule",
      cancelBooking: "Cancel Booking",
      questionsCall: "Questions? Call us at",
      footer: "México Lindo Y Que Rico · Greater Los Angeles · 20+ Years of Flavor",
    },
    cashPending: {
      subject: () => `We've Received Your Booking — Payment Required! 🌮`,
      heading: "We've received your booking! 🎉",
      subtitle: (name: string) => `Hey ${name}, thanks for choosing us! Your booking is <strong>not yet confirmed</strong> — please send your payment to secure your date.`,
      whatNext: "📋 How to confirm your booking",
      step1: (amount: string, method: string) => `Send <strong>${amount}</strong> via <strong>${method}</strong> using the details below`,
      step2: (bookingNumber: string) => `Use your booking number <strong>${bookingNumber}</strong> as the memo/note`,
      step3: `Once we receive your payment, we'll send you a <strong>confirmation email</strong>`,
      yourEventDetails: "📅 Your Event Details",
      paymentDetails: "💳 Payment Instructions",
      amountDue: "Amount Due",
      paymentMethod: "Payment Method",
      sendTo: "Send To",
      reference: "Reference / Memo",
      deadline: "Payment Deadline",
      balanceRemaining: "Balance Due on Event Day",
      nonRefundable: "⚠️ This deposit is non-refundable.",
      fullPaymentNote: "Full payment — no balance due on event day.",
      estimatedTotal: "Event Total",
      deadlineWarning: (deadline: string) => `⏰ Your booking will be <strong>automatically cancelled</strong> if payment is not received by <strong>${deadline}</strong>.`,
    },
    reminder: {
      subject: (days: number) => `Reminder: Your Catering Event is in ${days} Days! 🌮`,
      heading: (days: number) => `Your event is in ${days} days! 🎉`,
      subtitle: (name: string) => `Hey ${name}, just a friendly reminder about your upcoming taco catering:`,
    },
    dayBefore: {
      subject: () => `Tomorrow: Your Catering Event! 🌮`,
      heading: "Your event is TOMORROW! 🎉",
      subtitle: (name: string) => `Hey ${name}, we're excited to cater your event tomorrow!`,
      setupNote: `⏰ <strong>Setup:</strong> Our team will arrive 1 hour before your event begins!`,
      needToCancel: "⚠️ Need to cancel?",
      cancelWarning: (fee: string) => `Cancelling at this point will incur a cancellation fee of <strong>${fee}</strong>.`,
      needToReschedule: (locale: string) =>
        locale === "es"
          ? `📞 <strong>¿Necesitas reprogramar?</strong> Por favor llámanos al`
          : `📞 <strong>Need to reschedule?</strong> Please call us at`,
    },
    cancellation: {
      subject: (date: string) => `Booking Cancelled — ${date}`,
      heading: "Booking Cancelled",
      message: (name: string, date: string) =>
        `Hey ${name}, your booking for <strong>${date}</strong> has been cancelled.`,
      cancellationFee: "Cancellation fee",
      refundAmount: "Refund amount",
      refundNote: "Refunds typically take 5-10 business days to appear on your statement.",
      hopeToServe: "We hope to serve you in the future! Call us at",
    },
    ownerCancellation: {
      subject: (date: string) => `Your Booking for ${date} Has Been Cancelled`,
      heading: "Event Cancelled",
      message: (name: string, date: string) =>
        `Hi ${name}, we're sorry to let you know that your catering booking for <strong>${date}</strong> has been cancelled.`,
      reason: "If you have any questions or would like to rebook, please don't hesitate to reach out to us at",
      apology: "We apologize for any inconvenience and hope to serve you in the future!",
    },
    autoCancellation: {
      subject: "Booking Cancelled — Payment Not Received",
      heading: "Booking Cancelled",
      message: (name: string, date: string) =>
        `Hi ${name}, your catering booking for <strong>${date}</strong> has been automatically cancelled because payment was not confirmed within the required deadline.`,
      amountDue: "Amount due",
      contactUs: "If you believe this was an error or would like to rebook, please contact us at",
      apology: "We apologize for any inconvenience and hope to serve you in the future!",
    },
    reschedule: {
      subject: (date: string) => `Booking Rescheduled — ${date} 🌮`,
      heading: "Booking Rescheduled! 📅",
      message: (name: string) => `Hey ${name}, your booking has been rescheduled.`,
      previousDate: "Previous date:",
      newDate: "New date:",
      questionsCall: "Questions? Call us at",
    },
  },

  es: {
    confirmation: {
      subject: (date: string) => `Reservación Confirmada — ${date} 🌮`,
      greeting: (name: string) => `¡Gracias, ${name}! 🎉`,
      subtitle: "Tu reservación está confirmada. Aquí tienes todos los detalles:",
      eventDetails: "📅 Detalles del Evento",
      date: "Fecha",
      address: "Dirección",
      package: "Paquete",
      guests: "Invitados",
      notProvided: "No proporcionada",
      yourMeats: "🥩 Tus Carnes",
      extras: "✨ Extras",
      whatsIncluded: "📦 Incluido con Tu Paquete",
      includedItems: [
        "Tortillas de maíz y harina",
        "Salsas caseras (roja, verde, verde cruda)",
        "Cebolla, cilantro y limón",
        "Platos y servilletas",
        "Tenedores y utensilios para servir",
        "Preparación de aguas frescas",
      ],
      totalPaid: "Total Pagado",
      setupNote: `⏰ <strong>Preparación:</strong> Nuestro equipo llegará 1 hora antes de que comience tu evento para preparar todo. ¡No necesitas hacer nada!`,
      manageBooking: "Administra Tu Reservación",
      reschedule: "Reprogramar",
      cancelBooking: "Cancelar Reservación",
      questionsCall: "¿Preguntas? Llámanos al",
      footer: "México Lindo Y Que Rico · Gran Los Ángeles · 20+ Años de Sabor",
    },
    cashPending: {
      subject: () => `¡Hemos Recibido Tu Reservación — Pago Requerido! 🌮`,
      heading: "¡Hemos recibido tu reservación! 🎉",
      subtitle: (name: string) => `Hola ${name}, ¡gracias por elegirnos! Tu reservación <strong>aún no está confirmada</strong> — por favor envía tu pago para asegurar tu fecha.`,
      whatNext: "📋 Cómo confirmar tu reservación",
      step1: (amount: string, method: string) => `Envía <strong>${amount}</strong> por <strong>${method}</strong> usando los detalles a continuación`,
      step2: (bookingNumber: string) => `Usa tu número de reservación <strong>${bookingNumber}</strong> como memo/nota`,
      step3: `Una vez que recibamos tu pago, te enviaremos un <strong>correo de confirmación</strong>`,
      yourEventDetails: "📅 Detalles de Tu Evento",
      paymentDetails: "💳 Instrucciones de Pago",
      amountDue: "Monto a Pagar",
      paymentMethod: "Método de Pago",
      sendTo: "Enviar A",
      reference: "Referencia / Memo",
      deadline: "Fecha Límite de Pago",
      balanceRemaining: "Saldo Pendiente el Día del Evento",
      nonRefundable: "⚠️ Este depósito no es reembolsable.",
      fullPaymentNote: "Pago completo — sin saldo pendiente el día del evento.",
      estimatedTotal: "Total del Evento",
      deadlineWarning: (deadline: string) => `⏰ Tu reservación será <strong>cancelada automáticamente</strong> si no se recibe el pago antes del <strong>${deadline}</strong>.`,
    },
    reminder: {
      subject: (days: number) => `Recordatorio: ¡Tu Evento de Catering es en ${days} Días! 🌮`,
      heading: (days: number) => `¡Tu evento es en ${days} días! 🎉`,
      subtitle: (name: string) => `Hola ${name}, un recordatorio amistoso sobre tu próximo catering de tacos:`,
    },
    dayBefore: {
      subject: () => `¡Mañana: Tu Evento de Catering! 🌮`,
      heading: "¡Tu evento es MAÑANA! 🎉",
      subtitle: (name: string) => `Hola ${name}, ¡estamos emocionados de atender tu evento mañana!`,
      setupNote: `⏰ <strong>Preparación:</strong> ¡Nuestro equipo llegará 1 hora antes de que comience tu evento!`,
      needToCancel: "⚠️ ¿Necesitas cancelar?",
      cancelWarning: (fee: string) => `Cancelar en este momento tendrá un cargo por cancelación de <strong>${fee}</strong>.`,
      needToReschedule: () =>
        `📞 <strong>¿Necesitas reprogramar?</strong> Por favor llámanos al`,
    },
    cancellation: {
      subject: (date: string) => `Reservación Cancelada — ${date}`,
      heading: "Reservación Cancelada",
      message: (name: string, date: string) =>
        `Hola ${name}, tu reservación para el <strong>${date}</strong> ha sido cancelada.`,
      cancellationFee: "Cargo por cancelación",
      refundAmount: "Monto del reembolso",
      refundNote: "Los reembolsos generalmente tardan de 5 a 10 días hábiles en aparecer en tu estado de cuenta.",
      hopeToServe: "¡Esperamos atenderte en el futuro! Llámanos al",
    },
    ownerCancellation: {
      subject: (date: string) => `Tu Reservación para el ${date} Ha Sido Cancelada`,
      heading: "Evento Cancelado",
      message: (name: string, date: string) =>
        `Hola ${name}, lamentamos informarte que tu reservación de catering para el <strong>${date}</strong> ha sido cancelada.`,
      reason: "Si tienes alguna pregunta o deseas reservar nuevamente, no dudes en comunicarte con nosotros al",
      apology: "¡Nos disculpamos por cualquier inconveniente y esperamos atenderte en el futuro!",
    },
    autoCancellation: {
      subject: "Reservación Cancelada — Pago No Recibido",
      heading: "Reservación Cancelada",
      message: (name: string, date: string) =>
        `Hola ${name}, tu reservación de catering para el <strong>${date}</strong> ha sido cancelada automáticamente porque el pago no fue confirmado dentro del plazo requerido.`,
      amountDue: "Monto pendiente",
      contactUs: "Si crees que esto fue un error o deseas reservar nuevamente, comunícate con nosotros al",
      apology: "¡Nos disculpamos por cualquier inconveniente y esperamos atenderte en el futuro!",
    },
    reschedule: {
      subject: (date: string) => `Reservación Reprogramada — ${date} 🌮`,
      heading: "¡Reservación Reprogramada! 📅",
      message: (name: string) => `Hola ${name}, tu reservación ha sido reprogramada.`,
      previousDate: "Fecha anterior:",
      newDate: "Nueva fecha:",
      questionsCall: "¿Preguntas? Llámanos al",
    },
  },
} as const;

export function getTranslations(locale: string) {
  return locale === "es" ? emailTranslations.es : emailTranslations.en;
}
