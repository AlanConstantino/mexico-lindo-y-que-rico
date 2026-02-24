import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | México Lindo Y Que Rico",
  description:
    "Get in touch with México Lindo Y Que Rico for taco catering in the greater Los Angeles area.",
};

export default function ContactPage() {
  return (
    <div className="pt-28 pb-20">
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            title="Get in Touch"
            subtitle="We'd love to hear from you. Reach out to discuss your next event or ask any questions."
          />
        </div>
      </section>

      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Phone Cards */}
            <a
              href="tel:+15622359361"
              className="group p-8 rounded-2xl bg-navy-light/50 border border-amber/5 hover:border-amber/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber/5 text-center"
            >
              <div className="text-4xl mb-4">📞</div>
              <p className="text-cream/50 text-sm uppercase tracking-wider mb-2">
                Primary Line
              </p>
              <p className="font-heading text-3xl text-amber group-hover:text-amber-light transition-colors">
                (562) 235-9361
              </p>
              <p className="text-cream/30 text-sm mt-3">Tap to call</p>
            </a>

            <a
              href="tel:+15627463998"
              className="group p-8 rounded-2xl bg-navy-light/50 border border-amber/5 hover:border-amber/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber/5 text-center"
            >
              <div className="text-4xl mb-4">📱</div>
              <p className="text-cream/50 text-sm uppercase tracking-wider mb-2">
                Secondary Line
              </p>
              <p className="font-heading text-3xl text-amber group-hover:text-amber-light transition-colors">
                (562) 746-3998
              </p>
              <p className="text-cream/30 text-sm mt-3">Tap to call</p>
            </a>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="p-10 rounded-2xl bg-navy-light/50 border border-amber/5 text-center">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="font-heading text-2xl text-amber mb-3">
              Service Area
            </h3>
            <p className="text-cream/60 text-lg mb-2">
              Greater Los Angeles Area
            </p>
            <p className="text-cream/40 text-sm max-w-lg mx-auto">
              We bring the full catering experience to you — homes, venues,
              parks, offices, and anywhere your event takes place across the LA
              area.
            </p>
          </div>
        </div>
      </section>

      {/* Hours & Availability */}
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-navy-light/50 border border-amber/5 text-center">
              <div className="text-4xl mb-4">🕐</div>
              <h3 className="font-heading text-xl text-cream mb-3">
                Availability
              </h3>
              <p className="text-cream/50">
                We cater events 7 days a week. Book early to secure your
                preferred date — we fill up fast!
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-navy-light/50 border border-amber/5 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-heading text-xl text-cream mb-3">
                Minimum Notice
              </h3>
              <p className="text-cream/50">
                We require at least 3 days advance notice for bookings. For best
                availability, book 2+ weeks ahead.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-teal/10 to-amber/5 border border-teal/20">
            <h3 className="font-heading text-3xl text-amber mb-4">
              Ready to Book?
            </h3>
            <p className="text-cream/50 mb-8">
              Skip the call — book your taco catering online in just a few
              minutes.
            </p>
            <Link
              href="/booking"
              className="inline-block px-10 py-4 bg-amber text-navy font-bold text-lg rounded-full hover:bg-amber-light transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-amber/25"
            >
              Book Your Event
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
