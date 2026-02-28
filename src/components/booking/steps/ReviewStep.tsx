"use client";

import { useTranslations, useLocale } from "next-intl";
import type { BookingData } from "../BookingForm";
import { EXTRA_OPTIONS, calculateSurcharge, calculateDeposit } from "@/lib/pricing";

interface ReviewStepProps {
  data: BookingData;
  basePrice: number;
  extrasTotal: number;
  total: number;
  ccSurchargePercent: number;
  cashDepositPercent: number;
  onPaymentMethodChange: (method: "card" | "cash") => void;
}

export default function ReviewStep({
  data,
  basePrice,
  extrasTotal,
  total,
  ccSurchargePercent,
  cashDepositPercent,
  onPaymentMethodChange,
}: ReviewStepProps) {
  const t = useTranslations("booking");
  const tMenu = useTranslations("menu.meats");
  const tExtras = useTranslations("extras.items");
  const locale = useLocale();

  const formattedDate = data.eventDate
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
        new Date(data.eventDate + "T12:00:00")
      )
    : "";

  const serviceLabel =
    data.serviceType === "2hr" ? t("twoHourService") : t("threeHourService");

  const activeExtras = EXTRA_OPTIONS.filter(
    (e) => (data.extras[e.id] || 0) > 0
  );

  const surcharge = calculateSurcharge(total, ccSurchargePercent);
  const cardTotal = total + surcharge;
  const depositAmount = calculateDeposit(total, cashDepositPercent);
  const balanceDue = total - depositAmount;

  return (
    <div>
      <h2 className="font-heading text-3xl text-cream mb-2">
        {t("reviewOrder")}
      </h2>
      <p className="text-cream/40 text-sm mb-8">{t("reviewDesc")}</p>

      <div className="space-y-4">
        {/* Event Date */}
        <div className="p-4 rounded-xl bg-navy-light/30 border border-cream/5">
          <div className="text-cream/40 text-xs uppercase tracking-wider mb-1">
            {t("eventDate")}
          </div>
          <div className="text-cream font-medium">{formattedDate}</div>
        </div>

        {/* Package */}
        <div className="p-4 rounded-xl bg-navy-light/30 border border-cream/5">
          <div className="text-cream/40 text-xs uppercase tracking-wider mb-1">
            {t("package")}
          </div>
          <div className="text-cream font-medium">
            {serviceLabel} · {t("guestCount", { count: data.guestCount ?? 0 })}
          </div>
        </div>

        {/* Meats */}
        <div className="p-4 rounded-xl bg-navy-light/30 border border-cream/5">
          <div className="text-cream/40 text-xs uppercase tracking-wider mb-2">
            {t("meats")}
          </div>
          <div className="flex flex-wrap gap-2">
            {data.meats.map((id, idx) => (
              <span
                key={`${id}-${idx}`}
                className="px-3 py-1 rounded-full bg-amber/10 text-amber text-xs font-medium border border-amber/20"
              >
                {tMenu(`${id}.name`)}
              </span>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="p-4 rounded-xl bg-navy-light/30 border border-cream/5">
          <div className="text-cream/40 text-xs uppercase tracking-wider mb-2">
            {t("extras")}
          </div>
          {activeExtras.length > 0 ? (
            <div className="space-y-1.5">
              {activeExtras.map((extra) => {
                const qty = data.extras[extra.id] || 0;
                return (
                  <div key={extra.id}>
                    <div className="flex justify-between text-sm">
                      <span className="text-cream/70">
                        {tExtras(extra.id)}{" "}
                        <span className="text-cream/30">
                          {t("qty", { count: qty })}
                        </span>
                      </span>
                      <span className="text-cream/50">
                        ${(qty * extra.price).toLocaleString()}
                      </span>
                    </div>
                    {extra.id === "agua" && Object.keys(data.aguaFlavors).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 ml-1">
                        {Object.entries(data.aguaFlavors)
                          .filter(([, q]) => (q || 0) > 0)
                          .map(([flavor, q]) => (
                          <span
                            key={flavor}
                            className="px-2 py-0.5 rounded-full bg-amber/10 text-amber/70 text-[10px] font-medium border border-amber/15"
                          >
                            {tExtras(`aguaFlavors.${flavor}`)} ×{q}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-cream/30 text-sm">{t("noExtras")}</div>
          )}
        </div>

        {/* Event Address */}
        <div className="p-4 rounded-xl bg-navy-light/30 border border-cream/5">
          <div className="text-cream/40 text-xs uppercase tracking-wider mb-1">
            {t("eventAddress")}
          </div>
          <div className="text-cream font-medium">{data.eventAddress}</div>
        </div>

        {/* Contact Info */}
        <div className="p-4 rounded-xl bg-navy-light/30 border border-cream/5">
          <div className="text-cream/40 text-xs uppercase tracking-wider mb-2">
            {t("contact")}
          </div>
          <div className="space-y-1 text-sm">
            <div className="text-cream">{data.customerName}</div>
            <div className="text-cream/50">{data.customerEmail}</div>
            <div className="text-cream/50">{data.customerPhone}</div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="p-5 rounded-xl bg-navy-light/30 border border-cream/5">
          <div className="text-cream/40 text-xs uppercase tracking-wider mb-4">
            {t("paymentMethod")}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pay with Card */}
            <button
              type="button"
              onClick={() => onPaymentMethodChange("card")}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                data.paymentMethod === "card"
                  ? "border-amber bg-amber/5"
                  : "border-cream/10 hover:border-cream/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-cream font-medium text-sm">{t("payWithCard")}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-cream/50">{t("subtotal")}</span>
                  <span className="text-cream/70">${total.toLocaleString()}</span>
                </div>
                {surcharge > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-cream/50">{t("ccSurcharge", { percent: ccSurchargePercent })}</span>
                    <span className="text-cream/70">${surcharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium pt-1 border-t border-cream/5">
                  <span className="text-cream">{t("total")}</span>
                  <span className="text-amber">${cardTotal.toLocaleString()}</span>
                </div>
              </div>
            </button>

            {/* Pay with Cash */}
            <button
              type="button"
              onClick={() => onPaymentMethodChange("cash")}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                data.paymentMethod === "cash"
                  ? "border-amber bg-amber/5"
                  : "border-cream/10 hover:border-cream/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-cream font-medium text-sm">{t("payWithCash")}</span>
              </div>
              <div className="space-y-1">
                <p className="text-cream/50 text-xs">{t("cardOnFileNote")}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-cream/50">{t("cashDueOnEventDay")}</span>
                  <span className="text-cream/70">${total.toLocaleString()}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="p-5 rounded-xl bg-gradient-to-b from-amber/5 to-transparent border border-amber/10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-cream/50">{t("basePrice")}</span>
            <span className="text-cream">${basePrice.toLocaleString()}</span>
          </div>
          {extrasTotal > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-cream/50">{t("extrasTotal")}</span>
              <span className="text-cream">
                ${extrasTotal.toLocaleString()}
              </span>
            </div>
          )}
          {data.paymentMethod === "card" && surcharge > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-cream/50">{t("ccSurcharge", { percent: ccSurchargePercent })}</span>
              <span className="text-cream">${surcharge.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-cream/10 mt-3 pt-3 flex justify-between">
            <span className="text-cream font-medium">
              {t("total")}
            </span>
            <span className="font-heading text-2xl text-amber">
              ${data.paymentMethod === "card" ? cardTotal.toLocaleString() : total.toLocaleString()}
            </span>
          </div>
          {data.paymentMethod === "cash" && (
            <div className="text-xs text-cream/40 mt-2">
              {t("cardOnFileSummary")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
