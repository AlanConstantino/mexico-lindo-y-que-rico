import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-brown-dark py-16 border-t border-brown/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <p className="font-heading text-3xl text-cream mb-3">
              México Lindo<br />
              <span className="text-marigold">Y Que Rico</span>
            </p>
            <p className="text-cream/40 text-sm leading-relaxed mt-4">
              Authentic taco catering for the greater Los Angeles area.
              Over 20 years of bringing the flavors of México to your celebrations.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-cream/30 text-xs uppercase tracking-[0.2em] mb-5">
              Navigate
            </p>
            <ul className="space-y-3">
              {[
                { label: "About", href: "#about" },
                { label: "Menu", href: "#menu" },
                { label: "Packages", href: "#packages" },
                { label: "Gallery", href: "#gallery" },
                { label: "Contact", href: "#contact" },
                { label: "Book Now", href: "/booking" },
              ].map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("#") ? (
                    <a
                      href={link.href}
                      className="text-cream/50 hover:text-marigold transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-cream/50 hover:text-marigold transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-cream/30 text-xs uppercase tracking-[0.2em] mb-5">
              Contact
            </p>
            <div className="space-y-3">
              <a
                href="tel:+15622359361"
                className="block text-cream/50 hover:text-marigold transition-colors duration-300 text-sm"
              >
                (562) 235-9361
              </a>
              <a
                href="tel:+15627463998"
                className="block text-cream/50 hover:text-marigold transition-colors duration-300 text-sm"
              >
                (562) 746-3998
              </a>
              <p className="text-cream/30 text-sm mt-4">
                Greater Los Angeles Area
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/30 text-xs">
            &copy; {new Date().getFullYear()} México Lindo Y Que Rico. All rights reserved.
          </p>
          <p className="text-cream/30 text-xs italic font-heading text-base">
            &ldquo;Aquí la panza es primero.&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
