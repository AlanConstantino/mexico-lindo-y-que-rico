"use client";

import { useTranslations } from "next-intl";
import type { BookingData } from "../BookingForm";
import { EXTRA_OPTIONS, AGUA_FLAVORS, MEAT_OPTIONS, type ExtraId, type AguaFlavor, type AguaFlavorQuantities, type MeatId, type ExtraMeatQuantities } from "@/lib/pricing";

interface ExtrasStepProps {
  data: BookingData;
  updateData: (updates: Partial<BookingData>) => void;
}

export default function ExtrasStep({ data, updateData }: ExtrasStepProps) {
  const t = useTranslations("booking");
  const tExtras = useTranslations("extras.items");
  const tMenu = useTranslations("menu.meats");

  const updateQuantity = (id: ExtraId, delta: number) => {
    const current = data.extras[id] || 0;
    const newVal = Math.max(0, current + delta);
    const newExtras = { ...data.extras };
    if (newVal === 0) {
      delete newExtras[id];
    } else {
      newExtras[id] = newVal;
    }
    // Clear agua flavors when agua is removed or count decreases
    if (id === "agua" && newVal === 0) {
      updateData({ extras: newExtras, aguaFlavors: {} });
    } else if (id === "agua") {
      const currentFlavorSum = Object.values(data.aguaFlavors).reduce<number>((sum, n) => sum + (n || 0), 0);
      if (currentFlavorSum > newVal) {
        updateData({ extras: newExtras, aguaFlavors: {} });
      } else {
        updateData({ extras: newExtras });
      }
    } else if (id === "extraMeat" && newVal === 0) {
      updateData({ extras: newExtras, extraMeatSelections: {} });
    } else if (id === "extraMeat") {
      const currentMeatSum = Object.values(data.extraMeatSelections).reduce<number>((sum, n) => sum + (n || 0), 0);
      if (currentMeatSum > newVal) {
        updateData({ extras: newExtras, extraMeatSelections: {} });
      } else {
        updateData({ extras: newExtras });
      }
    } else {
      updateData({ extras: newExtras });
    }
  };

  const totalAssigned = Object.values(data.aguaFlavors).reduce<number>((sum, n) => sum + (n || 0), 0);
  const aguaCount = data.extras.agua || 0;

  const totalMeatAssigned = Object.values(data.extraMeatSelections).reduce<number>((sum, n) => sum + (n || 0), 0);
  const extraMeatCount = data.extras.extraMeat || 0;

  const updateFlavorQty = (flavor: AguaFlavor, delta: number) => {
    const current = data.aguaFlavors[flavor] || 0;
    const newVal = Math.max(0, current + delta);
    const newFlavors: AguaFlavorQuantities = { ...data.aguaFlavors };
    if (newVal === 0) {
      delete newFlavors[flavor];
    } else {
      newFlavors[flavor] = newVal;
    }
    updateData({ aguaFlavors: newFlavors });
  };

  const updateMeatQty = (meatId: MeatId, delta: number) => {
    const current = data.extraMeatSelections[meatId] || 0;
    const newVal = Math.max(0, current + delta);
    const newSelections: ExtraMeatQuantities = { ...data.extraMeatSelections };
    if (newVal === 0) {
      delete newSelections[meatId];
    } else {
      newSelections[meatId] = newVal;
    }
    updateData({ extraMeatSelections: newSelections });
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
          const isExtraMeat = extra.id === "extraMeat";
          const hasSubPicker = (isAgua || isExtraMeat) && hasQty;

          return (
            <div key={extra.id} className="space-y-0">
              <div
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                hasQty
                  ? "border-amber/20 bg-amber/5"
                  : "border-teal/20 bg-teal/10"
              } ${hasSubPicker ? "rounded-b-none border-b-0" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium text-sm ${hasQty ? "text-amber" : "text-cream"}`}
                >
                  {tExtras(extra.id)}
                </div>
                <div className="text-cream/30 text-xs mt-0.5">
                  ${extra.price}
                  {extra.id === "extraTime" ? ` ${t("perHour")}` : extra.perUnit ? ` ${t("each")}` : ` · ${t("servesNote")}`}
                </div>
                {extra.id === "extraTime" && (
                  <div className="text-cream/20 text-[10px] mt-0.5">{tExtras("extraTimeNote")}</div>
                )}
                {extra.id === "extraMeat" && (
                  <div className="text-cream/20 text-[10px] mt-0.5">{tExtras("extraMeatNote")}</div>
                )}
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
                  ${(qty * extra.price).toFixed(2)}
                </div>
              )}
            </div>

            {/* Extra meat selection picker */}
            {isExtraMeat && hasQty && (
              <div className="px-4 pb-4 pt-3 rounded-b-xl border border-t-0 border-amber/20 bg-amber/5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-cream/50 text-xs">{t("chooseMeats")}</p>
                  <span className={`text-xs font-medium ${totalMeatAssigned === extraMeatCount ? "text-green-400" : "text-amber"}`}>
                    {t("meatsAssigned", { assigned: totalMeatAssigned, total: extraMeatCount })}
                  </span>
                </div>
                <div className="space-y-2">
                  {MEAT_OPTIONS.map((meatId) => {
                    const meatQty = data.extraMeatSelections[meatId] || 0;
                    const hasMeatQty = meatQty > 0;
                    return (
                      <div key={meatId} className="flex items-center justify-between py-1.5">
                        <span className={`text-xs font-medium ${hasMeatQty ? "text-amber" : "text-cream/50"}`}>
                          {tMenu(`${meatId}.name`)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateMeatQty(meatId, -1)}
                            disabled={meatQty === 0}
                            className="w-7 h-7 rounded-full border border-cream/10 flex items-center justify-center text-cream/50 hover:border-cream/30 hover:text-cream transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className={`w-6 text-center text-xs font-medium ${hasMeatQty ? "text-amber" : "text-cream/30"}`}>
                            {meatQty}
                          </span>
                          <button
                            onClick={() => updateMeatQty(meatId, 1)}
                            disabled={totalMeatAssigned >= extraMeatCount}
                            className="w-7 h-7 rounded-full border border-cream/10 flex items-center justify-center text-cream/50 hover:border-amber/30 hover:text-amber transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Agua flavor quantity picker */}
            {isAgua && hasQty && (
              <div className="px-4 pb-4 pt-3 rounded-b-xl border border-t-0 border-amber/20 bg-amber/5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-cream/50 text-xs">{t("chooseFlavors")}</p>
                  <span className={`text-xs font-medium ${totalAssigned === aguaCount ? "text-green-400" : "text-amber"}`}>
                    {t("flavorsAssigned", { assigned: totalAssigned, total: aguaCount })}
                  </span>
                </div>
                <div className="space-y-2">
                  {AGUA_FLAVORS.map((flavor) => {
                    const flavorQty = data.aguaFlavors[flavor] || 0;
                    const hasFlavorQty = flavorQty > 0;
                    return (
                      <div key={flavor} className="flex items-center justify-between py-1.5">
                        <span className={`text-xs font-medium ${hasFlavorQty ? "text-amber" : "text-cream/50"}`}>
                          {tExtras(`aguaFlavors.${flavor}`)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateFlavorQty(flavor, -1)}
                            disabled={flavorQty === 0}
                            className="w-7 h-7 rounded-full border border-cream/10 flex items-center justify-center text-cream/50 hover:border-cream/30 hover:text-cream transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className={`w-6 text-center text-xs font-medium ${hasFlavorQty ? "text-amber" : "text-cream/30"}`}>
                            {flavorQty}
                          </span>
                          <button
                            onClick={() => updateFlavorQty(flavor, 1)}
                            disabled={totalAssigned >= aguaCount}
                            className="w-7 h-7 rounded-full border border-cream/10 flex items-center justify-center text-cream/50 hover:border-amber/30 hover:text-amber transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
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
