import Image from "next/image";
import { useTranslations } from "next-intl";

export default function About() {
  const t = useTranslations("about");

  const stats = [
    { value: "20+", label: t("statYears") },
    { value: "8", label: t("statProteins") },
    { value: "200+", label: t("statGuests") },
  ];

  return (
    <section id="about" className="relative py-32 lg:py-40 overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(42,107,94,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(184,92,58,0.06),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image side */}
          <div className="reveal-left relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="/images/spread.jpg"
                alt="Catering spread"
                fill
                className="object-cover"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-6 -right-6 lg:-right-8 bg-amber text-navy p-6 rounded-2xl shadow-2xl shadow-amber/20 animate-float">
              <p className="font-heading text-4xl">20+</p>
              <p className="text-sm font-semibold tracking-wide">{t("floatingCard")}</p>
            </div>
            {/* Decorative border */}
            <div className="absolute -top-4 -left-4 w-full h-full border border-amber/20 rounded-2xl -z-10" />
          </div>

          {/* Text side */}
          <div className="reveal-right">
            <p className="text-amber text-xs uppercase tracking-[0.3em] mb-4 font-medium">
              {t("label")}
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-cream mb-8 leading-tight">
              {t("heading")}<br />
              <span className="text-amber">{t("headingHighlight")}</span> {t("headingEnd")}
            </h2>
            <div className="space-y-5 text-cream/60 text-base leading-relaxed">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
              <p>{t("p3")}</p>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="font-heading text-3xl lg:text-4xl text-amber">{stat.value}</p>
                  <p className="text-cream/40 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
