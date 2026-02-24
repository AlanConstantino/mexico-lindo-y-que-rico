const meats = [
  {
    name: "Asada",
    description: "Grilled marinated beef, charred to perfection with a smoky, savory depth",
  },
  {
    name: "Pastor",
    description: "Slow-roasted pork with pineapple, achiote, and dried chilies",
  },
  {
    name: "Chicken",
    description: "Tender, seasoned chicken grilled and hand-pulled for the perfect taco",
  },
  {
    name: "Chorizo",
    description: "Spiced Mexican sausage, crumbled and crisped with bold, smoky flavor",
  },
  {
    name: "Fish Fillet",
    description: "Lightly seasoned white fish, grilled until golden and flaky",
  },
  {
    name: "Shrimp Fajitas",
    description: "Sautéed shrimp with peppers and onions in a zesty citrus marinade",
  },
  {
    name: "Veggies",
    description: "Grilled seasonal vegetables with Mexican herbs and a touch of lime",
  },
  {
    name: "Alambres",
    description: "Chopped beef with bacon, peppers, onions, and melted cheese",
  },
];

export default function Menu() {
  return (
    <section id="menu" className="relative py-32 lg:py-40">
      {/* Background accent */}
      <div className="absolute inset-0 bg-navy-light/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/20 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20 reveal">
          <p className="text-amber text-xs uppercase tracking-[0.3em] mb-4 font-medium">
            Choose Four
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-cream mb-6">
            The Menu
          </h2>
          <p className="text-cream/50 text-base max-w-xl mx-auto leading-relaxed">
            Select four proteins for your event. Each one prepared fresh on-site,
            exactly the way it should be.
          </p>
        </div>

        {/* Menu grid — restaurant-style */}
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 stagger-children">
          {meats.map((meat, index) => (
            <div
              key={meat.name}
              className="reveal group flex items-start gap-5 pb-10 border-b border-amber/10 last:border-0"
            >
              {/* Number */}
              <span className="text-amber/20 font-heading text-5xl leading-none mt-1 group-hover:text-amber/40 transition-colors duration-500">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h3 className="font-heading text-2xl text-cream group-hover:text-amber transition-colors duration-500">
                    {meat.name}
                  </h3>
                  {/* Dotted line connector */}
                  <div className="flex-1 border-b border-dotted border-cream/10 mb-1" />
                </div>
                <p className="text-cream/40 text-sm leading-relaxed">
                  {meat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
