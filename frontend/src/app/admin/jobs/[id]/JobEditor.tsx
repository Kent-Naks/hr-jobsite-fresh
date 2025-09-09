"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = { id: number; label: string };
type Question = {
  id?: string;
  type: "yes_no" | "text";
  prompt: string;
  required?: boolean;
  order?: number;
};

/** ---- helpers ----------------------------------------------------------- */

/** Format any value for <input type="datetime-local"> (YYYY-MM-DDTHH:mm) */
function formatForInputDateTime(v: any): string {
  if (!v) return "";
  if (typeof v === "string") {
    // Already looks like 2025-10-10T09:00 or ISO → slice to minutes
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) return v.slice(0, 16);
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 16);
    return "";
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 16);
  }
  return "";
}

/** Normalize many human/locale formats to a safe wire string (YYYY-MM-DDTHH:mm) */
function normalizeDateTimeForWire(input: any): string | null {
  if (input === null || input === undefined || input === "") return null;

  if (typeof input === "string") {
    const s = input.trim();
    if (s === "") return null;

    // Already good
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s;

    // "DD/MM/YYYY, HH:mm" or "DD/MM/YYYY HH:mm"
    const m2 = s.replace(",", "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})$/);
    if (m2) {
      const [, dd, mm, yyyy, HH, MM] = m2;
      const pad = (n: string | number) => String(n).padStart(2, "0");
      return `${yyyy}-${pad(mm)}-${pad(dd)}T${pad(HH)}:${pad(MM)}`;
    }

    // Try native Date and reduce to minutes
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 16);

    // Last resort: return as-is; server will validate
    return s;
  }

  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return input.toISOString().slice(0, 16);
  }

  return null;
}

/** Read server error bodies robustly (JSON or HTML) */
async function readError(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: res.status, statusText: res.statusText, body: text?.slice(0, 800) };
  }
}

/** ----------------------------------------------------------------------- */

export default function JobEditor({
  initialJob,
  categories,
}: {
  initialJob?: any;
  categories: Category[];
}) {
  const router = useRouter();

  const [job, setJob] = useState<any>(
    initialJob ?? {
      title: "",
      description: "",
      categoryId: categories[0]?.id,
      salaryMin: "",
      salaryMax: "",
      currency: "KES",
      requireCV: false,
      requireCoverLetter: false,
      questions: [] as Question[],
      // store as string suitable for <input type="datetime-local">
      expiresAt: "",
      status: "draft",
    }
  );

  const isEdit = !!initialJob;
  const up = (k: string, v: any) => setJob((s: any) => ({ ...s, [k]: v }));

  const addQuestion = (type: "yes_no" | "text") =>
    setJob((s: any) => ({
      ...s,
      questions: [
        ...(s.questions ?? []),
        { type, prompt: "", required: false, order: (s.questions?.length ?? 0) },
      ],
    }));

  async function save(publish = false) {
    const endpoint = isEdit ? `/api/admin/jobs/${job.id}` : `/api/admin/jobs`;
    const method = isEdit ? "PUT" : "POST";

    const body = {
      ...job,
      categoryId: Number(job.categoryId),
      salaryMin: job.salaryMin === "" ? null : Number(job.salaryMin),
      salaryMax: job.salaryMax === "" ? null : Number(job.salaryMax),
      publish,
      // 🔐 normalize datetime so server accepts it
      expiresAt: normalizeDateTimeForWire(job.expiresAt),
    };

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await readError(res);
      alert("Error saving job: " + JSON.stringify(err));
      return;
    }
    router.push("/admin");
  }

  async function del() {
    if (!isEdit) return;
    if (!confirm("Delete this job?")) return;
    const res = await fetch(`/api/admin/jobs/${job.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await readError(res);
      alert("Failed to delete: " + JSON.stringify(err));
      return;
    }
    router.push("/admin");
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{isEdit ? "Edit Job" : "New Job"}</h1>

      <label className="block">
        <div className="text-sm font-medium">Title</div>
        <input
          className="w-full border p-2 rounded"
          value={job.title}
          onChange={(e) => up("title", e.target.value)}
        />
      </label>

      <label className="block">
        <div className="text-sm font-medium">Category</div>
        <select
          className="w-full border p-2 rounded"
          value={job.categoryId}
          onChange={(e) => up("categoryId", e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <div className="text-sm font-medium">Description (JD)</div>
        <textarea
          className="w-full border p-2 rounded min-h-[180px]"
          value={job.description}
          onChange={(e) => up("description", e.target.value)}
        />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <div className="text-sm font-medium">Salary Min</div>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={job.salaryMin ?? ""}
            onChange={(e) => up("salaryMin", e.target.value)}
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Salary Max</div>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={job.salaryMax ?? ""}
            onChange={(e) => up("salaryMax", e.target.value)}
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Currency</div>
          <input
            className="w-full border p-2 rounded"
            value={job.currency ?? "KES"}
            onChange={(e) => up("currency", e.target.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={job.requireCV}
            onChange={(e) => up("requireCV", e.target.checked)}
          />
          <span>Require CV</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={job.requireCoverLetter}
            onChange={(e) => up("requireCoverLetter", e.target.checked)}
          />
          <span>Require Cover Letter</span>
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">Expires At</div>
        <input
          type="datetime-local"
          className="border p-2 rounded"
          value={formatForInputDateTime(job.expiresAt)}
          onChange={(e) => up("expiresAt", e.target.value)}
        />
      </label>

      {/* Questions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Custom Questions</div>
          <div className="flex gap-2">
            <button type="button" className="border px-2 py-1 rounded" onClick={() => addQuestion("yes_no")}>
              + Yes/No
            </button>
            <button type="button" className="border px-2 py-1 rounded" onClick={() => addQuestion("text")}>
              + Input
            </button>
          </div>
        </div>

        {(job.questions ?? []).map((q: Question, i: number) => (
          <div key={i} className="border rounded p-2 flex items-start gap-2">
            <select
              value={q.type}
              onChange={(e) => {
                const arr = [...job.questions];
                arr[i] = { ...q, type: e.target.value as any };
                up("questions", arr);
              }}
              className="border p-1 rounded"
            >
              <option value="yes_no">Yes/No</option>
              <option value="text">Input</option>
            </select>

            <input
              className="flex-1 border p-2 rounded"
              placeholder="Question prompt"
              value={q.prompt}
              onChange={(e) => {
                const arr = [...job.questions];
                arr[i] = { ...q, prompt: e.target.value };
                up("questions", arr);
              }}
            />

            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                checked={!!q.required}
                onChange={(e) => {
                  const arr = [...job.questions];
                  arr[i] = { ...q, required: e.target.checked };
                  up("questions", arr);
                }}
              />
              <span className="text-sm">Required</span>
            </label>

            <button
              type="button"
              className="text-red-600"
              onClick={() => {
                const arr = [...job.questions];
                arr.splice(i, 1);
                up("questions", arr);
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button type="button" className="border px-3 py-2 rounded" onClick={() => save(false)}>
          Save Draft
        </button>
        <button type="button" className="border px-3 py-2 rounded bg-black text-white" onClick={() => save(true)}>
          Publish
        </button>
        {isEdit && (
          <button type="button" className="border px-3 py-2 rounded text-red-600" onClick={del}>
            Delete
          </button>
        )}
      </div>
    </main>
  );
}
