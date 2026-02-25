"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  to: number;
  label: string;
}

/**
 * Like CountUp, but the animation only starts when the element
 * scrolls into the viewport (fires once).
 */
export default function ScrollCountUp({ to, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [val, setVal] = useState(0);

  // Trigger count when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Run animation once started
  useEffect(() => {
    if (!started || to <= 0) return;
    let current = 0;
    const duration = 1200;
    const stepCount = Math.max(10, Math.min(80, Math.round(duration / 16)));
    const increment = Math.max(1, Math.round(to / stepCount));
    const stepTime = Math.max(16, Math.floor(duration / (to / increment)));

    const timer = setInterval(() => {
      current += increment;
      if (current >= to) {
        setVal(to);
        clearInterval(timer);
      } else {
        setVal(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [started, to]);

  return (
    <div ref={ref} className="text-center py-2">
      <div
        className="text-4xl font-black mb-1"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #9ca3af 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {val}
      </div>
      <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
        {label}
      </div>
    </div>
  );
}
