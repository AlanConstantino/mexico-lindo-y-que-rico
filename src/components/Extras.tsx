import { useTranslations } from "next-intl";

const extras: {
  key: string;
  price: string;
  serves: string;
  priceKey?: string;
}[] = [
  { key: "rice", price: "$40", serves: "40–50" },
  { key: "beans", price: "$40", serves: "40–50" },
  { key: "quesadillas", price: "$30", serves: "40–50" },
  { key: "jalapenos", price: "$20", serves: "40–50" },
  { key: "guacamole", price: "$40", serves: "40–50" },
  { key: "salsa", price: "$40", serves: "40–50" },
  { key: "agua", price: "$25", serves: "40–50" },
  { key: "salad", price: "$30", serves: "40–50" },
  { key: "burgers", price: "$4 each", serves: "per unit", priceKey: "each4" },
  { key: "hotdogs", price: "$2 each", serves: "per unit", priceKey: "each2" },
];

export default function Extras() {
  const t = useTranslations("extras");

  return (
    <section className="relative py-16 sm:py-32 lg:py-40">
      <div className="absolute inset-0 bg-navy-light/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/20 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-16 reveal">
          <p className="text-terracotta text-xs uppercase tracking-[0.3em] mb-4 font-medium">
            {t("label")}
          </p>
          <h2 className="font-heading text-3xl sm:text-5xl text-cream mb-6">
            {t("heading")}
          </h2>
          <p className="text-cream/50 text-base max-w-lg mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Extras list */}
        <div className="space-y-0">
          {extras.map((extra) => (
            <div
              key={extra.key}
              className="reveal group flex items-center justify-between py-5 border-b border-cream/5 hover:border-amber/15 transition-colors duration-300"
            >
              <div className="flex-1 min-w-0">
                <p className="text-cream group-hover:text-amber transition-colors duration-300 text-base font-medium">
                  {t(`items.${extra.key}`)}
                </p>
                {extra.key === "agua" && (
                  <p className="text-cream/30 text-xs mt-1">{t("items.aguaNote")}</p>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <span className="text-cream/30 text-xs hidden sm:block">
                  {extra.serves === "per unit"
                    ? t("perUnit")
                    : t("serves", { count: extra.serves })}
                </span>
                <span className="text-amber font-semibold text-lg">
                  {extra.priceKey ? t(`prices.${extra.priceKey}`) : extra.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
