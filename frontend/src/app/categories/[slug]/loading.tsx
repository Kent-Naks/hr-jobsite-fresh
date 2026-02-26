export default function CategoryLoading() {
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

      <div className="p-6 max-w-7xl mx-auto">

        {/* VideoHero placeholder */}
        <div className="relative w-full h-[350px] md:h-[500px] lg:h-[650px] overflow-hidden rounded-lg sk mb-4" />

        {/* Ad slot placeholder */}
        <div className="sk h-[90px] w-full mb-6" />

        {/* Category heading */}
        <div className="mb-6">
          <div className="sk h-9 w-64" />
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="sk h-11 w-full rounded-xl" />
        </div>

        {/* 6 job card skeletons */}
        <ul className="space-y-3">
          {[72, 60, 80, 55, 68, 75].map((titleW, i) => (
            <li key={i}>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                }}
                className="p-5"
              >
                {/* Title */}
                <div className="sk h-5 mb-3" style={{ width: `${titleW}%` }} />
                {/* Description lines */}
                <div className="sk h-3.5 w-full mb-2" />
                <div className="sk h-3.5 mb-3" style={{ width: `${titleW - 15}%` }} />
                {/* Salary */}
                <div
                  className="sk h-3.5"
                  style={{
                    width: "28%",
                    background: "linear-gradient(90deg, rgba(52,211,153,0.12) 25%, rgba(52,211,153,0.22) 50%, rgba(52,211,153,0.12) 75%)",
                    backgroundSize: "200% 100%",
                    animation: "skeleton-shimmer 1.6s ease-in-out infinite",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>

      </div>
    </>
  );
}
