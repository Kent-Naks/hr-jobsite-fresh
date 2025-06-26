'use client';

import { useState } from 'react';
import Link from 'next/link';
import jobs from '@/app/data/jobs.json';
import type { Job } from '@/app/types';
import AdSlot from '@/app/components/AdSlot';

export default function HomePage() {
  const [search, setSearch] = useState('');

  const filteredJobs = (jobs as Job[]).filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <AdSlot slot="1234567890" />
      </div>

      <input
        type="text"
        placeholder="Search jobs..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-3 border rounded mb-6"
      />

      <div className="space-y-4">
        {filteredJobs.map((job: Job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block p-4 border rounded hover:shadow"
          >
            <h2 className="text-lg font-semibold">{job.title}</h2>
            <p className="text-sm text-gray-600">{job.location}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <AdSlot slot="0987654321" />
      </div>
    </div>
  );
}


