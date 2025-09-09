import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import JobForm from "./JobForm";
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
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <AdSlot slot="4455667788" />
      </div>

      <h1 className="text-2xl font-bold mb-1">{dbJob.title}</h1>
      {dbJob.category?.label && (
        <p className="text-sm text-gray-500 mb-1">{dbJob.category.label}</p>
      )}
      {salaryKES && (
        <p className="mb-4 font-medium text-emerald-400">{salaryKES}</p>
      )}

      <p className="mb-6 whitespace-pre-line leading-relaxed">
        {dbJob.description}
      </p>

      <div className="mb-4">
        <AdSlot slot="5566778899" />
      </div>

      <JobForm
        recommendations={[]}
        jobId={dbJob.id}
        questions={questions}
        requireCV={!!dbJob.requireCV}
        requireCoverLetter={!!dbJob.requireCoverLetter}
      />
    </div>
  );
}
