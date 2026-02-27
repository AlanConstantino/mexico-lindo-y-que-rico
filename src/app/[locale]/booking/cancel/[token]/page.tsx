"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

interface BookingData {
  id: string;
  customer_name: string;
  event_date: string;
  service_type: string;
  guest_count: number;
  meats: string[];
  event_address?: string;
  total_price: number;
  status: string;
}

interface FeeInfo {
  cancellationFee: number;
  refundAmount: number;
  isFree: boolean;
}

export default function CancelBookingPage() {
  const t = useTranslations("cancel");
  const params = useParams();
  const token = params.token as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [feeInfo, setFeeInfo] = useState<FeeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ refundAmount: number; cancellationFee: number } | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/booking/cancel/lookup?token=${token}`);
        if (!res.ok) {
          setError(t("invalidLink"));
          return;
        }
        const data = await res.json();
        setBooking(data.booking);
        setFeeInfo(data.feeInfo);
      } catch {
        setError(t("invalidLink"));
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [token, t]);

  const handleCancel = async () => {
    setCancelling(true);
    setError("");
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("cancelError"));
        return;
      }
      setCancelled(true);
      setResult({ refundAmount: data.refundAmount, cancellationFee: data.cancellationFee });
    } catch {
      setError(t("cancelError"));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-cream/50">{t("loading")}</div>
      </div>
    );
  }

  if (cancelled && result) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-teal-light/10 border border-teal-light/20 flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-teal-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl text-cream mb-3">{t("cancelledTitle")}</h1>
          <p className="text-cream/60 mb-4">
            {result.cancellationFee > 0
              ? t("cancelledWithFee", {
                  fee: `$${(result.cancellationFee / 100).toFixed(2)}`,
                  refund: `$${(result.refundAmount / 100).toFixed(2)}`,
                })
              : t("cancelledFullRefund", {
                  refund: `$${(result.refundAmount / 100).toFixed(2)}`,
                })}
          </p>
          <p className="text-cream/40 text-sm mb-8">{t("refundNote")}</p>
          <Link href="/" className="inline-block px-8 py-3 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300">
            {t("returnHome")}
          </Link>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="font-heading text-3xl text-cream mb-3">{t("errorTitle")}</h1>
          <p className="text-cream/50 mb-8">{error}</p>
          <Link href="/" className="inline-block px-8 py-3 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300">
            {t("returnHome")}
          </Link>
        </div>
      </div>
    );
  }

  if (!booking || !feeInfo) return null;

  const formattedDate = new Date(booking.event_date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">
        <h1 className="font-heading text-3xl text-cream mb-2 text-center">{t("title")}</h1>
        <p className="text-cream/50 text-center mb-8">{t("subtitle")}</p>

        <div className="bg-navy-light border border-cream/10 rounded-xl p-6 mb-6">
          <h3 className="text-amber font-semibold mb-4">{t("bookingDetails")}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-cream/50">{t("date")}</span>
              <span className="text-cream font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream/50">{t("package")}</span>
              <span className="text-cream font-medium">{booking.service_type === "2hr" ? "2-Hour" : "3-Hour"} Service</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream/50">{t("guests")}</span>
              <span className="text-cream font-medium">{booking.guest_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream/50">{t("total")}</span>
              <span className="text-cream font-medium">${(booking.total_price / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className={`border rounded-xl p-6 mb-6 ${feeInfo.isFree ? "bg-teal-light/5 border-teal-light/20" : "bg-terracotta/5 border-terracotta/20"}`}>
          {feeInfo.isFree ? (
            <>
              <p className="text-teal-light font-semibold mb-1">✓ {t("freeCancellation")}</p>
              <p className="text-cream/60 text-sm">{t("fullRefundMessage", { amount: `$${(feeInfo.refundAmount / 100).toFixed(2)}` })}</p>
            </>
          ) : (
            <>
              <p className="text-terracotta font-semibold mb-1">⚠️ {t("feeApplies")}</p>
              <p className="text-cream/60 text-sm">{t("feeMessage", { fee: `$${(feeInfo.cancellationFee / 100).toFixed(2)}`, refund: `$${(feeInfo.refundAmount / 100).toFixed(2)}` })}</p>
            </>
          )}
        </div>

        {error && <p className="text-terracotta text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <Link href="/" className="flex-1 text-center py-3 border border-cream/10 text-cream/50 rounded-full hover:border-cream/30 hover:text-cream transition-all duration-300 text-sm">
            {t("keepBooking")}
          </Link>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 py-3 bg-terracotta text-white font-semibold rounded-full hover:bg-terracotta/80 transition-all duration-300 disabled:opacity-50 text-sm"
          >
            {cancelling ? t("cancelling") : t("confirmCancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
