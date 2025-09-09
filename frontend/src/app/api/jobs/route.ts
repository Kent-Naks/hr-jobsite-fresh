import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slugParam = searchParams.get("category") ?? undefined;
  const now = new Date();

  const baseWhere: any = {
    status: "published",
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  if (!slugParam) {
    const jobs = await prisma.job.findMany({
      where: baseWhere,
      include: { category: true },
      orderBy: [{ publishedAt: "asc" }, { createdAt: "desc" }],
    });
    return Response.json(jobs.map(mapJob), { status: 200 });
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
    return Response.json([], { status: 200 });
  }

  const jobs = await prisma.job.findMany({
    where: { ...baseWhere, categoryId: cat.id },
    include: { category: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return Response.json(jobs.map(mapJob), { status: 200 });
}

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
