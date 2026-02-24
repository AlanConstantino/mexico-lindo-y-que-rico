interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionHeading({
  title,
  subtitle,
  centered = true,
  light = false,
}: SectionHeadingProps) {
  return (
    <div className={centered ? "text-center" : ""}>
      <h2
        className={`font-heading text-4xl md:text-5xl lg:text-6xl mb-4 ${
          light ? "text-navy" : "text-amber"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-lg max-w-2xl ${centered ? "mx-auto" : ""} ${
            light ? "text-navy/70" : "text-cream/60"
          }`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`mt-6 flex items-center gap-3 ${
          centered ? "justify-center" : ""
        }`}
      >
        <span className="w-12 h-0.5 bg-terracotta" />
        <span
          className={`w-2 h-2 rounded-full ${
            light ? "bg-teal" : "bg-amber"
          }`}
        />
        <span className="w-12 h-0.5 bg-terracotta" />
      </div>
    </div>
  );
}
