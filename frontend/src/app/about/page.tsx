// src/app/about/page.tsx
import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ScrollCountUp from "./ScrollCountUp";
import MarqueeTicker from "./MarqueeTicker";
import ScrollReveal from "@/components/ScrollReveal";

export default async function AboutPage() {
  let jobCount = 0;
  let categoryCount = 0;
  let latestJobs: { id: string; title: string; categoryLabel?: string }[] = [];
  let categoryNames: string[] = [];

  try {
    jobCount = await prisma.job.count({
      where: {
        status: "published",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  } catch (err) {
    console.error("AboutPage: job count failed:", err);
  }

  try {
    const cats = await prisma.category.findMany({ select: { label: true } });
    categoryCount = cats.length;
    categoryNames = cats.map((c) => c.label);
  } catch (err) {
    console.error("AboutPage: category count failed:", err);
  }

  try {
    const jobs = await prisma.job.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      include: { category: true },
      take: 6,
    });
    latestJobs = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      categoryLabel: j.category?.label,
    }));
  } catch (err) {
    console.error("AboutPage: latest jobs fetch failed:", err);
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* ── ANIMATED HERO ─────────────────────────────────────────────── */}
      <div
        className="relative px-6 pt-14 pb-12 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Floating background text layers */}
        <div
          className="animate-float-slow absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ opacity: 0.025 }}
        >
          <span className="text-[14vw] font-black text-white whitespace-nowrap">TALENT</span>
        </div>
        <div
          className="animate-float absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ opacity: 0.015 }}
        >
          <span className="text-[10vw] font-black text-white whitespace-nowrap translate-y-8">AFRICA</span>
        </div>

        {/* Foreground content */}
        <div className="relative z-10 animate-fade-slide-up" style={{ animationDelay: "0.05s" }}>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Our Story
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            About{" "}
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

          <div
            className="glass-card p-6 space-y-4 text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl"
          >
            <p>
              <strong className="text-white">The Talent Africa</strong> is not your typical career
              website. Our mission is to make sure job seekers are never undercut, whether by
              undervaluing their worth or being disqualified for going slightly above a company&apos;s
              internal budget.
            </p>
            <p>
              We exist to promote <strong className="text-white">transparency</strong> and ensure both
              employers and applicants get value for their time and experience. In our contracts with
              employers, we require that a <strong className="text-white">rough job location</strong> be
              provided so applicants can factor in commute, cost of living, and accessibility when
              determining salary expectations.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">

        {/* ── STAT COUNTERS (scroll-triggered) ──────────────────────── */}
        <ScrollReveal>
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="glass-card p-6">
              <ScrollCountUp to={jobCount ?? 0} label="Published jobs" />
            </div>
            <div className="glass-card p-6">
              <ScrollCountUp to={categoryCount ?? 0} label="Categories" />
            </div>
          </section>
        </ScrollReveal>

        {/* ── MARQUEE TICKER ─────────────────────────────────────────── */}
        {categoryNames.length > 0 && (
          <div className="mb-10">
            <MarqueeTicker categories={categoryNames} />
          </div>
        )}

        {/* ── LATEST ROLES ────────────────────────────────────────────── */}
        <ScrollReveal>
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white">Latest roles</h2>
              <Link
                href="/jobs"
                className="text-sm nav-link"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                View all →
              </Link>
            </div>

            {latestJobs.length === 0 ? (
              <div className="glass-card p-6 text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                No recent jobs to show right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestJobs.map((j, i) => (
                  <ScrollReveal key={j.id} delay={i * 70}>
                    <article className="glass-card glass-card-hover p-5 h-full">
                      <h3 className="font-semibold text-white text-base mb-1">{j.title}</h3>
                      <div className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {j.categoryLabel ?? "General"}
                      </div>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/jobs/${j.id}`}
                          className="text-sm nav-link"
                          style={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          View
                        </Link>
                        <Link
                          href={`/jobs/${j.id}`}
                          className="text-xs px-3 py-1 rounded-full transition-all duration-200"
                          style={{
                            border: "1px solid rgba(255,255,255,0.18)",
                            color: "rgba(255,255,255,0.7)",
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          Apply now
                        </Link>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </section>
        </ScrollReveal>

        {/* ── MISSION / HOW / PARTNER ───────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: "🎯",
              title: "Our mission",
              content: (
                <p className="text-sm text-gray-400 leading-relaxed">
                  Bring <strong className="text-gray-200">transparency</strong> and fairness into
                  recruitment, changing a system that has often been{" "}
                  <em>predatory against job seekers</em> into one built on{" "}
                  <strong className="text-gray-200">honesty, respect, and equal value exchange</strong>.
                </p>
              ),
            },
            {
              icon: "⚡",
              title: "How it works",
              content: (
                <ol className="list-decimal ml-5 text-sm text-gray-400 space-y-2 leading-relaxed">
                  <li>Apply with a CV &amp; cover letter</li>
                  <li>Employers review and reach out</li>
                </ol>
              ),
            },
            {
              icon: "🤝",
              title: "Want to partner?",
              content: (
                <p className="text-sm text-gray-400 leading-relaxed">
                  Hiring drives, NGOs, or enterprise partnerships?{" "}
                  <Link href="/contact" className="text-white underline">
                    Get in touch
                  </Link>
                  .
                </p>
              ),
            },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 100}>
              <div className="glass-card p-6 h-full">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                {item.content}
              </div>
            </ScrollReveal>
          ))}
        </section>

        {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
        <ScrollReveal>
          <section>
            <h2 className="text-2xl font-bold text-white mb-5">What people say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <blockquote className="glass-card p-6">
                <p className="italic text-gray-300 leading-relaxed">
                  &ldquo;The Talent Africa helped us hire across multiple markets quickly.&rdquo;
                </p>
                <footer className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Hiring Manager, Tech Startup
                </footer>
              </blockquote>
              <blockquote className="glass-card p-6">
                <p className="italic text-gray-300 leading-relaxed">
                  &ldquo;Easy application flow, and it&apos;s the transparency for me.&rdquo;
                </p>
                <footer className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Candidate, Nairobi
                </footer>
              </blockquote>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
