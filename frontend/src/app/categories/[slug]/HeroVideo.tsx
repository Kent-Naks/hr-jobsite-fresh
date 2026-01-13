// src/app/categories/[slug]/HeroVideo.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type HeroVideoProps = { videos: string[] };

export default function HeroVideo({ videos }: HeroVideoProps) {
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  // handle video looping for multiple videos
  useEffect(() => {
    if (!videos.length) return;

    const currentVideo = videoRefs.current[current];
    const handleEnded = () => setCurrent((prev) => (prev + 1) % videos.length);

    currentVideo?.addEventListener("ended", handleEnded);
    return () => currentVideo?.removeEventListener("ended", handleEnded);
  }, [current, videos]);

  return (
    <div className="relative w-full h-[60vh] sm:h-[80vh] mb-6 overflow-hidden rounded-lg">
      {videos.map((video, index) => (
        <video
          key={video}
          ref={(el) => {
            if (el) videoRefs.current[index] = el;
          }}
          src={`/videos/${video}`}
          autoPlay
          muted
          playsInline
          className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
