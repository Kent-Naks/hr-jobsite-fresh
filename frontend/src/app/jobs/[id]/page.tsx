import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import JobForm from "./JobForm";
import JobDescription from "./JobDescription";
import { prisma } from "@/lib/prisma";

export default async function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dbJob = await prisma.job.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!dbJob) return notFound();

  const salaryKES =
    dbJob.salaryMin != null && dbJob.salaryMax != null
      ? `K sh ${Number(dbJob.salaryMin).toLocaleString()} – ${Number(
          dbJob.salaryMax
        ).toLocaleString()} gross / month`
      : undefined;

  const questions = Array.isArray(dbJob.questions)
    ? (dbJob.questions as unknown as {
        id?: string;
        type: "yes_no" | "text";
        prompt: string;
        required?: boolean;
        order?: number;
      }[])
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <AdSlot slot="4455667788" />
      </div>

      <h1 className="text-2xl font-bold mb-1">{dbJob.title}</h1>
      {dbJob.category?.label && (
        <p className="text-sm text-gray-500 mb-2">{dbJob.category.label}</p>
      )}
      {salaryKES && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-5">
          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v2m0 8v2M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
          </svg>
          <span className="font-semibold text-emerald-400 text-sm">{salaryKES}</span>
        </div>
      )}

      <JobDescription description={dbJob.description ?? ""} />

      <div className="mb-4">
        <AdSlot slot="5566778899" />
      </div>

      <div id="apply-form">
        <JobForm
          recommendations={[]}
          jobId={dbJob.id}
          questions={questions}
          requireCV={!!dbJob.requireCV}
          requireCoverLetter={!!dbJob.requireCoverLetter}
        />
      </div>
    </div>
  );
}
