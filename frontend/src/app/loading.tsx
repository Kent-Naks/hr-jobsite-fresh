export default function HomeLoading() {
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
      `}</style>

      {/* Hero placeholder */}
      <div className="sk w-full" style={{ minHeight: "520px", borderRadius: 0 }} />

      {/* Categories section */}
      <div className="p-6 max-w-7xl mx-auto mt-8">

        {/* Ad slot */}
        <div className="mb-6">
          <div className="sk h-[90px] w-full" />
        </div>

        {/* "Job Categories" heading + sub */}
        <div className="mb-6">
          <div className="sk h-7 w-40 mb-2" />
          <div className="sk h-4 w-52" />
        </div>

        {/* 6 category card skeletons — 3-column grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[55, 70, 48, 62, 75, 50].map((labelW, i) => (
            <li key={i}>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                }}
                className="p-5"
              >
                {/* Emoji circle + arrow row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="sk w-7 h-7 rounded-md" />
                  <div className="sk w-4 h-4 rounded" />
                </div>
                {/* Category label */}
                <div className="sk h-4" style={{ width: `${labelW}%` }} />
              </div>
            </li>
          ))}
        </ul>

      </div>
    </>
  );
}
