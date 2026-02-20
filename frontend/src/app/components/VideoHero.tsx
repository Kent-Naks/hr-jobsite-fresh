// src/components/VideoHero.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Skeleton from "@/components/Skeleton";

type VideoHeroProps = {
  videos: string[];
};

// prefer a CDN/base URL for videos when provided, otherwise serve local `/videos/`
const VIDEO_BASE = (process.env.NEXT_PUBLIC_VIDEO_BASE_URL || "").replace(/\/$/, "");

export default function VideoHero({ videos }: VideoHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [srcLoaded, setSrcLoaded] = useState(false);
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (videos.length === 0) return;

    const interval = setInterval(() => {
      setFade(false); // start fade-out

      setTimeout(() => {
        // increment index and wrap around even for single video
        setCurrentIndex((prev) => (prev + 1) % videos.length);
        setFade(true); // fade-in new video
      }, 500); // match Tailwind duration-500
    }, 6000);

    return () => clearInterval(interval);
  }, [videos]);

  useEffect(() => {
    // IntersectionObserver to lazy-load videos only when visible on page
    const node = elRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setIsVisible(true);
            obs.disconnect();
          }
        });
      },
      { root: null, threshold: 0.2 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [elRef]);

  if (videos.length === 0) return null;

  const filename = videos[currentIndex];
  const posterPath = VIDEO_BASE
    ? `${VIDEO_BASE}/videos/posters/${filename.replace(/\.mp4$/, ".jpg")}`
    : `/videos/posters/${filename.replace(/\.mp4$/, ".jpg")}`;
  const src = isVisible ? (VIDEO_BASE ? `${VIDEO_BASE}/videos/${filename}` : `/videos/${filename}`) : undefined;

  return (
    <div ref={elRef} className="relative w-full h-[350px] md:h-[500px] lg:h-[650px] overflow-hidden">
      {!srcLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-full max-w-3xl" />
        </div>
      )}

      <video
        key={filename}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        playsInline
        loop={videos.length === 1}
        preload={isVisible ? "metadata" : "none"}
        poster={posterPath}
        src={src}
        onLoadedMetadata={() => setSrcLoaded(true)}
      />

      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
