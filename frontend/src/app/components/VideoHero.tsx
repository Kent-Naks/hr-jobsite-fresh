// src/components/VideoHero.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type VideoHeroProps = {
  videos: string[];
};

// prefer a CDN/base URL for videos when provided, otherwise serve local `/videos/`
const VIDEO_BASE = (process.env.NEXT_PUBLIC_VIDEO_BASE_URL || "").replace(/\/$/, "");

export default function VideoHero({ videos }: VideoHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  // autoplay carousel
  useEffect(() => {
    if (videos.length === 0) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % videos.length);
        setFade(true);
        setLoaded(false); // ensure next video will lazy load
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, [videos]);

  // IntersectionObserver to lazy-load when in viewport
  useEffect(() => {
    if (!videoRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(videoRef.current);
    return () => obs.disconnect();
  }, [videoRef]);

  if (videos.length === 0) return null;

  const filename = videos[currentIndex];
  const baseName = filename.replace(/\.mp4$/, "");
  const posterPath = VIDEO_BASE
    ? `${VIDEO_BASE}/videos/posters/${baseName}.jpg`
    : `/videos/posters/${baseName}.jpg`;

  // Prefer the transcoded 720p variants first, then fall back to originals.
  const webm720 = VIDEO_BASE ? `${VIDEO_BASE}/videos/${baseName}-720.webm` : `/videos/${baseName}-720.webm`;
  const webmOrig = VIDEO_BASE ? `${VIDEO_BASE}/videos/${baseName}.webm` : `/videos/${baseName}.webm`;
  const mp4720 = VIDEO_BASE ? `${VIDEO_BASE}/videos/${baseName}-720.mp4` : `/videos/${baseName}-720.mp4`;
  const mp4Orig = VIDEO_BASE ? `${VIDEO_BASE}/videos/${filename}` : `/videos/${filename}`;

  return (
    <div ref={videoRef} className="relative w-full h-[350px] md:h-[500px] lg:h-[650px] overflow-hidden">
      <video
        key={filename}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
        autoPlay={visible}
        muted
        playsInline
        loop={videos.length === 1}
        preload="metadata"
        poster={posterPath}
      >
        {visible && (
          <>
            <source src={webm720} type="video/webm" />
            <source src={webmOrig} type="video/webm" />
            <source src={mp4720} type="video/mp4" />
            <source src={mp4Orig} type="video/mp4" />
          </>
        )}
      </video>
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
