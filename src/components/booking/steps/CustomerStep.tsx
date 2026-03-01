"use client";

import { useTranslations } from "next-intl";
import type { BookingData } from "../BookingForm";

interface CustomerStepProps {
  data: BookingData;
  updateData: (updates: Partial<BookingData>) => void;
}

export default function CustomerStep({ data, updateData }: CustomerStepProps) {
  const t = useTranslations("booking");

  return (
    <div>
      <h2 className="font-heading text-3xl text-cream mb-2">
        {t("customerInfo")}
      </h2>
      <p className="text-cream/40 text-sm mb-8">{t("customerInfoDesc")}</p>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-cream/60 text-sm mb-2 font-medium"
          >
            {t("fullName")} <span className="text-terracotta">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={data.customerName}
            onChange={(e) => updateData({ customerName: e.target.value })}
            placeholder={t("namePlaceholder")}
            className="w-full px-4 py-3 rounded-xl bg-navy-light/50 border border-cream/10 text-cream placeholder:text-cream/20 focus:border-amber/40 focus:outline-none focus:ring-1 focus:ring-amber/20 transition-all text-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-cream/60 text-sm mb-2 font-medium"
          >
            {t("email")} <span className="text-terracotta">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={data.customerEmail}
            onChange={(e) => updateData({ customerEmail: e.target.value })}
            placeholder={t("emailPlaceholder")}
            className="w-full px-4 py-3 rounded-xl bg-navy-light/50 border border-cream/10 text-cream placeholder:text-cream/20 focus:border-amber/40 focus:outline-none focus:ring-1 focus:ring-amber/20 transition-all text-sm"
          />
          {data.customerEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail) && (
              <p className="text-terracotta/70 text-xs mt-1.5">
                {t("invalidEmail")}
              </p>
            )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-cream/60 text-sm mb-2 font-medium"
          >
            {t("phone")} <span className="text-terracotta">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={data.customerPhone}
            onChange={(e) => updateData({ customerPhone: e.target.value })}
            placeholder={t("phonePlaceholder")}
            className="w-full px-4 py-3 rounded-xl bg-navy-light/50 border border-cream/10 text-cream placeholder:text-cream/20 focus:border-amber/40 focus:outline-none focus:ring-1 focus:ring-amber/20 transition-all text-sm"
          />
        </div>

        {/* Event Address */}
        <div>
          <label
            htmlFor="address"
            className="block text-cream/60 text-sm mb-2 font-medium"
          >
            {t("eventAddress")} <span className="text-terracotta">*</span>
          </label>
          <input
            id="address"
            type="text"
            value={data.eventAddress}
            onChange={(e) => updateData({ eventAddress: e.target.value })}
            placeholder={t("addressPlaceholder")}
            className="w-full px-4 py-3 rounded-xl bg-navy-light/50 border border-cream/10 text-cream placeholder:text-cream/20 focus:border-amber/40 focus:outline-none focus:ring-1 focus:ring-amber/20 transition-all text-sm"
          />
          {data.eventAddress && data.eventAddress.trim().length > 0 && (
            !(/\d/.test(data.eventAddress) && /\d{5}/.test(data.eventAddress) && data.eventAddress.trim().length >= 10) ? (
              <p className="text-terracotta/70 text-xs mt-1.5">
                {t("invalidAddress")}
              </p>
            ) : (
              <p className="text-teal text-xs mt-1.5">✓ {t("validAddress")}</p>
            )
          )}
          {(!data.eventAddress || data.eventAddress.trim().length === 0) && (
            <p className="text-cream/30 text-xs mt-1.5">{t("addressNote")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
