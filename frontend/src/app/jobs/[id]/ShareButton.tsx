"use client";

import React, { useEffect, useRef, useState } from "react";

// ─── SVG icons ────────────────────────────────────────────────────────────────

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.5l5.805-1.522A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.578-.504-5.062-1.38l-.362-.214-3.742.982.999-3.648-.236-.374A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function GmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ─── Share items config ───────────────────────────────────────────────────────

type ShareItem = {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  bg: string;
  border: string;
  Icon: () => React.ReactElement;
  getHref?: (title: string, url: string) => string;
  isNewTab?: boolean;
  copyLink?: boolean;
  instagram?: boolean;
};

const SHARE_ITEMS: ShareItem[] = [
  {
    id: "whatsapp",
    label: "Share on WhatsApp",
    shortLabel: "WhatsApp",
    color: "#25D366",
    bg: "rgba(37,211,102,0.14)",
    border: "rgba(37,211,102,0.35)",
    Icon: WaIcon,
    getHref: (title, url) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
    isNewTab: true,
  },
  {
    id: "gmail",
    label: "Share via Gmail",
    shortLabel: "Gmail",
    color: "#EA4335",
    bg: "rgba(234,67,53,0.14)",
    border: "rgba(234,67,53,0.35)",
    Icon: GmailIcon,
    getHref: (title, url) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    label: "Share on X",
    shortLabel: "X",
    color: "#ffffff",
    bg: "rgba(255,255,255,0.10)",
    border: "rgba(255,255,255,0.25)",
    Icon: XIcon,
    getHref: (title, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    isNewTab: true,
  },
  {
    id: "instagram",
    label: "Share on Instagram",
    shortLabel: "Instagram",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.14)",
    border: "rgba(225,48,108,0.35)",
    Icon: IgIcon,
    instagram: true,
  },
  {
    id: "copy",
    label: "Copy link",
    shortLabel: "Copy",
    color: "rgba(255,255,255,0.8)",
    bg: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.20)",
    Icon: CopyIcon,
    copyLink: true,
  },
];

// Button is fixed bottom-LEFT → arc fans upward and to the RIGHT so icons stay on-screen.
// translate(x, -y): positive x = right, positive y = up.
// All x ≥ 0 (never left). All y ≥ 60 so labels clear the 48px trigger + gap.
// Arc: R=224px, angles 90°→18° in 18° steps → exactly 70px center-to-center spacing.
const ARC: { x: number; y: number }[] = [
  { x:   0, y: 224 }, // WhatsApp  – straight up        (90°)
  { x:  69, y: 213 }, // Gmail     – up-right           (72°)
  { x: 132, y: 181 }, // X         – diagonal           (54°)
  { x: 181, y: 132 }, // Instagram – right-up           (36°)
  { x: 213, y:  69 }, // Copy      – mostly right       (18°)
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  title: string;
}

export default function ShareButton({ title }: Props) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function copyToClipboard(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }

  async function handleItemClick(item: ShareItem) {
    const url = window.location.href;

    if (item.instagram) {
      await copyToClipboard(url);
      window.open("https://www.instagram.com", "_blank", "noopener,noreferrer");
      setCopiedId(item.id);
      setTimeout(() => { setCopiedId(null); setOpen(false); }, 2500);
      return;
    }

    if (item.copyLink) {
      await copyToClipboard(url);
      setCopiedId(item.id);
      setTimeout(() => { setCopiedId(null); setOpen(false); }, 1800);
      return;
    }

    if (item.getHref) {
      const href = item.getHref(title, url);
      if (item.isNewTab) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = href;
      }
      setOpen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 40,
        width: 48,
        height: 48,
      }}
    >
      {SHARE_ITEMS.map((item, i) => {
        const pos = ARC[i];
        const isCopied = copiedId === item.id;

        return (
          <div
            key={item.id}
            className="share-item"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              ...(open
                ? {
                    transform: `translate(${pos.x}px, -${pos.y}px) scale(1)`,
                    opacity: 1,
                    pointerEvents: "auto",
                    transitionDelay: `${i * 45}ms`,
                  }
                : {
                    transform: "translate(0, 0) scale(0)",
                    opacity: 0,
                    pointerEvents: "none",
                    transitionDelay: `${(SHARE_ITEMS.length - 1 - i) * 30}ms`,
                  }),
            }}
          >
            {/* Instagram "link copied" tooltip */}
            {isCopied && item.instagram && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  right: 0,
                  background: "rgba(15,15,15,0.95)",
                  border: "1px solid rgba(225,48,108,0.45)",
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontSize: 11,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                Link copied! Paste on Instagram
              </div>
            )}

            <button
              type="button"
              aria-label={item.label}
              title={item.label}
              onClick={() => handleItemClick(item)}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: `1px solid ${isCopied ? "rgba(52,211,153,0.45)" : item.border}`,
                background: isCopied ? "rgba(52,211,153,0.18)" : item.bg,
                color: isCopied ? "#34d399" : item.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                flexShrink: 0,
              }}
            >
              {isCopied ? <CheckIcon /> : <item.Icon />}
            </button>

            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.70)",
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
                userSelect: "none",
                fontWeight: 500,
              }}
            >
              {isCopied && item.instagram ? "Copied!" : item.shortLabel}
            </span>
          </div>
        );
      })}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close share menu" : "Share this job"}
        title="Share"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: open
            ? "1px solid rgba(255,255,255,0.30)"
            : "1px solid rgba(255,255,255,0.15)",
          background: open
            ? "rgba(255,255,255,0.14)"
            : "rgba(255,255,255,0.08)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          color: "rgba(255,255,255,0.80)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          transition: "background 0.2s, border-color 0.2s, transform 0.2s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          zIndex: 1,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    </div>
  );
}
