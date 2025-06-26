'use client';
import { useEffect, useState } from 'react';

export default function AdSlot({ slot }: { slot: string }) {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (e) {
      console.error('AdSense error', e);
    }
  }, []);

  return adLoaded ? (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', minHeight: '100px' }}
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
