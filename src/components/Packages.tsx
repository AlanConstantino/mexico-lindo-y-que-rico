import Link from "next/link";

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

const included = [
  "Corn Tortillas",
  "Red & Green Hot Sauce",
  "Radishes, Onion & Cilantro, Lemons",
  "Plates & Napkins",
  "Forks with Rice and Beans",
  "Cups, Ice & Aguas Frescas",
];

function PricingCard({
  guests,
  price,
  featured,
}: {
  guests: number;
  price: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`reveal relative group rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 ${
        featured
          ? "bg-gradient-to-b from-amber/15 to-amber/5 border border-amber/30 shadow-lg shadow-amber/10"
          : "bg-navy-light/40 border border-cream/5 hover:border-amber/20"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 bg-amber text-navy text-xs font-bold uppercase tracking-wider rounded-full">
            Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <p className="text-cream/40 text-xs uppercase tracking-wider mb-3">
          Up to
        </p>
        <p className="font-heading text-5xl text-amber mb-1">{guests}</p>
        <p className="text-cream/40 text-xs uppercase tracking-wider mb-6">
          Guests
        </p>

        {/* Divider */}
        <div className="w-12 h-px bg-amber/20 mx-auto mb-6" />

        <p className="text-3xl font-bold text-cream mb-8">{price}</p>

        <Link
          href="/booking"
          className={`block w-full py-3 rounded-full font-medium text-sm tracking-wide transition-all duration-500 hover:scale-105 active:scale-95 ${
            featured
              ? "bg-amber text-navy hover:bg-amber-light hover:shadow-lg hover:shadow-amber/20"
              : "border border-amber/30 text-amber hover:border-amber hover:bg-amber/5"
          }`}
        >
          Book This Package
        </Link>
      </div>
    </div>
  );
}

export default function Packages() {
  return (
    <section id="packages" className="relative py-32 lg:py-40">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,162,78,0.04),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20 reveal">
          <p className="text-amber text-xs uppercase tracking-[0.3em] mb-4 font-medium">
            Transparent Pricing
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-cream mb-6">
            Catering Packages
          </h2>
          <p className="text-cream/50 text-base max-w-xl mx-auto leading-relaxed">
            Simple pricing for every celebration. Every package includes
            four meats of your choice and all the essentials.
          </p>
        </div>

        {/* 2-Hour Service */}
        <div className="mb-24">
          <div className="text-center mb-12 reveal">
            <h3 className="font-heading text-3xl text-cream mb-2">
              2-Hour Service
            </h3>
            <p className="text-cream/40 text-sm">
              Perfect for intimate gatherings
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto stagger-children">
            {twoHour.map((pkg, i) => (
              <PricingCard
                key={pkg.guests}
                guests={pkg.guests}
                price={pkg.price}
                featured={i === 1}
              />
            ))}
          </div>
        </div>

        {/* 3-Hour Service */}
        <div className="mb-20">
          <div className="text-center mb-12 reveal">
            <h3 className="font-heading text-3xl text-cream mb-2">
              3-Hour Service
            </h3>
            <p className="text-cream/40 text-sm">
              Ideal for larger celebrations
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-children">
            {threeHour.map((pkg, i) => (
              <PricingCard
                key={pkg.guests}
                guests={pkg.guests}
                price={pkg.price}
                featured={i === 2}
              />
            ))}
          </div>
        </div>

        {/* Extra hour + Included */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Extra hour */}
          <div className="reveal p-8 rounded-2xl bg-teal/10 border border-teal/20">
            <p className="text-teal-light text-xs uppercase tracking-[0.2em] mb-3 font-medium">
              Need More Time?
            </p>
            <p className="text-cream text-lg mb-2">
              Add an extra hour for just{" "}
              <span className="text-amber font-bold">$40</span>
            </p>
            <p className="text-cream/40 text-sm">
              We arrive 1 hour early for setup — this does not count toward
              your service time.
            </p>
          </div>

          {/* What's included */}
          <div className="reveal p-8 rounded-2xl bg-navy-light/40 border border-cream/5">
            <p className="text-amber text-xs uppercase tracking-[0.2em] mb-4 font-medium">
              Every Package Includes
            </p>
            <ul className="space-y-2.5">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-3 text-cream/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber/60 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
