/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdSlot from '../../components/AdSlot'
import type { Job } from '@/../types'

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
}

const categoryImages: Record<string, string> = {
  business:  'https://i.pinimg.com/1200x/39/89/60/39896018cbbac2155cd77a9843ec6666.jpg',
  hr:        'https://i.pinimg.com/1200x/fc/a0/34/fca03430751532c1476f1b25bc3c3079.jpg',
  admin:     'https://i.pinimg.com/736x/05/72/ba/0572ba80787a7ec1c3afd11df80096cb.jpg',
  marketing: 'https://i.pinimg.com/1200x/39/89/60/39896018cbbac2155cd77a9843ec6666.jpg',
  sales:     'https://i.pinimg.com/1200x/f4/67/8b/f4678b8229e3429e80375750044ab59e.jpg',
  account:   'https://i.pinimg.com/1200x/ae/f6/8e/aef68e55a79feac28d5dc9c3baf471ec.jpg',
  operations:'https://i.pinimg.com/736x/62/58/8a/62588a7473f2369ffaa9c13294c12bd7.jpg',
  projects:  'https://i.pinimg.com/1200x/36/c6/f9/36c6f95b343a2d7b679ad4526e9355ba.jpg',
  strategy:  'https://i.pinimg.com/1200x/XX/XX/XX/your-strategy-image.jpg',
  logistics: 'https://i.pinimg.com/736x/62/58/8a/62588a7473f2369ffaa9c13294c12bd7.jpg',
  legal:     'https://i.pinimg.com/1200x/75/1e/15/751e15d434a390b4374300508ccfbb1f.jpg',
  it:        'https://i.pinimg.com/1200x/e6/26/0f/e6260fb8c9cea2369d7daaf0cf8f64fa.jpg',
}

/**
 * IMPORTANT:
 *  ──────────
 *  keep the function *async* **and** accept `params` as a **Promise**
 *  so its type line-up matches the auto-generated `PageProps`.
 */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params          // <- unwrap the promise here

  const jobs = allData[slug]
  if (!jobs) return notFound()

  const title = slug
    .split('-')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' & ')

  const heroImage = categoryImages[slug]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {heroImage && (
        <div
          className="relative w-full h-64 bg-cover bg-center mb-6 rounded-lg overflow-hidden"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
      )}

      <div className="mb-4">
        <AdSlot slot="2233445566" />
      </div>

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

      <div className="mt-6">
        <AdSlot slot="3344556677" />
      </div>
    </div>
  )
}
