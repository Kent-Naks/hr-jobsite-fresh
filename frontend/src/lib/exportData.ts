import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// ---- CATEGORIES (unchanged behavior) ----
let catsTimer: NodeJS.Timeout | null = null;

export function scheduleExportCategories(delayMs = 500) {
  if (catsTimer) clearTimeout(catsTimer);
  catsTimer = setTimeout(exportCategories, delayMs);
}

async function exportCategories() {
  const categories = await prisma.category.findMany({ orderBy: { label: "asc" } });
  const dir = path.join(process.cwd(), "data-backups");
  await mkdir(dir, { recursive: true });

  const latest = path.join(dir, "categories-latest.json");
  await writeFile(latest, JSON.stringify(categories, null, 2), "utf8");

  if (process.env.NODE_ENV !== "production") {
    console.log(`🧾 Exported ${categories.length} categories → ${latest}`);
  }
}

// ---- JOBS (new) ----
// We export every job with key fields + the category slug for easy reseeding.
let jobsTimer: NodeJS.Timeout | null = null;

export function scheduleExportJobs(delayMs = 700) {
  if (jobsTimer) clearTimeout(jobsTimer);
  jobsTimer = setTimeout(exportJobs, delayMs);
}

async function exportJobs() {
  const jobs = await prisma.job.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { category: { select: { slug: true } } },
  });

  // Shape for backup: flatten category -> categorySlug
  const serialized = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    description: j.description,
    categoryId: j.categoryId,
    categorySlug: j.category?.slug ?? null,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    currency: j.currency,
    requireCV: j.requireCV,
    requireCoverLetter: j.requireCoverLetter,
    questions: j.questions,
    status: j.status,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
    publishedAt: j.publishedAt,
    expiresAt: j.expiresAt,
  }));

  const dir = path.join(process.cwd(), "data-backups");
  await mkdir(dir, { recursive: true });

  const latest = path.join(dir, "jobs-latest.json");
  await writeFile(latest, JSON.stringify(serialized, null, 2), "utf8");

  if (process.env.NODE_ENV !== "production") {
    console.log(`🧾 Exported ${serialized.length} jobs → ${latest}`);
  }
}

// Convenience: export both when you need to snapshot all data manually
export async function exportAllNow() {
  await Promise.all([exportCategories(), exportJobs()]);
}
