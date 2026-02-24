"use client";

import { useTranslations, useLocale } from "next-intl";
import type { BookingData } from "../BookingForm";
import { EXTRA_OPTIONS } from "@/lib/pricing";

interface ReviewStepProps {
  data: BookingData;
  basePrice: number;
  extrasTotal: number;
  total: number;
}

export default function ReviewStep({
  data,
  basePrice,
  extrasTotal,
  total,
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
            {data.meats.map((id) => (
              <span
                key={id}
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
                  <div
                    key={extra.id}
                    className="flex justify-between text-sm"
                  >
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
                );
              })}
            </div>
          ) : (
            <div className="text-cream/30 text-sm">{t("noExtras")}</div>
          )}
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
          <div className="border-t border-cream/10 mt-3 pt-3 flex justify-between">
            <span className="text-cream font-medium">{t("total")}</span>
            <span className="font-heading text-2xl text-amber">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
