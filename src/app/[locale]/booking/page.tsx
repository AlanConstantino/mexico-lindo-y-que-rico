import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.booking" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function BookingPage() {
  const t = await getTranslations("booking");
  const tNav = await getTranslations("nav");

  const steps = [
    { step: "01", label: t("step1") },
    { step: "02", label: t("step2") },
    { step: "03", label: t("step3") },
    { step: "04", label: t("step4") },
  ];

  return (
    <div className="min-h-screen bg-navy">
      {/* Minimal top nav for booking page */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-md border-b border-cream/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-heading text-2xl text-cream hover:text-amber transition-colors duration-300"
          >
            México Lindo <span className="text-amber">Y Que Rico</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-cream/50 hover:text-amber transition-colors duration-300 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            {t("backHome")}
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-amber text-xs uppercase tracking-[0.3em] mb-4 font-medium">
              {t("reserveLabel")}
            </p>
            <h1 className="font-heading text-5xl sm:text-6xl text-cream mb-6">
              {t("title")}
            </h1>
            <p className="text-cream/50 text-base max-w-lg mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className="relative p-12 rounded-3xl bg-gradient-to-b from-navy-light/60 to-navy-light/30 border border-amber/10 text-center overflow-hidden mb-12">
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,162,78,0.08),transparent_60%)]" />

            <div className="relative">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center mx-auto mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                <svg
                  className="w-8 h-8 text-amber"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>

              <h3 className="font-heading text-3xl text-cream mb-4">
                {t("comingSoonTitle")}
              </h3>
              <p className="text-cream/40 text-base mb-10 max-w-md mx-auto leading-relaxed">
                {t("comingSoonDescription")}
              </p>

              {/* Steps preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                {steps.map((s) => (
                  <div
                    key={s.step}
                    className="p-4 rounded-xl bg-navy/60 border border-cream/5"
                  >
                    <p className="font-heading text-2xl text-amber/60 mb-1">
                      {s.step}
                    </p>
                    <p className="text-cream/30 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Phone CTA */}
              <div>
                <p className="text-cream/30 text-xs uppercase tracking-[0.2em] mb-5">
                  {t("phoneCta")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:+15622359361"
                    className="px-8 py-4 bg-amber text-navy font-semibold text-base rounded-full hover:bg-amber-light transition-all duration-500 hover:shadow-2xl hover:shadow-amber/30 hover:scale-105 active:scale-95"
                  >
                    (562) 235-9361
                  </a>
                  <a
                    href="tel:+15627463998"
                    className="px-8 py-4 border border-amber/30 text-amber font-medium text-base rounded-full hover:border-amber hover:bg-amber/5 transition-all duration-500 hover:scale-105 active:scale-95"
                  >
                    (562) 746-3998
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick info cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-navy-light/30 border border-cream/5 text-center">
              <p className="font-heading text-3xl text-amber mb-1">$395</p>
              <p className="text-cream/40 text-sm">{t("startingFrom")}</p>
              <p className="text-cream/25 text-xs mt-1">{t("guests25")}</p>
            </div>
            <div className="p-6 rounded-2xl bg-navy-light/30 border border-cream/5 text-center">
              <p className="font-heading text-3xl text-amber mb-1">200+</p>
              <p className="text-cream/40 text-sm">{t("maxGuests")}</p>
              <p className="text-cream/25 text-xs mt-1">
                {t("threeHourService")}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-navy-light/30 border border-cream/5 text-center">
              <p className="font-heading text-3xl text-amber mb-1">8</p>
              <p className="text-cream/40 text-sm">{t("proteins")}</p>
              <p className="text-cream/25 text-xs mt-1">{t("choose4")}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="border-t border-cream/5 py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/20 text-xs">
            &copy; {new Date().getFullYear()} México Lindo Y Que Rico
          </p>
          <Link
            href="/"
            className="text-cream/30 text-xs hover:text-amber transition-colors"
          >
            {t("backHome")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
