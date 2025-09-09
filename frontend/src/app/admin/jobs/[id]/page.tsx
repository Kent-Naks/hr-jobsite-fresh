import { prisma } from "@/lib/prisma";
import JobEditor from "./JobEditor";

export default async function EditJob({ params }: { params: { id: string } }) {
  const [job, categories] = await Promise.all([
    prisma.job.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { label: "asc" } }),
  ]);

  if (!job) return <main className="p-6">Not found</main>;
  return <JobEditor initialJob={job} categories={categories} />;
}
