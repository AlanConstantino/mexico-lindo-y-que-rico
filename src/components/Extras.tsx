const extras = [
  { item: "Rice", price: "$40", serves: "40–50" },
  { item: "Beans", price: "$40", serves: "40–50" },
  { item: "Quesadillas (Flour Tortilla)", price: "$30", serves: "40–50" },
  { item: "Jalapeños & Grilled Onions", price: "$20", serves: "40–50" },
  { item: "Fresh Guacamole & Chips", price: "$40", serves: "40–50" },
  { item: "Fresh Salsa & Chips", price: "$40", serves: "40–50" },
  { item: "Agua Fresca", price: "$25", serves: "40–50", note: "Horchata, Jamaica, Lemon, Pineapple, Tamarindo, Melon" },
  { item: "Salad", price: "$30", serves: "40–50" },
  { item: "Cheeseburgers", price: "$4 each", serves: "per unit" },
  { item: "Hot Dogs", price: "$2 each", serves: "per unit" },
];

export default function Extras() {
  return (
    <section className="relative py-32 lg:py-40">
      <div className="absolute inset-0 bg-navy-light/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/20 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <p className="text-terracotta text-xs uppercase tracking-[0.3em] mb-4 font-medium">
            Add-Ons
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl text-cream mb-6">
            Extras
          </h2>
          <p className="text-cream/50 text-base max-w-lg mx-auto leading-relaxed">
            Complement your taco spread. Each item serves 40–50 people
            unless noted otherwise.
          </p>
        </div>

        {/* Extras list */}
        <div className="space-y-0 stagger-children">
          {extras.map((extra) => (
            <div
              key={extra.item}
              className="reveal group flex items-center justify-between py-5 border-b border-cream/5 hover:border-amber/15 transition-colors duration-300"
            >
              <div className="flex-1 min-w-0">
                <p className="text-cream group-hover:text-amber transition-colors duration-300 text-base font-medium">
                  {extra.item}
                </p>
                {extra.note && (
                  <p className="text-cream/30 text-xs mt-1">{extra.note}</p>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <span className="text-cream/30 text-xs hidden sm:block">
                  {extra.serves === "per unit" ? "Per unit" : `Serves ${extra.serves}`}
                </span>
                <span className="text-amber font-semibold text-lg">
                  {extra.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
