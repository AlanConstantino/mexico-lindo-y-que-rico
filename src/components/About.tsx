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
    <section id="about" className="relative py-16 sm:py-32 lg:py-40 overflow-hidden">
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
              {/* Floating sticker badge — inside image, bottom-right */}
              <div className="absolute bottom-3 right-3 z-30 animate-float hover:-translate-y-2 hover:scale-110 transition-all duration-500 cursor-pointer" style={{ filter: "drop-shadow(0 8px 24px rgba(232,169,53,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F0BD55" />
                        <stop offset="50%" stopColor="#E8A935" />
                        <stop offset="100%" stopColor="#C8912A" />
                      </linearGradient>
                      <linearGradient id="starShine" x1="0%" y1="0%" x2="50%" y2="50%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </linearGradient>
                      <filter id="innerShadow">
                        <feFlood floodColor="#C8912A" floodOpacity="0.4" />
                        <feComposite in2="SourceAlpha" operator="in" />
                        <feGaussianBlur stdDeviation="2" />
                        <feComposite in2="SourceAlpha" operator="in" />
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Main starburst with gradient */}
                    <path
                      d="M50 0 L61 12 L75 5 L78 21 L95 22 L90 37 L100 50 L90 63 L95 78 L78 79 L75 95 L61 88 L50 100 L39 88 L25 95 L22 79 L5 78 L10 63 L0 50 L10 37 L5 22 L22 21 L25 5 L39 12 Z"
                      fill="url(#starGrad)"
                      filter="url(#innerShadow)"
                    />
                    {/* Shine overlay */}
                    <path
                      d="M50 0 L61 12 L75 5 L78 21 L95 22 L90 37 L100 50 L90 63 L95 78 L78 79 L75 95 L61 88 L50 100 L39 88 L25 95 L22 79 L5 78 L10 63 L0 50 L10 37 L5 22 L22 21 L25 5 L39 12 Z"
                      fill="url(#starShine)"
                    />
                    {/* Border ring */}
                    <path
                      d="M50 6 L59 16 L71 10 L74 24 L88 25 L84 38 L93 50 L84 62 L88 75 L74 76 L71 90 L59 84 L50 94 L41 84 L29 90 L26 76 L12 75 L16 62 L7 50 L16 38 L12 25 L26 24 L29 10 L41 16 Z"
                      fill="none"
                      stroke="#C8912A"
                      strokeWidth="0.5"
                      opacity="0.6"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-navy">
                    <p className="font-heading text-2xl sm:text-3xl leading-none" style={{ textShadow: "0 1px 0 rgba(240,189,85,0.5)" }}>20+</p>
                    <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider leading-tight text-center px-2" style={{ textShadow: "0 1px 0 rgba(240,189,85,0.3)" }}>{t("floatingCard")}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative border */}
            <div className="absolute top-0 left-0 sm:inset-0 sm:-top-4 sm:-left-4 sm:-bottom-4 sm:-right-4 border border-amber/20 rounded-2xl -z-10" />
          </div>

          {/* Text side */}
          <div className="reveal-right">
            <p className="text-amber text-xs uppercase tracking-[0.3em] mb-4 font-medium">
              {t("label")}
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-cream mb-5 sm:mb-8 leading-tight">
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
