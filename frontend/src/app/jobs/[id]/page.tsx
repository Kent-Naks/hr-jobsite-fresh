// src/app/jobs/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Job } from '@/../types'             // adjust if your types live elsewhere
import AdSlot from '../../components/AdSlot';
import JobForm from './JobForm';

// 1. Pull in every category file and flatten into one array:
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

const jobs: Job[] = [
  ...business,
  ...hr,
  ...admin,
  ...marketing,
  ...sales,
  ...account,
  ...operations,
  ...projects,
  ...strategy,
  ...logistics,
  ...legal,
  ...it,
];

export default function JobDetail({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const job = jobs.find((j) => j.id === id);
  if (!job) return notFound();

  const recommendations = jobs.filter(
    (j) =>
      j.id !== job.id &&
      j.keywords.some((k) => job.keywords.includes(k))
  );

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
  );
}
