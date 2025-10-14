// src/app/contact/page.tsx
"use client";

import React, { useState } from "react";

type SentState = { ok: boolean; msg: string } | null;

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
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Contact Talent Africa</h1>
        <p className="text-gray-300">Questions, partnerships, or support. We’ll get back to you within 1-2 business days.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="w-full p-2 border rounded bg-transparent"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="w-full p-2 border rounded bg-transparent"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <input
            className="w-full p-2 border rounded bg-transparent"
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <textarea
            rows={6}
            className="w-full p-2 border rounded bg-transparent"
            placeholder="How can we help?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send message"}
            </button>

            {sent && (
              <div className={`text-sm ${sent.ok ? "text-emerald-400" : "text-red-400"}`}>
                {sent.msg}
              </div>
            )}
          </div>
        </form>

        {/* Sidebar: contact details, map, FAQ */}
        <aside className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-semibold">Contact details</h3>
            <p className="text-sm text-gray-300 mt-2">Email: <a href="mailto:hello@talent.africa" className="underline">hello@talent.africa</a></p>
            <p className="text-sm text-gray-300">Support hours: Mon–Fri, 9:00–17:00 (EAT)</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="p-3">
              <h4 className="font-semibold mb-2">Our location</h4>
              <p className="text-sm text-gray-300 mb-2">Nairobi, Kenya approximate location shown below</p>
            </div>
            {/* OpenStreetMap iframe (no API key required) */}
            <div style={{ height: 220 }} className="w-full">
              <iframe
                title="Talent Africa location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=36.75%2C-1.35%2C36.95%2C-1.15&layer=mapnik"
                style={{ border: 0, width: "100%", height: "100%" }}
              />
            </div>
            <div className="p-3 text-sm text-gray-400">Map: OpenStreetMap</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <h4 className="font-semibold mb-2">FAQ</h4>

            <div className="space-y-2">
              <div>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                  className="w-full text-left text-sm"
                >
                  <div className="flex justify-between items-center">
                    <span>How long until I hear back?</span>
                    <span className="text-xs text-gray-400">{openFaq === 0 ? "—" : "+"}</span>
                  </div>
                </button>
                {openFaq === 0 && <div className="mt-2 text-sm text-gray-300">Typically 1–2 business days for shortlisted candidates; may vary by employer.</div>}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                  className="w-full text-left text-sm"
                >
                  <div className="flex justify-between items-center">
                    <span>Can I apply without a CV?</span>
                    <span className="text-xs text-gray-400">{openFaq === 1 ? "—" : "+"}</span>
                  </div>
                </button>
                {openFaq === 1 && <div className="mt-2 text-sm text-gray-300">Most employers require a CV — required fields are marked on job pages.</div>}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                  className="w-full text-left text-sm"
                >
                  <div className="flex justify-between items-center">
                    <span>Partnership inquiries</span>
                    <span className="text-xs text-gray-400">{openFaq === 2 ? "—" : "+"}</span>
                  </div>
                </button>
                {openFaq === 2 && <div className="mt-2 text-sm text-gray-300">Fill the form with details and we’ll get back to discuss partnerships.</div>}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
