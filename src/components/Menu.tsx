import Image from "next/image";
import { useTranslations } from "next-intl";

const meatKeys = [
  "asada",
  "pastor",
  "chicken",
  "chorizo",
  "fish",
  "shrimp",
  "veggies",
  "alambres",
] as const;

const meatImages: Record<string, string> = {
  asada: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400&h=300&fit=crop",
  pastor: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop",
  chicken: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop",
  chorizo: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400&h=300&fit=crop",
  fish: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
  shrimp: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
  veggies: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
  alambres: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop",
};

export default function Menu() {
  const t = useTranslations("menu");

  return (
    <section id="menu" className="relative py-16 sm:py-32 lg:py-40">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/60 to-navy" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-20 reveal">
          <p className="text-teal text-xs uppercase tracking-[0.3em] mb-4 font-medium">
            {t("label")}
          </p>
          <h2 className="font-heading text-3xl sm:text-6xl lg:text-7xl text-cream mb-4 sm:mb-6 italic font-medium">
            {t("heading")}
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-terracotta to-transparent mx-auto mb-6" />
          <p className="text-cream/50 text-base max-w-xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Meat cards grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 stagger-children">
          {meatKeys.map((key) => (
            <div
              key={key}
              className="reveal group relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-light to-navy-dark border border-cream/5 hover:border-terracotta/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-terracotta/10"
            >
              {/* Image */}
              <div className="relative h-28 sm:h-44 overflow-hidden">
                <Image
                  src={meatImages[key]}
                  alt={t(`meats.${key}.name`)}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 to-transparent" />
                <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[8px] sm:text-[10px] uppercase tracking-widest text-teal font-semibold bg-navy/80 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  {t(`meats.${key}.tag`)}
                </span>
              </div>

              <div className="p-3 sm:p-5">
                {/* Name */}
                <h3 className="font-heading text-lg sm:text-2xl text-cream group-hover:text-amber transition-colors duration-500 mb-1 sm:mb-2 italic">
                  {t(`meats.${key}.name`)}
                </h3>

                {/* Description - hidden on mobile to save space */}
                <p className="text-cream/40 text-xs sm:text-sm leading-relaxed group-hover:text-cream/60 transition-colors duration-500 hidden sm:block">
                  {t(`meats.${key}.description`)}
                </p>
              </div>

              {/* Bottom accent line */}
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-terracotta via-amber to-teal transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
