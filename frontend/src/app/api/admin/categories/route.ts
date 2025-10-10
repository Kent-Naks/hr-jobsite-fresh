import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { scheduleExportCategories } from "@/lib/exportData";

export const dynamic = "force-dynamic";

function slugify(label: string) {
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

async function ensureUniqueSlug(base: string) {
  let candidate = base || "category";
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    candidate = `${base}-${n++}`;
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { label: "asc" },
    });
    return Response.json(categories, { status: 200 });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Failed to list categories" },
      { status: 500 }
    );
  }
}

const CreateSchema = z.object({
  label: z.string().trim().min(2, "Label too short").max(80, "Label too long"),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = CreateSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json(parsed.error.flatten(), { status: 400 });
    }

    const label = parsed.data.label.trim();
    const baseSlug = slugify(label);
    const slug = await ensureUniqueSlug(baseSlug);

    const cat = await prisma.category.create({
      data: { label, slug },
    });

+   // kick off a debounced export of categories to data-backups/categories-latest.json
+   scheduleExportCategories();

    return Response.json(cat, { status: 201 });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return Response.json(
        { error: "A category with that label or slug already exists." },
        { status: 409 }
      );
    }
    return Response.json({ error: e?.message ?? "Create failed" }, { status: 400 });
  }
}
