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

// ─── Section definitions ──────────────────────────────────────────────────────

type SectionKey =
  | "overview"
  | "responsibilities"
  | "education"
  | "skills"
  | "kpis"
  | "compensation"
  | "benefits"
  | "growth";

const SECTIONS: {
  key: SectionKey;
  label: string;
  hint: string;
  rows: number;
  accent: string;
}[] = [
  {
    key: "overview",
    label: "Overview",
    hint: "Brief intro — role purpose, company context, what makes this position unique.",
    rows: 4,
    accent: "border-l-blue-400",
  },
  {
    key: "responsibilities",
    label: "Key Responsibilities",
    hint: "Use - bullet lines for each duty (e.g. - Manage team of 5 engineers).",
    rows: 7,
    accent: "border-l-amber-400",
  },
  {
    key: "education",
    label: "Education & Experience",
    hint: "Required degrees, certifications, years of experience.",
    rows: 4,
    accent: "border-l-purple-400",
  },
  {
    key: "skills",
    label: "Skills",
    hint: "Comma-separated (e.g. React, TypeScript, Node.js) or - bullet lines.",
    rows: 3,
    accent: "border-l-cyan-400",
  },
  {
    key: "kpis",
    label: "KPIs",
    hint: "Key performance indicators the hire will be measured against.",
    rows: 4,
    accent: "border-l-rose-400",
  },
  {
    key: "compensation",
    label: "Compensation",
    hint: "Salary range, bonuses, commission structure, etc.",
    rows: 3,
    accent: "border-l-emerald-400",
  },
  {
    key: "benefits",
    label: "Benefits",
    hint: "Health cover, leave days, remote work policy, equipment, perks.",
    rows: 4,
    accent: "border-l-pink-400",
  },
  {
    key: "growth",
    label: "Growth Path",
    hint: "Career progression, training, promotion timeline.",
    rows: 3,
    accent: "border-l-teal-400",
  },
];

// ─── Section ↔ description converters ────────────────────────────────────────

type Sections = Record<SectionKey, string>;

const HEADING_MAP: { re: RegExp; key: SectionKey }[] = [
  { re: /^overview$/i, key: "overview" },
  { re: /^(key\s+)?responsibilities$/i, key: "responsibilities" },
  { re: /^education(\s*(&|and)\s*experience)?$/i, key: "education" },
  { re: /^education\s*,?\s*(qualifications?)?$/i, key: "education" },
  { re: /^experience$/i, key: "education" },
  { re: /^(required\s+)?skills?$/i, key: "skills" },
  { re: /^(key\s+)?performance\s*(indicators?)?$|^kpis?$/i, key: "kpis" },
  { re: /^(compensation|salary|remuneration)(\s+package)?$/i, key: "compensation" },
  { re: /^benefits?(\s+package)?$/i, key: "benefits" },
  { re: /^(career\s+)?growth(\s+path)?$/i, key: "growth" },
];

function emptySections(): Sections {
  return {
    overview: "",
    responsibilities: "",
    education: "",
    skills: "",
    kpis: "",
    compensation: "",
    benefits: "",
    growth: "",
  };
}

function descriptionToSections(description: string): Sections {
  const result = emptySections();
  if (!description?.trim()) return result;

  const lines = description.split("\n");
  let currentKey: SectionKey | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (currentKey !== null) {
      result[currentKey] = currentLines.join("\n").trim();
    }
    currentLines = [];
  };

  for (const line of lines) {
    const normalized = line.trim().replace(/:$/, "").trim();
    let matched = false;
    for (const { re, key } of HEADING_MAP) {
      if (re.test(normalized)) {
        flush();
        currentKey = key;
        matched = true;
        break;
      }
    }
    if (!matched) currentLines.push(line);
  }
  flush();

  // If the description had no parseable headings, put everything in overview
  const hasAny = Object.values(result).some((v) => v.trim());
  if (!hasAny && description.trim()) {
    result.overview = description.trim();
  }

  return result;
}

