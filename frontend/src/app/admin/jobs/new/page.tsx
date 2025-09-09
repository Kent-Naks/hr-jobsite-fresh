import { prisma } from "@/lib/prisma";
import JobEditor from "../[id]/JobEditor";

export default async function NewJob() {
  const categories = await prisma.category.findMany({ orderBy: { label: "asc" } });
  return <JobEditor categories={categories} />;
}
