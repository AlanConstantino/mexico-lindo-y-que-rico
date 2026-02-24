import Image from "next/image";
import Link from "next/link";

export default function Hero() {
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

      {/* Warm cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brown/50 via-brown/30 to-brown/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-brown/20 via-transparent to-brown/20" />
      {/* Warm amber tint */}
      <div className="absolute inset-0 bg-marigold/10 mix-blend-overlay" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <p className="animate-fade-in opacity-0 text-marigold-light text-xs sm:text-sm uppercase tracking-[0.4em] mb-8 font-medium">
          Authentic Taco Catering &middot; Los Angeles &middot; 20+ Years
        </p>

        <h1 className="animate-fade-in-up opacity-0 animate-delay-100 font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-cream leading-[0.9] mb-4">
          México Lindo
        </h1>
        <h1 className="animate-fade-in-up opacity-0 animate-delay-200 font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-marigold leading-[0.9] mb-8">
          Y Que Rico
        </h1>

        <p className="animate-fade-in-up opacity-0 animate-delay-300 font-heading text-xl sm:text-2xl md:text-3xl text-cream/70 italic mb-12">
          &ldquo;Aquí la panza es primero.&rdquo;
        </p>

        <div className="animate-fade-in-up opacity-0 animate-delay-500 flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            href="/booking"
            className="group px-10 py-4 bg-marigold text-brown font-semibold text-base tracking-wide rounded-full hover:bg-marigold-light transition-all duration-500 hover:shadow-2xl hover:shadow-marigold/30 hover:scale-105 active:scale-95"
          >
            Book Your Event
          </Link>
          <a
            href="#packages"
            className="px-10 py-4 border border-cream/30 text-cream font-medium text-base tracking-wide rounded-full hover:border-marigold/60 hover:text-marigold transition-all duration-500 hover:scale-105 active:scale-95"
          >
            View Packages
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in opacity-0 animate-delay-700">
        <a href="#about" className="flex flex-col items-center gap-3 group">
          <span className="text-cream/40 text-xs uppercase tracking-[0.3em] group-hover:text-marigold/70 transition-colors">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-marigold/60 to-transparent" />
        </a>
      </div>
    </section>
  );
}
