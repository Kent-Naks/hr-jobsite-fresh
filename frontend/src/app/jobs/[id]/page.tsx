// frontend/src/app/jobs/[id]/page.tsx
import { notFound } from 'next/navigation'
import jobs from '@/data/jobs.json'
import type { Job } from '@/../types'
import AdSlot from '@/components/AdSlot'
import JobForm from './JobForm'

export default async function JobDetail({
  params,
}: {
  params: { id: string }
}) {
  const job = (jobs as Job[]).find((j) => j.id === params.id)
  if (!job) return notFound()

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
