'use client';

import { useEffect, useRef, useState } from 'react';

// extend Window for TypeScript
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSlot({ slot }: { slot: string }) {
  const [adLoaded, setAdLoaded] = useState(false);
  const initialised = useRef(false);            // NEW — guard flag

  useEffect(() => {
    if (initialised.current || typeof window === 'undefined') return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialised.current = true;               // mark slot as initialised
      setAdLoaded(true);
    } catch (err: unknown) {
      // Ignore the “already initialised” TagError in dev so the overlay stays green
      if (
        typeof err === 'object' &&
        err &&
        'message' in err &&
        String(err.message).includes('adsbygoogle.push() error')
      ) {
        console.info('AdSense already initialised for this <ins>, skipping.');
      } else {
        console.error('AdSense error', err);
      }
    }
  }, []);

  return adLoaded ? (
    <ins
      className="adsbygoogle block min-h-[100px]"
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  ) : (
    <div className="bg-gray-100 text-gray-500 text-sm py-6 text-center border border-dashed border-gray-300">
      Google Ad Placeholder – Slot: {slot}
    </div>
  );
}
