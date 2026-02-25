// src/app/categories/[slug]/page.tsx
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import { headers } from "next/headers";
import VideoHero from "@/components/VideoHero";

// Category images
const categoryImages: Record<string, string> = {
  business: "https://i.pinimg.com/1200x/37/cf/1e/37cf1e0eeff2e9ed56861d49f6195f64.jpg",
  hr: "https://i.pinimg.com/1200x/fc/a0/34/fca03430751532c1476f1b25bc3c3079.jpg",
  admin: "https://i.pinimg.com/736x/05/72/ba/0572ba80787a7ec1c3afd11df80096cb.jpg",
  marketing: "https://i.pinimg.com/1200x/39/89/60/39896018cbbac2155cd77a9843ec6666.jpg",
  sales: "https://i.pinimg.com/1200x/f4/67/8b/f4678b8229e3429e80375750044ab59e.jpg",
  account: "https://i.pinimg.com/1200x/ae/f6/8e/aef68e55a79feac28d5dc9c3baf471ec.jpg",
  operations:"https://as2.ftcdn.net/v2/jpg/06/36/54/45/1000_F_636544591_kB9slleGGbjewzLH1F2S7qVZrEWgqXcD.jpg",
  projects:"https://i.pinimg.com/1200x/36/c6/f9/36c6f95b343a2d7b679ad4526e9355ba.jpg",
  strategy:"https://i.pinimg.com/1200x/29/0c/fc/290cfc31133166ddb68d6d0d731924bb.jpg",
  logistics:"https://i.pinimg.com/736x/42/6b/20/426b204c1133f76b1763fad8a9190c71.jpg",
  legal:"https://i.pinimg.com/1200x/75/1e/15/751e15d434a390b4374300508ccfbb1f.jpg",
  it:"https://i.pinimg.com/1200x/e6/26/0f/e6260fb8c9cea2369d7daaf0cf8f64fa.jpg",
};

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

type DisplayJob = {
  id: string;
  title: string;
  description?: string;
  salaryKES?: string;
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
  const jobs: DisplayJob[] = res.ok ? await res.json() : [];

  const catsRes = await fetch(`${base}/api/categories`, { next: { revalidate: 300 } });
  const cats: { slug: string; label: string }[] = catsRes.ok ? await catsRes.json() : [];
  const catLabel = cats.find((c) => c.slug === slug)?.label;

  const title =
    catLabel ??
    slug.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* FINAL HERO (Client Component) */}
      <VideoHero videos={videos} />

      <AdSlot slot="2233445566" />

      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-1">{title} Jobs</h1>
        {jobs.length > 0 && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {jobs.length} {jobs.length === 1 ? "position" : "positions"} available
          </p>
        )}
      </div>

      {jobs.length === 0 ? (
        <div
          className="glass-card p-8 text-center"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          No jobs found in this category yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job, i) => (
            <li
              key={job.id}
              className="animate-fade-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <Link
                href={`/jobs/${job.id}`}
                className="glass-card glass-card-hover block p-5 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-white transition-colors">
                      {job.title}
                    </h2>

                    {job.description && (
                      <p className="text-sm line-clamp-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {job.description}
                      </p>
                    )}

                    {job.salaryKES && (
                      <p className="text-sm font-medium text-emerald-400 mt-2">{job.salaryKES}</p>
                    )}
                  </div>

                  <span
                    className="shrink-0 text-base mt-1 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <AdSlot slot="3344556677" />
      </div>
    </div>
  );
}
