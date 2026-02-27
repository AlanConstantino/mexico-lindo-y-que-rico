"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

interface BookingData {
  id: string;
  customer_name: string;
  event_date: string;
  service_type: string;
  guest_count: number;
  total_price: number;
  status: string;
}

interface AvailabilityData {
  maxEventsPerDay: number;
  minNoticeDays: number;
  bookedDates: Record<string, number>;
}

export default function RescheduleBookingPage() {
  const t = useTranslations("reschedule");
  const params = useParams();
  const token = params.token as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newDateFormatted, setNewDateFormatted] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [availability, setAvailability] = useState<AvailabilityData>({
    maxEventsPerDay: 3,
    minNoticeDays: 3,
    bookedDates: {},
  });

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/booking/reschedule/lookup?token=${token}`);
        if (!res.ok) {
          setError(t("invalidLink"));
          return;
        }
        const data = await res.json();
        setBooking(data.booking);
      } catch {
        setError(t("invalidLink"));
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [token, t]);

  const fetchAvailability = useCallback(async () => {
    const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    try {
      const res = await fetch(`/api/availability?month=${monthStr}`);
      const data = await res.json();
      setAvailability(data);
    } catch { /* ignore */ }
  }, [viewYear, viewMonth]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleReschedule = async () => {
    if (!newDate) return;
    setRescheduling(true);
    setError("");
    try {
      const res = await fetch("/api/booking/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("rescheduleError"));
        return;
      }
      setSuccess(true);
      setNewDateFormatted(
        new Date(newDate).toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })
      );
    } catch {
      setError(t("rescheduleError"));
    } finally {
      setRescheduling(false);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });

  const isDateAvailable = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (date < today) return false;
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < availability.minNoticeDays) return false;
    const count = availability.bookedDates[dateStr] || 0;
    if (count >= availability.maxEventsPerDay) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-cream/50">{t("loading")}</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-teal-light/10 border border-teal-light/20 flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-teal-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl text-cream mb-3">{t("successTitle")}</h1>
          <p className="text-cream/60 mb-8">{t("successMessage", { date: newDateFormatted })}</p>
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

  if (!booking) return null;

  const currentFormattedDate = new Date(booking.event_date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">
        <h1 className="font-heading text-3xl text-cream mb-2 text-center">{t("title")}</h1>
        <p className="text-cream/50 text-center mb-8">{t("subtitle")}</p>

        <div className="bg-navy-light border border-cream/10 rounded-xl p-6 mb-6">
          <h3 className="text-amber font-semibold mb-2">{t("currentDate")}</h3>
          <p className="text-cream">{currentFormattedDate}</p>
        </div>

        <div className="bg-navy-light border border-cream/10 rounded-xl p-6 mb-6">
          <h3 className="text-amber font-semibold mb-4">{t("selectNewDate")}</h3>
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="text-cream/50 hover:text-cream p-2">←</button>
            <span className="text-cream font-medium">{monthName}</span>
            <button onClick={nextMonth} className="text-cream/50 hover:text-cream p-2">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-cream/40 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const available = isDateAvailable(day);
              const selected = newDate === dateStr;
              return (
                <button
                  key={day}
                  onClick={() => available && setNewDate(dateStr)}
                  disabled={!available}
                  className={`py-2 rounded-lg text-sm transition-all ${
                    selected ? "bg-amber text-navy font-bold"
                      : available ? "text-cream hover:bg-cream/10"
                        : "text-cream/20 cursor-not-allowed"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-terracotta text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <Link href="/" className="flex-1 text-center py-3 border border-cream/10 text-cream/50 rounded-full hover:border-cream/30 hover:text-cream transition-all duration-300 text-sm">
            {t("cancel")}
          </Link>
          <button
            onClick={handleReschedule}
            disabled={!newDate || rescheduling}
            className="flex-1 py-3 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300 disabled:opacity-50 text-sm"
          >
            {rescheduling ? t("rescheduling") : t("confirmReschedule")}
          </button>
        </div>
      </div>
    </div>
  );
}
