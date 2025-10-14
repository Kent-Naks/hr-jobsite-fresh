// src/app/api/categories/route.ts
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // cache categories for 5 minutes

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const now = new Date();

  try {
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
      count: c._count?.jobs ?? 0,
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("prisma.categories GET error:", err);

    // Return a safe empty array so the front-end still renders
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}

export const dynamic = "force-dynamic";
