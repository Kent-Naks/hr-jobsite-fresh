// src/app/categories/[slug]/page.tsx
import AdSlot from "@/components/AdSlot";
import { headers } from "next/headers";
import VideoHero from "@/components/VideoHero";
import JobList, { JobItem } from "./JobList";

// Category videos
const categoryVideos: Record<string, string[]> = {
  admin: ["admin.mp4"],
  agriculture: ["agriculture.mp4", "agriculture1.mp4", "agriculture2.mp4", "agriculture3.mp4"],
  education: ["education.mp4","education1.mp4","education2.mp4","education3.mp4","education4.mp4"],
  engineering: ["engineering.mp4"],
  hospitality: ["hospitality.mp4","hospitality2.mp4","hospitality3.mp4","hospitality4.mp4","hospitality5.mp4"],
  logistics: ["logistics.mp4"],
  operations: ["operations.mp4"],
  sports: ["sports.mp4"],
  "finance-accounting": ["finance-accounting.mp4"],
  hr: ["hr.mp4"],
  home: ["home.mp4","home1.mp4","home2.mp4","home3.mp4","home5.mp4"],
  "humanities-ngos": ["humanities-ngos.mp4"],
  legal: ["legal.mp4"],
  marketing: ["marketing.mp4"],
  "protective-services-security": ["protective-services-security.mp4"],
  strategy: ["strategy.mp4"],
  "media-entertainment-events": ["media-entertainment-events.mp4"],
  sales: ["sales.mp4"],
};

// Slug → video key
const slugToVideoKey: Record<string, string> = {
  "administrative-jobs": "admin",
  "agriculture-fishing-and-forestry": "agriculture",
  education: "education",
  engineering: "engineering",
  hospitality: "hospitality",
  "logistics-and-supply-chain": "logistics",
  operations: "operations",
  sports: "sports",
  "finance-and-accounting": "finance-accounting",
  "hr-and-recruitment": "hr",
  "marketing-and-brand": "marketing",
  "legal-and-compliance": "legal",
  "protective-services-security-personnel": "protective-services-security",
  "sales-and-biz-dev": "sales",
  "media-entertainment-and-events": "media-entertainment-events",
  "strategy-and-policy": "strategy",
  "humanities-and-ngos": "humanities-ngos",
  home: "home",
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const videoKey = slugToVideoKey[slug] ?? slug;
  const videos = categoryVideos[videoKey] ?? [];

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;

  const res = await fetch(`${base}/api/jobs?category=${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
  const jobs: JobItem[] = res.ok ? await res.json() : [];

  const catsRes = await fetch(`${base}/api/categories`, { next: { revalidate: 300 } });
  const cats: { slug: string; label: string }[] = catsRes.ok ? await catsRes.json() : [];
  const catLabel = cats.find((c) => c.slug === slug)?.label;

  const title =
    catLabel ??
    slug.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <VideoHero videos={videos} />

      <AdSlot slot="2233445566" />

      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-1">{title} Jobs</h1>
      </div>

      {/* Client island: sticky search + filtered glass cards + New badge */}
      <JobList jobs={jobs} />

      <div className="mt-8">
        <AdSlot slot="3344556677" />
      </div>
    </div>
  );
}
