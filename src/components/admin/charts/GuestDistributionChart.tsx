"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Booking {
  service_type: string;
}

const PIE_COLORS = ["#E8A935", "#C45A3C", "#7A8B6F", "#F0BD55"];

const COLORS = {
  navyLight: "#3A3632",
  cream: "#FAF5EF",
};

export default function GuestDistributionChart({
  bookings,
  title,
}: {
  bookings: Booking[];
  title: string;
}) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      const label = b.service_type || "Unknown";
      map.set(label, (map.get(label) || 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [bookings]);

  if (data.length === 0) {
    return (
      <div className="bg-navy-light rounded-2xl border border-cream/5 p-6">
        <h3 className="text-cream text-sm font-medium mb-4">{title}</h3>
        <div className="h-[250px] flex items-center justify-center text-cream/30 text-sm">
          No distribution data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-light rounded-2xl border border-cream/5 p-6">
      <h3 className="text-cream text-sm font-medium mb-4">{title}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: COLORS.navyLight,
                border: `1px solid rgba(250,245,239,0.1)`,
                borderRadius: "12px",
                color: COLORS.cream,
                fontSize: 13,
              }}
              formatter={(value, name) => [
                `${value} booking${value !== 1 ? "s" : ""}`,
                name,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span style={{ color: COLORS.cream, fontSize: 12 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
