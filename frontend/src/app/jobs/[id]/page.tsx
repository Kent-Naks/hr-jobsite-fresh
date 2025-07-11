// frontend/src/app/jobs/[id]/page.tsx
import { notFound } from 'next/navigation'
import jobs from '@/data/jobs.json'
import type { Job } from '@/../types'
import AdSlot from '@/components/AdSlot'
import JobForm from './JobForm'

export default async function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Await the dynamic param
  const { id } = await params

  // Find your job
  const job = (jobs as Job[]).find((j) => j.id === id)
  if (!job) return notFound()

  // Build recommendations
  const recommendations = (jobs as Job[]).filter(
    (j) =>
      j.id !== job.id &&
      j.keywords.some((k) => job.keywords.includes(k))
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <p className="mb-2">{job.location}</p>
      <p className="mb-6">{job.description}</p>

      <div className="mb-4">
        <AdSlot slot="1122334455" />
      </div>

      <JobForm recommendations={recommendations} />
    </div>
  )
}
