import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import JobForm from "./JobForm";
import JobDescription from "./JobDescription";
import ShareButton from "./ShareButton";
import { prisma } from "@/lib/prisma";

export default async function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dbJob = await prisma.job.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!dbJob) return notFound();

  const salaryKES =
    dbJob.salaryMin != null && dbJob.salaryMax != null
      ? `K sh ${Number(dbJob.salaryMin).toLocaleString()} – ${Number(
          dbJob.salaryMax
        ).toLocaleString()} gross / month`
      : undefined;

  const questions = Array.isArray(dbJob.questions)
    ? (dbJob.questions as unknown as {
        id?: string;
        type: "yes_no" | "text";
        prompt: string;
        required?: boolean;
        order?: number;
      }[])
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── PREMIUM HERO ──────────────────────────────────────────────── */}
      <div
        className="px-6 pt-8 pb-7 mb-2"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="mb-4">
          <AdSlot slot="4455667788" />
        </div>

        {/* Category pill */}
        {dbJob.category?.label && (
          <span
            className="inline-block text-xs font-semibold tracking-wide px-3 py-1 rounded-full mb-4"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {dbJob.category.label}
          </span>
        )}

        <h1
          className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4"
          style={{ letterSpacing: "-0.02em" }}
        >
          {dbJob.title}
        </h1>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 items-center">
          {salaryKES && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{
                background: "rgba(52,211,153,0.12)",
                border: "1px solid rgba(52,211,153,0.28)",
                color: "#34d399",
              }}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v2m0 8v2M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
              </svg>
              {salaryKES}
            </div>
          )}

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Nairobi, Kenya
          </div>
        </div>
      </div>

      {/* ── JD + FORM ─────────────────────────────────────────────────── */}
      <div className="px-6 py-6">
        <JobDescription description={dbJob.description ?? ""} />

        <div className="mb-4">
          <AdSlot slot="5566778899" />
        </div>

        <div id="apply-form">
          <JobForm
            recommendations={[]}
            jobId={dbJob.id}
            questions={questions}
            requireCV={!!dbJob.requireCV}
            requireCoverLetter={!!dbJob.requireCoverLetter}
          />
        </div>
      </div>

      {/* Radial share menu */}
      <ShareButton title={dbJob.title} />
    </div>
  );
}
