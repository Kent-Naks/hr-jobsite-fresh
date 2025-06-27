import { notFound } from 'next/navigation';
import Link from 'next/link';
import jobs from '@/data/jobs.json';
import AdSlot from '@/components/AdSlot';
import type { Job } from '@/../types';

type PageProps = {
  params: {
    id: string;
  };
};

export default function JobDetail({ params }: PageProps) {
  const job = (jobs as Job[]).find(j => j.id === params.id);

  if (!job) return notFound();

  const recommendations = (jobs as Job[]).filter(
    j => j.id !== job.id && j.keywords.some(k => job.keywords.includes(k))
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <p className="mb-2">{job.location}</p>
      <p className="mb-6">{job.description}</p>

      <div className="mb-4">
        <AdSlot slot="1122334455" />
      </div>

      <form className="space-y-4" action="/">
        <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" />
        <input type="email" placeholder="Email" required className="w-full p-2 border rounded" />
        <input type="tel" placeholder="Phone Number" required className="w-full p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Application
        </button>
      </form>

      <h3 className="text-lg font-semibold mt-6">Recommended Jobs:</h3>
      <ul className="list-disc pl-6">
        {recommendations.map(j => (
          <li key={j.id}>
            <Link href={`/jobs/${j.id}`} className="text-blue-700 underline">
              {j.title}
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/"
        className="inline-block mt-4 bg-gray-700 text-white px-4 py-2 rounded"
      >
        Back to Jobs
      </Link>
    </div>
  );
}
