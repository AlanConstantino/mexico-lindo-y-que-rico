import SectionHeading from "@/components/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meats | México Lindo Y Que Rico",
  description:
    "Choose 4 meats for your taco catering — asada, pastor, chicken, chorizo, fish, shrimp, veggies, and alambres.",
};

const meats = [
  {
    name: "Asada",
    description:
      "Tender, marinated carne asada grilled to perfection. A crowd favorite with smoky, savory flavors.",
    tag: "Fan Favorite",
  },
  {
    name: "Pastor",
    description:
      "Trompo-style marinated pork with pineapple, achiote, and traditional spices. Sweet, tangy, and unforgettable.",
    tag: "Signature",
  },
  {
    name: "Chicken",
    description:
      "Juicy, seasoned chicken grilled and chopped fresh. Light, flavorful, and perfect for everyone.",
    tag: null,
  },
  {
    name: "Chorizo",
    description:
      "Authentic Mexican chorizo with bold, spicy flavors. Cooked fresh on the grill for maximum flavor.",
    tag: null,
  },
  {
    name: "Fish Fillet",
    description:
      "Lightly seasoned fish fillet, grilled or fried to golden perfection. Great for Baja-style tacos.",
    tag: "Seafood",
  },
  {
    name: "Shrimp Fajitas",
    description:
      "Succulent shrimp sautéed with bell peppers and onions. A premium option your guests will love.",
    tag: "Premium",
  },
  {
    name: "Veggies",
    description:
      "Grilled seasonal vegetables with Mexican spices. A delicious option for vegetarian guests.",
    tag: "Vegetarian",
  },
  {
    name: "Alambres",
    description:
      "A hearty mix of chopped steak, bacon, peppers, onions, and melted cheese. Rich and indulgent.",
    tag: "Indulgent",
  },
];

export default function MeatsPage() {
  return (
    <div className="pt-28 pb-20">
      <section className="px-4 mb-6">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            title="Choose Your Meats"
            subtitle="Select 4 meats for your event. Every option is prepared fresh on-site by our skilled taqueros."
          />
        </div>
      </section>

      {/* Choose 4 Badge */}
      <section className="px-4 mb-16">
        <div className="max-w-xs mx-auto">
          <div className="text-center py-3 px-6 rounded-full bg-amber/10 border border-amber/20">
            <p className="text-amber font-semibold">
              Pick any <span className="text-2xl font-heading">4</span> meats
            </p>
          </div>
        </div>
      </section>

      {/* Meat Cards */}
      <section className="px-4 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {meats.map((meat, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-navy-light/50 border border-amber/5 hover:border-amber/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber/5 overflow-hidden"
              >
                {meat.tag && (
                  <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-terracotta/20 text-terracotta-light font-medium">
                    {meat.tag}
                  </span>
                )}
                <h3 className="font-heading text-2xl text-amber mb-3 mt-2">
                  {meat.name}
                </h3>
                <p className="text-cream/50 text-sm leading-relaxed">
                  {meat.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-terracotta via-amber to-terracotta opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-cream/40 text-sm">
            All meats are prepared fresh at your event using traditional Mexican
            recipes and the highest quality ingredients.
          </p>
        </div>
      </section>
    </div>
  );
}
