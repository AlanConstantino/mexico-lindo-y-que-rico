import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const navLinks = [
    { label: tNav("about"), href: "#about" },
    { label: tNav("menu"), href: "#menu" },
    { label: tNav("packages"), href: "#packages" },
    { label: tNav("gallery"), href: "#gallery" },
    { label: tNav("contact"), href: "#contact" },
    { label: tNav("bookNow"), href: "/booking" },
  ];

  return (
    <footer className="relative bg-navy-dark py-16 border-t border-cream/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <p className="font-heading text-3xl text-cream mb-3">
              México Lindo<br />
              <span className="text-amber">Y Que Rico</span>
            </p>
            <p className="text-cream/30 text-sm leading-relaxed mt-4">
              {t("description")}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-cream/30 text-xs uppercase tracking-[0.2em] mb-5">
              {t("navigate")}
            </p>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("#") ? (
                    <a
                      href={link.href}
                      className="text-cream/50 hover:text-amber transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-cream/50 hover:text-amber transition-colors duration-300 text-sm"
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
              {t("contact")}
            </p>
            <div className="space-y-3">
              <a
                href="tel:+15622359361"
                className="block text-cream/50 hover:text-amber transition-colors duration-300 text-sm"
              >
                (562) 235-9361
              </a>
              <a
                href="tel:+15627463998"
                className="block text-cream/50 hover:text-amber transition-colors duration-300 text-sm"
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
        <div className="pt-8 border-t border-cream/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/20 text-xs">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-cream/20 text-xs italic font-heading text-base">
            &ldquo;{t("tagline")}&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
