import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Contact() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="relative py-16 sm:py-32 lg:py-40">
      <div className="absolute inset-0 bg-navy-light/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/20 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left — CTA */}
          <div className="reveal-left">
            <p className="text-amber text-xs uppercase tracking-[0.3em] mb-4 font-medium">
              {t("label")}
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-cream mb-6 leading-tight">
              {t("heading")}<br />
              <span className="text-amber">{t("headingHighlight")}</span><br />
              {t("headingEnd")}
            </h2>
            <p className="text-cream/50 text-base leading-relaxed mb-10 max-w-md">
              {t("description")}
            </p>
            <Link
              href="/booking"
              className="inline-block px-10 py-4 bg-amber text-navy font-semibold text-base tracking-wide rounded-full hover:bg-amber-light transition-all duration-500 hover:shadow-2xl hover:shadow-amber/30 hover:scale-105 active:scale-95"
            >
              {t("bookEvent")}
            </Link>
          </div>

          {/* Right — Contact info */}
          <div className="reveal-right flex flex-col justify-center">
            <div className="space-y-10">
              {/* Phone numbers */}
              <div>
                <p className="text-cream/30 text-xs uppercase tracking-[0.2em] mb-4">
                  {t("callLabel")}
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+15622359361"
                    className="block text-2xl font-heading text-cream hover:text-amber transition-colors duration-300"
                  >
                    (562) 235-9361
                  </a>
                  <a
                    href="tel:+15627463998"
                    className="block text-2xl font-heading text-cream hover:text-amber transition-colors duration-300"
                  >
                    (562) 746-3998
                  </a>
                </div>
              </div>

              {/* Service area */}
              <div>
                <p className="text-cream/30 text-xs uppercase tracking-[0.2em] mb-4">
                  {t("areaLabel")}
                </p>
                <p className="text-cream/60 text-base">
                  {t("area")}
                </p>
              </div>

              {/* Quick facts */}
              <div>
                <p className="text-cream/30 text-xs uppercase tracking-[0.2em] mb-4">
                  {t("factsLabel")}
                </p>
                <ul className="space-y-2.5 text-cream/50 text-sm">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                    {t("fact1")}
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                    {t("fact2")}
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                    {t("fact3")}
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                    {t("fact4")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
