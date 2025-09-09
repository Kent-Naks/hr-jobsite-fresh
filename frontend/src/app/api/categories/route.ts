import { prisma } from "@/lib/prisma";

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const now = new Date();

  const categories = await prisma.category.findMany({
    orderBy: { label: "asc" },
    include: {
      _count: {
        select: {
          jobs: {
            where: {
              status: "published",
              OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
          },
        },
      },
    },
  });

  const result = categories.map((c) => ({
    id: c.id,
    label: c.label,
    slug: slugify(c.label),
    count: c._count.jobs,
  }));

  return Response.json(result, { status: 200 });
}

export const dynamic = "force-dynamic";
