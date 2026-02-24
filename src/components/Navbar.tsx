"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t("about"), href: "#about" },
    { label: t("menu"), href: "#menu" },
    { label: t("packages"), href: "#packages" },
    { label: t("gallery"), href: "#gallery" },
    { label: t("contact"), href: "#contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLinkClick = () => setMobileOpen(false);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as (typeof routing.locales)[number] });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 overflow-x-hidden ${
        scrolled
          ? "bg-navy/95 backdrop-blur-md shadow-lg shadow-black/20 py-2 sm:py-3"
          : "bg-transparent py-3 sm:py-6"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between gap-4">
        {/* Logo */}
        <a
          href="#hero"
          className="font-heading text-cream hover:text-amber transition-colors duration-300 text-sm sm:text-2xl leading-tight min-w-0"
        >
          México Lindo<br /><span className="text-amber">Y Que Rico</span>
        </a>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-cream/70 hover:text-amber transition-colors duration-300 tracking-wide uppercase"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/booking"
              className="text-sm px-6 py-2.5 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300 hover:shadow-lg hover:shadow-amber/20"
            >
              {t("bookNow")}
            </Link>
          </li>
          {/* Language switcher */}
          <li>
            <div className="flex items-center gap-1 text-sm">
              {routing.locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={`px-2 py-1 rounded transition-colors duration-300 uppercase text-xs font-semibold tracking-wider ${
                    locale === loc
                      ? "text-amber"
                      : "text-cream/40 hover:text-cream/70"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden relative w-8 h-8 shrink-0 flex flex-col justify-center items-center gap-1.5"
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
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-navy/98 backdrop-blur-lg border-t border-amber/10 px-6 py-8">
          <ul className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={handleLinkClick}
                  className="text-lg text-cream/80 hover:text-amber transition-colors duration-300 tracking-wide"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/booking"
                onClick={handleLinkClick}
                className="inline-block text-lg px-8 py-3 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300"
              >
                {t("bookNow")}
              </Link>
            </li>
            {/* Mobile language switcher */}
            <li className="flex items-center gap-3 pt-2 border-t border-cream/10">
              {routing.locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    switchLocale(loc);
                    handleLinkClick();
                  }}
                  className={`px-3 py-1.5 rounded transition-colors duration-300 uppercase text-sm font-semibold tracking-wider ${
                    locale === loc
                      ? "text-amber"
                      : "text-cream/40 hover:text-cream/70"
                  }`}
                >
                  {loc === "en" ? "English" : "Español"}
                </button>
              ))}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
