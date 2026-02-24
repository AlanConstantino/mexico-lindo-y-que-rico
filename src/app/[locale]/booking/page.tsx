import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import BookingForm from "@/components/booking/BookingForm";

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
          <div className="text-center mb-12">
            <p className="text-amber text-xs uppercase tracking-[0.3em] mb-4 font-medium">
              {t("reserveLabel")}
            </p>
            <h1 className="font-heading text-5xl sm:text-6xl text-cream mb-4">
              {t("title")}
            </h1>
            <p className="text-cream/40 text-sm max-w-lg mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Booking Form */}
          <BookingForm />
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
