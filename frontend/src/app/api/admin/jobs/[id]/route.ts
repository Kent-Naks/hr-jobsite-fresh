import { prisma } from "@/lib/prisma";
import { JobInputSchema } from "@/lib/validation";
import { scheduleExportJobs } from "@/lib/exportData"; // ✅ NEW

export const dynamic = "force-dynamic";

/** Convert many input shapes into Date|null|undefined; throw on invalid */
function toDateOrNull(input: unknown): Date | null | undefined {
  if (input === undefined) return undefined; // don't touch field
  if (input === null) return null;
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) throw new Error("Invalid datetime");
    return input;
  }
  if (typeof input !== "string") return null;

  const s = input.trim();
  if (s === "") return null;

  // "YYYY-MM-DDTHH:mm"
  const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (m1) {
    const [, y, mo, d, h, mi] = m1;
    const iso = `${y}-${mo}-${d}T${h}:${mi}:00`;
    const dObj = new Date(iso);
    if (Number.isNaN(dObj.getTime())) throw new Error("Invalid datetime");
    return dObj;
  }

  // "DD/MM/YYYY, HH:mm" or "DD/MM/YYYY HH:mm"
  const m2 = s.replace(",", "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})$/);
  if (m2) {
    const [, dd, mm, yyyy, HH, MM] = m2;
    const pad = (n: string | number) => String(n).padStart(2, "0");
    const iso = `${yyyy}-${pad(mm)}-${pad(dd)}T${pad(HH)}:${pad(MM)}:00`;
    const dObj = new Date(iso);
    if (Number.isNaN(dObj.getTime())) throw new Error("Invalid datetime");
    return dObj;
  }

  // Try native Date for any other ISO/RFC strings
  const dObj = new Date(s);
  if (Number.isNaN(dObj.getTime())) throw new Error("Invalid datetime");
  return dObj;
}

export async function GET(_req: Request, { params }: any) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!job) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(job);
}

export async function PUT(req: Request, { params }: any) {
  try {
    const body = await req.json().catch(() => ({}));

    // Validate (partial allowed)
    const parsed = JobInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return Response.json(parsed.error.flatten(), { status: 400 });
    }
    const d = parsed.data;

    const updateData: any = {
      title: d.title,
      description: d.description,
      categoryId: typeof d.categoryId === "number" ? d.categoryId : undefined,
      salaryMin: d.salaryMin ?? undefined,
      salaryMax: d.salaryMax ?? undefined,
      currency: d.currency ?? undefined,
      requireCV: d.requireCV ?? undefined,
      requireCoverLetter: d.requireCoverLetter ?? undefined,
      questions: d.questions ?? undefined,
      expiresAt: "expiresAt" in d ? toDateOrNull(d.expiresAt as any) : undefined,
    };

    // Publishing logic
    if (d.publish === true) {
      updateData.status = "published";
      updateData.publishedAt = new Date();
    } else if (d.publish === false && d.status) {
      updateData.status = d.status; // e.g., "draft"
    } else if (d.status) {
      updateData.status = d.status;
    }

    const job = await prisma.job.update({
      where: { id: params.id },
      data: updateData,
    });

    scheduleExportJobs(); // ✅ NEW: export after update

    return Response.json(job, { status: 200 });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Unknown error" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: any) {
  try {
    await prisma.job.delete({ where: { id: params.id } });

    scheduleExportJobs(); // ✅ NEW: export after delete

    return Response.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Unknown error" }, { status: 400 });
  }
}
