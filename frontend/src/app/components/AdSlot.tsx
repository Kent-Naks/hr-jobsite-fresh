// src/app/components/AdSlot.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

console.log("AD_CLIENT:", process.env.NEXT_PUBLIC_ADSENSE_ID);

/**
 * AdSlot
 * - Single, idempotent attempt to initialise adsbygoogle for this slot.
 * - Avoids duplicate pushes / console noise.
 * - Falls back to a harmless placeholder in dev or if AdSense is blocked.
 *
 * Notes:
 * - Set NEXT_PUBLIC_ADSENSE_ID in your .env.local (starts with "ca-pub-").
 * - The attribute data-ad-client uses a NEXT_PUBLIC env var so it is safe to use in client code.
 */

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

// read publisher id from public env (set NEXT_PUBLIC_ADSENSE_ID in .env.local)
const AD_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_ID ?? "ca-pub-XXXXXXXXXXXXXXXX";

export default function AdSlot({ slot }: { slot: string }) {
  const [adLoaded, setAdLoaded] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    // don't attempt to run in non-browser environments
    if (typeof window === "undefined") return;

    // If we already tried to initialise this slot, skip
    if (initialised.current) {
      return;
    }

    // If the AdSense script isn't present, bail (the script is injected in layout.tsx)
    if (!("adsbygoogle" in window) && !(window as any).adsbygoogle) {
      // still set placeholder => keeps UI consistent
      console.info("AdSense script not found; rendering placeholder.");
      setAdLoaded(false);
      initialised.current = false;
      return;
    }

    try {
      // idempotent push — if it throws with the usual TagError, we catch it below
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialised.current = true;
      setAdLoaded(true);
    } catch (err: unknown) {
      const msg = typeof err === "object" && err && "message" in err ? (err as any).message : String(err);
      // common dev error when running inside dev overlay: ignore it
      if (String(msg).includes("adsbygoogle.push() error") || String(msg).includes("TagError")) {
        console.info("AdSense already initialised for this <ins>, skipping.");
        // mark initialised to avoid repeated attempts
        initialised.current = true;
        setAdLoaded(true);
      } else {
        console.error("AdSense push error", err);
        // leave placeholder shown
        setAdLoaded(false);
      }
    }
  }, []);

  // Render the real <ins> only if ad client looks like a real id. This avoids accidental policy issues.
  const isDev = process.env.NODE_ENV === "development";
  const isValidClient =
  typeof AD_CLIENT === "string" &&
  AD_CLIENT.startsWith("ca-pub-") &&
  AD_CLIENT !== "placeholder";


  if (!isValidClient) {
    // helpful placeholder so you can see slots in dev and not accidentally send traffic to Google
    return (
      <div className="bg-gray-100 text-gray-500 text-sm py-6 text-center border border-dashed border-gray-300">
        Google Ad Placeholder – Slot: {slot} 
        
      </div>
    );
  }

  // show either the real ad element (or placeholder until first push)
  return (
    <ins
      className="adsbygoogle block min-h-[100px]"
      style={{ display: "block" }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      aria-hidden="true"
    />
  );
}
