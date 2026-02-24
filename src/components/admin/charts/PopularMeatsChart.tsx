"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Booking {
  meats: string[];
}

const BAR_COLORS = [
  "#E8A935",
  "#C45A3C",
  "#7A8B6F",
  "#F0BD55",
  "#D46E52",
  "#8FA382",
  "#C8912A",
  "#A64B30",
];

const COLORS = {
  navyLight: "#3A3632",
  cream: "#FAF5EF",
  creamMuted: "rgba(250,245,239,0.4)",
  gridLine: "rgba(250,245,239,0.06)",
};

export default function PopularMeatsChart({
  bookings,
  title,
}: {
  bookings: Booking[];
  title: string;
}) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      (b.meats || []).forEach((m) => {
        const name = m.charAt(0).toUpperCase() + m.slice(1);
        map.set(name, (map.get(name) || 0) + 1);
      });
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [bookings]);

  if (data.length === 0) {
    return (
      <div className="bg-navy-light rounded-2xl border border-cream/5 p-6">
        <h3 className="text-cream text-sm font-medium mb-4">{title}</h3>
        <div className="h-[250px] flex items-center justify-center text-cream/30 text-sm">
          No meat selection data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-light rounded-2xl border border-cream/5 p-6">
      <h3 className="text-cream text-sm font-medium mb-4">{title}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              tick={{ fill: COLORS.creamMuted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: COLORS.cream, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: COLORS.navyLight,
                border: `1px solid rgba(250,245,239,0.1)`,
                borderRadius: "12px",
                color: COLORS.cream,
                fontSize: 13,
              }}
              formatter={(value) => [value, "Selected"]}
              cursor={{ fill: "rgba(250,245,239,0.03)" }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
