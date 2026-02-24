import Image from "next/image";

const meats = [
  {
    name: "Asada",
    description: "Grilled marinated beef, charred to perfection with a smoky, savory depth",
    tag: "Fan Favorite",
    placeholder: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400&h=300&fit=crop",
  },
  {
    name: "Pastor",
    description: "Slow-roasted pork with pineapple, achiote, and dried chilies",
    tag: "Classic",
    placeholder: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop",
  },
  {
    name: "Chicken",
    description: "Tender, seasoned chicken grilled and hand-pulled for the perfect taco",
    tag: "Crowd Pleaser",
    placeholder: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop",
  },
  {
    name: "Chorizo",
    description: "Spiced Mexican sausage, crumbled and crisped with bold, smoky flavor",
    tag: "Bold",
    placeholder: "https://images.unsplash.com/photo-1624438246793-8f4a0ee27b8a?w=400&h=300&fit=crop",
  },
  {
    name: "Fish Fillet",
    description: "Lightly seasoned white fish, grilled until golden and flaky",
    tag: "Light & Fresh",
    placeholder: "https://images.unsplash.com/photo-1510130113356-d39e38368203?w=400&h=300&fit=crop",
  },
  {
    name: "Shrimp Fajitas",
    description: "Sautéed shrimp with peppers and onions in a zesty citrus marinade",
    tag: "Premium",
    placeholder: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
  },
  {
    name: "Veggies",
    description: "Grilled seasonal vegetables with Mexican herbs and a touch of lime",
    tag: "Vegetarian",
    placeholder: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
  },
  {
    name: "Alambres",
    description: "Chopped beef with bacon, peppers, onions, and melted cheese",
    tag: "Loaded",
    placeholder: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop",
  },
];

export default function Menu() {
  return (
    <section id="menu" className="relative py-28 lg:py-36 bg-cream-warm">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20 reveal">
          <p className="text-sage text-xs uppercase tracking-[0.3em] mb-4 font-medium">
            Your Selection
          </p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-brown mb-6 italic font-medium">
            Choose Four
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-terracotta to-transparent mx-auto mb-6" />
          <p className="text-brown/50 text-base max-w-xl mx-auto leading-relaxed">
            Each protein is prepared fresh on-site with authentic recipes.
            Pick four to make your event unforgettable.
          </p>
        </div>

        {/* Meat cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {meats.map((meat) => (
            <div
              key={meat.name}
              className="reveal group relative overflow-hidden rounded-2xl bg-cream border border-brown/8 hover:border-terracotta/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-brown/10"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={meat.placeholder}
                  alt={meat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown/40 to-transparent" />
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest text-sage-dark font-semibold bg-cream/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  {meat.tag}
                </span>
              </div>

              <div className="p-5">
                {/* Name */}
                <h3 className="font-heading text-2xl text-brown group-hover:text-terracotta transition-colors duration-500 mb-2 italic">
                  {meat.name}
                </h3>

                {/* Description */}
                <p className="text-brown/40 text-sm leading-relaxed group-hover:text-brown/60 transition-colors duration-500">
                  {meat.description}
                </p>
              </div>

              {/* Bottom accent line */}
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-terracotta via-marigold to-sage transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
