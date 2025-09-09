import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import JobForm from "./JobForm"; // adjust the relative path if your components are elsewhere
import { prisma } from "@/lib/prisma";

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

export const revalidate = 60; // ISR to reduce DB pressure

const allStatic = [
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

export default async function JobDetail({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // 1) Try database first
  const dbJob = await prisma.job.findUnique({
    where: { id },
    include: { category: true },
  });

  if (dbJob) {
    const salaryKES =
      dbJob.salaryMin != null && dbJob.salaryMax != null
        ? `K sh ${Number(dbJob.salaryMin).toLocaleString()} – ${Number(
            dbJob.salaryMax
          ).toLocaleString()} gross / month`
        : undefined;

    const postedAt = dbJob.publishedAt ?? dbJob.createdAt;
    const expiresAt = dbJob.expiresAt ?? null;

    return (
      <div className="p-6 max-w-3xl mx-auto">
        {/* Ad above description */}
        <div className="mb-4">
          <AdSlot slot="4455667788" />
        </div>

        <h1 className="text-2xl font-bold mb-1">{dbJob.title}</h1>

        {/* Meta line */}
        <p className="text-xs text-gray-400 mb-3">
          Job posted: {new Date(postedAt).toLocaleString()}
          {expiresAt && <> · Expires: {new Date(expiresAt).toLocaleString()}</>}
        </p>

        {salaryKES && (
          <p className="mb-4 font-medium text-emerald-400">{salaryKES}</p>
        )}

        <p className="mb-6 whitespace-pre-line leading-relaxed">
          {dbJob.description}
        </p>

        {/* Ad before application form */}
        <div className="mb-4">
          <AdSlot slot="5566778899" />
        </div>

        {/* Pass admin-defined inputs to the form */}
        <JobForm
          jobId={dbJob.id}
          questions={(dbJob.questions as any[]) ?? []}
          requireCV={!!dbJob.requireCV}
          requireCoverLetter={!!dbJob.requireCoverLetter}
          recommendations={[]}
        />
      </div>
    );
  }

  // 2) Fall back to static JSON
  const job = (allStatic as any[]).find((j) => j.id === id);
  if (!job) return notFound();

  const recommendations = (allStatic as any[]).filter(
    (j) =>
      j.id !== job.id &&
      j.keywords?.some((k: string) => job.keywords?.includes(k))
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Ad above description */}
      <div className="mb-4">
        <AdSlot slot="4455667788" />
      </div>

      <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
      {job.location && (
        <p className="mb-4 text-sm text-gray-500">{job.location}</p>
      )}

      {job.salaryKES && (
        <p className="mb-4 font-medium text-emerald-400">
          {job.salaryKES} (gross per month)
        </p>
      )}

      <p className="mb-6 whitespace-pre-line leading-relaxed">
        {job.description}
      </p>

      {job.benefits?.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-2">Benefits</h2>
          <ul className="list-disc pl-6 space-y-1 mb-8">
            {job.benefits.map((b: string) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </>
      )}

      {/* Ad before application form */}
      <div className="mb-4">
        <AdSlot slot="5566778899" />
      </div>

      {/* Static jobs don’t have admin-defined questions */}
      <JobForm
        jobId={job.id}
        questions={[]}
        requireCV={false}
        requireCoverLetter={false}
        recommendations={recommendations}
      />
    </div>
  );
}
