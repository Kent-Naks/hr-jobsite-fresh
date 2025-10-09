import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function upsertOne(job) {
  // Resolve categoryId via categorySlug if needed
  let categoryId = job.categoryId;
  if (!categoryId && job.categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: job.categorySlug } });
    if (!cat) throw new Error(`Category with slug "${job.categorySlug}" not found`);
    categoryId = cat.id;
  }

  // Prefer upsert by id if present
  if (job.id) {
    return prisma.job.upsert({
      where: { id: job.id },
      update: {
        title: job.title,
        description: job.description,
        categoryId,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        requireCV: job.requireCV,
        requireCoverLetter: job.requireCoverLetter,
        questions: job.questions,
        status: job.status,
        publishedAt: job.publishedAt,
        expiresAt: job.expiresAt
      },
      create: {
        id: job.id,
        title: job.title,
        description: job.description,
        categoryId,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        requireCV: job.requireCV,
        requireCoverLetter: job.requireCoverLetter,
        questions: job.questions,
        status: job.status,
        publishedAt: job.publishedAt,
        expiresAt: job.expiresAt
      }
    });
  }

  // Fallback: create without fixed id
  return prisma.job.create({
    data: {
      title: job.title,
      description: job.description,
      categoryId,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.currency,
      requireCV: job.requireCV,
      requireCoverLetter: job.requireCoverLetter,
      questions: job.questions,
      status: job.status,
      publishedAt: job.publishedAt,
      expiresAt: job.expiresAt
    }
  });
}

async function main() {
  const file = process.argv[2] || path.join(process.cwd(), 'data-backups', 'jobs-latest.json');
  const raw = await fs.readFile(file, 'utf8');
  const jobs = JSON.parse(raw);

  let created = 0, upserted = 0;
  for (const j of jobs) {
    const before = j.id ? await prisma.job.findUnique({ where: { id: j.id } }) : null;
    await upsertOne(j);
    before ? upserted++ : created++;
  }
  console.log(`✅ Seeded jobs. Created: ${created}, Upserted: ${upserted}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => { console.error(err); prisma.$disconnect(); process.exit(1); });
