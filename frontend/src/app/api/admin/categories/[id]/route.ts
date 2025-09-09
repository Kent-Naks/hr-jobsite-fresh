import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

function parseId(idRaw: string) {
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) throw new Error("Bad id");
  return id;
}

/** "Marketing & Brand" -> "marketing-brand" */
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

/** Ensure slug uniqueness while ignoring the current record */
async function ensureUniqueSlug(base: string, ignoreId: number) {
  let candidate = base || "category";
  let n = 2;
  // loop until a unique slug (excluding current id) is found
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await prisma.category.findFirst({
      where: { slug: candidate, id: { not: ignoreId } },
      select: { id: true },
    });
    if (!exists) return candidate;
    candidate = `${base}-${n++}`;
  }
}

export async function GET(_req: Request, { params }: any) {
  try {
    const id = parseId(params.id);
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(cat, { status: 200 });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Failed to fetch category" },
      { status: 400 }
    );
  }
}

const UpdateSchema = z.object({
  label: z.string().trim().min(2, "Label too short").max(80, "Label too long"),
});

export async function PUT(req: Request, { params }: any) {
  try {
    const id = parseId(params.id);
    const raw = await req.json().catch(() => ({}));
    const parsed = UpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json(parsed.error.flatten(), { status: 400 });
    }

    const label = parsed.data.label.trim();
    const baseSlug = slugify(label);
    const slug = await ensureUniqueSlug(baseSlug, id);

    const updated = await prisma.category.update({
      where: { id },
      data: { label, slug },
    });

    return Response.json(updated, { status: 200 });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return Response.json(
          { error: "A category with that label or slug already exists." },
          { status: 409 }
        );
      }
      if (e.code === "P2025") {
        return Response.json({ error: "Category not found." }, { status: 404 });
      }
    }
    return Response.json({ error: e?.message ?? "Rename failed" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: any) {
  try {
    const id = parseId(params.id);

    // Block deletion if jobs still reference this category
    const count = await prisma.job.count({ where: { categoryId: id } });
    if (count > 0) {
      return Response.json(
        { error: "Cannot delete: category has jobs. Move or delete those jobs first." },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return Response.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return Response.json({ error: "Category not found." }, { status: 404 });
    }
    return Response.json({ error: e?.message ?? "Delete failed" }, { status: 400 });
  }
}
