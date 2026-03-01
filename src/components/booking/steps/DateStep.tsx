"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { BookingData } from "../BookingForm";

interface DateStepProps {
  data: BookingData;
  updateData: (updates: Partial<BookingData>) => void;
}

interface AvailabilityData {
  maxEventsPerDay: number;
  minNoticeDays: number;
  bookedDates: Record<string, number>;
}

export default function DateStep({ data, updateData }: DateStepProps) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [availability, setAvailability] = useState<AvailabilityData>({
    maxEventsPerDay: 3,
    minNoticeDays: 3,
    bookedDates: {},
  });
  const [loading, setLoading] = useState(false);

  const fetchAvailability = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
      const res = await fetch(`/api/availability?month=${monthStr}`);
      if (res.ok) {
        const result = await res.json();
        setAvailability(result);
      }
    } catch {
      // Keep defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability(viewYear, viewMonth);
  }, [viewYear, viewMonth, fetchAvailability]);

  const monthName = new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(viewYear, viewMonth)
  );

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const dayNames = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
      new Date(2024, 0, i) // Jan 2024 starts on Monday, but we need Sun=0
      // Actually Jan 7 2024 is Sunday
    )
  );
  // Use a known Sunday as start: Jan 7, 2024
  const dayHeaders = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
      new Date(2024, 0, 7 + i)
    )
  );

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);

    // Past dates
    if (date < today) return true;

    // Too soon (min notice days)
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + availability.minNoticeDays);
    if (date < minDate) return true;

    // Fully booked
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const bookingCount = availability.bookedDates[dateStr] || 0;
    if (bookingCount >= availability.maxEventsPerDay) return true;

    return false;
  };

  const isDateFullyBooked = (day: number): boolean => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const bookingCount = availability.bookedDates[dateStr] || 0;
    return bookingCount >= availability.maxEventsPerDay;
  };

  const handleSelectDate = (day: number) => {
    if (isDateDisabled(day)) return;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    updateData({ eventDate: dateStr });
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Don't allow navigating to past months
  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  // Generate time slots from 8:00 AM to 8:00 PM in 30-min intervals
  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const min = i % 2 === 0 ? "00" : "30";
    const value = `${String(hour).padStart(2, "0")}:${min}`;
    const hour12 = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    const label = `${hour12}:${min} ${ampm}`;
    return { value, label };
  });

  const selectedDateFormatted = data.eventDate
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
        new Date(data.eventDate + "T12:00:00")
      )
    : null;

  const selectedTimeFormatted = data.eventTime
    ? timeSlots.find((s) => s.value === data.eventTime)?.label ?? data.eventTime
    : null;

  // Build day cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <h2 className="font-heading text-3xl text-cream mb-2">
        {t("selectDate")}
      </h2>
      <p className="text-cream/40 text-sm mb-8">{t("selectDateDesc")}</p>

      {/* Calendar */}
      <div className="rounded-2xl bg-navy-light/30 border border-cream/5 p-4 sm:p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            className="w-10 h-10 rounded-full flex items-center justify-center text-cream/40 hover:text-cream hover:bg-cream/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label={t("prevMonth")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h3 className="font-heading text-xl text-cream capitalize">
            {monthName} {viewYear}
          </h3>
          <button
            onClick={goToNextMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center text-cream/40 hover:text-cream hover:bg-cream/5 transition-all"
            aria-label={t("nextMonth")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {dayHeaders.map((day) => (
            <div
              key={day}
              className="text-center text-cream/30 text-xs font-medium py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-navy/50 flex items-center justify-center z-10 rounded-lg">
              <div className="w-6 h-6 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
            </div>
          )}
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = data.eventDate === dateStr;
            const disabled = isDateDisabled(day);
            const fullyBooked = isDateFullyBooked(day);

            return (
              <button
                key={day}
                onClick={() => handleSelectDate(day)}
                disabled={disabled}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all duration-200 relative ${
                  isSelected
                    ? "bg-amber text-navy font-bold shadow-lg shadow-amber/20"
                    : disabled
                      ? "text-cream/15 cursor-not-allowed"
                      : "text-cream/70 hover:bg-cream/5 hover:text-cream"
                }`}
              >
                {day}
                {fullyBooked && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-terracotta/60" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Picker — only show after date is selected */}
      {data.eventDate && (
        <div className="mt-6">
          <h3 className="font-heading text-xl text-cream mb-1">
            {t("selectTime")}
          </h3>
          <p className="text-cream/40 text-sm mb-4">{t("selectTimeDesc")}</p>
          <div className="relative">
            <select
              value={data.eventTime ?? ""}
              onChange={(e) =>
                updateData({ eventTime: e.target.value || null })
              }
              className="w-full appearance-none rounded-xl bg-navy-light/30 border border-cream/10 text-cream px-4 py-3 pr-10 text-sm focus:outline-none focus:border-amber/40 transition-colors cursor-pointer"
            >
              <option value="" className="bg-navy text-cream/50">
                {t("selectTime")}
              </option>
              {timeSlots.map((slot) => (
                <option
                  key={slot.value}
                  value={slot.value}
                  className="bg-navy text-cream"
                >
                  {slot.label}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          {data.eventTime && (() => {
            const [h, m] = data.eventTime.split(":").map(Number);
            const arrivalHour = h - 1;
            const arrivalH12 = arrivalHour % 12 || 12;
            const arrivalAmpm = arrivalHour >= 12 ? "PM" : "AM";
            const arrivalTime = `${arrivalH12}:${String(m).padStart(2, "0")} ${arrivalAmpm}`;
            return (
              <p className="text-cream/40 text-xs italic mt-3">
                ⏰ {t("setupArrivalNote", { arrivalTime })}
              </p>
            );
          })()}
        </div>
      )}

      {/* Selected date & time display */}
      {selectedDateFormatted && (
        <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber/5 border border-amber/20">
          <svg
            className="w-5 h-5 text-amber flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          <span className="text-amber text-sm font-medium">
            {selectedDateFormatted}
            {selectedTimeFormatted && ` · ${selectedTimeFormatted}`}
          </span>
        </div>
      )}
    </div>
  );
}
