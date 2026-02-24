import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services & Pricing | México Lindo Y Que Rico",
  description:
    "Taco catering packages for 25 to 200+ guests. 2-hour and 3-hour service options with competitive pricing.",
};

const twoHourPackages = [
  { guests: 25, price: "$395" },
  { guests: 50, price: "$495" },
  { guests: 75, price: "$595" },
];

const threeHourPackages = [
  { guests: 100, price: "$695" },
  { guests: 125, price: "$795" },
  { guests: 150, price: "$895" },
  { guests: 175, price: "$995" },
  { guests: 200, price: "$1,095" },
];

function PricingCard({
  guests,
  price,
  popular,
}: {
  guests: number;
  price: string;
  popular?: boolean;
}) {
  return (
    <div
      className={`relative group p-8 rounded-2xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
        popular
          ? "bg-amber/10 border-amber/30 hover:border-amber hover:shadow-amber/10"
          : "bg-navy-light/50 border-amber/5 hover:border-amber/20 hover:shadow-amber/5"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber text-navy text-xs font-bold rounded-full uppercase tracking-wider">
          Popular
        </div>
      )}
      <div className="text-center">
        <p className="text-cream/50 text-sm uppercase tracking-wider mb-2">
          Up to
        </p>
        <p className="font-heading text-5xl text-amber mb-1">{guests}</p>
        <p className="text-cream/50 text-sm mb-6">guests</p>
        <p className="text-3xl font-bold text-cream mb-8">{price}</p>
        <Link
          href="/booking"
          className={`block w-full py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
            popular
              ? "bg-amber text-navy hover:bg-amber-light"
              : "border-2 border-amber/30 text-amber hover:border-amber hover:bg-amber/5"
          }`}
        >
          Book This Package
        </Link>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="pt-28 pb-20">
      {/* Hero */}
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            title="Services & Pricing"
            subtitle="Simple, transparent pricing for every size event. Choose the package that fits your party."
          />
        </div>
      </section>

      {/* 2-Hour Packages */}
      <section className="px-4 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="font-heading text-3xl text-cream mb-2">
              2-Hour Service
            </h3>
            <p className="text-cream/50">Perfect for intimate gatherings</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {twoHourPackages.map((pkg, i) => (
              <PricingCard
                key={pkg.guests}
                guests={pkg.guests}
                price={pkg.price}
                popular={i === 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3-Hour Packages */}
      <section className="px-4 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="font-heading text-3xl text-cream mb-2">
              3-Hour Service
            </h3>
            <p className="text-cream/50">Ideal for larger celebrations</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {threeHourPackages.map((pkg, i) => (
              <PricingCard
                key={pkg.guests}
                guests={pkg.guests}
                price={pkg.price}
                popular={i === 2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Extra Hour Note */}
      <section className="px-4 mb-20">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl bg-teal/10 border border-teal/20 text-center">
            <p className="text-cream/80 text-lg mb-2">
              Need more time? Add an extra hour for just{" "}
              <span className="text-amber font-bold">$40</span>
            </p>
            <p className="text-cream/50 text-sm">
              We arrive 1 hour early for setup — this does not count toward your
              service time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="font-heading text-3xl text-amber mb-4">
            Not sure which package?
          </h3>
          <p className="text-cream/50 mb-8">
            Give us a call and we&apos;ll help you find the perfect fit for your
            event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15622359361"
              className="px-8 py-3 bg-amber text-navy font-bold rounded-full hover:bg-amber-light transition-all duration-300 hover:scale-105"
            >
              Call (562) 235-9361
            </a>
            <Link
              href="/booking"
              className="px-8 py-3 border-2 border-amber/30 text-amber font-semibold rounded-full hover:border-amber transition-all"
            >
              Book Online
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
