"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Booking {
  event_date: string;
  total_price: number;
  stripe_payment_status: string;
}

const COLORS = {
  amber: "#E8A935",
  amberLight: "#F0BD55",
  navy: "#2D2926",
  navyLight: "#3A3632",
  cream: "#FAF5EF",
  creamMuted: "rgba(250,245,239,0.4)",
  gridLine: "rgba(250,245,239,0.06)",
};

export default function RevenueChart({
  bookings,
  title,
}: {
  bookings: Booking[];
  title: string;
}) {
  const data = useMemo(() => {
    const paid = bookings.filter((b) => b.stripe_payment_status === "paid");
    const map = new Map<string, number>();
    paid.forEach((b) => {
      const d = new Date(b.event_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + b.total_price / 100);
    });
    const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.map(([month, revenue]) => {
      const [y, m] = month.split("-");
      const label = new Date(+y, +m - 1).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      return { month: label, revenue: Math.round(revenue * 100) / 100 };
    });
  }, [bookings]);

  if (data.length === 0) {
    return (
      <div className="bg-navy-light rounded-2xl border border-cream/5 p-6">
        <h3 className="text-cream text-sm font-medium mb-4">{title}</h3>
        <div className="h-[250px] flex items-center justify-center text-cream/30 text-sm">
          No revenue data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-light rounded-2xl border border-cream/5 p-6">
      <h3 className="text-cream text-sm font-medium mb-4">{title}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
              tickFormatter={(v) => `$${Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: COLORS.navyLight,
                border: `1px solid rgba(250,245,239,0.1)`,
                borderRadius: "12px",
                color: COLORS.cream,
                fontSize: 13,
              }}
              formatter={(value) => [`$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, "Revenue"]}
              cursor={{ fill: "rgba(232,169,53,0.08)" }}
            />
            <Bar
              dataKey="revenue"
              fill={COLORS.amber}
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
