import SectionHeading from "@/components/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's Included | México Lindo Y Que Rico",
  description:
    "Everything included with your taco catering package — tortillas, salsas, sides, drinks, plates, and more.",
};

const includedItems = [
  {
    icon: "🫓",
    title: "Corn Tortillas",
    description: "Fresh, warm corn tortillas made throughout your event.",
  },
  {
    icon: "🌶️",
    title: "Red & Green Hot Sauce",
    description:
      "Our signature homemade salsas — from mild to fiery. Something for every palate.",
  },
  {
    icon: "🥬",
    title: "Fresh Toppings",
    description:
      "Crisp radishes, fresh onion & cilantro, and freshly cut lemons.",
  },
  {
    icon: "🍽️",
    title: "Plates & Napkins",
    description: "Everything your guests need — plates, napkins, and utensils.",
  },
  {
    icon: "🍚",
    title: "Rice & Beans",
    description:
      "Authentic Mexican rice and refried beans served alongside your tacos.",
  },
  {
    icon: "🥤",
    title: "Aguas Frescas",
    description:
      "Refreshing drinks with cups and ice included. Choose from horchata, jamaica, and more.",
  },
];

export default function IncludedPage() {
  return (
    <div className="pt-28 pb-20">
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            title="What's Included"
            subtitle="Every package comes loaded with everything you need for an amazing taco experience."
          />
        </div>
      </section>

      <section className="px-4 mb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {includedItems.map((item, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-navy-light/50 border border-amber/5 hover:border-amber/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber/5"
              >
                <div className="text-5xl mb-5">{item.icon}</div>
                <h3 className="font-heading text-2xl text-cream mb-3">
                  {item.title}
                </h3>
                <p className="text-cream/50 leading-relaxed">
                  {item.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber/0 via-amber/30 to-amber/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-Service Note */}
      <section className="px-4">
        <div className="max-w-3xl mx-auto">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-teal/10 to-amber/5 border border-teal/20 text-center">
            <h3 className="font-heading text-3xl text-amber mb-4">
              Full-Service Experience
            </h3>
            <p className="text-cream/60 text-lg leading-relaxed">
              We arrive one hour before your event to set up everything. Our
              team handles all the cooking, serving, and cleanup — you just
              enjoy the party.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
