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

  const getMeatCount = (id: MeatId) =>
    data.meats.filter((m) => m === id).length;

  const totalSelected = data.meats.length;

  const addMeat = (id: MeatId) => {
    if (totalSelected < 4) {
      updateData({ meats: [...data.meats, id] });
    }
  };

  const removeMeat = (id: MeatId) => {
    const idx = data.meats.indexOf(id);
    if (idx !== -1) {
      const updated = [...data.meats];
      updated.splice(idx, 1);
      updateData({ meats: updated });
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
            totalSelected === 4
              ? "bg-amber/10 text-amber border border-amber/30"
              : "bg-navy-light/50 text-cream/40 border border-cream/10"
          }`}
        >
          {t("meatsCount", { count: totalSelected })}
        </span>
      </div>
      <p className="text-cream/40 text-sm mb-8">{t("selectMeatsDesc")}</p>

      <div className="grid grid-cols-2 gap-3">
        {MEAT_OPTIONS.map((id) => {
          const count = getMeatCount(id);
          const isSelected = count > 0;
          const canAdd = totalSelected < 4;

          return (
            <div
              key={id}
              className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                isSelected
                  ? "border-amber bg-amber/5 shadow-lg shadow-amber/5"
                  : "border-cream/10 bg-navy-light/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium text-sm transition-colors ${isSelected ? "text-amber" : "text-cream"}`}
                  >
                    {tMenu(`${id}.name`)}
                  </div>
                  <div className="text-cream/30 text-xs mt-1">
                    {tMenu(`${id}.tag`)}
                  </div>
                </div>

                {/* Count badge */}
                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-amber text-navy text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {count}
                  </span>
                )}
              </div>

              {/* Add / Remove controls */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => removeMeat(id)}
                  disabled={count === 0}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                    count > 0
                      ? "bg-cream/10 text-cream hover:bg-cream/20"
                      : "bg-cream/5 text-cream/20 cursor-not-allowed"
                  }`}
                >
                  −
                </button>
                <button
                  onClick={() => addMeat(id)}
                  disabled={!canAdd}
                  className={`flex-1 h-8 rounded-lg text-xs font-medium transition-all ${
                    canAdd
                      ? "bg-amber/10 text-amber border border-amber/20 hover:bg-amber/20"
                      : "bg-cream/5 text-cream/20 border border-cream/5 cursor-not-allowed"
                  }`}
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
