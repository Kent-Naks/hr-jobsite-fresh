// src/app/categories/[slug]/page.tsx

import { notFound } from 'next/navigation'
import Link from 'next/link'

import business   from '../../data/business.json'
import hr         from '../../data/hr.json'
import admin      from '../../data/admin.json'
import marketing  from '../../data/marketing.json'
import sales      from '../../data/sales.json'
import account    from '../../data/account.json'
import operations from '../../data/operations.json'
import projects   from '../../data/projects.json'
import strategy   from '../../data/strategy.json'
import logistics  from '../../data/logistics.json'
import legal      from '../../data/legal.json'
import it         from '../../data/it.json'

const allData: Record<string, any[]> = {
  business, hr, admin, marketing, sales,
  account, operations, projects, strategy,
  logistics, legal, it
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const jobs = allData[params.slug]
  if (!jobs) return notFound()

  const pretty = params.slug
    .replace(/[-_]/g, ' ')
    .replace(/^./, c => c.toUpperCase())

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{pretty} Jobs</h1>
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
    </div>
  )
}
