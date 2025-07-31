import { notFound } from "next/navigation";
import Link   from "next/link";
import AdSlot from "@/components/AdSlot";
import type { Job } from "@/types";

import business   from "../../data/business.json";
import hr         from "../../data/hr.json";
import admin      from "../../data/admin.json";
import marketing  from "../../data/marketing.json";
import sales      from "../../data/sales.json";
import account    from "../../data/account.json";
import operations from "../../data/operations.json";
import projects   from "../../data/projects.json";
import strategy   from "../../data/strategy.json";
import logistics  from "../../data/logistics.json";
import legal      from "../../data/legal.json";
import it         from "../../data/it.json";

const allData: Record<string, Job[]> = {
  business,
  hr,
  admin,
  marketing,
  sales,
  account,
  operations,
  projects,
  strategy,
  logistics,
  legal,
  it,
};

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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;   // <-- Promise
}) {
  const { slug } = await params;       // <-- unwrap it
  const jobs = allData[slug];
  if (!jobs) return notFound();

  const title = slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" & ");

  const heroImage = categoryImages[slug];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Hero image */}
      {heroImage && (
        <div
          className="relative w-full h-64 mb-6 rounded-lg bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
      )}

      {/* Ad above list */}
      <AdSlot slot="2233445566"/>

      {/* Job list */}
      <h1 className="text-2xl font-bold mb-4">{title} Jobs</h1>
      <ul className="space-y-4">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link
              href={`/jobs/${job.id}`}
              className="block p-4 border rounded hover:shadow transition"
            >
              <h2 className="text-lg font-semibold">{job.title}</h2>
              <p className="text-sm text-gray-500">{job.location}</p>
            </Link>
          </li>
        ))}
      </ul>

      {/* Ad below list */}
      <AdSlot slot="3344556677"/>
    </div>
  );
}
