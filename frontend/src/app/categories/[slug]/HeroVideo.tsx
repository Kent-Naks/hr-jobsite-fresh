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

  // track loaded indexes so we can show a spinner while buffering
  const [loadedIndexes, setLoadedIndexes] = useState<number[]>([]);

  // helper to set src and start preloading
  const loadVideo = (index: number) => {
    const el = videoRefs.current[index];
    if (!el) return;
    if (loadedIndexes.includes(index)) return;
    if (!el.getAttribute("data-loaded")) {
      // runtime debug flag via URL: ?video_debug=1
      const DEBUG = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("video_debug") === "1";
      const src = `/videos/${videos[index]}`;
      if (DEBUG) console.debug(`[HeroVideo] loadVideo(${index}) -> ${src}`);
      el.preload = "auto";
      el.src = src;
      // mark as loading/loaded via event
      const onCan = () => {
        if (DEBUG) console.debug(`[HeroVideo] canplaythrough ${index}`);
        setLoadedIndexes((prev) => (prev.includes(index) ? prev : [...prev, index]));
        el.setAttribute("data-loaded", "true");
        el.removeEventListener("canplaythrough", onCan);
      };
      el.addEventListener("canplaythrough", onCan);
      // also attempt to call load() to start fetching
      try {
        if (DEBUG) console.debug(`[HeroVideo] calling load() for ${index}`);
        el.load();
      } catch {}
    }
  };

  // Ensure the element has enough buffered data before playing to avoid rebuffering
  const ensureBuffered = (index: number, minRatio = 0.9, timeoutMs = 5000) => {
    return new Promise<void>((resolve) => {
      const el = videoRefs.current[index];
      if (!el) return resolve();
      const DEBUG = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("video_debug") === "1";

      const checkBuffered = () => {
        try {
          const dur = el.duration;
          if (isNaN(dur) || !isFinite(dur) || dur === 0) {
            // unknown duration, rely on readyState
            if (el.readyState >= 3) return true;
            return false;
          }
          if (el.buffered.length === 0) return false;
          const bufferedEnd = el.buffered.end(el.buffered.length - 1);
          const ratio = bufferedEnd / dur;
          if (DEBUG) console.debug(`[HeroVideo] buffered check idx=${index} end=${bufferedEnd.toFixed(2)} dur=${dur.toFixed(2)} ratio=${ratio.toFixed(2)}`);
          return ratio >= minRatio || el.readyState >= 4;
        } catch (e) {
          return el.readyState >= 3;
        }
      };

      if (checkBuffered()) return resolve();

      const onProgress = () => {
        if (checkBuffered()) {
          cleanup();
          resolve();
        }
      };

      const onCan = () => {
        if (DEBUG) console.debug(`[HeroVideo] canplaythrough triggered for ${index}`);
        cleanup();
        resolve();
      };

      const cleanup = () => {
        el.removeEventListener("progress", onProgress);
        el.removeEventListener("canplaythrough", onCan);
        clearTimeout(timer);
      };

      el.addEventListener("progress", onProgress);
      el.addEventListener("canplaythrough", onCan);
      const timer = setTimeout(() => {
        if (DEBUG) console.debug(`[HeroVideo] buffer timeout for ${index}, proceeding`);
        cleanup();
        resolve();
      }, timeoutMs);
    });
  };

  // Play current video when visible and loaded; preload next while playing
  useEffect(() => {
    if (!visible || videos.length === 0) return;

    // Ensure current is loaded
    loadVideo(current);

    const currentEl = videoRefs.current[current];
    if (!currentEl) return;

    const tryPlay = () => {
      const DEBUG = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("video_debug") === "1";
      const isLoaded = loadedIndexes.includes(current) || currentEl.getAttribute("data-loaded") || currentEl.readyState >= 3;
      if (DEBUG) console.debug(`[HeroVideo] tryPlay current=${current} isLoaded=${isLoaded}`);
      if (isLoaded) {
        // pause others
        videoRefs.current.forEach((v, i) => {
          if (!v) return;
            if (i === current) {
              v.muted = true;
              // ensure enough buffer before playing to avoid mid-loop freezes
              ensureBuffered(i).then(() => v.play().catch((err) => { if (DEBUG) console.debug('[HeroVideo] play error', err); }));
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
        const DEBUG = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("video_debug") === "1";
        const next = (current + 1) % videos.length;
        if (DEBUG) console.debug(`[HeroVideo] ended current=${current} -> start loading next=${next}`);
        // Start loading the next video only after the current video finished its first full play.
        loadVideo(next);
        const nextEl = videoRefs.current[next];
        if (!nextEl) {
          setCurrent(next);
          return;
        }
        const isNextLoaded = loadedIndexes.includes(next) || nextEl.getAttribute("data-loaded") || nextEl.readyState >= 3;
        if (isNextLoaded) {
          if (DEBUG) console.debug(`[HeroVideo] next already loaded, advancing to ${next}`);
          setCurrent(next);
        } else {
          const onCanNext = () => {
            if (DEBUG) console.debug(`[HeroVideo] next canplaythrough ${next}, advancing`);
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
