import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-dark border-t border-amber/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-3xl text-amber mb-4">
              Que Rico
            </h3>
            <p className="text-cream/60 text-sm leading-relaxed mb-4">
              Authentic taco catering serving the greater Los Angeles area for
              over 20 years. We bring the fiesta to you.
            </p>
            <p className="text-amber/80 font-heading text-lg italic">
              &ldquo;Aquí la panza es primero.&rdquo;
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-cream font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/services", label: "Services & Pricing" },
                { href: "/included", label: "What's Included" },
                { href: "/meats", label: "Meats" },
                { href: "/extras", label: "Extras" },
                { href: "/gallery", label: "Gallery" },
                { href: "/booking", label: "Book Now" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/50 hover:text-amber transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-cream font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact Us
            </h4>
            <div className="space-y-3 text-sm">
              <a
                href="tel:+15622359361"
                className="block text-cream/50 hover:text-amber transition-colors"
              >
                (562) 235-9361
              </a>
              <a
                href="tel:+15627463998"
                className="block text-cream/50 hover:text-amber transition-colors"
              >
                (562) 746-3998
              </a>
              <p className="text-cream/50">Greater Los Angeles Area</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-amber/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/30 text-xs">
            &copy; {new Date().getFullYear()} México Lindo Y Que Rico. All
            rights reserved.
          </p>
          <p className="text-cream/30 text-xs">
            Serving LA with love for 20+ years
          </p>
        </div>
      </div>
    </footer>
  );
}
