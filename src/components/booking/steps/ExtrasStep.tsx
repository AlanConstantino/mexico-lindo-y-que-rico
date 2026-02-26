"use client";

import { useTranslations } from "next-intl";
import type { BookingData } from "../BookingForm";
import { EXTRA_OPTIONS, AGUA_FLAVORS, type ExtraId, type AguaFlavor } from "@/lib/pricing";

interface ExtrasStepProps {
  data: BookingData;
  updateData: (updates: Partial<BookingData>) => void;
}

export default function ExtrasStep({ data, updateData }: ExtrasStepProps) {
  const t = useTranslations("booking");
  const tExtras = useTranslations("extras.items");

  const updateQuantity = (id: ExtraId, delta: number) => {
    const current = data.extras[id] || 0;
    const newVal = Math.max(0, current + delta);
    const newExtras = { ...data.extras };
    if (newVal === 0) {
      delete newExtras[id];
    } else {
      newExtras[id] = newVal;
    }
    // Clear agua flavors when agua is removed
    if (id === "agua" && newVal === 0) {
      updateData({ extras: newExtras, aguaFlavors: [] });
    } else {
      updateData({ extras: newExtras });
    }
  };

  const toggleFlavor = (flavor: AguaFlavor) => {
    const current = data.aguaFlavors;
    const updated = current.includes(flavor)
      ? current.filter((f) => f !== flavor)
      : [...current, flavor];
    updateData({ aguaFlavors: updated });
  };

  return (
    <div>
      <h2 className="font-heading text-3xl text-cream mb-2">
        {t("selectExtras")}
      </h2>
      <p className="text-cream/40 text-sm mb-8">{t("selectExtrasDesc")}</p>

      <div className="space-y-3">
        {EXTRA_OPTIONS.map((extra) => {
          const qty = data.extras[extra.id] || 0;
          const hasQty = qty > 0;
          const isAgua = extra.id === "agua";

          return (
            <div key={extra.id} className="space-y-0">
            <div
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                hasQty
                  ? "border-amber/20 bg-amber/5"
                  : "border-cream/10 bg-navy-light/30"
              } ${isAgua && hasQty ? "rounded-b-none border-b-0" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium text-sm ${hasQty ? "text-amber" : "text-cream"}`}
                >
                  {tExtras(extra.id)}
                </div>
                <div className="text-cream/30 text-xs mt-0.5">
                  ${extra.price}
                  {extra.perUnit ? ` ${t("each")}` : ` · ${t("servesNote")}`}
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateQuantity(extra.id, -1)}
                  disabled={qty === 0}
                  className="w-8 h-8 rounded-full border border-cream/10 flex items-center justify-center text-cream/50 hover:border-cream/30 hover:text-cream transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span
                  className={`w-8 text-center text-sm font-medium ${hasQty ? "text-amber" : "text-cream/30"}`}
                >
                  {qty}
                </span>
                <button
                  onClick={() => updateQuantity(extra.id, 1)}
                  className="w-8 h-8 rounded-full border border-cream/10 flex items-center justify-center text-cream/50 hover:border-amber/30 hover:text-amber transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>

              {/* Line total */}
              {hasQty && (
                <div className="text-amber text-sm font-medium ml-3 w-16 text-right">
                  ${(qty * extra.price).toLocaleString()}
                </div>
              )}
            </div>

            {/* Agua flavor picker */}
            {isAgua && hasQty && (
              <div className="px-4 pb-4 pt-3 rounded-b-xl border border-t-0 border-amber/20 bg-amber/5">
                <p className="text-cream/50 text-xs mb-2.5">{t("chooseFlavors")}</p>
                <div className="flex flex-wrap gap-2">
                  {AGUA_FLAVORS.map((flavor) => {
                    const isSelected = data.aguaFlavors.includes(flavor);
                    return (
                      <button
                        key={flavor}
                        onClick={() => toggleFlavor(flavor)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                          isSelected
                            ? "border-amber/40 bg-amber/15 text-amber"
                            : "border-cream/10 bg-navy-light/30 text-cream/50 hover:border-cream/20 hover:text-cream/70"
                        }`}
                      >
                        {tExtras(`aguaFlavors.${flavor}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
