"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";

export default function AdminNav({ onLogout }: { onLogout: () => void }) {
  const t = useTranslations("admin.nav");
  const locale = useLocale();
  const pathname = usePathname();

  const links = [
    { label: t("dashboard"), href: `/${locale}/admin` },
    { label: t("settings"), href: `/${locale}/admin/settings` },
  ];

  return (
    <nav className="bg-navy-dark border-b border-amber/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-heading text-amber text-lg sm:text-xl">
            {t("title")}
          </span>
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive =
                pathname === link.href.replace(`/${locale}`, "") ||
                (link.href.endsWith("/admin") &&
                  pathname === "/admin");
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
        </div>
        <div className="flex items-center gap-3">
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
    </nav>
  );
}
