// src/app/categories/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdSlot from '../../components/AdSlot';

import business   from '../../data/business.json';
import hr         from '../../data/hr.json';
import admin      from '../../data/admin.json';
import marketing  from '../../data/marketing.json';
import sales      from '../../data/sales.json';
import account    from '../../data/account.json';
import operations from '../../data/operations.json';
import projects   from '../../data/projects.json';
import strategy   from '../../data/strategy.json';
import logistics  from '../../data/logistics.json';
import legal      from '../../data/legal.json';
import it         from '../../data/it.json';

const allData: Record<string, any[]> = {
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

// Category-specific hero images
const categoryImages: Record<string, string> = {
  hr: 'https://i.pinimg.com/1200x/fc/a0/34/fca03430751532c1476f1b25bc3c3079.jpg',
  // ...more mappings as needed
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const jobs = allData[slug];
  if (!jobs) return notFound();

  // Title formatting
  const title = slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' & ');

  const heroImage = categoryImages[slug];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* HERO IMAGE */}
      {heroImage && (
        <div
          className="relative w-full h-64 bg-cover bg-center mb-6 rounded-lg overflow-hidden"
          style={{ backgroundImage: `url('${heroImage}')` }}
        >
          
          <div className="relative z-10 flex h-full items-center justify-center text-white text-2xl font-bold">
            {title} Jobs
          </div>
        </div>
      )}

      {/* TOP AD */}
      <div className="mb-4">
        <AdSlot slot="2233445566" />
      </div>

      {/* JOB LIST */}
      <h1 className="text-2xl font-bold mb-4">{title} Jobs</h1>
      <ul className="space-y-4">
        {jobs.map(job => (
          <li key={job.id}>
            <Link
              href={`/jobs/${job.id}`}
              className="block p-4 border rounded hover:shadow transition"
            >
              <h2 className="text-lg font-semibold">{job.title}</h2>
              <p className="text-sm text-gray-600">{job.location}</p>
            </Link>
          </li>
        ))}
      </ul>

      {/* BOTTOM AD */}
      <div className="mt-6">
        <AdSlot slot="3344556677" />
      </div>
    </div>
  );
}
