export default function AdminLoading() {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .sk {
          background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.6s ease-in-out infinite;
          border-radius: 6px;
        }
      `}</style>

      <main className="p-6 max-w-5xl mx-auto">

        {/* Page title */}
        <div className="flex justify-between items-center mb-6">
          <div className="sk h-8 w-40" />
          <div className="flex gap-2">
            <div className="sk h-9 w-36 rounded" />
            <div className="sk h-9 w-24 rounded" />
          </div>
        </div>

        {/* Stats row: 3 stat card skeletons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="p-4"
              style={{
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
            >
              <div className="sk h-3.5 w-24 mb-3" />
              <div className="sk h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div
          style={{
            border: "1px solid #374151",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {/* Header row */}
          <div
            className="grid gap-2 p-2"
            style={{
              gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1.5fr 1.5fr 60px",
              background: "#1f2937",
              borderBottom: "1px solid #374151",
            }}
          >
            {["Title", "Category", "Status", "Posted", "Updated", "Expiring", ""].map((_, i) => (
              <div key={i} className="sk h-4" style={{ opacity: i === 6 ? 0 : 1 }} />
            ))}
          </div>

          {/* 8 data rows */}
          {Array.from({ length: 8 }).map((_, row) => (
            <div
              key={row}
              className="grid gap-2 p-2"
              style={{
                gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1.5fr 1.5fr 60px",
                borderBottom: "1px solid #1f2937",
                background: row % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
              }}
            >
              <div className="sk h-4" style={{ width: `${60 + (row * 7) % 30}%` }} />
              <div className="sk h-4" style={{ width: "70%" }} />
              <div className="sk h-4" style={{ width: "55%" }} />
              <div className="sk h-4" style={{ width: "80%" }} />
              <div className="sk h-4" style={{ width: "80%" }} />
              <div className="sk h-4" style={{ width: "65%" }} />
              <div className="sk h-4" style={{ width: "40%" }} />
            </div>
          ))}
        </div>

      </main>
    </>
  );
}
