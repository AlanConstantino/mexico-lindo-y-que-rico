import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extras | México Lindo Y Que Rico",
  description:
    "Add extras to your taco catering — guacamole, quesadillas, aguas frescas, salads, and more.",
};

const extras = [
  { item: "Rice", price: "$40", serves: "40-50 people", icon: "🍚" },
  { item: "Beans", price: "$40", serves: "40-50 people", icon: "🫘" },
  {
    item: "Quesadillas",
    price: "$30",
    serves: "40-50 people",
    icon: "🧀",
    note: "Flour Tortilla",
  },
  {
    item: "Jalapeños & Grilled Onions",
    price: "$20",
    serves: "40-50 people",
    icon: "🌶️",
  },
  {
    item: "Fresh Guacamole & Chips",
    price: "$40",
    serves: "40-50 people",
    icon: "🥑",
  },
  {
    item: "Fresh Salsa & Chips",
    price: "$40",
    serves: "40-50 people",
    icon: "🍅",
  },
  {
    item: "Agua Fresca",
    price: "$25",
    serves: "40-50 people",
    icon: "🥤",
    note: "Horchata, Jamaica, Lemon, Pineapple, Tamarindo, Melon",
  },
  { item: "Salad", price: "$30", serves: "40-50 people", icon: "🥗" },
  {
    item: "Cheeseburgers",
    price: "$4 each",
    serves: "Per person",
    icon: "🍔",
  },
  { item: "Hot Dogs", price: "$2 each", serves: "Per person", icon: "🌭" },
];

export default function ExtrasPage() {
  return (
    <div className="pt-28 pb-20">
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            title="Extras"
            subtitle="Take your event to the next level with our add-on options. Each serving feeds 40-50 people unless noted."
          />
        </div>
      </section>

      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {extras.map((extra, i) => (
              <div
                key={i}
                className="group flex items-start gap-4 p-6 rounded-2xl bg-navy-light/50 border border-amber/5 hover:border-amber/20 transition-all duration-300 hover:shadow-lg hover:shadow-amber/5"
              >
                <span className="text-3xl shrink-0 mt-1">{extra.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="font-heading text-xl text-cream">
                      {extra.item}
                    </h3>
                    <span className="text-amber font-bold text-lg shrink-0">
                      {extra.price}
                    </span>
                  </div>
                  <p className="text-cream/40 text-sm">{extra.serves}</p>
                  {extra.note && (
                    <p className="text-cream/30 text-xs mt-1 italic">
                      {extra.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-amber/5 to-terracotta/5 border border-amber/10">
            <h3 className="font-heading text-3xl text-amber mb-4">
              Add Extras to Your Booking
            </h3>
            <p className="text-cream/50 mb-8">
              Customize your event with any combination of extras when you book.
            </p>
            <Link
              href="/booking"
              className="inline-block px-10 py-4 bg-amber text-navy font-bold rounded-full hover:bg-amber-light transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Your Booking
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
