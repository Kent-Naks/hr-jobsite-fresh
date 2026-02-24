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

      <h1 className="text-2xl font-bold mb-4">{title} Jobs</h1>

      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/jobs/${job.id}`}
                className="block p-4 border rounded hover:shadow transition"
              >
                <h2 className="text-lg font-semibold">{job.title}</h2>

                {job.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {job.description}
                  </p>
                )}

                {job.salaryKES && (
                  <p className="text-sm text-emerald-500">{job.salaryKES}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <AdSlot slot="3344556677" />
    </div>
  );
}
