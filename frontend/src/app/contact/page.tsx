// src/app/contact/page.tsx
"use client";

import React, { useState } from "react";

type SentState = { ok: boolean; msg: string } | null;

const inputStyle: React.CSSProperties = {
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

const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.30)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,255,255,0.05)";
};
const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
  e.currentTarget.style.boxShadow = "none";
};

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<SentState>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
        setSent({ ok: true, msg: data?.message ?? "Message sent." });
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
        {/* ── FORM ────────────────────────────────────────────────── */}
        <div
          className="glass-card p-6 animate-fade-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          <h2 className="font-bold text-white mb-5 text-lg">Send a message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                style={inputStyle}
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                required
              />
              <input
                style={inputStyle}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                required
              />
            </div>

            <input
              style={inputStyle}
              placeholder="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onFocus={inputFocusHandler}
              onBlur={inputBlurHandler}
            />

            <textarea
              rows={6}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="How can we help?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={inputFocusHandler}
              onBlur={inputBlurHandler}
              required
            />

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                style={{
                  background: loading ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)",
                  color: loading ? "#fff" : "#000",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {loading ? "Sending…" : "Send message"}
              </button>

              {sent && (
                <div
                  className={`text-sm ${sent.ok ? "text-emerald-400" : "text-red-400"}`}
                >
                  {sent.msg}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <aside className="space-y-4 animate-fade-slide-up" style={{ animationDelay: "0.22s" }}>
          {/* Contact details */}
          <div className="glass-card p-5">
            <h3 className="font-bold text-white mb-3">Contact details</h3>
            <div className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              <p className="flex items-center gap-2">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>✉</span>
                <a
                  href="mailto:thetalentafrica@zohomail.com"
                  className="hover:text-white transition-colors"
                >
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
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                Nairobi, Kenya
              </p>
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
                {
                  q: "How long until I hear back?",
                  a: "Typically 1–2 business days for shortlisted candidates; may vary by employer.",
                },
                {
                  q: "Can I apply without a CV?",
                  a: "Most employers require a CV — required fields are marked on job pages.",
                },
                {
                  q: "Partnership inquiries",
                  a: "Fill the form with details and we'll get back to discuss partnerships.",
                },
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
                    <div
                      className="text-xs leading-relaxed pb-2"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
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
