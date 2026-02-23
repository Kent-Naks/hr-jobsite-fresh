// src/app/about/page.tsx
import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CountUp from "./CountUp"; // client component in same folder

export default async function AboutPage() {
  // Live counts & latest jobs (guarded)
  let jobCount = 0;
  let categoryCount = 0;
  let latestJobs: { id: string; title: string; categoryLabel?: string }[] = [];

  try {
    // Count only currently active published jobs (not expired)
    jobCount = await prisma.job.count({
      where: {
        status: "published",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  } catch (err) {
    console.error("AboutPage: job count failed:", err);
    jobCount = 0;
  }

  try {
    categoryCount = await prisma.category.count();
  } catch (err) {
    console.error("AboutPage: category count failed:", err);
    categoryCount = 0;
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
    latestJobs = [];
  }

  // avg removed — we no longer surface average jobs per category on About

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">About Talent Africa</h1>
        <p>
          <strong>Talent Africa</strong> is not your typical career website. Our
          mission is to make sure job seekers are never undercut, whether by
          undervaluing their worth or being disqualified for going slightly above
          a company’s internal budget. We aim to move away from the outdated idea
          that salary ranges should be used to filter candidates. From our
          research, we’ve found that many employers miss out on exceptional hires
          simply because of salary disqualifications.
        </p>

        

        <p>
          We exist to promote <strong>transparency</strong> and ensure both
          employers and applicants get value for their time and experience. In our
          contracts with employers, we require that a <strong>rough job
          location</strong> be provided so that applicants can consider relevant
          factors such as commute, cost of living, and accessibility when
          determining their salary expectations.
        </p>
      </header>

      {/* Counters */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <CountUp to={jobCount ?? 0} label="Published jobs" />
        <CountUp to={categoryCount ?? 0} label="Categories" />
      </section>

      {/* Latest jobs carousel / grid */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Latest roles</h2>
          <Link href="/jobs" className="text-sm underline">
            View all jobs
          </Link>
        </div>

        {latestJobs.length === 0 ? (
          <div className="p-6 bg-white/5 border border-white/10 rounded-md text-gray-300">
            No recent jobs to show right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestJobs.map((j) => (
              <article key={j.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:shadow-lg">
                <h3 className="font-semibold text-lg mb-1">{j.title}</h3>
                <div className="text-sm text-gray-300 mb-3">{j.categoryLabel ?? "General"}</div>
                <div className="flex items-center justify-between">
                  <Link href={`/jobs/${j.id}`} className="text-sm underline">
                    View
                  </Link>
                  <Link href={`/jobs/${j.id}`} className="text-xs px-2 py-1 border rounded text-gray-200">
                    Apply now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Team / Mission / CTA */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-5">
          <h3 className="font-semibold mb-2">Our mission</h3>
          <p className="text-sm text-gray-300">
          Our mission is to bring <strong>transparency</strong> and fairness into
          recruitment, changing a system that has often been
          <em> predatory against job seekers</em> into one built on
          <strong> honesty, respect, and equal value exchange</strong>. We’re here
          to transform recruitment culture across Africa by promoting openness,
          accountability, and human-centered hiring.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-5">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ol className="list-decimal ml-5 text-sm text-gray-300 space-y-2">
            
            <li>Apply with a CV & cover letter</li>
            <li>Employers review and reach out</li>
          </ol>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-5">
          <h3 className="font-semibold mb-2">Want to partner?</h3>
          <p className="text-sm text-gray-300 mb-3">
            If you'd like to partner (hiring drives, NGOs or enterprise),{" "}
            <Link href="/contact" className="underline">
              get in touch
            </Link>
            .
          </p>
          
        </div>
      </section>

      {/* Social proof / testimonials */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">What people say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <blockquote className="bg-white/5 border border-white/10 p-4 rounded">
            <p className="italic text-gray-200">"Talent Africa helped us hire across multiple markets quickly."</p>
            <footer className="mt-3 text-sm text-gray-400">— Hiring Manager, Tech Startup</footer>
          </blockquote>

          <blockquote className="bg-white/5 border border-white/10 p-4 rounded">
            <p className="italic text-gray-200">"Easy application flow plus its the transparency for me."</p>
            <footer className="mt-3 text-sm text-gray-400">— Candidate, Nairobi</footer>
          </blockquote>
        </div>
      </section>
    </div>
  );
}
