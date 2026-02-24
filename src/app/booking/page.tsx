import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Event | México Lindo Y Que Rico",
  description:
    "Book your taco catering event online. Select your package, meats, and extras.",
};

export default function BookingPage() {
  return (
    <div className="pt-28 pb-20">
      <section className="px-4 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            title="Book Your Event"
            subtitle="Our online booking system is coming soon. In the meantime, give us a call to reserve your date."
          />
        </div>
      </section>

      {/* Coming Soon Card */}
      <section className="px-4 mb-20">
        <div className="max-w-2xl mx-auto">
          <div className="p-12 rounded-2xl bg-navy-light/50 border border-amber/10 text-center relative overflow-hidden">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 shimmer" />

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center mx-auto mb-8">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="font-heading text-3xl text-amber mb-4">
                Online Booking Coming Soon
              </h3>
              <p className="text-cream/50 text-lg mb-8 max-w-md mx-auto">
                We&apos;re building a seamless booking experience for you.
                Select your date, package, meats, extras, and pay — all in one
                place.
              </p>

              {/* Preview of what's coming */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {[
                  { step: "1", label: "Pick Date" },
                  { step: "2", label: "Choose Package" },
                  { step: "3", label: "Select Meats" },
                  { step: "4", label: "Pay & Confirm" },
                ].map((s) => (
                  <div
                    key={s.step}
                    className="p-4 rounded-xl bg-navy/50 border border-amber/5"
                  >
                    <p className="font-heading text-2xl text-amber mb-1">
                      {s.step}
                    </p>
                    <p className="text-cream/40 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Call to action - phone */}
              <div className="space-y-4">
                <p className="text-cream/40 text-sm uppercase tracking-wider">
                  Book by phone today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:+15622359361"
                    className="px-8 py-4 bg-amber text-navy font-bold text-lg rounded-full hover:bg-amber-light transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-amber/25"
                  >
                    Call (562) 235-9361
                  </a>
                  <a
                    href="tel:+15627463998"
                    className="px-8 py-4 border-2 border-amber/30 text-amber font-semibold text-lg rounded-full hover:border-amber hover:bg-amber/5 transition-all duration-300"
                  >
                    (562) 746-3998
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-navy-light/30 border border-amber/5 text-center">
              <p className="text-amber font-heading text-xl mb-2">
                Packages from
              </p>
              <p className="text-cream text-2xl font-bold">$395</p>
              <p className="text-cream/40 text-sm mt-1">for 25 guests</p>
            </div>
            <div className="p-6 rounded-2xl bg-navy-light/30 border border-amber/5 text-center">
              <p className="text-amber font-heading text-xl mb-2">
                Up to
              </p>
              <p className="text-cream text-2xl font-bold">200+ Guests</p>
              <p className="text-cream/40 text-sm mt-1">3-hour service</p>
            </div>
            <div className="p-6 rounded-2xl bg-navy-light/30 border border-amber/5 text-center">
              <p className="text-amber font-heading text-xl mb-2">
                Choose from
              </p>
              <p className="text-cream text-2xl font-bold">8 Meats</p>
              <p className="text-cream/40 text-sm mt-1">
                <Link
                  href="/meats"
                  className="text-amber/60 hover:text-amber transition-colors"
                >
                  View all meats →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
