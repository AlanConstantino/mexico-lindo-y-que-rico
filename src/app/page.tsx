import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/tacos.jpg"
          alt="Authentic Mexican tacos"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="animate-fade-in text-amber/80 text-sm uppercase tracking-[0.3em] mb-6 font-medium">
          Authentic Taco Catering &bull; Los Angeles
        </p>
        <h1 className="animate-fade-in-up font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream mb-6 leading-tight">
          México Lindo
          <br />
          <span className="text-amber">Y Que Rico</span>
        </h1>
        <p className="animate-fade-in-up animate-delay-200 text-xl md:text-2xl text-cream/70 font-heading italic mb-4">
          &ldquo;Aquí la panza es primero.&rdquo;
        </p>
        <p className="animate-fade-in-up animate-delay-300 text-cream/50 text-lg mb-10 max-w-xl mx-auto">
          Bringing the flavors of Mexico to your next event. Serving the greater
          LA area with love for over 20 years.
        </p>
        <div className="animate-fade-in-up animate-delay-400 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/booking"
            className="px-10 py-4 bg-amber text-navy font-bold text-lg rounded-full hover:bg-amber-light transition-all duration-300 hover:shadow-xl hover:shadow-amber/25 hover:scale-105 active:scale-95"
          >
            Book Your Event
          </Link>
          <Link
            href="/services"
            className="px-10 py-4 border-2 border-cream/30 text-cream font-semibold text-lg rounded-full hover:border-amber hover:text-amber transition-all duration-300 hover:scale-105 active:scale-95"
          >
            View Pricing
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-cream/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-amber rounded-full" />
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection() {
  const features = [
    {
      icon: "🔥",
      title: "20+ Years of Flavor",
      description:
        "Two decades of perfecting our craft, serving thousands of events across Los Angeles.",
    },
    {
      icon: "🌮",
      title: "Fresh & Authentic",
      description:
        "Everything prepared fresh on-site with authentic Mexican recipes passed down through generations.",
    },
    {
      icon: "🎉",
      title: "Full-Service Catering",
      description:
        "From setup to cleanup, we handle everything so you can enjoy your event stress-free.",
    },
    {
      icon: "💰",
      title: "Unbeatable Value",
      description:
        "Premium catering at prices that make sense. Packages starting at just $395 for 25 guests.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-navy">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="Why Choose Us"
          subtitle="We don't just cater — we create unforgettable experiences"
        />
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl bg-navy-light/50 border border-amber/5 hover:border-amber/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber/5"
            >
              <div className="text-4xl mb-5">{feature.icon}</div>
              <h3 className="font-heading text-xl text-cream mb-3">
                {feature.title}
              </h3>
              <p className="text-cream/50 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-terracotta/20 via-amber/10 to-teal/20" />
      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="font-heading text-4xl md:text-5xl text-amber mb-6">
          Ready to Bring the Fiesta?
        </h2>
        <p className="text-cream/60 text-lg mb-10 max-w-2xl mx-auto">
          Whether it&apos;s a birthday, wedding, corporate event, or backyard
          party — we&apos;ll make it one to remember. Book your taco catering
          today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/booking"
            className="px-10 py-4 bg-amber text-navy font-bold text-lg rounded-full hover:bg-amber-light transition-all duration-300 hover:shadow-xl hover:shadow-amber/25 hover:scale-105 active:scale-95"
          >
            Book Now
          </Link>
          <Link
            href="/contact"
            className="px-10 py-4 border-2 border-amber/30 text-amber font-semibold text-lg rounded-full hover:border-amber hover:bg-amber/5 transition-all duration-300"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhyChooseUsSection />
      <CTASection />
    </>
  );
}
