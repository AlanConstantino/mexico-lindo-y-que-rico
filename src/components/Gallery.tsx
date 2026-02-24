import Image from "next/image";

export default function Gallery() {
  return (
    <section id="gallery" className="relative py-28 lg:py-36 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20 reveal">
          <p className="text-marigold-dark text-xs uppercase tracking-[0.3em] mb-4 font-medium">
            Our Work
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-brown mb-6">
            Gallery
          </h2>
          <p className="text-brown/50 text-base max-w-xl mx-auto leading-relaxed">
            A glimpse of what we bring to your celebration.
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Large featured image */}
          <div className="reveal-scale md:row-span-2 relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-lg shadow-brown/10">
            <Image
              src="/images/tacos.jpg"
              alt="Fresh tacos being prepared"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brown/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <p className="font-heading text-xl text-cream">Fresh Tacos</p>
              <p className="text-cream/70 text-sm">Made on-site for every event</p>
            </div>
          </div>

          {/* Top right */}
          <div className="reveal-scale relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-lg shadow-brown/10">
            <Image
              src="/images/spread.jpg"
              alt="Full catering spread"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brown/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <p className="font-heading text-xl text-cream">The Full Spread</p>
              <p className="text-cream/70 text-sm">Everything your guests need</p>
            </div>
          </div>

          {/* Bottom right — warm stat card */}
          <div className="reveal-scale relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-terracotta/10 to-marigold/10 border border-terracotta/10 flex items-center justify-center">
            <div className="text-center px-8">
              <p className="font-heading text-5xl text-terracotta font-bold mb-3">1000+</p>
              <p className="text-brown/70 text-base mb-1">Events Catered</p>
              <p className="text-brown/40 text-sm">Across the Greater LA Area</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
