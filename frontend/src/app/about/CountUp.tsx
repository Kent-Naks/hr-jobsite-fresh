// src/app/about/CountUp.tsx
"use client";

import React, { useEffect, useState } from "react";

export default function CountUp({ to, label }: { to: number; label: string }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = 0;
    if (to <= 0) {
      setVal(0);
      return;
    }
    const duration = 900;
    // ensure a reasonable number of steps, min interval 16ms
    const stepCount = Math.max(10, Math.min(60, Math.round(duration / 16)));
    const increment = Math.max(1, Math.round(to / stepCount));
    const stepTime = Math.max(16, Math.floor(duration / (to / increment)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setVal(to);
        clearInterval(timer);
      } else {
        setVal(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [to]);

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
      <div className="text-3xl font-bold">{val}</div>
      <div className="text-sm text-gray-300">{label}</div>
    </div>
  );
}
