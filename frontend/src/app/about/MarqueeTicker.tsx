"use client";

interface Props {
  categories: string[];
}

/**
 * Infinite horizontal marquee showing category names.
 * Doubled list so the loop is seamless.
 */
export default function MarqueeTicker({ categories }: Props) {
  if (!categories.length) return null;

  // Duplicate so the scroll looks continuous
  const items = [...categories, ...categories];

  return (
    <div
      className="overflow-hidden select-none"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "10px 0",
        maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div className="marquee-track">
        {items.map((cat, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 mx-4 text-xs font-medium tracking-wide uppercase whitespace-nowrap"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            <span
              className="inline-block w-1 h-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
