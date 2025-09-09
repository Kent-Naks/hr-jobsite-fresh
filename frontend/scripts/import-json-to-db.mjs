// scripts/import-json-to-db.mjs
import { PrismaClient } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "src", "app", "data");

// Map your JSON files -> Category labels used in DB
const CATS = [
  { slug: "business",   label: "Business Jobs",               file: "business.json" },
  { slug: "hr",         label: "HR & Recruitment",            file: "hr.json" },
  { slug: "admin",      label: "Administrative Jobs",         file: "admin.json" },
  { slug: "marketing",  label: "Marketing & Brand",           file: "marketing.json" },
  { slug: "sales",      label: "Sales & Biz-Dev",             file: "sales.json" },
  { slug: "account",    label: "Account & Client Management", file: "account.json" },
  { slug: "operations", label: "Operations",                  file: "operations.json" },
  { slug: "projects",   label: "Project Management",          file: "projects.json" },
  { slug: "strategy",   label: "Strategy & Policy",           file: "strategy.json" },
  { slug: "logistics",  label: "Logistics & Supply Chain",    file: "logistics.json" },
  { slug: "legal",      label: "Legal & Compliance",          file: "legal.json" },
  { slug: "it",         label: "IT & Tech",                   file: "it.json" },
];

function parseSalaryKES(s) {
  if (!s) return { min: null, max: null };
  // Grab two big numbers from strings like "K sh 145 000 – 220 000 gross / month"
  const m = s.replace(/[, ]/g, "").match(/(\d+)[^\d]+(\d+)/);
  if (!m) return { min: null, max: null };
  return { min: Number(m[1]), max: Number(m[2]) };
}

async function ensureCategory(label) {
  let c = await prisma.category.findFirst({ where: { label } });
  if (!c) c = await prisma.category.create({ data: { label } });
  return c;
}

async function run() {
  for (const cat of CATS) {
    const filePath = path.join(dataDir, cat.file);
    const buf = await fs.readFile(filePath, "utf8");
    const items = JSON.parse(buf);

    const category = await ensureCategory(cat.label);

    for (const item of items) {
      // Skip if a job with the same title already exists in this category
      const exists = await prisma.job.findFirst({
        where: { title: item.title, categoryId: category.id },
        select: { id: true },
      });
      if (exists) continue;

      const { min, max } = parseSalaryKES(item.salaryKES);

      await prisma.job.create({
        data: {
          title: item.title,
          description: item.description ?? "",
          categoryId: category.id,
          salaryMin: min,
          salaryMax: max,
          currency: "KES",
          requireCV: false,
          requireCoverLetter: false,
          questions: [],         // start with none; you can add via Admin later
          expiresAt: null,
          status: "published",
          publishedAt: new Date(),
        },
      });
    }
  }
}

run()
  .then(async () => {
    console.log("✅ Import complete");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Import failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
