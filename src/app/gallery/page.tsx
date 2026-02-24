import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | México Lindo Y Que Rico",
  description:
    "See our taco catering in action — photos of our food, setup, and events across Los Angeles.",
};

export default function GalleryPage() {
  return (
    <div className="pt-28 pb-20">
      <section className="px-4 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            title="Gallery"
            subtitle="A taste of what we bring to every event. Real food, real events, real flavor."
          />
        </div>
      </section>

      {/* Photo Grid */}
      <section className="px-4 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spread Image - Large */}
            <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden md:col-span-2">
              <Image
                src="/images/spread.jpg"
                alt="Full taco catering spread with all the fixings"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="font-heading text-2xl text-amber mb-2">
                  The Full Spread
                </h3>
                <p className="text-cream/70">
                  Everything set up and ready to serve at a private event.
                </p>
              </div>
            </div>

            {/* Tacos Image */}
            <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/tacos.jpg"
                alt="Close-up of authentic Mexican tacos"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="font-heading text-2xl text-amber mb-2">
                  Fresh Tacos
                </h3>
                <p className="text-cream/70">
                  Made to order with the freshest ingredients.
                </p>
              </div>
            </div>

            {/* Placeholder for more photos */}
            <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy-light/50 border-2 border-dashed border-amber/10 flex items-center justify-center">
              <div className="text-center p-8">
                <p className="text-4xl mb-4">📸</p>
                <p className="font-heading text-xl text-amber/60 mb-2">
                  More Photos Coming Soon
                </p>
                <p className="text-cream/30 text-sm">
                  Follow us on social media for the latest
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="px-4">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="relative">
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-6xl text-amber/20 font-serif">
              &ldquo;
            </span>
            <p className="text-cream/70 text-xl italic leading-relaxed mt-8 mb-4">
              The food was absolutely incredible. Our guests couldn&apos;t stop
              raving about the tacos. Que Rico made our wedding reception
              unforgettable!
            </p>
            <p className="text-amber/60 text-sm uppercase tracking-wider">
              — Happy Customer, Los Angeles
            </p>
          </blockquote>
        </div>
      </section>
    </div>
  );
}
