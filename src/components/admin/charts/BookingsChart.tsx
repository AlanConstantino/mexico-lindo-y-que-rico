"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Booking {
  created_at: string;
}

const COLORS = {
  terracotta: "#C45A3C",
  terracottaLight: "#D46E52",
  navyLight: "#3A3632",
  cream: "#FAF5EF",
  creamMuted: "rgba(250,245,239,0.4)",
  gridLine: "rgba(250,245,239,0.06)",
};

export default function BookingsChart({
  bookings,
  title,
}: {
  bookings: Booking[];
  title: string;
}) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      const d = new Date(b.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.map(([month, count]) => {
      const [y, m] = month.split("-");
      const label = new Date(+y, +m - 1).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      return { month: label, bookings: count };
    });
  }, [bookings]);

  if (data.length === 0) {
    return (
      <div className="bg-navy-light rounded-2xl border border-cream/5 p-6">
        <h3 className="text-cream text-sm font-medium mb-4">{title}</h3>
        <div className="h-[250px] flex items-center justify-center text-cream/30 text-sm">
          No booking data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-light rounded-2xl border border-cream/5 p-6">
      <h3 className="text-cream text-sm font-medium mb-4">{title}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: COLORS.creamMuted, fontSize: 11 }}
              axisLine={{ stroke: COLORS.gridLine }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: COLORS.creamMuted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: COLORS.navyLight,
                border: `1px solid rgba(250,245,239,0.1)`,
                borderRadius: "12px",
                color: COLORS.cream,
                fontSize: 13,
              }}
              formatter={(value) => [value, "Bookings"]}
              cursor={{ stroke: COLORS.terracottaLight, strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="bookings"
              stroke={COLORS.terracotta}
              strokeWidth={2.5}
              dot={{ fill: COLORS.terracotta, r: 4, strokeWidth: 0 }}
              activeDot={{ fill: COLORS.terracottaLight, r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
