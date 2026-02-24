"use client";

import { useTranslations } from "next-intl";
import type { BookingData } from "../BookingForm";
import { GUEST_OPTIONS, type ServiceType } from "@/lib/pricing";

interface PackageStepProps {
  data: BookingData;
  updateData: (updates: Partial<BookingData>) => void;
}

export default function PackageStep({ data, updateData }: PackageStepProps) {
  const t = useTranslations("booking");

  const handleServiceSelect = (type: ServiceType) => {
    // Reset guest count when switching service type
    if (type !== data.serviceType) {
      updateData({ serviceType: type, guestCount: null });
    }
  };

  const handleGuestSelect = (count: number) => {
    updateData({ guestCount: count });
  };

  const services: { type: ServiceType; labelKey: string; descKey: string }[] = [
    {
      type: "2hr",
      labelKey: "twoHourService",
      descKey: "twoHourDesc",
    },
    {
      type: "3hr",
      labelKey: "threeHourService",
      descKey: "threeHourDesc",
    },
  ];

  return (
    <div>
      <h2 className="font-heading text-3xl text-cream mb-2">
        {t("selectPackage")}
      </h2>
      <p className="text-cream/40 text-sm mb-8">{t("selectPackageDesc")}</p>

      {/* Service type selection */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {services.map((svc) => {
          const isSelected = data.serviceType === svc.type;
          return (
            <button
              key={svc.type}
              onClick={() => handleServiceSelect(svc.type)}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 ${
                isSelected
                  ? "border-amber bg-amber/5 shadow-lg shadow-amber/5"
                  : "border-cream/10 bg-navy-light/30 hover:border-cream/20"
              }`}
            >
              <div
                className={`text-lg font-heading mb-1 transition-colors ${isSelected ? "text-amber" : "text-cream"}`}
              >
                {t(svc.labelKey)}
              </div>
              <div className="text-cream/40 text-xs">{t(svc.descKey)}</div>
            </button>
          );
        })}
      </div>

      {/* Guest count selection */}
      {data.serviceType && (
        <div>
          <p className="text-cream/50 text-sm mb-4 font-medium">
            {t("upTo")}...
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GUEST_OPTIONS[data.serviceType].map((option) => {
              const isSelected = data.guestCount === option.count;
              return (
                <button
                  key={option.count}
                  onClick={() => handleGuestSelect(option.count)}
                  className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                    isSelected
                      ? "border-amber bg-amber/5 shadow-lg shadow-amber/5"
                      : "border-cream/10 bg-navy-light/30 hover:border-cream/20"
                  }`}
                >
                  <div
                    className={`font-heading text-2xl mb-1 transition-colors ${isSelected ? "text-amber" : "text-cream"}`}
                  >
                    {option.count}
                  </div>
                  <div className="text-cream/40 text-xs">{t("guests")}</div>
                  <div
                    className={`font-heading text-lg mt-2 transition-colors ${isSelected ? "text-amber" : "text-cream/60"}`}
                  >
                    ${option.price}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
