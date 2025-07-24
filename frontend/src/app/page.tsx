// src/app/page.tsx
import React from "react";
import Link from "next/link";
import AdSlot from "./components/AdSlot";

import business   from "./data/business.json";
import hr         from "./data/hr.json";
import admin      from "./data/admin.json";
import marketing  from "./data/marketing.json";
import sales      from "./data/sales.json";
import account    from "./data/account.json";
import operations from "./data/operations.json";
import projects   from "./data/projects.json";
import strategy   from "./data/strategy.json";
import logistics  from "./data/logistics.json";
import legal      from "./data/legal.json";
import it         from "./data/it.json";

interface Category {
  slug: string;
  label: string;
  count: number;
}

const categories: Category[] = [
  { slug: "business",  label: "Business Jobs",           count: business.length },
  { slug: "hr",        label: "HR & Recruitment",         count: hr.length },
  { slug: "admin",     label: "Administrative Jobs",      count: admin.length },
  { slug: "marketing", label: "Marketing & Brand",        count: marketing.length },
  { slug: "sales",     label: "Sales & Biz‑Dev",          count: sales.length },
  { slug: "account",   label: "Account & Client Management", count: account.length },
  { slug: "operations",label: "Operations",               count: operations.length },
  { slug: "projects",  label: "Project Management",       count: projects.length },
  { slug: "strategy",  label: "Strategy & Policy",        count: strategy.length },
  { slug: "logistics", label: "Logistics & Supply Chain", count: logistics.length },
  { slug: "legal",     label: "Legal & Compliance",       count: legal.length },
  { slug: "it",        label: "IT & Tech",                count: it.length },
];

type Job = {
  id: number;
  title: string;
  description: string;
};

export default async function HomePage() {
  // 1) Fetch live jobs
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/jobs`,
    { cache: "no-store" }
  );
  const jobs: Job[] = await res.json();

  return (
    <>
      {/* FULL‑WIDTH HERO */}
      <div
        className="relative w-full h-96 bg-cover bg-center rounded-b-3xl"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/04/29/95/04299542ecddde63a7ffbd10f24990f8.jpg')",
        }}
      >
        <div className="hero-text text-white text-2xl font-bold">
          Browse Jobs by Category
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* TOP AD */}
        <div className="mb-4">
          <AdSlot slot="1234567890" />
        </div>

        {/* CATEGORY GRID */}
        <h2 className="text-2xl font-semibold mb-4">Job Categories</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/categories/${cat.slug}`}
                className="block p-4 border rounded-lg hover:shadow transition"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{cat.label}</span>
                  <span className="text-gray-500">({cat.count})</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* LATEST JOBS */}
        <h2 className="text-2xl font-semibold mb-4">Latest Job Listings</h2>
        {jobs.length ? (
          <ul className="space-y-4 mb-8">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="p-4 border rounded-lg hover:shadow transition"
              >
                <Link href={`/jobs/${job.id}`} className="block">
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-gray-600">{job.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-8">No jobs found.</p>
        )}

        {/* BOTTOM AD */}
        <div className="mt-6">
          <AdSlot slot="0987654321" />
        </div>
      </div>
    </>
  );
}
