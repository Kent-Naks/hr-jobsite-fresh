"use client";

import { useState } from "react";

/**
 * Floating button that copies the current page URL to the clipboard.
 * Positioned bottom-left so it doesn't overlap the Apply Now button (bottom-right).
 */
export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select + copy
      const el = document.createElement("input");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Copy link"
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
      style={{
        background: copied
          ? "rgba(52,211,153,0.15)"
          : "rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: copied
          ? "1px solid rgba(52,211,153,0.35)"
          : "1px solid rgba(255,255,255,0.15)",
        color: copied ? "#34d399" : "rgba(255,255,255,0.75)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}
