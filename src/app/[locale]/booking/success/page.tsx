"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface CashBookingDetails {
  booking_number: string;
  total_price: number;
  deposit_amount: number;
  balance_due: number;
  cash_payment_method: string;
  cash_payment_option: string;
  deposit_deadline: string;
  customer_name: string;
}

interface PaymentHandles {
  zelle_handle: string;
  paypal_email: string;
  cashapp_handle: string;
  venmo_handle: string;
}

export default function BookingSuccessPage() {
  const t = useTranslations("booking");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const isCash = searchParams.get("cash") === "true" || sessionId.startsWith("cash_");
  const bookingRef = searchParams.get("ref");

  const [cashDetails, setCashDetails] = useState<CashBookingDetails | null>(null);
  const [paymentHandles, setPaymentHandles] = useState<PaymentHandles | null>(null);

  useEffect(() => {
    if (!isCash || !sessionId.startsWith("cash_")) return;
    const bookingId = sessionId.replace("cash_", "");

    // Fetch booking details and payment handles
    Promise.all([
      fetch(`/api/booking/${bookingId}`).then(r => r.ok ? r.json() : null),
      fetch("/api/settings/public").then(r => r.ok ? r.json() : null),
    ]).then(([bookingData, settingsData]) => {
      if (bookingData?.booking) setCashDetails(bookingData.booking);
      if (settingsData) setPaymentHandles({
        zelle_handle: settingsData.zelle_handle || "",
        paypal_email: settingsData.paypal_email || "",
        cashapp_handle: settingsData.cashapp_handle || "",
        venmo_handle: settingsData.venmo_handle || "",
      });
    }).catch(() => {});
  }, [isCash, sessionId]);

  const getPaymentHandle = (method: string): string => {
    if (!paymentHandles) return "";
    switch (method) {
      case "zelle": return paymentHandles.zelle_handle;
      case "paypal": return paymentHandles.paypal_email;
      case "cashapp": return paymentHandles.cashapp_handle;
      case "venmo": return paymentHandles.venmo_handle;
      default: return "";
    }
  };

  const getMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      zelle: "Zelle",
      paypal: "PayPal",
      cashapp: "Cash App",
      venmo: "Venmo",
      cash_in_person: t("cashInPerson"),
    };
    return labels[method] || method;
  };

  const amountDue = cashDetails
    ? (cashDetails.cash_payment_option === "deposit"
        ? cashDetails.deposit_amount / 100
        : cashDetails.total_price / 100)
    : 0;

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className={`w-20 h-20 rounded-full ${isCash ? "bg-amber/10 border border-amber/20" : "bg-teal/10 border border-teal/20"} flex items-center justify-center mx-auto mb-8`}>
          <svg
            className={`w-10 h-10 ${isCash ? "text-amber" : "text-teal"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="font-heading text-4xl text-cream mb-3">
          {isCash ? t("cashSuccessTitle") : t("successTitle")}
        </h1>
        <p className="text-amber text-sm mb-4">
          {isCash ? t("cashSuccessSubtitle") : t("successSubtitle")}
        </p>

        {/* Booking reference number */}
        {bookingRef && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-navy-light/40 border border-cream/10 inline-block">
            <p className="text-cream/40 text-xs uppercase tracking-wider mb-1">
              {t("successBookingId")}
            </p>
            <p className="font-heading text-2xl text-amber tracking-wide">
              {bookingRef}
            </p>
          </div>
        )}

        {/* Cash Payment Instructions */}
        {isCash && cashDetails && cashDetails.cash_payment_method && (
          <div className="mb-6 text-left p-5 rounded-xl bg-navy-light/40 border border-cream/10 space-y-4">
            <h3 className="text-cream font-medium text-sm uppercase tracking-wider">
              {t("cashPaymentInstructions")}
            </h3>

            {/* Amount to send */}
            <div className="flex justify-between items-center">
              <span className="text-cream/50 text-sm">{t("amountToSend")}</span>
              <span className="font-heading text-xl text-amber">${amountDue.toFixed(2)}</span>
            </div>

            {/* Payment method details */}
            <div className="p-3 rounded-lg bg-navy-light/60 border border-cream/5">
              <div className="text-cream/50 text-xs mb-1">{t("sendVia")} {getMethodLabel(cashDetails.cash_payment_method)}</div>
              <div className="text-cream font-medium">
                {cashDetails.cash_payment_method === "zelle" && getPaymentHandle("zelle") && (
                  <a href={`sms:${getPaymentHandle("zelle")}`} className="text-amber hover:underline">{getPaymentHandle("zelle")}</a>
                )}
                {cashDetails.cash_payment_method === "paypal" && getPaymentHandle("paypal") && (
                  <a href={`https://paypal.me/${getPaymentHandle("paypal")}`} className="text-amber hover:underline">{getPaymentHandle("paypal")}</a>
                )}
                {cashDetails.cash_payment_method === "cashapp" && getPaymentHandle("cashapp") && (
                  <span className="text-amber">{getPaymentHandle("cashapp")}</span>
                )}
                {cashDetails.cash_payment_method === "venmo" && getPaymentHandle("venmo") && (
                  <span className="text-amber">{getPaymentHandle("venmo")}</span>
                )}
              </div>
            </div>

            {/* Memo instruction */}
            <div className="text-cream/50 text-xs">
              {t("cashMemoInstruction", { ref: bookingRef || "" })}
            </div>

            {/* Balance due if deposit */}
            {cashDetails.cash_payment_option === "deposit" && (
              <div className="flex justify-between text-xs">
                <span className="text-cream/50">{t("balanceDueOnEventLabel")}</span>
                <span className="text-cream/70">${(cashDetails.balance_due / 100).toFixed(2)}</span>
              </div>
            )}

            {/* Auto-cancel warning */}
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-xs">
                ⚠️ {t("cashAutoCancelWarning")}
              </p>
            </div>
          </div>
        )}

        {/* Non-cash success message */}
        {!isCash && (
          <p className="text-cream/40 text-sm mb-10 leading-relaxed">
            {t("successDesc")}
          </p>
        )}

        {/* Cash without details - fallback */}
        {isCash && !cashDetails && (
          <p className="text-cream/40 text-sm mb-10 leading-relaxed">
            {t("cashSuccessDesc")}
          </p>
        )}

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300 hover:shadow-lg hover:shadow-amber/20 text-sm"
        >
          {t("returnHome")}
        </Link>
      </div>
    </div>
  );
}
