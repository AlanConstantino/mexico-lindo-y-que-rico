"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";

export default function AdminNav({ onLogout }: { onLogout: () => void }) {
  const t = useTranslations("admin.nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: t("dashboard"), href: `/${locale}/admin` },
    { label: t("settings"), href: `/${locale}/admin/settings` },
  ];

  return (
    <nav className="bg-navy-dark border-b border-amber/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Title */}
        <span className="font-heading text-amber text-lg sm:text-xl shrink-0">
          {t("title")}
        </span>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-6 flex-1">
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive =
                pathname === link.href.replace(`/${locale}`, "") ||
                (link.href.endsWith("/admin") && pathname === "/admin");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${
                    isActive
                      ? "bg-amber/15 text-amber font-medium"
                      : "text-cream/60 hover:text-cream hover:bg-cream/5"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <a
              href={`/${locale}`}
              className="text-sm text-cream/50 hover:text-cream transition-colors duration-200"
            >
              {t("backToSite")}
            </a>
            <button
              onClick={onLogout}
              className="text-sm text-terracotta/70 hover:text-terracotta transition-colors duration-200"
            >
              {t("logout")}
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden relative w-8 h-8 shrink-0 flex flex-col justify-center items-center gap-1.5"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-cream transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-cream transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-cream transition-all duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 border-t border-cream/5 space-y-2">
          {links.map((link) => {
            const isActive =
              pathname === link.href.replace(`/${locale}`, "") ||
              (link.href.endsWith("/admin") && pathname === "/admin");
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-amber/15 text-amber font-medium"
                    : "text-cream/60 hover:text-cream hover:bg-cream/5"
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <div className="border-t border-cream/5 pt-2 mt-2 space-y-2">
            <a
              href={`/${locale}`}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm text-cream/50 hover:text-cream hover:bg-cream/5 transition-colors duration-200"
            >
              ← {t("backToSite")}
            </a>
            <button
              onClick={() => {
                setMobileOpen(false);
                onLogout();
              }}
              className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-terracotta/70 hover:text-terracotta hover:bg-terracotta/5 transition-colors duration-200"
            >
              {t("logout")}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
