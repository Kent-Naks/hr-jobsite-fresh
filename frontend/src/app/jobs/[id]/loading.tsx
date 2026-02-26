export default function JobDetailLoading() {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .sk {
          background: linear-gradient(90deg, #1f2937 25%, #2d3748 50%, #1f2937 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.6s ease-in-out infinite;
          border-radius: 6px;
        }
        .sk-emerald {
          background: linear-gradient(90deg, rgba(52,211,153,0.10) 25%, rgba(52,211,153,0.20) 50%, rgba(52,211,153,0.10) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.6s ease-in-out infinite;
          border-radius: 9999px;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* Hero header */}
        <div
          className="px-6 pt-8 pb-7 mb-2"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Ad slot */}
          <div className="mb-4">
            <div className="sk h-[90px] w-full" />
          </div>

          {/* Category pill */}
          <div className="sk h-6 w-28 rounded-full mb-4" />

          {/* Title — 2 lines */}
          <div className="sk h-9 w-4/5 mb-2" />
          <div className="sk h-9 w-3/5 mb-4" />

          {/* Badges row: salary + location */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="sk-emerald h-8 w-52" />
            <div className="sk h-8 w-32 rounded-full" />
          </div>
        </div>

        {/* JD section cards */}
        <div className="px-6 py-6">
          <div className="space-y-3 mb-6">
            {[
              { titleW: 36, lines: [100, 90, 75] },
              { titleW: 44, lines: [100, 88, 60, 72] },
              { titleW: 38, lines: [100, 82] },
              { titleW: 30, lines: [100, 95, 70] },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "12px",
                }}
                className="p-4 sm:p-5"
              >
                {/* Icon + heading row */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="sk w-5 h-5 flex-shrink-0" />
                  <div className="sk h-4" style={{ width: `${card.titleW}%` }} />
                </div>
                {/* Content lines */}
                <div className="space-y-2">
                  {card.lines.map((w, j) => (
                    <div key={j} className="sk h-3.5" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Ad slot */}
          <div className="mb-4">
            <div className="sk h-[90px] w-full" />
          </div>

          {/* Apply button skeleton */}
          <div className="sk-emerald h-12 w-full rounded-xl" />
        </div>

      </div>
    </>
  );
}
