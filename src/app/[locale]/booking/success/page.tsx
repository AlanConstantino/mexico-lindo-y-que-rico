import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function BookingSuccessPage() {
  const t = await getTranslations("booking");

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-10 h-10 text-teal"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="font-heading text-4xl text-cream mb-3">
          {t("successTitle")}
        </h1>
        <p className="text-amber text-sm mb-4">{t("successSubtitle")}</p>
        <p className="text-cream/40 text-sm mb-10 leading-relaxed">
          {t("successDesc")}
        </p>

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-amber text-navy font-semibold rounded-full hover:bg-amber-light transition-all duration-300 hover:shadow-lg hover:shadow-amber/20 text-sm"
        >
          {t("returnHome")}
        </Link>
      </div>
    </div>
  );
}
