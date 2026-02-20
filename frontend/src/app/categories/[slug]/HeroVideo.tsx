// src/app/categories/[slug]/HeroVideo.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type HeroVideoProps = { videos: string[] };

export default function HeroVideo({ videos }: HeroVideoProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Observe container to lazy-load when it enters viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // track loaded indexes so we can show a spinner while buffering
  const [loadedIndexes, setLoadedIndexes] = useState<number[]>([]);

  // helper to set src and start preloading
  const loadVideo = (index: number) => {
    const el = videoRefs.current[index];
    if (!el) return;
    if (loadedIndexes.includes(index)) return;
    if (!el.getAttribute("data-loaded")) {
      el.preload = "auto";
      el.src = `/videos/${videos[index]}`;
      // mark as loading/loaded via event
      const onCan = () => {
        setLoadedIndexes((prev) => (prev.includes(index) ? prev : [...prev, index]));
        el.setAttribute("data-loaded", "true");
        el.removeEventListener("canplaythrough", onCan);
      };
      el.addEventListener("canplaythrough", onCan);
      // also attempt to call load() to start fetching
      try {
        el.load();
      } catch {}
    }
  };

  // Play current video when visible and loaded; preload next while playing
  useEffect(() => {
    if (!visible || videos.length === 0) return;

    // Ensure current is loaded
    loadVideo(current);

    const currentEl = videoRefs.current[current];
    if (!currentEl) return;

    const tryPlay = () => {
      const isLoaded = loadedIndexes.includes(current) || currentEl.getAttribute("data-loaded") || currentEl.readyState >= 3;
      if (isLoaded) {
        // pause others
        videoRefs.current.forEach((v, i) => {
          if (!v) return;
          if (i === current) {
            v.muted = true;
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
        // Do NOT preload next here — defer loading of the next video until
        // the current video finishes its first full loop (on 'ended').
      } else {
        // wait for canplaythrough
        const onCan = () => {
          currentEl.removeEventListener("canplaythrough", onCan);
          tryPlay();
        };
        currentEl.addEventListener("canplaythrough", onCan);
      }
    };

    tryPlay();

    // when current ends, advance only after ensuring next is loaded
    const onEnded = async () => {
      const next = (current + 1) % videos.length;
      // Start loading the next video only after the current video finished its first full play.
      loadVideo(next);
      const nextEl = videoRefs.current[next];
      if (!nextEl) {
        setCurrent(next);
        return;
      }
      const isNextLoaded = loadedIndexes.includes(next) || nextEl.getAttribute("data-loaded") || nextEl.readyState >= 3;
      if (isNextLoaded) {
        setCurrent(next);
      } else {
        const onCanNext = () => {
          nextEl.removeEventListener("canplaythrough", onCanNext);
          setCurrent(next);
        };
        nextEl.addEventListener("canplaythrough", onCanNext);
      }
    };

    currentEl.addEventListener("ended", onEnded);

    return () => {
      currentEl.removeEventListener("ended", onEnded);
    };
  }, [current, visible, videos]);

  return (
    <div ref={containerRef} className="relative w-full h-[60vh] sm:h-[80vh] mb-6 overflow-hidden rounded-lg">
      {videos.map((video, index) => {
        const isCurrent = index === current;
        const isLoaded = loadedIndexes.includes(index);
        return (
          <div key={video} className={`absolute inset-0 transition-opacity duration-1000 ${isCurrent ? "opacity-100" : "opacity-0"}`}>
            <video
              ref={(el) => {
                if (el) videoRefs.current[index] = el;
              }}
              // src is set via loadVideo to avoid eager fetching
              data-src={`/videos/${video}`}
              preload="none"
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {/* buffering spinner */}
            {isCurrent && !isLoaded && visible && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
