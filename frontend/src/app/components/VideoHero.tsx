// src/components/VideoHero.tsx
"use client";

import { useEffect, useState } from "react";

type VideoHeroProps = {
  videos: string[];
};

export default function VideoHero({ videos }: VideoHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

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

  if (videos.length === 0) return null;

  return (
    <div className="relative w-full h-[350px] md:h-[500px] lg:h-[650px] overflow-hidden">
      <video
        key={videos[currentIndex]}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        playsInline
        loop={videos.length === 1} // explicit loop for single video
        src={`/videos/${videos[currentIndex]}`}
      />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
