"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export type JobItem = {
  id: string;
  title: string;
  description?: string;
  salaryKES?: string;
  publishedAt?: string | null;
  createdAt?: string | null;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isNew(job: JobItem): boolean {
  const dateStr = job.publishedAt ?? job.createdAt;
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < SEVEN_DAYS_MS;
}

export default function JobList({ jobs }: { jobs: JobItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => j.title.toLowerCase().includes(q));
  }, [jobs, query]);

  return (
    <div>
      {/* Sticky search bar */}
      <div
        className="sticky z-30 mb-4 py-3"
        style={{ top: "72px" }}
      >
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "rgba(255,255,255,0.35)" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by job title…"
            className="search-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div
          className="glass-card p-8 text-center text-sm"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {query ? `No results for "${query}"` : "No jobs found in this category yet."}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((job, i) => {
            const fresh = isNew(job);
            return (
              <li
                key={job.id}
                className="animate-fade-slide-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <Link
                  href={`/jobs/${job.id}`}
                  className="glass-card glass-card-hover block p-5 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-lg font-semibold text-white transition-colors">
                          {job.title}
                        </h2>
                        {fresh && (
                          <span
                            className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(52,211,153,0.15)",
                              border: "1px solid rgba(52,211,153,0.3)",
                              color: "#34d399",
                            }}
                          >
                            New
                          </span>
                        )}
                      </div>

                      {job.description && (
                        <p
                          className="text-sm line-clamp-2"
                          style={{ color: "rgba(255,255,255,0.48)" }}
                        >
                          {job.description}
                        </p>
                      )}

                      {job.salaryKES && (
                        <p className="text-sm font-medium text-emerald-400 mt-2">
                          {job.salaryKES}
                        </p>
                      )}
                    </div>

                    <span
                      className="shrink-0 text-base mt-1 transition-transform duration-300 group-hover:translate-x-1"
                      style={{ color: "rgba(255,255,255,0.22)" }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
