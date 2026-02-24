"use client";

import { useTranslations } from "next-intl";
import type { BookingData } from "../BookingForm";
import { MEAT_OPTIONS, type MeatId } from "@/lib/pricing";

interface MeatStepProps {
  data: BookingData;
  updateData: (updates: Partial<BookingData>) => void;
}

export default function MeatStep({ data, updateData }: MeatStepProps) {
  const t = useTranslations("booking");
  const tMenu = useTranslations("menu.meats");

  const toggleMeat = (id: MeatId) => {
    const current = data.meats;
    if (current.includes(id)) {
      updateData({ meats: current.filter((m) => m !== id) });
    } else if (current.length < 4) {
      updateData({ meats: [...current, id] });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading text-3xl text-cream">
          {t("selectMeats")}
        </h2>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
            data.meats.length === 4
              ? "bg-amber/10 text-amber border border-amber/30"
              : "bg-navy-light/50 text-cream/40 border border-cream/10"
          }`}
        >
          {t("meatsCount", { count: data.meats.length })}
        </span>
      </div>
      <p className="text-cream/40 text-sm mb-8">{t("selectMeatsDesc")}</p>

      <div className="grid grid-cols-2 gap-3">
        {MEAT_OPTIONS.map((id) => {
          const isSelected = data.meats.includes(id);
          const isDisabled = !isSelected && data.meats.length >= 4;

          return (
            <button
              key={id}
              onClick={() => toggleMeat(id)}
              disabled={isDisabled}
              className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                isSelected
                  ? "border-amber bg-amber/5 shadow-lg shadow-amber/5"
                  : isDisabled
                    ? "border-cream/5 bg-navy-light/20 opacity-40 cursor-not-allowed"
                    : "border-cream/10 bg-navy-light/30 hover:border-cream/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div
                    className={`font-medium text-sm transition-colors ${isSelected ? "text-amber" : "text-cream"}`}
                  >
                    {tMenu(`${id}.name`)}
                  </div>
                  <div className="text-cream/30 text-xs mt-1">
                    {tMenu(`${id}.tag`)}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-amber flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 text-navy"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
