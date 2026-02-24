"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import AdminNav from "@/components/admin/AdminNav";

interface Booking {
  id: string;
  event_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  guest_count: number;
  service_type: string;
  meats: string[];
  extras: { id: string; quantity: number }[];
  total_price: number;
  stripe_payment_status: string;
  status: string;
  created_at: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("admin_token");
}

function setToken(token: string) {
  sessionStorage.setItem("admin_token", token);
}

function clearToken() {
  sessionStorage.removeItem("admin_token");
}

export default function AdminPage() {
  const t = useTranslations("admin");
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const fetchBookings = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/bookings?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        clearToken();
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, dateFrom, dateTo]);

  useEffect(() => {
    if (authenticated) {
      fetchBookings();
    }
  }, [authenticated, fetchBookings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError(t("login.error"));
        return;
      }
      const data = await res.json();
      setToken(data.token);
      setAuthenticated(true);
      setPassword("");
    } catch {
      setLoginError(t("login.error"));
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    setAuthenticated(false);
    setBookings([]);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const token = getToken();
    if (!token) return;
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch {
      console.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const downloadCSV = () => {
    const headers = [
      "Date",
      "Name",
      "Email",
      "Phone",
      "Guests",
      "Service",
      "Meats",
      "Extras",
      "Total",
      "Payment",
      "Status",
    ];
    const rows = bookings.map((b) => [
      b.event_date,
      b.customer_name,
      b.customer_email,
      b.customer_phone,
      b.guest_count,
      b.service_type,
      (b.meats || []).join("; "),
      (b.extras || []).map((e) => `${e.id}x${e.quantity}`).join("; "),
      `$${(b.total_price / 100).toFixed(2)}`,
      b.stripe_payment_status,
      b.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const totalBookings = bookings.length;
  const upcomingEvents = bookings.filter(
    (b) => new Date(b.event_date) >= new Date() && b.status !== "cancelled"
  ).length;
  const totalRevenue = bookings
    .filter((b) => b.stripe_payment_status === "paid")
    .reduce((sum, b) => sum + b.total_price, 0);

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-teal/20 text-teal-light";
      case "pending":
        return "bg-amber/20 text-amber";
      case "cancelled":
        return "bg-terracotta/20 text-terracotta-light";
      default:
        return "bg-cream/10 text-cream/60";
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-cream/50">{t("loading")}</div>
      </div>
    );
  }

  // Login form
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-heading text-amber text-3xl mb-2">
              {t("login.title")}
            </h1>
            <p className="text-cream/50 text-sm">{t("login.subtitle")}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-cream/70 mb-1.5">
                {t("login.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream placeholder:text-cream/30 focus:outline-none focus:border-amber/50 transition-colors"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-terracotta text-sm">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn || !password}
              className="w-full py-3 bg-amber text-navy font-semibold rounded-lg hover:bg-amber-light transition-colors duration-200 disabled:opacity-50"
            >
              {loggingIn ? t("login.loggingIn") : t("login.submit")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-navy">
      <AdminNav onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-navy-light rounded-xl p-4 border border-cream/5">
            <p className="text-cream/50 text-xs uppercase tracking-wider mb-1">
              {t("stats.totalBookings")}
            </p>
            <p className="text-2xl font-bold text-cream">{totalBookings}</p>
          </div>
          <div className="bg-navy-light rounded-xl p-4 border border-cream/5">
            <p className="text-cream/50 text-xs uppercase tracking-wider mb-1">
              {t("stats.upcoming")}
            </p>
            <p className="text-2xl font-bold text-amber">{upcomingEvents}</p>
          </div>
          <div className="bg-navy-light rounded-xl p-4 border border-cream/5">
            <p className="text-cream/50 text-xs uppercase tracking-wider mb-1">
              {t("stats.revenue")}
            </p>
            <p className="text-2xl font-bold text-teal-light">
              ${(totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-navy-light border border-cream/10 rounded-lg text-sm text-cream focus:outline-none focus:border-amber/50"
          >
            <option value="all">{t("filters.all")}</option>
            <option value="pending">{t("filters.pending")}</option>
            <option value="confirmed">{t("filters.confirmed")}</option>
            <option value="cancelled">{t("filters.cancelled")}</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-navy-light border border-cream/10 rounded-lg text-sm text-cream focus:outline-none focus:border-amber/50"
            placeholder={t("filters.from")}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-navy-light border border-cream/10 rounded-lg text-sm text-cream focus:outline-none focus:border-amber/50"
            placeholder={t("filters.to")}
          />
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-amber/10 text-amber text-sm rounded-lg hover:bg-amber/20 transition-colors"
          >
            {t("filters.apply")}
          </button>
          <button
            onClick={downloadCSV}
            className="ml-auto px-4 py-2 bg-cream/5 text-cream/60 text-sm rounded-lg hover:bg-cream/10 hover:text-cream transition-colors"
          >
            {t("filters.csv")}
          </button>
        </div>

        {/* Bookings table */}
        {loading ? (
          <div className="text-center py-12 text-cream/50">{t("loading")}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-cream/40">
            {t("dashboard.noBookings")}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Desktop header */}
            <div className="hidden lg:grid lg:grid-cols-[120px_1fr_1fr_80px_100px_100px_100px_120px] gap-3 px-4 py-2 text-xs text-cream/40 uppercase tracking-wider">
              <span>{t("table.date")}</span>
              <span>{t("table.customer")}</span>
              <span>{t("table.contact")}</span>
              <span>{t("table.guests")}</span>
              <span>{t("table.service")}</span>
              <span>{t("table.total")}</span>
              <span>{t("table.payment")}</span>
              <span>{t("table.status")}</span>
            </div>

            {bookings.map((booking) => (
              <div key={booking.id}>
                {/* Row */}
                <div
                  onClick={() =>
                    setExpandedId(
                      expandedId === booking.id ? null : booking.id
                    )
                  }
                  className="bg-navy-light rounded-xl border border-cream/5 hover:border-cream/10 transition-colors cursor-pointer"
                >
                  {/* Desktop row */}
                  <div className="hidden lg:grid lg:grid-cols-[120px_1fr_1fr_80px_100px_100px_100px_120px] gap-3 px-4 py-3 items-center">
                    <span className="text-sm text-cream">
                      {new Date(booking.event_date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-cream truncate">
                      {booking.customer_name}
                    </span>
                    <span className="text-sm text-cream/60 truncate">
                      {booking.customer_email}
                    </span>
                    <span className="text-sm text-cream/80">
                      {booking.guest_count}
                    </span>
                    <span className="text-sm text-cream/80">
                      {booking.service_type}
                    </span>
                    <span className="text-sm text-cream font-medium">
                      ${(booking.total_price / 100).toFixed(2)}
                    </span>
                    <span className="text-xs">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full ${
                          booking.stripe_payment_status === "paid"
                            ? "bg-teal/20 text-teal-light"
                            : "bg-cream/10 text-cream/50"
                        }`}
                      >
                        {booking.stripe_payment_status}
                      </span>
                    </span>
                    <span className="text-xs">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full ${statusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </span>
                  </div>

                  {/* Mobile row */}
                  <div className="lg:hidden px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-cream">
                        {booking.customer_name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-cream/60">
                      <span>
                        {new Date(booking.event_date).toLocaleDateString()} · {booking.guest_count} {t("table.guests").toLowerCase()}
                      </span>
                      <span className="font-medium text-cream">
                        ${(booking.total_price / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === booking.id && (
                  <div className="bg-navy-light/50 rounded-b-xl border border-t-0 border-cream/5 px-4 py-4 -mt-1 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-cream/40 text-xs uppercase">
                          {t("table.customer")}
                        </span>
                        <p className="text-cream">{booking.customer_name}</p>
                      </div>
                      <div>
                        <span className="text-cream/40 text-xs uppercase">
                          {t("table.contact")}
                        </span>
                        <p className="text-cream">{booking.customer_email}</p>
                        <p className="text-cream/70">{booking.customer_phone}</p>
                      </div>
                      <div>
                        <span className="text-cream/40 text-xs uppercase">
                          {t("table.meats")}
                        </span>
                        <p className="text-cream">
                          {(booking.meats || []).join(", ")}
                        </p>
                      </div>
                      <div>
                        <span className="text-cream/40 text-xs uppercase">
                          {t("table.extras")}
                        </span>
                        <p className="text-cream">
                          {(booking.extras || []).length > 0
                            ? booking.extras
                                .map((e) => `${e.id} x${e.quantity}`)
                                .join(", ")
                            : t("dashboard.noExtras")}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-cream/5">
                      {booking.status !== "confirmed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(booking.id, "confirmed");
                          }}
                          disabled={updatingId === booking.id}
                          className="px-3 py-1.5 bg-teal/20 text-teal-light text-xs rounded-lg hover:bg-teal/30 transition-colors disabled:opacity-50"
                        >
                          {t("actions.confirm")}
                        </button>
                      )}
                      {booking.status !== "cancelled" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(booking.id, "cancelled");
                          }}
                          disabled={updatingId === booking.id}
                          className="px-3 py-1.5 bg-terracotta/20 text-terracotta-light text-xs rounded-lg hover:bg-terracotta/30 transition-colors disabled:opacity-50"
                        >
                          {t("actions.cancel")}
                        </button>
                      )}
                      {booking.status !== "pending" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(booking.id, "pending");
                          }}
                          disabled={updatingId === booking.id}
                          className="px-3 py-1.5 bg-amber/20 text-amber text-xs rounded-lg hover:bg-amber/30 transition-colors disabled:opacity-50"
                        >
                          {t("actions.pending")}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
