// src/app/contact/page.tsx
"use client";

import React, { useEffect, useState } from "react";

type SentState = { ok: boolean; msg: string } | null;

// ─── Confetti ────────────────────────────────────────────────────────────────

const COLORS = ["#34d399", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa", "#fb7185"];

function ConfettiBlast() {
  const [particles] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: `${Math.random() * 0.8}s`,
      duration: `${1.8 + Math.random() * 1.4}s`,
      size: `${6 + Math.random() * 6}px`,
      rotate: Math.random() > 0.5 ? "1" : "-1",
    }))
  );

  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

// ─── Input style helpers ──────────────────────────────────────────────────────

const baseInput: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "0.5rem",
  color: "#fff",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.38)";
  e.currentTarget.style.boxShadow =
    "0 0 0 3px rgba(255,255,255,0.07), 0 0 18px rgba(255,255,255,0.05)";
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
  e.currentTarget.style.boxShadow = "none";
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<SentState>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showConfetti, setShowConfetti] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSent(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();
      if (res.ok) {
        setSent({ ok: true, msg: data?.message ?? "Message sent!" });
        setShowConfetti(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setSent({ ok: false, msg: data?.error ?? "Failed to send" });
      }
    } catch (err) {
      console.error(err);
      setSent({ ok: false, msg: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {showConfetti && <ConfettiBlast key={Date.now()} />}

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="mb-8 animate-fade-slide-up" style={{ animationDelay: "0.05s" }}>
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          Get in touch
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
          Contact{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #ffffff 0%, #9ca3af 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            The Talent Africa
          </span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
          Questions, partnerships, or support. We&apos;ll get back to you within 1–2 business days.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── FORM ──────────────────────────────────────────────────── */}
        <div
          className="glass-card p-6 animate-fade-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          <h2 className="font-bold text-white mb-5 text-lg">Send a message</h2>

          {/* Success state */}
          {sent?.ok ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}
              >
                <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Message sent!</p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  We&apos;ll be in touch within 1–2 business days.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSent(null)}
                className="text-xs px-4 py-1.5 rounded-full transition-colors"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  style={baseInput}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  required
                />
                <input
                  style={baseInput}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  required
                />
              </div>

              <input
                style={baseInput}
                placeholder="Subject (optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
              />

              <textarea
                rows={6}
                style={{ ...baseInput, resize: "vertical" }}
                placeholder="How can we help?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                required
              />

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
                  style={{
                    background: loading ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.90)",
                    color: loading ? "#fff" : "#000",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {loading ? "Sending…" : "Send message"}
                </button>

                {sent && !sent.ok && (
                  <div className="text-sm text-red-400">{sent.msg}</div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* ── SIDEBAR ───────────────────────────────────────────────── */}
        <aside className="space-y-4 animate-fade-slide-up" style={{ animationDelay: "0.22s" }}>
          {/* Contact details */}
          <div className="glass-card p-5">
            <h3 className="font-bold text-white mb-3">Contact details</h3>
            <div className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              <p className="flex items-center gap-2">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>✉</span>
                <a href="mailto:thetalentafrica@zohomail.com" className="hover:text-white transition-colors">
                  thetalentafrica@zohomail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>🕐</span>
                Mon–Fri, 9:00–17:00 EAT
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="glass-card overflow-hidden">
            <div className="p-4">
              <h4 className="font-bold text-white mb-1">Our location</h4>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Nairobi, Kenya</p>
            </div>
            <div style={{ height: 200 }} className="w-full">
              <iframe
                title="The Talent Africa location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=36.75%2C-1.35%2C36.95%2C-1.15&layer=mapnik"
                style={{ border: 0, width: "100%", height: "100%", filter: "invert(0.9) hue-rotate(180deg)" }}
              />
            </div>
            <div className="px-4 py-2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Map data © OpenStreetMap contributors
            </div>
          </div>

          {/* FAQ */}
          <div className="glass-card p-5">
            <h4 className="font-bold text-white mb-3">FAQ</h4>
            <div className="space-y-1 divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {[
                { q: "How long until I hear back?", a: "Typically 1–2 business days for shortlisted candidates; may vary by employer." },
                { q: "Can I apply without a CV?", a: "Most employers require a CV. Required fields are marked on each job page." },
                { q: "Partnership inquiries", a: "Fill the form with details and we'll get back to discuss partnerships." },
              ].map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left text-sm py-1.5 transition-colors"
                    style={{ color: openFaq === idx ? "#fff" : "rgba(255,255,255,0.65)" }}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span>{item.q}</span>
                      <span style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>
                        {openFaq === idx ? "−" : "+"}
                      </span>
                    </div>
                  </button>
                  {openFaq === idx && (
                    <div className="text-xs leading-relaxed pb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
