// src/app/admin/jobs/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import JobEditor from "./JobEditor";

export const dynamic = "force-dynamic";

type CategoryOpt = { id: number; label: string };

export default async function EditJob({
  params,
}: {
  // ✅ Match your app’s PageProps where params is a Promise
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [job, categoriesRaw] = await Promise.all([
    prisma.job.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { label: "asc" } }),
  ]);

  if (!job) return notFound();

  // Ensure questions is always an array for the editor
  const initialJob = {
    ...job,
    questions: Array.isArray(job.questions) ? job.questions : [],
  };

  // Narrow to the shape JobEditor expects
  const categories: CategoryOpt[] = categoriesRaw.map((c) => ({
    id: c.id,
    label: c.label,
  }));

  return <JobEditor initialJob={initialJob} categories={categories} />;
}
