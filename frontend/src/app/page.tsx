import React from "react";
import Link from "next/link";
import AdSlot from "./components/AdSlot";
import FlashBanner from "./components/FlashBanner";
import ScrollReveal from "./components/ScrollReveal";
import { headers } from "next/headers";

type Category = { slug: string; label: string; count: number };

export default async function HomePage() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;

  const res = await fetch(`${base}/api/categories`, { cache: "no-store" });
  const categories: Category[] = res.ok ? await res.json() : [];

  const totalJobs = categories.reduce((acc, c) => acc + (c.count ?? 0), 0);

  return (
    <>
      {/* ── APPLE-STYLE HERO ──────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "520px" }}>
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/1200x/04/29/95/04299542ecddde63a7ffbd10f24990f8.jpg')",
            filter: "brightness(0.50)",
          }}
        />
        <div className="hero-overlay absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.45) 0%, transparent 50%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        <div
          className="animate-float-slow absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)" }}
        />
        <div
          className="animate-float-delayed absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-28 sm:py-36">
          <div className="animate-float">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              East Africa&apos;s Talent Platform
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight mb-4 drop-shadow-2xl">
              Find Your Next
              <span
                className="block mt-1"
                style={{
                  background: "linear-gradient(90deg, #ffffff 0%, #d1d5db 50%, #9ca3af 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Career Move
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto mb-10 drop-shadow leading-relaxed">
              Transparent hiring. No games. Real opportunities across East Africa.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#categories"
                className="inline-block px-8 py-3 rounded-full font-semibold text-black transition-all duration-300 hover:scale-105 shadow-2xl"
                style={{ background: "linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)" }}
              >
                Browse Jobs
              </a>
              <Link
                href="/about"
                className="inline-block px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.20)",
                }}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 inset-x-0 h-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
        />
      </div>

      {/* ── STATS PILL ────────────────────────────────────────────────── */}
      {totalJobs > 0 && (
        <div className="flex justify-center -mt-5 relative z-10 px-6">
          <div
            className="inline-flex items-center gap-5 px-6 py-3 rounded-full text-sm animate-fade-slide-up"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.12)",
              animationDelay: "0.3s",
            }}
          >
            <span className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#34d399" }}
              />
              <span className="text-white font-semibold">{totalJobs}</span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>open roles</span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span className="flex items-center gap-2">
              <span className="text-white font-semibold">{categories.length}</span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>categories</span>
            </span>
          </div>
        </div>
      )}

      {/* ── CATEGORIES GRID ───────────────────────────────────────────── */}
      <div id="categories" className="p-6 max-w-7xl mx-auto mt-8">
        <FlashBanner />

        <div className="mb-6">
          <AdSlot slot="1234567890" />
        </div>

        <ScrollReveal>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Job Categories</h2>
            <p className="text-sm text-gray-400">Browse opportunities by field</p>
          </div>

          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 mb-8">No categories yet.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {categories.map((cat, i) => (
                <li
                  key={cat.slug}
                  className="animate-fade-slide-up"
                  style={{ animationDelay: `${0.05 + i * 0.055}s` }}
                >
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="glass-card glass-card-hover block p-5 group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white transition-colors">{cat.label}</span>
                      <span
                        className="text-lg transition-transform duration-300 group-hover:translate-x-1"
                        style={{ color: "rgba(255,255,255,0.28)" }}
                      >
                        →
                      </span>
                    </div>
                    {cat.count > 0 && (
                      <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.38)" }}>
                        {cat.count} {cat.count === 1 ? "role" : "roles"} available
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ScrollReveal>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
        <ScrollReveal delay={100}>
          <div className="my-12">
            <h2 className="text-2xl font-bold text-center mb-2">How it works</h2>
            <p className="text-center text-sm text-gray-400 mb-8">Three steps to your next role</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: "01",
                  title: "Browse",
                  desc: "Explore jobs across all categories — salaries are always shown upfront.",
                },
                {
                  step: "02",
                  title: "Apply",
                  desc: "Submit your CV and cover letter in minutes directly on the job page.",
                },
                {
                  step: "03",
                  title: "Get hired",
                  desc: "Shortlisted candidates are contacted directly by the employer.",
                },
              ].map((item, i) => (
                <ScrollReveal key={item.step} delay={i * 120}>
                  <div className="glass-card p-6 text-center">
                    <div
                      className="text-4xl font-black mb-3"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {item.step}
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {item.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-6">
          <AdSlot slot="0987654321" />
        </div>
      </div>
    </>
  );
}
