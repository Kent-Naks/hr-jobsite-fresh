import { prisma } from "@/lib/prisma";
import { JobInputSchema } from "@/lib/validation";
import { scheduleExportJobs } from "@/lib/exportData"; // ✅ NEW import

/** Same converter used in the [id] route */
function toDateOrNull(input: unknown): Date | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (typeof input !== "string") return null;

  const s = input.trim();
  if (s === "") return null;

  const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (m1) {
    const [, y, mo, d, h, mi] = m1;
    const dObj = new Date(`${y}-${mo}-${d}T${h}:${mi}:00`);
    if (Number.isNaN(dObj.getTime())) throw new Error("Invalid datetime");
    return dObj;
  }

  const m2 = s.replace(",", "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})$/);
  if (m2) {
    const [, dd, mm, yyyy, HH, MM] = m2;
    const pad = (n: string | number) => String(n).padStart(2, "0");
    const dObj = new Date(`${yyyy}-${pad(mm)}-${pad(dd)}T${pad(HH)}:${pad(MM)}:00`);
    if (Number.isNaN(dObj.getTime())) throw new Error("Invalid datetime");
    return dObj;
  }

  const dObj = new Date(s);
  if (Number.isNaN(dObj.getTime())) throw new Error("Invalid datetime");
  return dObj;
}

export async function GET() {
  const jobs = await prisma.job.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });
  return Response.json(jobs);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const parsed = JobInputSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(parsed.error.flatten(), { status: 400 });
    }

    const d = parsed.data;

    const job = await prisma.job.create({
      data: {
        title: d.title,
        description: d.description,
        categoryId: d.categoryId,
        salaryMin: d.salaryMin ?? undefined,
        salaryMax: d.salaryMax ?? undefined,
        currency: d.currency ?? "KES",
        requireCV: !!d.requireCV,
        requireCoverLetter: !!d.requireCoverLetter,
        questions: d.questions ?? [],
        expiresAt: toDateOrNull(d.expiresAt),
        status: d.publish ? "published" : d.status ?? "draft",
        publishedAt: d.publish ? new Date() : null,
      },
    });

    // ✅ NEW — automatically export all jobs to data-backups/jobs-latest.json
    scheduleExportJobs();

    return Response.json(job, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Unknown error" }, { status: 400 });
  }
}
