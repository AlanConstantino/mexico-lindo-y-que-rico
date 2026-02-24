import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const twoHour = [
  { guests: 25, price: "$395" },
  { guests: 50, price: "$495" },
  { guests: 75, price: "$595" },
];

const threeHour = [
  { guests: 100, price: "$695" },
  { guests: 125, price: "$795" },
  { guests: 150, price: "$895" },
  { guests: 175, price: "$995" },
  { guests: 200, price: "$1,095" },
];

const includedKeys = [
  "tortillas",
  "sauces",
  "garnish",
  "plates",
  "forks",
  "drinks",
] as const;

function PricingCard({
  guests,
  price,
  featured,
  upToLabel,
  guestsLabel,
  popularLabel,
  bookLabel,
}: {
  guests: number;
  price: string;
  featured?: boolean;
  upToLabel: string;
  guestsLabel: string;
  popularLabel: string;
  bookLabel: string;
}) {
  return (
    <div
      className={`reveal relative group rounded-2xl p-4 sm:p-8 transition-all duration-500 hover:-translate-y-1 ${
        featured
          ? "bg-gradient-to-b from-amber/15 to-amber/5 border border-amber/30 shadow-lg shadow-amber/10"
          : "bg-navy-light/40 border border-cream/5 hover:border-amber/20"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 bg-amber text-navy text-xs font-bold uppercase tracking-wider rounded-full">
            {popularLabel}
          </span>
        </div>
      )}

      <div className="text-center">
        <p className="text-cream/40 text-xs uppercase tracking-wider mb-3">
          {upToLabel}
        </p>
        <p className="font-heading text-3xl sm:text-5xl text-amber mb-1">{guests}</p>
        <p className="text-cream/40 text-xs uppercase tracking-wider mb-6">
          {guestsLabel}
        </p>

        {/* Divider */}
        <div className="w-12 h-px bg-amber/20 mx-auto mb-6" />

        <p className="text-xl sm:text-3xl font-bold text-cream mb-4 sm:mb-8">{price}</p>

        <Link
          href="/booking"
          className={`block w-full py-2 sm:py-3 rounded-full font-medium text-xs sm:text-sm tracking-wide transition-all duration-500 hover:scale-105 active:scale-95 ${
            featured
              ? "bg-amber text-navy hover:bg-amber-light hover:shadow-lg hover:shadow-amber/20"
              : "border border-amber/30 text-amber hover:border-amber hover:bg-amber/5"
          }`}
        >
          {bookLabel}
        </Link>
      </div>
    </div>
  );
}

export default function Packages() {
  const t = useTranslations("packages");

  return (
    <section id="packages" className="relative py-16 sm:py-32 lg:py-40">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,162,78,0.04),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-20 reveal">
          <p className="text-amber text-xs uppercase tracking-[0.3em] mb-4 font-medium">
            {t("label")}
          </p>
          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-cream mb-6">
            {t("heading")}
          </h2>
          <p className="text-cream/50 text-base max-w-xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* 2-Hour Service */}
        <div className="mb-12 sm:mb-24">
          <div className="text-center mb-12 reveal">
            <h3 className="font-heading text-3xl text-cream mb-2">
              {t("twoHour")}
            </h3>
            <p className="text-cream/40 text-sm">
              {t("twoHourSub")}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto stagger-children">
            {twoHour.map((pkg, i) => (
              <PricingCard
                key={pkg.guests}
                guests={pkg.guests}
                price={pkg.price}
                featured={i === 1}
                upToLabel={t("upTo")}
                guestsLabel={t("guests")}
                popularLabel={t("popular")}
                bookLabel={t("bookPackage")}
              />
            ))}
          </div>
        </div>

        {/* 3-Hour Service */}
        <div className="mb-10 sm:mb-20">
          <div className="text-center mb-12 reveal">
            <h3 className="font-heading text-3xl text-cream mb-2">
              {t("threeHour")}
            </h3>
            <p className="text-cream/40 text-sm">
              {t("threeHourSub")}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-5xl mx-auto stagger-children">
            {threeHour.map((pkg, i) => (
              <PricingCard
                key={pkg.guests}
                guests={pkg.guests}
                price={pkg.price}
                featured={i === 2}
                upToLabel={t("upTo")}
                guestsLabel={t("guests")}
                popularLabel={t("popular")}
                bookLabel={t("bookPackage")}
              />
            ))}
          </div>
        </div>

        {/* Extra hour + Included */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Extra hour */}
          <div className="reveal p-8 rounded-2xl bg-teal/10 border border-teal/20">
            <p className="text-teal-light text-xs uppercase tracking-[0.2em] mb-3 font-medium">
              {t("moreTimeLabel")}
            </p>
            <p className="text-cream text-lg mb-2">
              {t("moreTimeText")}{" "}
              <span className="text-amber font-bold">{t("moreTimePrice")}</span>
            </p>
            <p className="text-cream/40 text-sm">
              {t("moreTimeNote")}
            </p>
          </div>

          {/* What's included */}
          <div className="reveal p-8 rounded-2xl bg-navy-light/40 border border-cream/5">
            <p className="text-amber text-xs uppercase tracking-[0.2em] mb-4 font-medium">
              {t("includesLabel")}
            </p>
            <ul className="space-y-2.5">
              {includedKeys.map((key) => (
                <li key={key} className="flex items-center gap-3 text-cream/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber/60 shrink-0" />
                  {t(`included.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
