import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const file = process.argv[2] || path.join(process.cwd(), 'data-backups', 'categories-latest.json');
  const raw = await fs.readFile(file, 'utf8');
  const categories = JSON.parse(raw);

  let created = 0, updated = 0;
  for (const c of categories) {
    const res = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { label: c.label },
      create: { slug: c.slug, label: c.label }
    });
    if (res.createdAt?.toString() === res.updatedAt?.toString()) created++; else updated++;
  }

  console.log(`✅ Seeded categories. Created: ${created}, Updated: ${updated}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => { console.error(err); prisma.$disconnect(); process.exit(1); });
