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
      totalPaid: "Total Paid",
      setupNote: `⏰ <strong>Setup:</strong> Our team will arrive 1 hour before your event begins to get everything ready. No action needed on your end!`,
      manageBooking: "Manage Your Booking",
      reschedule: "Reschedule",
      cancelBooking: "Cancel Booking",
      questionsCall: "Questions? Call us at",
      footer: "México Lindo Y Que Rico · Greater Los Angeles · 20+ Years of Flavor",
    },
    cashPending: {
      subject: () => `We've Received Your Booking! 🌮`,
      heading: "We've received your booking! 🎉",
      subtitle: (name: string) => `Hey ${name}, thanks for choosing us! Your booking is currently being reviewed.`,
      whatNext: "📋 What happens next?",
      step1: `One of our team members will <strong>call you shortly</strong> to confirm the details`,
      step2: "We'll go over your event and arrange payment",
      step3: `Once confirmed, you'll receive a <strong>follow-up confirmation email</strong> with everything locked in`,
      yourEventDetails: "📅 Your Event Details",
      estimatedTotal: "Estimated Total (Cash)",
      dueCash: "Due in cash on event day",
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
      totalPaid: "Total Pagado",
      setupNote: `⏰ <strong>Preparación:</strong> Nuestro equipo llegará 1 hora antes de que comience tu evento para preparar todo. ¡No necesitas hacer nada!`,
      manageBooking: "Administra Tu Reservación",
      reschedule: "Reprogramar",
      cancelBooking: "Cancelar Reservación",
      questionsCall: "¿Preguntas? Llámanos al",
      footer: "México Lindo Y Que Rico · Gran Los Ángeles · 20+ Años de Sabor",
    },
    cashPending: {
      subject: () => `¡Hemos Recibido Tu Reservación! 🌮`,
      heading: "¡Hemos recibido tu reservación! 🎉",
      subtitle: (name: string) => `Hola ${name}, ¡gracias por elegirnos! Tu reservación está siendo revisada.`,
      whatNext: "📋 ¿Qué sigue?",
      step1: `Uno de nuestros miembros del equipo te <strong>llamará pronto</strong> para confirmar los detalles`,
      step2: "Revisaremos tu evento y organizaremos el pago",
      step3: `Una vez confirmado, recibirás un <strong>correo de confirmación</strong> con todo asegurado`,
      yourEventDetails: "📅 Detalles de Tu Evento",
      estimatedTotal: "Total Estimado (Efectivo)",
      dueCash: "A pagar en efectivo el día del evento",
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
