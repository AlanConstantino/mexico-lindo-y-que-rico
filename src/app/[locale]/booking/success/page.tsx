"use client";

import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function BookingSuccessPage() {
  const t = useTranslations("booking");
  const searchParams = useSearchParams();
  const isCash = searchParams.get("cash") === "true";
  const bookingRef = searchParams.get("ref");

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

        <p className="text-cream/40 text-sm mb-10 leading-relaxed">
          {isCash ? t("cashSuccessDesc") : t("successDesc")}
        </p>

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
