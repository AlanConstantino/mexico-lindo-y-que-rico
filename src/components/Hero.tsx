import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with zoom animation */}
      <div className="absolute inset-0 animate-hero-zoom">
        <Image
          src="/images/tacos.jpg"
          alt="Authentic Mexican tacos"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </div>

      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/40 via-transparent to-navy/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <p className="animate-fade-in opacity-0 text-amber/90 text-xs sm:text-sm uppercase tracking-[0.4em] mb-8 font-medium">
          {t("subtitle")}
        </p>

        <h1 className="animate-fade-in-up opacity-0 animate-delay-100 font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-cream leading-[0.9] mb-4">
          {t("heading1")}
        </h1>
        <h1 className="animate-fade-in-up opacity-0 animate-delay-200 font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-amber leading-[0.9] mb-8">
          {t("heading2")}
        </h1>

        <p className="animate-fade-in-up opacity-0 animate-delay-300 font-heading text-xl sm:text-2xl md:text-3xl text-cream/60 italic mb-12">
          &ldquo;{t("tagline")}&rdquo;
        </p>

        <div className="animate-fade-in-up opacity-0 animate-delay-500 flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            href="/booking"
            className="group px-10 py-4 bg-amber text-navy font-semibold text-base tracking-wide rounded-full hover:bg-amber-light transition-all duration-500 hover:shadow-2xl hover:shadow-amber/30 hover:scale-105 active:scale-95"
          >
            {t("bookEvent")}
          </Link>
          <a
            href="#packages"
            className="px-10 py-4 border border-cream/20 text-cream/90 font-medium text-base tracking-wide rounded-full hover:border-amber/60 hover:text-amber transition-all duration-500 hover:scale-105 active:scale-95"
          >
            {t("viewPackages")}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in opacity-0 animate-delay-700">
        <a href="#about" className="flex flex-col items-center gap-3 group">
          <span className="text-cream/30 text-xs uppercase tracking-[0.3em] group-hover:text-amber/60 transition-colors">
            {t("scroll")}
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-amber/60 to-transparent" />
        </a>
      </div>
    </section>
  );
}
