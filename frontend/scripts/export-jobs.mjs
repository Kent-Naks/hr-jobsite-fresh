import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    include: { category: { select: { slug: true } } },
  });

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

  const dir = path.join(process.cwd(), 'data-backups');
  await fs.mkdir(dir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const stamped = path.join(dir, `jobs-${stamp}.json`);
  const latest  = path.join(dir, 'jobs-latest.json');

  await fs.writeFile(stamped, JSON.stringify(serialized, null, 2), 'utf8');
  await fs.writeFile(latest,  JSON.stringify(serialized, null, 2), 'utf8');

  console.log(`✅ Exported ${serialized.length} jobs → ${latest}`);
}

main().finally(() => prisma.$disconnect());
