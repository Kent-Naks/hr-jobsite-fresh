import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import { headers } from "next/headers";

const categoryImages: Record<string, string> = {
  business:  "https://i.pinimg.com/1200x/37/cf/1e/37cf1e0eeff2e9ed56861d49f6195f64.jpg",
  hr:        "https://i.pinimg.com/1200x/fc/a0/34/fca03430751532c1476f1b25bc3c3079.jpg",
  admin:     "https://i.pinimg.com/736x/05/72/ba/0572ba80787a7ec1c3afd11df80096cb.jpg",
  marketing: "https://i.pinimg.com/1200x/39/89/60/39896018cbbac2155cd77a9843ec6666.jpg",
  sales:     "https://i.pinimg.com/1200x/f4/67/8b/f4678b8229e3429e80375750044ab59e.jpg",
  account:   "https://i.pinimg.com/1200x/ae/f6/8e/aef68e55a79feac28d5dc9c3baf471ec.jpg",
  operations:"https://i.pinimg.com/736x/62/58/8a/62588a7473f2369ffaa9c13294c12bd7.jpg",
  projects:  "https://i.pinimg.com/1200x/36/c6/f9/36c6f95b343a2d7b679ad4526e9355ba.jpg",
  strategy:  "https://i.pinimg.com/1200x/29/0c/fc/290cfc31133166ddb68d6d0d731924bb.jpg",
  logistics: "https://i.pinimg.com/736x/42/6b/20/426b204c1133f76b1763fad8a9190c71.jpg",
  legal:     "https://i.pinimg.com/1200x/75/1e/15/751e15d434a390b4374300508ccfbb1f.jpg",
  it:        "https://i.pinimg.com/1200x/e6/26/0f/e6260fb8c9cea2369d7daaf0cf8f64fa.jpg",
};

type DisplayJob = {
  id: string;
  title: string;
  description?: string;
  salaryKES?: string;
  _source?: "db" | "json";
};

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Build absolute base URL for dev / proxy-friendly fetch
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;

  // Fetch jobs for this category
  const res = await fetch(`${base}/api/jobs?category=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  const jobs: DisplayJob[] = res.ok ? await res.json() : [];

  // Fetch live categories to resolve the human label (optional but nice)
  const catsRes = await fetch(`${base}/api/categories`, { cache: "no-store" });
  const cats: { slug: string; label: string }[] = catsRes.ok ? await catsRes.json() : [];
  const catLabel = cats.find((c) => c.slug === slug)?.label;

  // Prefer DB label; fall back to prettified slug
  const title =
    catLabel ??
    slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

  const heroImage = categoryImages[slug];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Hero image (optional for unknown slugs) */}
      {heroImage && (
        <div
          className="relative w-full h-64 mb-6 rounded-lg bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
      )}

      {/* Ad above list */}
      <AdSlot slot="2233445566" />

      {/* Job list */}
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
                  <p className="text-sm text-gray-500 line-clamp-2">{job.description}</p>
                )}
                {job.salaryKES && (
                  <p className="text-sm text-emerald-500">{job.salaryKES}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Ad below list */}
      <AdSlot slot="3344556677" />
    </div>
  );
}
