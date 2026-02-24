import Link from "next/link";

export default function Contact() {
  return (
    <section id="contact" className="relative py-28 lg:py-36 bg-cream-warm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terracotta/20 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left — CTA */}
          <div className="reveal-left">
            <p className="text-terracotta text-xs uppercase tracking-[0.3em] mb-4 font-medium">
              Get In Touch
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-brown mb-6 leading-tight">
              Ready for the<br />
              <span className="text-terracotta">Best Tacos</span><br />
              in LA?
            </h2>
            <p className="text-brown/50 text-base leading-relaxed mb-10 max-w-md">
              Whether it&apos;s a birthday, wedding, corporate event, or backyard
              party — we&apos;ll make it one to remember.
            </p>
            <Link
              href="/booking"
              className="inline-block px-10 py-4 bg-marigold text-brown font-semibold text-base tracking-wide rounded-full hover:bg-marigold-light transition-all duration-500 hover:shadow-xl hover:shadow-marigold/20 hover:scale-105 active:scale-95"
            >
              Book Your Event
            </Link>
          </div>

          {/* Right — Contact info */}
          <div className="reveal-right flex flex-col justify-center">
            <div className="space-y-10">
              {/* Phone numbers */}
              <div>
                <p className="text-brown/30 text-xs uppercase tracking-[0.2em] mb-4">
                  Call Us Directly
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+15622359361"
                    className="block text-2xl font-heading text-brown hover:text-terracotta transition-colors duration-300"
                  >
                    (562) 235-9361
                  </a>
                  <a
                    href="tel:+15627463998"
                    className="block text-2xl font-heading text-brown hover:text-terracotta transition-colors duration-300"
                  >
                    (562) 746-3998
                  </a>
                </div>
              </div>

              {/* Service area */}
              <div>
                <p className="text-brown/30 text-xs uppercase tracking-[0.2em] mb-4">
                  Service Area
                </p>
                <p className="text-brown/60 text-base">
                  Greater Los Angeles Area
                </p>
              </div>

              {/* Quick facts */}
              <div>
                <p className="text-brown/30 text-xs uppercase tracking-[0.2em] mb-4">
                  Quick Facts
                </p>
                <ul className="space-y-2.5 text-brown/50 text-sm">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                    Events from 25 to 200+ guests
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                    Packages starting at $395
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                    Full setup and cleanup included
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                    Fresh on-site preparation
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
