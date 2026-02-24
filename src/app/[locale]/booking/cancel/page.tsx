import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function BookingCancelPage() {
  const t = await getTranslations("booking");

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Cancel icon */}
        <div className="w-20 h-20 rounded-full bg-terracotta/10 border border-terracotta/20 flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-10 h-10 text-terracotta"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="font-heading text-4xl text-cream mb-3">
          {t("cancelTitle")}
        </h1>
        <p className="text-cream/50 text-sm mb-4">{t("cancelSubtitle")}</p>
        <p className="text-cream/40 text-sm mb-10 leading-relaxed">
          {t("cancelDesc")}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/booking"
            className="inline-block px-8 py-3 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300 hover:shadow-lg hover:shadow-amber/20 text-sm"
          >
            {t("tryAgain")}
          </Link>
          <Link
            href="/"
            className="inline-block px-8 py-3 border border-cream/10 text-cream/50 rounded-full hover:border-cream/30 hover:text-cream transition-all duration-300 text-sm"
          >
            {t("returnHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