function sectionsToDescription(sections: Sections): string {
  return SECTIONS.filter(({ key }) => sections[key]?.trim())
    .map(({ key, label }) => `${label}:\n${sections[key].trim()}`)
    .join("\n\n");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatForInputDateTime(v: any): string {
  if (!v) return "";
  if (typeof v === "string") {
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

function normalizeDateTimeForWire(input: any): string | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input === "string") {
    const s = input.trim();
    if (s === "") return null;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s;
    const m2 = s
      .replace(",", "")
      .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})$/);
    if (m2) {
      const [, dd, mm, yyyy, HH, MM] = m2;
      const pad = (n: string | number) => String(n).padStart(2, "0");
      return `${yyyy}-${pad(mm)}-${pad(dd)}T${pad(HH)}:${pad(MM)}`;
    }
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 16);
    return s;
  }
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return input.toISOString().slice(0, 16);
  }
  return null;
}

async function readError(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: res.status, statusText: res.statusText, body: text?.slice(0, 800) };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

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
      categoryId: categories[0]?.id,
      salaryMin: "",
      salaryMax: "",
      currency: "KES",
      requireCV: false,
      requireCoverLetter: false,
      questions: [] as Question[],
      expiresAt: "",
      status: "draft",
    }
  );

  const [sections, setSections] = useState<Sections>(() =>
    descriptionToSections(initialJob?.description ?? "")
  );

  const isEdit = !!initialJob;
  const up = (k: string, v: any) => setJob((s: any) => ({ ...s, [k]: v }));
  const upSection = (key: SectionKey, value: string) =>
    setSections((s) => ({ ...s, [key]: value }));

  const addQuestion = (type: "yes_no" | "text") =>
    setJob((s: any) => ({
      ...s,
      questions: [
        ...(s.questions ?? []),
        { type, prompt: "", required: false, order: s.questions?.length ?? 0 },
      ],
    }));

  async function save(publish = false) {
    const endpoint = isEdit ? `/api/admin/jobs/${job.id}` : `/api/admin/jobs`;
    const method = isEdit ? "PUT" : "POST";

    const body = {
      ...job,
      description: sectionsToDescription(sections),
      categoryId: Number(job.categoryId),
      salaryMin: job.salaryMin === "" ? null : Number(job.salaryMin),
      salaryMax: job.salaryMax === "" ? null : Number(job.salaryMax),
      publish,
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

  const inputCls = "w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">{isEdit ? "Edit Job" : "New Job"}</h1>

      {/* ── Title ─────────────────────────────────────────────────────── */}
      <label className="block">
        <div className="text-sm font-semibold mb-1">Title</div>
        <input
          className={inputCls}
          value={job.title}
          onChange={(e) => up("title", e.target.value)}
        />
      </label>

      {/* ── Category ──────────────────────────────────────────────────── */}
      <label className="block">
        <div className="text-sm font-semibold mb-1">Category</div>
        <select
          className={inputCls}
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

      {/* ── JD Sections ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-sm font-semibold">Job Description</div>
          <div className="text-xs text-gray-400">
            Each section renders as a card on the public listing
          </div>
        </div>

        <div className="space-y-3">
          {SECTIONS.map(({ key, label, hint, rows, accent }) => (
            <div
              key={key}
              className={`border border-gray-200 border-l-4 ${accent} rounded-lg overflow-hidden`}
            >
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-gray-800">{label}</span>
                <span className="text-xs text-gray-400 text-right hidden sm:block">{hint}</span>
              </div>
              <p className="text-xs text-gray-400 px-3 pt-2 sm:hidden">{hint}</p>
              <textarea
                className="w-full px-3 py-2 text-sm resize-y bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300 placeholder-gray-300"
                rows={rows}
                placeholder={hint}
                value={sections[key]}
                onChange={(e) => upSection(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Salary ────────────────────────────────────────────────────── */}
      <div>
        <div className="text-sm font-semibold mb-1">Salary</div>
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <div className="text-xs text-gray-500 mb-1">Min</div>
            <input
              type="number"
              className={inputCls}
              value={job.salaryMin ?? ""}
              onChange={(e) => up("salaryMin", e.target.value)}
            />
          </label>
          <label className="block">
            <div className="text-xs text-gray-500 mb-1">Max</div>
            <input
              type="number"
              className={inputCls}
              value={job.salaryMax ?? ""}
              onChange={(e) => up("salaryMax", e.target.value)}
            />
          </label>
          <label className="block">
            <div className="text-xs text-gray-500 mb-1">Currency</div>
            <input
              className={inputCls}
              value={job.currency ?? "KES"}
              onChange={(e) => up("currency", e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* ── Documents ─────────────────────────────────────────────────── */}
      <div>
        <div className="text-sm font-semibold mb-2">Required Documents</div>
        <div className="flex gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-blue-600"
              checked={job.requireCV}
              onChange={(e) => up("requireCV", e.target.checked)}
            />
            <span className="text-sm">Require CV</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-blue-600"
              checked={job.requireCoverLetter}
              onChange={(e) => up("requireCoverLetter", e.target.checked)}
            />
            <span className="text-sm">Require Cover Letter</span>
          </label>
        </div>
      </div>

      {/* ── Expires At ────────────────────────────────────────────────── */}
      <label className="block">
        <div className="text-sm font-semibold mb-1">Expires At</div>
        <input
          type="datetime-local"
          className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={formatForInputDateTime(job.expiresAt)}
          onChange={(e) => up("expiresAt", e.target.value)}
        />
      </label>

      {/* ── Custom Questions ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Custom Questions</div>
          <div className="flex gap-2">
            <button
              type="button"
              className="border border-gray-300 px-2 py-1 rounded text-sm hover:bg-gray-50"
              onClick={() => addQuestion("yes_no")}
            >
              + Yes/No
            </button>
            <button
              type="button"
              className="border border-gray-300 px-2 py-1 rounded text-sm hover:bg-gray-50"
              onClick={() => addQuestion("text")}
            >
              + Input
            </button>
          </div>
        </div>

        {(job.questions ?? []).map((q: Question, i: number) => (
          <div key={i} className="border border-gray-200 rounded p-2 flex items-start gap-2">
            <select
              value={q.type}
              onChange={(e) => {
                const arr = [...job.questions];
                arr[i] = { ...q, type: e.target.value as any };
                up("questions", arr);
              }}
              className="border border-gray-300 p-1 rounded text-sm"
            >
              <option value="yes_no">Yes/No</option>
              <option value="text">Input</option>
            </select>

            <input
              className="flex-1 border border-gray-300 p-2 rounded text-sm"
              placeholder="Question prompt"
              value={q.prompt}
              onChange={(e) => {
                const arr = [...job.questions];
                arr[i] = { ...q, prompt: e.target.value };
                up("questions", arr);
              }}
            />

            <label className="inline-flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={!!q.required}
                onChange={(e) => {
                  const arr = [...job.questions];
                  arr[i] = { ...q, required: e.target.checked };
                  up("questions", arr);
                }}
              />
              Required
            </label>

            <button
              type="button"
              className="text-red-500 text-sm hover:text-red-700"
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

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2 border-t border-gray-200">
        <button
          type="button"
          className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
          onClick={() => save(false)}
        >
          Save Draft
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded text-sm bg-black text-white hover:bg-gray-800"
          onClick={() => save(true)}
        >
          Publish
        </button>
        {isEdit && (
          <button
            type="button"
            className="border border-red-300 px-4 py-2 rounded text-sm text-red-600 hover:bg-red-50 ml-auto"
            onClick={del}
          >
            Delete
          </button>
        )}
      </div>
    </main>
  );
}
