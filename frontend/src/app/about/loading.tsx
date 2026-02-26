export default function AboutLoading() {
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

      <div className="max-w-6xl mx-auto">

        {/* Hero section placeholder */}
        <div
          className="relative px-6 pt-14 pb-12 overflow-hidden"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="sk h-3 w-20 mb-4" />
          <div className="sk h-10 w-80 mb-5" />
          <div
            className="p-6 space-y-3 max-w-3xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
            }}
          >
            <div className="sk h-3.5 w-full" />
            <div className="sk h-3.5 w-11/12" />
            <div className="sk h-3.5 w-full" />
            <div className="sk h-3.5 w-4/5" />
          </div>
        </div>

        <div className="p-6">

          {/* Stats row: 2 large number skeletons */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="p-6"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                }}
              >
                <div className="sk h-10 w-24 mb-2" />
                <div className="sk h-3.5 w-32" />
              </div>
            ))}
          </section>

          {/* Latest roles heading + 6 job card skeletons in 3-col grid */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="sk h-7 w-36" />
              <div className="sk h-4 w-16" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                  }}
                >
                  <div className="sk h-5 w-4/5 mb-2" />
                  <div className="sk h-3 w-1/3 mb-4" />
                  <div className="flex justify-between">
                    <div className="sk h-3.5 w-12" />
                    <div className="sk h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mission / How it works / Partner: 3 card skeletons in a row */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-6"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                }}
              >
                <div className="sk h-7 w-8 mb-3" />
                <div className="sk h-5 w-32 mb-3" />
                <div className="sk h-3.5 w-full mb-2" />
                <div className="sk h-3.5 w-5/6 mb-2" />
                <div className="sk h-3.5 w-4/6" />
              </div>
            ))}
          </section>

          {/* Testimonials: 2 card skeletons side by side */}
          <section>
            <div className="sk h-7 w-44 mb-5" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="p-6"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                  }}
                >
                  <div className="sk h-3.5 w-full mb-2" />
                  <div className="sk h-3.5 w-5/6 mb-5" />
                  <div className="sk h-3 w-40" />
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
