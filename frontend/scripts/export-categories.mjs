import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({ orderBy: { label: 'asc' } });

  const dir = path.join(process.cwd(), 'data-backups');
  await fs.mkdir(dir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const stamped = path.join(dir, `categories-${stamp}.json`);
  const latest  = path.join(dir, 'categories-latest.json');

  await fs.writeFile(stamped, JSON.stringify(categories, null, 2), 'utf8');
  await fs.writeFile(latest,  JSON.stringify(categories, null, 2), 'utf8');

  console.log(`✅ Exported ${categories.length} categories → ${latest}`);
}

main().finally(() => prisma.$disconnect());
