"use client";

// Animated gradient mesh background — Linear.app style slow-drifting blobs.
// Rendered fixed behind all content (z-index: -1).
export default function GradientMesh() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Blob 1 — deep indigo, top-left */}
      <div
        className="mesh-blob-1"
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "55vw",
          height: "55vw",
          background:
            "radial-gradient(ellipse at center, rgba(30,30,60,0.55) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
      {/* Blob 2 — slate, bottom-right */}
      <div
        className="mesh-blob-2"
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: "60vw",
          height: "60vw",
          background:
            "radial-gradient(ellipse at center, rgba(15,15,35,0.6) 0%, transparent 65%)",
          borderRadius: "50%",
        }}
      />
      {/* Blob 3 — very subtle warm tint, centre */}
      <div
        className="mesh-blob-3"
        style={{
          position: "absolute",
          top: "30%",
          left: "30%",
          width: "45vw",
          height: "45vw",
          background:
            "radial-gradient(ellipse at center, rgba(20,18,40,0.4) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
