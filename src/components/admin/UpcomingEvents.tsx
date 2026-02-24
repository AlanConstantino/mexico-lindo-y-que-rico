"use client";

import { useMemo } from "react";

interface Booking {
  id: string;
  event_date: string;
  customer_name: string;
  guest_count: number;
  service_type: string;
  status: string;
}

export default function UpcomingEvents({
  bookings,
  title,
  noEventsText,
  guestsLabel,
}: {
  bookings: Booking[];
  title: string;
  noEventsText: string;
  guestsLabel: string;
}) {
  const upcoming = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return bookings
      .filter((b) => new Date(b.event_date) >= now && b.status !== "cancelled")
      .sort(
        (a, b) =>
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      )
      .slice(0, 7);
  }, [bookings]);

  const statusDot = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-teal";
      case "pending":
        return "bg-amber";
      default:
        return "bg-cream/30";
    }
  };

  return (
    <div className="bg-navy-light rounded-2xl border border-cream/5 p-6">
      <h3 className="text-cream text-sm font-medium mb-4">{title}</h3>
      {upcoming.length === 0 ? (
        <div className="py-8 text-center text-cream/30 text-sm">
          {noEventsText}
        </div>
      ) : (
        <div className="space-y-1">
          {upcoming.map((event, i) => {
            const eventDate = new Date(event.event_date);
            const dayName = eventDate.toLocaleDateString("en-US", { weekday: "short" });
            const monthDay = eventDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            return (
              <div
                key={event.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-cream/[0.03] ${
                  i === 0 ? "bg-amber/[0.04]" : ""
                }`}
              >
                {/* Date badge */}
                <div className="flex-shrink-0 w-14 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-cream/40">
                    {dayName}
                  </div>
                  <div className={`text-sm font-semibold ${i === 0 ? "text-amber" : "text-cream"}`}>
                    {monthDay}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-cream/10" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-cream truncate">
                    {event.customer_name}
                  </div>
                  <div className="text-xs text-cream/40">
                    {event.guest_count} {guestsLabel} · {event.service_type}
                  </div>
                </div>

                {/* Status dot */}
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(event.status)}`}
                  title={event.status}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
