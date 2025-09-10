import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 60; // cache job lists for 1 minute

export const dynamic = "force-dynamic"; // fine for APIs; we set Cache-Control manually

/** Current slugification in your categories API */
function slugifyCurrent(label: string) {
  return label
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60);
}

/** Older variant (where '&' → 'and') to support legacy links */
function slugifyAndVariant(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60);
}

// Legacy short keys from the old site:
const LEGACY_SLUG_TO_LABEL: Record<string, string> = {
  business:  "Business Jobs",
  hr:        "HR & Recruitment",
  admin:     "Administrative Jobs",
  marketing: "Marketing & Brand",
  sales:     "Sales & Biz-Dev",
  account:   "Account & Client Management",
  operations:"Operations",
  projects:  "Project Management",
  strategy:  "Strategy & Policy",
  logistics: "Logistics & Supply Chain",
  legal:     "Legal & Compliance",
  it:        "IT & Tech",
};

function mapJob(j: any) {
  const salaryKES =
    j.salaryMin != null && j.salaryMax != null
      ? `K sh ${Number(j.salaryMin).toLocaleString()} – ${Number(
          j.salaryMax
        ).toLocaleString()} gross / month`
      : undefined;

  return {
    id: j.id,
    title: j.title,
    description: j.description ?? "",
    salaryKES,
    _source: "db" as const,
    _category: j.category?.slug ?? j.category?.label,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slugParam = searchParams.get("category") ?? undefined;
  const now = new Date();

  const baseWhere: any = {
    status: "published",
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  // If no category is provided, return latest jobs overall (newest first)
  if (!slugParam) {
    const jobs = await prisma.job.findMany({
      where: baseWhere,
      include: { category: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
    const res = NextResponse.json(jobs.map(mapJob));
    res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res;
  }

  // Resolve the slugParam to a real Category.id
  let cat = await prisma.category.findUnique({ where: { slug: slugParam } });

  if (!cat) {
    const all = await prisma.category.findMany({
      select: { id: true, label: true, slug: true },
    });

    cat =
      all.find((c) => slugifyCurrent(c.label) === slugParam) ??
      all.find((c) => slugifyAndVariant(c.label) === slugParam) ??
      all.find((c) => c.label === LEGACY_SLUG_TO_LABEL[slugParam!]) ??
      null;
  }

  if (!cat) {
    const res = NextResponse.json([]);
    res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res;
  }

  const jobs = await prisma.job.findMany({
    where: { ...baseWhere, categoryId: cat.id },
    include: { category: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  const res = NextResponse.json(jobs.map(mapJob));
  res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  return res;
}
