import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Gallery() {
  const t = useTranslations("gallery");

  return (
    <section id="gallery" className="relative py-32 lg:py-40">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20 reveal">
          <p className="text-amber text-xs uppercase tracking-[0.3em] mb-4 font-medium">
            {t("label")}
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-cream mb-6">
            {t("heading")}
          </h2>
          <p className="text-cream/50 text-base max-w-xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Large featured image */}
          <div className="reveal-scale md:row-span-2 relative aspect-[3/4] rounded-2xl overflow-hidden group">
            <Image
              src="/images/tacos.jpg"
              alt="Fresh tacos being prepared"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <p className="font-heading text-xl text-cream">{t("freshTacos")}</p>
              <p className="text-cream/60 text-sm">{t("freshTacosSub")}</p>
            </div>
          </div>

          {/* Top right */}
          <div className="reveal-scale relative aspect-[4/3] rounded-2xl overflow-hidden group">
            <Image
              src="/images/spread.jpg"
              alt="Full catering spread"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <p className="font-heading text-xl text-cream">{t("fullSpread")}</p>
              <p className="text-cream/60 text-sm">{t("fullSpreadSub")}</p>
            </div>
          </div>

          {/* Bottom right — tinted overlay card */}
          <div className="reveal-scale relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-amber/10 to-terracotta/10 border border-amber/10 flex items-center justify-center">
            <div className="text-center px-8">
              <p className="font-heading text-5xl text-amber mb-3">1000+</p>
              <p className="text-cream/70 text-base mb-1">{t("eventsCatered")}</p>
              <p className="text-cream/40 text-sm">{t("eventsCateredSub")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
