"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { ServiceType, MeatId, ExtraId } from "@/lib/pricing";
import { calculateTotal, getBasePrice, getExtrasTotal } from "@/lib/pricing";
import DateStep from "./steps/DateStep";
import PackageStep from "./steps/PackageStep";
import MeatStep from "./steps/MeatStep";
import ExtrasStep from "./steps/ExtrasStep";
import CustomerStep from "./steps/CustomerStep";
import ReviewStep from "./steps/ReviewStep";

export interface BookingData {
  eventDate: string | null;
  serviceType: ServiceType | null;
  guestCount: number | null;
  meats: MeatId[];
  extras: Partial<Record<ExtraId, number>>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventAddress: string;
}

const TOTAL_STEPS = 6;

const STEP_LABELS = [
  "step1Label",
  "step2Label",
  "step3Label",
  "step4Label",
  "step5Label",
  "step6Label",
] as const;

export default function BookingForm() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<BookingData>({
    eventDate: null,
    serviceType: null,
    guestCount: null,
    meats: [],
    extras: {},
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventAddress: "",
  });

  const updateData = (updates: Partial<BookingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return data.eventDate !== null;
      case 2:
        return data.serviceType !== null && data.guestCount !== null;
      case 3:
        return data.meats.length === 4;
      case 4:
        return true; // extras are optional
      case 5:
        return (
          data.customerName.trim() !== "" &&
          data.customerEmail.trim() !== "" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail) &&
          data.customerPhone.trim() !== "" &&
          data.eventAddress.trim() !== ""
        );
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS && isStepValid()) {
      setStep((s) => s + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      setError(null);
    }
  };

  const handlePayment = async () => {
    if (!data.serviceType || !data.guestCount || !data.eventDate) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const totalPrice = calculateTotal(
        data.serviceType,
        data.guestCount,
        data.extras
      );

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventDate: data.eventDate,
          serviceType: data.serviceType,
          guestCount: data.guestCount,
          meats: data.meats,
          extras: data.extras,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          eventAddress: data.eventAddress,
          totalPrice,
          locale,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Checkout failed");
      }

      // Redirect to Stripe Checkout
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
      setIsSubmitting(false);
    }
  };

  const total =
    data.serviceType && data.guestCount
      ? calculateTotal(data.serviceType, data.guestCount, data.extras)
      : null;

  const basePrice =
    data.serviceType && data.guestCount
      ? getBasePrice(data.serviceType, data.guestCount)
      : null;

  const extrasTotal = getExtrasTotal(data.extras);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === step;
            const isComplete = stepNum < step;
            return (
              <div key={label} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-amber text-navy scale-110"
                      : isComplete
                        ? "bg-amber/20 text-amber border border-amber/40"
                        : "bg-navy-light/50 text-cream/30 border border-cream/10"
                  }`}
                >
                  {isComplete ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1.5 transition-colors duration-300 hidden sm:block ${
                    isActive
                      ? "text-amber font-medium"
                      : isComplete
                        ? "text-amber/50"
                        : "text-cream/25"
                  }`}
                >
                  {t(label)}
                </span>
              </div>
            );
          })}
        </div>
        {/* Progress line */}
        <div className="h-0.5 bg-cream/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber to-amber-light transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Running total (show from step 2 onwards) */}
      {total !== null && step >= 2 && (
        <div className="mb-6 flex items-center justify-between px-4 py-3 rounded-xl bg-navy-light/30 border border-cream/5">
          <span className="text-cream/40 text-sm">{t("total")}</span>
          <span className="font-heading text-2xl text-amber">
            ${total.toLocaleString()}
          </span>
        </div>
      )}

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 1 && <DateStep data={data} updateData={updateData} />}
        {step === 2 && <PackageStep data={data} updateData={updateData} />}
        {step === 3 && <MeatStep data={data} updateData={updateData} />}
        {step === 4 && <ExtrasStep data={data} updateData={updateData} />}
        {step === 5 && <CustomerStep data={data} updateData={updateData} />}
        {step === 6 && (
          <ReviewStep
            data={data}
            basePrice={basePrice!}
            extrasTotal={extrasTotal}
            total={total!}
          />
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8 gap-4">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="px-6 py-3 border border-cream/10 text-cream/50 rounded-full hover:border-cream/30 hover:text-cream transition-all duration-300 text-sm"
          >
            {t("back")}
          </button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="px-8 py-3 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300 hover:shadow-lg hover:shadow-amber/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-amber disabled:hover:shadow-none text-sm"
          >
            {t("next")}
          </button>
        ) : (
          <button
            onClick={handlePayment}
            disabled={isSubmitting}
            className="px-8 py-3 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300 hover:shadow-lg hover:shadow-amber/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {t("processing")}
              </>
            ) : (
              t("payWithStripe")
            )}
          </button>
        )}
      </div>
    </div>
  );
}
