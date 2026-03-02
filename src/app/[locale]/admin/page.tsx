"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import AdminNav from "@/components/admin/AdminNav";
import RevenueChart from "@/components/admin/charts/RevenueChart";
import BookingsChart from "@/components/admin/charts/BookingsChart";
import PopularMeatsChart from "@/components/admin/charts/PopularMeatsChart";
import GuestDistributionChart from "@/components/admin/charts/GuestDistributionChart";
import UpcomingEvents from "@/components/admin/UpcomingEvents";

function formatTime12(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

interface Booking {
  id: string;
  event_date: string;
  event_time: string | null;
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

/* ─── Inline SVG Icons ─── */
function IconRevenue() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconBookings() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconUpcoming() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconAvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
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
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialogBookingId, setConfirmDialogBookingId] = useState<string | null>(null);
  const [cancelDialogBookingId, setCancelDialogBookingId] = useState<string | null>(null);
  const [deleteDialogBookingId, setDeleteDialogBookingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const deleteBooking = async (id: string) => {
    const token = getToken();
    if (!token) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        setExpandedId(null);
      }
    } catch {
      console.error("Failed to delete booking");
    } finally {
      setDeletingId(null);
    }
  };

  const downloadCSV = () => {
    const headers = [
      "Date", "Name", "Email", "Phone", "Guests", "Service",
      "Meats", "Extras", "Total", "Payment", "Status",
    ];
    const rows = bookings.map((b) => [
      b.event_date, b.customer_name, b.customer_email, b.customer_phone,
      b.guest_count, b.service_type,
      (b.meats || []).join("; "),
      (b.extras || []).map((e) => `${e.id}x${e.quantity}`).join("; "),
      `$${(b.total_price / 100).toFixed(2)}`,
      b.stripe_payment_status, b.status,
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
    (b) => new Date(b.event_date + "T12:00:00") >= new Date() && b.status !== "cancelled"
  ).length;
  const totalRevenue = bookings
    .filter((b) => b.stripe_payment_status === "paid")
    .reduce((sum, b) => sum + b.total_price, 0);
  const avgBookingValue =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Filtered bookings for table (by search query)
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase();
    return bookings.filter(
      (b) =>
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_email.toLowerCase().includes(q)
    );
  }, [bookings, searchQuery]);

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-teal/20 text-teal-light border border-teal/20";
      case "pending":
        return "bg-amber/15 text-amber border border-amber/20";
      case "cancelled":
        return "bg-terracotta/15 text-terracotta-light border border-terracotta/20";
      default:
        return "bg-cream/10 text-cream/60 border border-cream/10";
    }
  };

  const paymentColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-teal/15 text-teal-light border border-teal/20";
      default:
        return "bg-cream/8 text-cream/50 border border-cream/10";
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="relative overflow-hidden bg-navy-light rounded-2xl p-5 border border-cream/5">
            <div className="absolute inset-0 bg-gradient-to-br from-amber/[0.07] to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-cream/50 text-xs uppercase tracking-wider font-medium">
                  {t("stats.revenue")}
                </span>
                <span className="text-amber/60"><IconRevenue /></span>
              </div>
              <p className="text-2xl font-bold text-cream mb-1">
                ${(totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-teal-light flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M6 3L3 6M6 3L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t("stats.changeRevenue")}
              </p>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="relative overflow-hidden bg-navy-light rounded-2xl p-5 border border-cream/5">
            <div className="absolute inset-0 bg-gradient-to-br from-terracotta/[0.07] to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-cream/50 text-xs uppercase tracking-wider font-medium">
                  {t("stats.totalBookings")}
                </span>
                <span className="text-terracotta/60"><IconBookings /></span>
              </div>
              <p className="text-2xl font-bold text-cream mb-1">{totalBookings}</p>
              <p className="text-xs text-teal-light flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M6 3L3 6M6 3L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t("stats.changeBookings")}
              </p>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="relative overflow-hidden bg-navy-light rounded-2xl p-5 border border-cream/5">
            <div className="absolute inset-0 bg-gradient-to-br from-teal/[0.07] to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-cream/50 text-xs uppercase tracking-wider font-medium">
                  {t("stats.upcoming")}
                </span>
                <span className="text-teal/60"><IconUpcoming /></span>
              </div>
              <p className="text-2xl font-bold text-amber mb-1">{upcomingEvents}</p>
              <p className="text-xs text-teal-light flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M6 3L3 6M6 3L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t("stats.changeUpcoming")}
              </p>
            </div>
          </div>

          {/* Average Booking Value */}
          <div className="relative overflow-hidden bg-navy-light rounded-2xl p-5 border border-cream/5">
            <div className="absolute inset-0 bg-gradient-to-br from-cream/[0.04] to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-cream/50 text-xs uppercase tracking-wider font-medium">
                  {t("stats.avgBooking")}
                </span>
                <span className="text-cream/40"><IconAvg /></span>
              </div>
              <p className="text-2xl font-bold text-cream mb-1">
                ${(avgBookingValue / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-teal-light flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M6 3L3 6M6 3L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t("stats.changeAvg")}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Charts Row 1 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueChart bookings={bookings} title={t("charts.revenue")} />
          <BookingsChart bookings={bookings} title={t("charts.bookings")} />
        </div>

        {/* ─── Charts Row 2 + Upcoming Events ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PopularMeatsChart bookings={bookings} title={t("charts.popularMeats")} />
          <GuestDistributionChart bookings={bookings} title={t("charts.guestDistribution")} />
          <UpcomingEvents
            bookings={bookings}
            title={t("dashboard.upcomingEvents")}
            noEventsText={t("dashboard.noUpcoming")}
            guestsLabel={t("table.guests").toLowerCase()}
          />
        </div>

        {/* ─── Bookings Table Section ─── */}
        <div className="bg-navy-light rounded-2xl border border-cream/5 overflow-hidden">
          {/* Table header with search & filters */}
          <div className="px-5 py-4 border-b border-cream/5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="text-cream text-sm font-medium">
                {t("dashboard.bookingsTable")}
              </h3>
              <div className="flex flex-col gap-3 sm:ml-auto w-full sm:w-auto px-2 sm:px-0">
                {/* Row 1: Search + Status */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-cream/40 text-xs uppercase tracking-wider mb-1.5">Search Customer</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 flex items-center justify-center w-5 h-5">
                        <IconSearch />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("dashboard.searchPlaceholder")}
                        className="w-full pl-10 pr-3 py-2.5 bg-navy border border-cream/10 rounded-lg text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-amber/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="shrink-0">
                    <label className="block text-cream/40 text-xs uppercase tracking-wider mb-1.5">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2.5 bg-navy border border-cream/10 rounded-lg text-sm text-cream focus:outline-none focus:border-amber/50"
                    >
                      <option value="all">{t("filters.all")}</option>
                      <option value="pending">{t("filters.pending")}</option>
                      <option value="confirmed">{t("filters.confirmed")}</option>
                      <option value="cancelled">{t("filters.cancelled")}</option>
                    </select>
                  </div>
                </div>
                {/* Row 2: Date range (from — to) */}
                <div>
                  <label className="block text-cream/40 text-xs uppercase tracking-wider mb-1.5">Date Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2.5 bg-navy border border-cream/10 rounded-lg text-sm text-cream focus:outline-none focus:border-amber/50"
                    />
                    <span className="text-cream/30 text-xs shrink-0">—</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2.5 bg-navy border border-cream/10 rounded-lg text-sm text-cream focus:outline-none focus:border-amber/50"
                    />
                  </div>
                </div>
                {/* Row 3: Apply button */}
                <button
                  onClick={fetchBookings}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber/10 text-amber text-sm rounded-lg hover:bg-amber/20 transition-colors"
                >
                  {t("filters.apply")}
                </button>
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 bg-cream/5 text-cream/60 text-sm rounded-lg hover:bg-cream/10 hover:text-cream transition-colors"
                >
                  {t("filters.csv")}
                </button>
              </div>
            </div>
          </div>

          {/* Table content */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-12 text-cream/50">{t("loading")}</div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-cream/40">
                {t("dashboard.noBookings")}
              </div>
            ) : (
              <div className="space-y-1.5">
                {/* Desktop header */}
                <div className="hidden lg:grid lg:grid-cols-[110px_1fr_1fr_70px_90px_95px_90px_110px] gap-3 px-4 py-2 text-[11px] text-cream/40 uppercase tracking-wider">
                  <span>{t("table.date")}</span>
                  <span>{t("table.customer")}</span>
                  <span>{t("table.contact")}</span>
                  <span>{t("table.guests")}</span>
                  <span>{t("table.service")}</span>
                  <span>{t("table.total")}</span>
                  <span>{t("table.payment")}</span>
                  <span>{t("table.status")}</span>
                </div>

                {filteredBookings.map((booking) => (
                  <div key={booking.id}>
                    {/* Row */}
                    <div
                      onClick={() =>
                        setExpandedId(
                          expandedId === booking.id ? null : booking.id
                        )
                      }
                      className="rounded-xl border border-transparent hover:border-cream/8 hover:bg-cream/[0.02] transition-all duration-200 cursor-pointer group"
                    >
                      {/* Desktop row */}
                      <div className="hidden lg:grid lg:grid-cols-[110px_1fr_1fr_70px_90px_95px_90px_110px] gap-3 px-4 py-3 items-center">
                        <span className="text-sm text-cream/80">
                          {new Date(booking.event_date + "T12:00:00").toLocaleDateString()}
                          {booking.event_time && ` · ${formatTime12(booking.event_time)}`}
                        </span>
                        <span className="text-sm text-cream font-medium truncate">
                          {booking.customer_name}
                        </span>
                        <span className="text-sm text-cream/50 truncate">
                          {booking.customer_email}
                        </span>
                        <span className="text-sm text-cream/70">
                          {booking.guest_count}
                        </span>
                        <span className="text-sm text-cream/70">
                          {booking.service_type}
                        </span>
                        <span className="text-sm text-cream font-medium">
                          ${(booking.total_price / 100).toFixed(2)}
                        </span>
                        <span>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${paymentColor(
                              booking.stripe_payment_status
                            )}`}
                          >
                            {booking.stripe_payment_status}
                          </span>
                        </span>
                        <span>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusColor(
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
                            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${statusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-cream/50">
                          <span>
                            {new Date(booking.event_date + "T12:00:00").toLocaleDateString()}{booking.event_time ? ` · ${formatTime12(booking.event_time)}` : ""} · {booking.guest_count} {t("table.guests").toLowerCase()}
                          </span>
                          <span className="font-medium text-cream">
                            ${(booking.total_price / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded details card */}
                    {expandedId === booking.id && (
                      <div className="mx-2 mb-2 bg-navy rounded-xl border border-cream/8 p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <span className="text-cream/40 text-[11px] uppercase tracking-wider font-medium block mb-1">
                              {t("table.customer")}
                            </span>
                            <p className="text-cream text-sm font-medium">{booking.customer_name}</p>
                          </div>
                          <div>
                            <span className="text-cream/40 text-[11px] uppercase tracking-wider font-medium block mb-1">
                              {t("table.contact")}
                            </span>
                            <p className="text-cream text-sm">{booking.customer_email}</p>
                            <p className="text-cream/60 text-sm">{booking.customer_phone}</p>
                          </div>
                          <div>
                            <span className="text-cream/40 text-[11px] uppercase tracking-wider font-medium block mb-1">
                              {t("table.meats")}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {(booking.meats || []).map((meat) => (
                                <span
                                  key={meat}
                                  className="inline-block px-2 py-0.5 text-[11px] bg-amber/10 text-amber rounded-full"
                                >
                                  {meat}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-cream/40 text-[11px] uppercase tracking-wider font-medium block mb-1">
                              {t("table.extras")}
                            </span>
                            {(booking.extras || []).length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {booking.extras.map((e) => (
                                  <span
                                    key={e.id}
                                    className="inline-block px-2 py-0.5 text-[11px] bg-cream/8 text-cream/70 rounded-full"
                                  >
                                    {e.id} x{e.quantity}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-cream/40 text-sm">{t("dashboard.noExtras")}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-cream/8">
                          {booking.status !== "confirmed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDialogBookingId(booking.id);
                              }}
                              disabled={updatingId === booking.id}
                              className="px-4 py-1.5 bg-teal/15 text-teal-light text-xs font-medium rounded-lg hover:bg-teal/25 border border-teal/20 transition-colors disabled:opacity-50"
                            >
                              {t("actions.confirm")}
                            </button>
                          )}
                          {booking.status !== "cancelled" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCancelDialogBookingId(booking.id);
                              }}
                              disabled={updatingId === booking.id}
                              className="px-4 py-1.5 bg-terracotta/15 text-terracotta-light text-xs font-medium rounded-lg hover:bg-terracotta/25 border border-terracotta/20 transition-colors disabled:opacity-50"
                            >
                              {t("actions.cancel")}
                            </button>
                          )}
                          {booking.status === "cancelled" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialogBookingId(booking.id);
                              }}
                              disabled={deletingId === booking.id}
                              className="px-4 py-1.5 bg-red-500/15 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/25 border border-red-500/20 transition-colors disabled:opacity-50"
                            >
                              {t("actions.delete")}
                            </button>
                          )}
                          {booking.status !== "pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(booking.id, "pending");
                              }}
                              disabled={updatingId === booking.id}
                              className="px-4 py-1.5 bg-amber/15 text-amber text-xs font-medium rounded-lg hover:bg-amber/25 border border-amber/20 transition-colors disabled:opacity-50"
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
      </div>

      {/* Confirm Booking Dialog */}
      {confirmDialogBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDialogBookingId(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-charcoal border border-cream/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-cream text-lg font-bold mb-3">{t("actions.confirmDialogTitle")}</h3>
            <p className="text-cream/60 text-sm mb-6 leading-relaxed">{t("actions.confirmDialogMessage")}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialogBookingId(null)}
                className="px-4 py-2 text-cream/50 text-sm font-medium rounded-lg hover:bg-cream/5 transition-colors"
              >
                {t("actions.confirmDialogCancel")}
              </button>
              <button
                onClick={() => {
                  updateStatus(confirmDialogBookingId, "confirmed");
                  setConfirmDialogBookingId(null);
                }}
                disabled={updatingId === confirmDialogBookingId}
                className="px-4 py-2 bg-teal/20 text-teal-light text-sm font-medium rounded-lg hover:bg-teal/30 border border-teal/30 transition-colors disabled:opacity-50"
              >
                {t("actions.confirmDialogYes")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Dialog */}
      {cancelDialogBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setCancelDialogBookingId(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-charcoal border border-cream/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-cream text-lg font-bold mb-3">{t("actions.cancelDialogTitle")}</h3>
            <p className="text-cream/60 text-sm mb-6 leading-relaxed">{t("actions.cancelDialogMessage")}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelDialogBookingId(null)}
                className="px-4 py-2 text-cream/50 text-sm font-medium rounded-lg hover:bg-cream/5 transition-colors"
              >
                {t("actions.confirmDialogCancel")}
              </button>
              <button
                onClick={() => {
                  updateStatus(cancelDialogBookingId, "cancelled");
                  setCancelDialogBookingId(null);
                }}
                disabled={updatingId === cancelDialogBookingId}
                className="px-4 py-2 bg-terracotta/20 text-terracotta-light text-sm font-medium rounded-lg hover:bg-terracotta/30 border border-terracotta/30 transition-colors disabled:opacity-50"
              >
                {t("actions.cancelDialogYes")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Booking Dialog */}
      {deleteDialogBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteDialogBookingId(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-charcoal border border-cream/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-red-400 text-lg font-bold mb-3">{t("actions.deleteDialogTitle")}</h3>
            <p className="text-cream/60 text-sm mb-6 leading-relaxed">{t("actions.deleteDialogMessage")}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteDialogBookingId(null)}
                className="px-4 py-2 text-cream/50 text-sm font-medium rounded-lg hover:bg-cream/5 transition-colors"
              >
                {t("actions.confirmDialogCancel")}
              </button>
              <button
                onClick={() => {
                  deleteBooking(deleteDialogBookingId);
                  setDeleteDialogBookingId(null);
                }}
                disabled={deletingId === deleteDialogBookingId}
                className="px-4 py-2 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-colors disabled:opacity-50"
              >
                {t("actions.deleteDialogYes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
