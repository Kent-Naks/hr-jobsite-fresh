export default function ContactLoading() {
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

      <div className="p-6 max-w-4xl mx-auto">

        {/* Page title */}
        <header className="mb-8">
          <div className="sk h-3 w-20 mb-3" />
          <div className="sk h-9 w-72 mb-2" />
          <div className="sk h-3.5 w-96" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: form skeletons */}
          <div
            className="p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
            }}
          >
            <div className="sk h-5 w-36 mb-5" />
            {/* Name + email row */}
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="sk h-10 w-full rounded-lg" />
              <div className="sk h-10 w-full rounded-lg" />
            </div>
            {/* Subject */}
            <div className="sk h-10 w-full rounded-lg mb-4" />
            {/* Message textarea */}
            <div className="sk h-36 w-full rounded-lg mb-4" />
            {/* Submit button */}
            <div className="sk h-10 w-36 rounded-full" />
          </div>

          {/* Right: contact details + map + FAQ */}
          <aside className="space-y-4">

            {/* Contact details card */}
            <div
              className="p-5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
              }}
            >
              <div className="sk h-5 w-36 mb-3" />
              <div className="sk h-3.5 w-64 mb-2" />
              <div className="sk h-3.5 w-48" />
            </div>

            {/* Map placeholder */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div className="p-4">
                <div className="sk h-5 w-32 mb-1" />
                <div className="sk h-3 w-24 mt-1" />
              </div>
              <div className="sk w-full" style={{ height: 200, borderRadius: 0 }} />
              <div className="px-4 py-2">
                <div className="sk h-3 w-48" />
              </div>
            </div>

            {/* FAQ skeletons */}
            <div
              className="p-5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
              }}
            >
              <div className="sk h-5 w-12 mb-4" />
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <div className="sk h-4 w-5/6 mb-1" />
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </>
  );
}
