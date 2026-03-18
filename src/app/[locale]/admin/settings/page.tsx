"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import AdminNav from "@/components/admin/AdminNav";

interface Settings {
  max_events_per_day: number;
  min_notice_days: number;
  reminder_days: number;
  notification_email: string;
  notification_phone: string;
  cc_surcharge_percent: number;
  stripe_fee_percent: number;
  stripe_fee_flat: number;
  cancellation_fee_type: "flat" | "percentage";
  cancellation_fee_flat: number;
  cancellation_fee_percent: number;
  free_cancellation_days: number;
  noshow_fee_type: "flat" | "percentage";
  noshow_fee_flat: number;
  noshow_fee_percent: number;
  zelle_handle: string;
  zelle_enabled: boolean;
  venmo_handle: string;
  venmo_enabled: boolean;
  cashapp_handle: string;
  cashapp_enabled: boolean;
  paypal_email: string;
  paypal_enabled: boolean;
  cash_auto_cancel_hours: number;
  cash_deposit_percent: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("admin_token");
}

function clearToken() {
  sessionStorage.removeItem("admin_token");
}

export default function AdminSettingsPage() {
  const t = useTranslations("admin");
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState<Settings>({
    max_events_per_day: 3,
    min_notice_days: 3,
    reminder_days: 5,
    notification_email: "",
    notification_phone: "",
    cc_surcharge_percent: 10,
    stripe_fee_percent: 2.9,
    stripe_fee_flat: 30,
    cancellation_fee_type: "flat",
    cancellation_fee_flat: 50,
    cancellation_fee_percent: 25,
    free_cancellation_days: 7,
    noshow_fee_type: "flat",
    noshow_fee_flat: 100,
    noshow_fee_percent: 50,
    zelle_handle: "(562) 746-3998",
    zelle_enabled: true,
    venmo_handle: "",
    venmo_enabled: true,
    cashapp_handle: "",
    cashapp_enabled: true,
    paypal_email: "",
    paypal_enabled: true,
    cash_auto_cancel_hours: 48,
    cash_deposit_percent: 10,
  });

  useEffect(() => {
    const token = getToken();
    if (token) {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const fetchSettings = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        clearToken();
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch {
      setError(t("settings.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (authenticated) {
      fetchSettings();
    }
  }, [authenticated, fetchSettings]);

  const handleLogout = () => {
    clearToken();
    setAuthenticated(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || t("settings.saveError"));
      }
    } catch {
      setError(t("settings.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-cream/50">{t("loading")}</div>
      </div>
    );
  }

  if (!authenticated) {
    // Redirect to admin login
    if (typeof window !== "undefined") {
      window.location.href = window.location.pathname.replace("/settings", "");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-navy">
      <AdminNav onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-heading text-amber text-2xl mb-6">
          {t("settings.title")}
        </h1>

        {loading ? (
          <div className="text-center py-12 text-cream/50">{t("loading")}</div>
        ) : (
          <>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm text-cream/70 mb-1.5">
                {t("settings.maxEvents")}
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.max_events_per_day}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    max_events_per_day: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors"
              />
              <p className="text-xs text-cream/40 mt-1">
                {t("settings.maxEventsHint")}
              </p>
            </div>

            <div>
              <label className="block text-sm text-cream/70 mb-1.5">
                {t("settings.minNotice")}
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={settings.min_notice_days}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    min_notice_days: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors"
              />
              <p className="text-xs text-cream/40 mt-1">
                {t("settings.minNoticeHint")}
              </p>
            </div>

            <div>
              <label className="block text-sm text-cream/70 mb-1.5">
                {t("settings.reminderDays")}
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={settings.reminder_days}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reminder_days: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors"
              />
              <p className="text-xs text-cream/40 mt-1">
                {t("settings.reminderDaysHint")}
              </p>
            </div>

            <div>
              <label className="block text-sm text-cream/70 mb-1.5">
                {t("settings.email")}
              </label>
              <input
                type="email"
                value={settings.notification_email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notification_email: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream placeholder:text-cream/30 focus:outline-none focus:border-amber/50 transition-colors"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-cream/70 mb-1.5">
                {t("settings.phone")}
              </label>
              <input
                type="tel"
                value={settings.notification_phone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notification_phone: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream placeholder:text-cream/30 focus:outline-none focus:border-amber/50 transition-colors"
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Payment Fee Settings */}
            <div className="border-t border-cream/10 pt-5 mt-2">
              <h3 className="text-cream/60 text-xs uppercase tracking-wider mb-4">
                {t("settings.paymentFeesTitle")}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cream/70 mb-1.5">{t("settings.ccSurchargeLabel")}</label>
                  <input type="number" min={0} max={100} value={settings.cc_surcharge_percent}
                    onChange={(e) => setSettings({ ...settings, cc_surcharge_percent: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors" />
                  <p className="text-xs text-cream/40 mt-1">{t("settings.ccSurchargeHint")}</p>
                </div>
                <div>
                  <label className="block text-sm text-cream/70 mb-1.5">{t("settings.stripeFeePercentLabel")}</label>
                  <input type="number" min={0} max={20} step={0.1} value={settings.stripe_fee_percent}
                    onChange={(e) => setSettings({ ...settings, stripe_fee_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-cream/70 mb-1.5">{t("settings.stripeFeeFlatLabel")}</label>
                  <input type="number" min={0} max={100} value={settings.stripe_fee_flat}
                    onChange={(e) => setSettings({ ...settings, stripe_fee_flat: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors" />
                  <p className="text-xs text-cream/40 mt-1">{t("settings.stripeFeeHint")}</p>
                </div>
              </div>
            </div>

            {/* Cancellation Settings */}
            <div className="border-t border-cream/10 pt-5 mt-2">
              <h3 className="text-cream/60 text-xs uppercase tracking-wider mb-4">
                {t("settings.cancellationTitle")}
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-cream/70 mb-1.5">{t("settings.cancellationFeeType")}</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setSettings({ ...settings, cancellation_fee_type: "flat" })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${settings.cancellation_fee_type === "flat" ? "bg-amber text-navy" : "bg-navy-light border border-cream/10 text-cream/50"}`}>
                      {t("settings.flatRate")}
                    </button>
                    <button type="button" onClick={() => setSettings({ ...settings, cancellation_fee_type: "percentage" })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${settings.cancellation_fee_type === "percentage" ? "bg-amber text-navy" : "bg-navy-light border border-cream/10 text-cream/50"}`}>
                      {t("settings.percentage")}
                    </button>
                  </div>
                </div>
                {settings.cancellation_fee_type === "flat" ? (
                  <div>
                    <label className="block text-sm text-cream/70 mb-1.5">{t("settings.flatRateAmount")}</label>
                    <input type="number" min={0} max={1000} value={settings.cancellation_fee_flat}
                      onChange={(e) => setSettings({ ...settings, cancellation_fee_flat: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors" />
                    <p className="text-xs text-cream/40 mt-1">{t("settings.flatRateHint")}</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm text-cream/70 mb-1.5">{t("settings.percentageAmount")}</label>
                    <input type="number" min={0} max={100} value={settings.cancellation_fee_percent}
                      onChange={(e) => setSettings({ ...settings, cancellation_fee_percent: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors" />
                    <p className="text-xs text-cream/40 mt-1">{t("settings.percentageHint")}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-cream/70 mb-1.5">{t("settings.freeCancellationDays")}</label>
                  <input type="number" min={0} max={30} value={settings.free_cancellation_days}
                    onChange={(e) => setSettings({ ...settings, free_cancellation_days: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors" />
                  <p className="text-xs text-cream/40 mt-1">{t("settings.freeCancellationHint")}</p>
                </div>
              </div>
            </div>

            {/* No-Show Fee */}
            <div className="pt-6 border-t border-cream/10">
              <h3 className="text-cream font-medium mb-4">{t("settings.noshowFeeTitle")}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cream/70 mb-1.5">{t("settings.feeType")}</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSettings({ ...settings, noshow_fee_type: "flat" })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${settings.noshow_fee_type === "flat" ? "bg-amber text-navy" : "bg-navy-light border border-cream/10 text-cream/50"}`}>
                      {t("settings.flatRate")}
                    </button>
                    <button type="button" onClick={() => setSettings({ ...settings, noshow_fee_type: "percentage" })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${settings.noshow_fee_type === "percentage" ? "bg-amber text-navy" : "bg-navy-light border border-cream/10 text-cream/50"}`}>
                      {t("settings.percentage")}
                    </button>
                  </div>
                </div>
                {settings.noshow_fee_type === "flat" ? (
                  <div>
                    <label className="block text-sm text-cream/70 mb-1.5">{t("settings.noshowFeeFlat")}</label>
                    <input type="number" min={0} max={5000} value={settings.noshow_fee_flat}
                      onChange={(e) => setSettings({ ...settings, noshow_fee_flat: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm text-cream/70 mb-1.5">{t("settings.noshowFeePercent")}</label>
                    <input type="number" min={0} max={100} value={settings.noshow_fee_percent}
                      onChange={(e) => setSettings({ ...settings, noshow_fee_percent: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors" />
                  </div>
                )}
                <p className="text-xs text-cream/40">{t("settings.noshowFeeHint")}</p>
              </div>
            </div>

            {/* Cash / Alternative Payments */}
            <div className="pt-6 border-t border-cream/10">
              <h3 className="text-cream/60 text-xs uppercase tracking-wider mb-4">
                {t("settings.cashPaymentsTitle")}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cream/70 mb-1.5">{t("settings.cashDepositPercent")}</label>
                  <input type="number" min={0} max={100} value={settings.cash_deposit_percent}
                    onChange={(e) => setSettings({ ...settings, cash_deposit_percent: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors" />
                  <p className="text-xs text-cream/40 mt-1">{t("settings.cashDepositPercentHint")}</p>
                </div>
                <div>
                  <label className="block text-sm text-cream/70 mb-1.5">{t("settings.cashAutoCancelHours")}</label>
                  <input type="number" min={1} max={168} value={settings.cash_auto_cancel_hours}
                    onChange={(e) => setSettings({ ...settings, cash_auto_cancel_hours: parseInt(e.target.value) || 48 })}
                    className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors" />
                  <p className="text-xs text-cream/40 mt-1">{t("settings.cashAutoCancelHoursHint")}</p>
                </div>
                {/* Payment Method Toggles */}
                {([
                  { key: "zelle" as const, label: "Zelle", icon: "💸", enabledKey: "zelle_enabled" as const, handleKey: "zelle_handle" as const, placeholder: "(562) 746-3998", inputType: "text" },
                  { key: "paypal" as const, label: "PayPal", icon: "🅿️", enabledKey: "paypal_enabled" as const, handleKey: "paypal_email" as const, placeholder: "paypal@example.com", inputType: "email" },
                  { key: "cashapp" as const, label: "Cash App", icon: "💵", enabledKey: "cashapp_enabled" as const, handleKey: "cashapp_handle" as const, placeholder: "$yourtag", inputType: "text" },
                  { key: "venmo" as const, label: "Venmo", icon: "✌️", enabledKey: "venmo_enabled" as const, handleKey: "venmo_handle" as const, placeholder: "@yourhandle", inputType: "text" },
                ] as const).map((method) => (
                  <div key={method.key} className={`p-4 rounded-xl border transition-all duration-200 ${settings[method.enabledKey] ? 'border-amber/30 bg-amber/5' : 'border-cream/10 bg-cream/5 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{method.icon}</span>
                        <span className="text-cream font-medium">{method.label}</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settings[method.enabledKey]}
                        onClick={() => setSettings({ ...settings, [method.enabledKey]: !settings[method.enabledKey] })}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber/50 ${settings[method.enabledKey] ? 'bg-amber' : 'bg-cream/20'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${settings[method.enabledKey] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {settings[method.enabledKey] && (
                      <input
                        type={method.inputType}
                        value={settings[method.handleKey]}
                        onChange={(e) => setSettings({ ...settings, [method.handleKey]: e.target.value })}
                        placeholder={method.placeholder}
                        className="w-full px-4 py-2.5 bg-navy-light border border-cream/10 rounded-lg text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-amber/50 transition-colors"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-terracotta text-sm">{error}</p>}
            {saved && (
              <p className="text-teal-light text-sm">{t("settings.saved")}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-amber text-navy font-semibold rounded-lg hover:bg-amber-light transition-colors duration-200 disabled:opacity-50"
            >
              {saving ? t("settings.saving") : t("settings.save")}
            </button>
          </form>

          {/* Test Emails Section */}
          <TestEmailsSection t={t} />
          </>
        )}
      </div>
    </div>
  );
}

function TestEmailsSection({ t }: { t: (key: string) => string }) {
  const [testEmail, setTestEmail] = useState("");
  const [dataMode, setDataMode] = useState<"random" | "custom">("random");
  const [customFields, setCustomFields] = useState({
    customerName: "",
    customerPhone: "",
    eventDate: "",
    eventTime: "",
    guestCount: "",
    eventAddress: "",
    totalPrice: "",
    serviceType: "",
  });

  const emailCategories = [
    {
      title: t("settings.testCategoryBooking"),
      emails: [
        { key: "owner_booking", label: t("settings.testOwnerBooking"), icon: "📩" },
        { key: "customer_confirmation", label: t("settings.testCustomerConfirmation"), icon: "✅" },
        { key: "cash_pending", label: t("settings.testCashPending"), icon: "💵" },
      ],
    },
    {
      title: t("settings.testCategoryReminders"),
      emails: [
        { key: "customer_reminder", label: t("settings.testCustomerReminder"), icon: "🔔" },
        { key: "owner_reminder", label: t("settings.testOwnerReminder"), icon: "📋" },
        { key: "day_before", label: t("settings.testDayBefore"), icon: "⏰" },
      ],
    },
    {
      title: t("settings.testCategoryCancellation"),
      emails: [
        { key: "customer_cancellation", label: t("settings.testCustomerCancellation"), icon: "❌" },
        { key: "owner_cancellation", label: t("settings.testOwnerCancellation"), icon: "📣" },
        { key: "owner_initiated_cancel", label: t("settings.testOwnerInitiatedCancel"), icon: "🚫" },
        { key: "auto_cancel", label: t("settings.testAutoCancel"), icon: "⏳" },
      ],
    },
    {
      title: t("settings.testCategoryReschedule"),
      emails: [
        { key: "customer_reschedule", label: t("settings.testCustomerReschedule"), icon: "📅" },
        { key: "owner_reschedule", label: t("settings.testOwnerReschedule"), icon: "🔄" },
      ],
    },
    {
      title: t("settings.testCategoryConfirmation"),
      emails: [
        { key: "event_confirmed", label: t("settings.testEventConfirmed"), icon: "🎉" },
        { key: "auto_confirm_request", label: t("settings.testAutoConfirmRequest"), icon: "📋" },
        { key: "owner_no_response", label: t("settings.testOwnerNoResponse"), icon: "⚠️" },
      ],
    },
  ];

  const buildCustomData = () => {
    if (dataMode === "random") return undefined;
    const data: Record<string, unknown> = {};
    if (customFields.customerName.trim()) data.customerName = customFields.customerName.trim();
    if (customFields.customerPhone.trim()) data.customerPhone = customFields.customerPhone.trim();
    if (customFields.eventDate) data.eventDate = customFields.eventDate;
    if (customFields.eventTime) data.eventTime = customFields.eventTime;
    if (customFields.guestCount) data.guestCount = parseInt(customFields.guestCount);
    if (customFields.eventAddress.trim()) data.eventAddress = customFields.eventAddress.trim();
    if (customFields.totalPrice) data.totalPrice = parseFloat(customFields.totalPrice);
    if (customFields.serviceType) data.serviceType = customFields.serviceType;
    return Object.keys(data).length > 0 ? data : undefined;
  };

  return (
    <div className="mt-10 pt-8 border-t border-cream/10">
      <h2 className="font-heading text-amber text-xl mb-4">
        {t("settings.testEmails")}
      </h2>
      <p className="text-cream/40 text-sm mb-4">
        {t("settings.testEmailsHint")}
      </p>

      {/* Recipient email input */}
      <div className="mb-6">
        <label className="block text-sm text-cream/70 mb-1.5">{t("settings.testEmailRecipient")}</label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder={t("settings.testEmailPlaceholder")}
          className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-amber/50 transition-colors placeholder:text-cream/25"
        />
      </div>

      {/* Data Mode Toggle */}
      <div className="mb-6">
        <label className="block text-sm text-cream/70 mb-2">{t("settings.testDataMode")}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDataMode("random")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
              dataMode === "random"
                ? "bg-amber/15 border-amber/40 text-amber"
                : "bg-navy-light border-cream/10 text-cream/50 hover:border-cream/20"
            }`}
          >
            🎲 {t("settings.testDataRandom")}
          </button>
          <button
            type="button"
            onClick={() => setDataMode("custom")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
              dataMode === "custom"
                ? "bg-amber/15 border-amber/40 text-amber"
                : "bg-navy-light border-cream/10 text-cream/50 hover:border-cream/20"
            }`}
          >
            ✏️ {t("settings.testDataCustom")}
          </button>
        </div>
      </div>

      {/* Custom Data Fields */}
      {dataMode === "custom" && (
        <div className="mb-6 p-4 rounded-xl border border-cream/10 bg-navy-light/50 space-y-3">
          <p className="text-cream/40 text-xs">{t("settings.testCustomHint")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-cream/50 mb-1">{t("settings.testFieldName")}</label>
              <input type="text" value={customFields.customerName}
                onChange={(e) => setCustomFields({ ...customFields, customerName: e.target.value })}
                placeholder="María García"
                className="w-full px-3 py-2 bg-navy border border-cream/10 rounded-lg text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:border-amber/50" />
            </div>
            <div>
              <label className="block text-xs text-cream/50 mb-1">{t("settings.testFieldPhone")}</label>
              <input type="text" value={customFields.customerPhone}
                onChange={(e) => setCustomFields({ ...customFields, customerPhone: e.target.value })}
                placeholder="(562) 555-1234"
                className="w-full px-3 py-2 bg-navy border border-cream/10 rounded-lg text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:border-amber/50" />
            </div>
            <div>
              <label className="block text-xs text-cream/50 mb-1">{t("settings.testFieldDate")}</label>
              <input type="date" value={customFields.eventDate}
                onChange={(e) => setCustomFields({ ...customFields, eventDate: e.target.value })}
                className="w-full px-3 py-2 bg-navy border border-cream/10 rounded-lg text-cream text-sm focus:outline-none focus:border-amber/50" />
            </div>
            <div>
              <label className="block text-xs text-cream/50 mb-1">{t("settings.testFieldTime")}</label>
              <input type="time" value={customFields.eventTime}
                onChange={(e) => setCustomFields({ ...customFields, eventTime: e.target.value })}
                className="w-full px-3 py-2 bg-navy border border-cream/10 rounded-lg text-cream text-sm focus:outline-none focus:border-amber/50" />
            </div>
            <div>
              <label className="block text-xs text-cream/50 mb-1">{t("settings.testFieldGuests")}</label>
              <input type="number" value={customFields.guestCount}
                onChange={(e) => setCustomFields({ ...customFields, guestCount: e.target.value })}
                placeholder="100"
                className="w-full px-3 py-2 bg-navy border border-cream/10 rounded-lg text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:border-amber/50" />
            </div>
            <div>
              <label className="block text-xs text-cream/50 mb-1">{t("settings.testFieldPrice")}</label>
              <input type="number" step="0.01" value={customFields.totalPrice}
                onChange={(e) => setCustomFields({ ...customFields, totalPrice: e.target.value })}
                placeholder="695.00"
                className="w-full px-3 py-2 bg-navy border border-cream/10 rounded-lg text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:border-amber/50" />
            </div>
            <div>
              <label className="block text-xs text-cream/50 mb-1">{t("settings.testFieldAddress")}</label>
              <input type="text" value={customFields.eventAddress}
                onChange={(e) => setCustomFields({ ...customFields, eventAddress: e.target.value })}
                placeholder="123 Main St, Los Angeles, CA"
                className="w-full px-3 py-2 bg-navy border border-cream/10 rounded-lg text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:border-amber/50" />
            </div>
            <div>
              <label className="block text-xs text-cream/50 mb-1">{t("settings.testFieldService")}</label>
              <select value={customFields.serviceType}
                onChange={(e) => setCustomFields({ ...customFields, serviceType: e.target.value })}
                className="w-full px-3 py-2 bg-navy border border-cream/10 rounded-lg text-cream text-sm focus:outline-none focus:border-amber/50">
                <option value="">{t("settings.testFieldServiceAuto")}</option>
                <option value="2hr">2 Hour</option>
                <option value="3hr">3 Hour</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Email Categories */}
      {emailCategories.map((category) => (
        <div key={category.title} className="mb-6">
          <h3 className="text-cream/60 text-xs uppercase tracking-wider mb-2">{category.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {category.emails.map((email) => (
              <TestEmailButton
                key={email.key}
                emailType={email.key}
                label={`${email.icon} ${email.label}`}
                recipientEmail={testEmail}
                customData={buildCustomData()}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TestEmailButton({ emailType, label, recipientEmail, customData }: { emailType: string; label: string; recipientEmail: string; customData?: Record<string, unknown> }) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleSend = async () => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("admin_token") : null;
    if (!token) return;

    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailType,
          ...(recipientEmail.trim() && { recipientEmail: recipientEmail.trim() }),
          ...(customData && { customData }),
        }),
      });
      setResult(res.ok ? "success" : "error");
    } catch {
      setResult("error");
    } finally {
      setSending(false);
      setTimeout(() => setResult(null), 3000);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={sending}
      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 border text-left ${
        result === "success"
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : result === "error"
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-navy-light border-cream/10 text-cream/70 hover:border-amber/30 hover:text-amber"
      }`}
    >
      {sending ? "Sending..." : result === "success" ? "✓ Sent!" : result === "error" ? "✗ Failed" : label}
    </button>
  );
}
