"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

interface BookingData {
  id: string;
  customer_name: string;
  event_date: string;
  event_time: string | null;
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

// Generate time slots from 8:00 AM to 8:00 PM in 30-min intervals
const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? "00" : "30";
  const value = `${String(hour).padStart(2, "0")}:${min}`;
  const hour12 = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  const label = `${hour12}:${min} ${ampm}`;
  return { value, label };
});

function formatTime12(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export default function RescheduleBookingPage() {
  const t = useTranslations("reschedule");
  const tBooking = useTranslations("booking");
  const params = useParams();
  const token = params.token as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState<string | null>(null);
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
        // Pre-fill with existing time if available
        if (data.booking?.event_time) {
          setNewTime(data.booking.event_time);
        }
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
    if (!newDate || !newTime) return;
    setRescheduling(true);
    setError("");
    try {
      const res = await fetch("/api/booking/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newDate, newTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("rescheduleError"));
        return;
      }
      setSuccess(true);
      const formatted = new Date(newDate + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      setNewDateFormatted(`${formatted} · ${formatTime12(newTime)}`);
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

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

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

  const currentFormattedDate = new Date(booking.event_date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const currentFormattedTime = booking.event_time ? formatTime12(booking.event_time) : null;

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

        {/* Current booking info */}
        <div className="bg-navy-light border border-cream/10 rounded-xl p-6 mb-6">
          <h3 className="text-amber font-semibold mb-2">{t("currentDate")}</h3>
          <p className="text-cream">
            {currentFormattedDate}
            {currentFormattedTime && ` · ${currentFormattedTime}`}
          </p>
        </div>

        {/* Calendar */}
        <div className="bg-navy-light border border-cream/10 rounded-xl p-6 mb-6">
          <h3 className="text-amber font-semibold mb-4">{t("selectNewDate")}</h3>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="text-cream/50 hover:text-cream p-2 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              ←
            </button>
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

        {/* Time Picker — show after date is selected */}
        {newDate && (
          <div className="bg-navy-light border border-cream/10 rounded-xl p-6 mb-6">
            <h3 className="text-amber font-semibold mb-1">{tBooking("selectTime")}</h3>
            <p className="text-cream/40 text-sm mb-4">{tBooking("selectTimeDesc")}</p>
            <div className="relative">
              <select
                value={newTime ?? ""}
                onChange={(e) => setNewTime(e.target.value || null)}
                className="w-full appearance-none rounded-xl bg-navy border border-cream/10 text-cream px-4 py-3 pr-10 text-sm focus:outline-none focus:border-amber/40 transition-colors cursor-pointer"
              >
                <option value="" className="bg-navy text-cream/50">
                  {tBooking("selectTime")}
                </option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value} className="bg-navy text-cream">
                    {slot.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
            {newTime && (() => {
              const [h, m] = newTime.split(":").map(Number);
              const arrivalHour = h - 1;
              const arrivalH12 = arrivalHour % 12 || 12;
              const arrivalAmpm = arrivalHour >= 12 ? "PM" : "AM";
              const arrivalTime = `${arrivalH12}:${String(m).padStart(2, "0")} ${arrivalAmpm}`;
              return (
                <p className="text-cream/40 text-xs italic mt-3">
                  ⏰ {tBooking("setupArrivalNote", { arrivalTime })}
                </p>
              );
            })()}
          </div>
        )}

        {/* Selected date & time summary */}
        {newDate && newTime && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber/5 border border-amber/20 mb-6">
            <svg className="w-5 h-5 text-amber flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="text-amber text-sm font-medium">
              {new Date(newDate + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
              {` · ${formatTime12(newTime)}`}
            </span>
          </div>
        )}

        {error && <p className="text-terracotta text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <Link href="/" className="flex-1 text-center py-3 border border-cream/10 text-cream/50 rounded-full hover:border-cream/30 hover:text-cream transition-all duration-300 text-sm">
            {t("cancel")}
          </Link>
          <button
            onClick={handleReschedule}
            disabled={!newDate || !newTime || rescheduling}
            className="flex-1 py-3 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300 disabled:opacity-50 text-sm"
          >
            {rescheduling ? t("rescheduling") : t("confirmReschedule")}
          </button>
        </div>
      </div>
    </div>
  );
}
