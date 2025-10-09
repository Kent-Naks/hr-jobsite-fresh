"use client";

import { useEffect, useState } from "react";

/**
 * Reads a one-time flash message from sessionStorage ("flash_banner"),
 * shows it for ~4s on mount, and fades it away.
 *
 * To trigger it from another page:
 *   sessionStorage.setItem("flash_banner", "Application submitted successfully!");
 *   router.replace("/");
 */
export default function FlashBanner() {
  const [text, setText] = useState<string | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem("flash_banner");
      if (!msg) return;
      sessionStorage.removeItem("flash_banner"); // one-time
      setText(msg);

      const fadeTimer = setTimeout(() => setFading(true), 3500); // start fade
      const hideTimer = setTimeout(() => setText(null), 4000);   // remove

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    } catch {
      // ignore storage errors (Safari private mode, etc.)
    }
  }, []);

  if (!text) return null;

  return (
    <div
      role="status"
      className={[
        "mb-4 rounded-md border p-3 text-sm font-medium shadow-sm",
        "bg-green-50 border-green-300 text-green-800",
        "transition-opacity duration-500",
        fading ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      {text}
    </div>
  );
}
