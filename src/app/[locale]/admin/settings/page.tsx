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
        )}
      </div>
    </div>
  );
}
