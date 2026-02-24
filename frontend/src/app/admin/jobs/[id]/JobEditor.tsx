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
  accent: string;        // left-border colour class
  accentText: string;    // heading text colour class
}[] = [
  {
    key: "overview",
    label: "Overview",
    hint: "Brief intro — role purpose, company context, what makes this position unique.",
    rows: 4,
    accent: "border-l-blue-400",
    accentText: "text-blue-300",
  },
  {
    key: "responsibilities",
    label: "Key Responsibilities",
    hint: "Use - bullet lines for each duty (e.g. - Manage team of 5 engineers).",
    rows: 7,
    accent: "border-l-amber-400",
    accentText: "text-amber-300",
  },
  {
    key: "education",
    label: "Education & Experience",
    hint: "Required degrees, certifications, years of experience.",
    rows: 4,
    accent: "border-l-purple-400",
    accentText: "text-purple-300",
  },
  {
    key: "skills",
    label: "Skills",
    hint: "Comma-separated (e.g. React, TypeScript, Node.js) or - bullet lines.",
    rows: 3,
    accent: "border-l-cyan-400",
    accentText: "text-cyan-300",
  },
  {
    key: "kpis",
    label: "KPIs",
    hint: "Key performance indicators the hire will be measured against.",
    rows: 4,
    accent: "border-l-rose-400",
    accentText: "text-rose-300",
  },
  {
    key: "compensation",
    label: "Compensation",
    hint: "Salary range, bonuses, commission structure, etc.",
    rows: 3,
    accent: "border-l-emerald-400",
    accentText: "text-emerald-300",
  },
  {
    key: "benefits",
    label: "Benefits",
    hint: "Health cover, leave days, remote work policy, equipment, perks.",
    rows: 4,
    accent: "border-l-pink-400",
    accentText: "text-pink-300",
  },
  {
    key: "growth",
    label: "Growth Path",
    hint: "Career progression, training, promotion timeline.",
    rows: 3,
    accent: "border-l-teal-400",
    accentText: "text-teal-300",
  },
];

// ─── Heading maps ─────────────────────────────────────────────────────────────

type Sections = Record<SectionKey, string>;

const HEADING_MAP: { re: RegExp; key: SectionKey }[] = [
  { re: /^overview$/i, key: "overview" },
  { re: /^about(\s+(the\s+)?(role|position|company|us))?$/i, key: "overview" },
  { re: /^(key\s+)?responsibilities?$/i, key: "responsibilities" },
  { re: /^duties$/i, key: "responsibilities" },
  { re: /^education(\s*(&|and)\s*experience)?$/i, key: "education" },
  { re: /^education\s*,?\s*(qualifications?)?$/i, key: "education" },
  { re: /^experience$/i, key: "education" },
  { re: /^requirements?$/i, key: "education" },
  { re: /^qualifications?$/i, key: "education" },
  { re: /^(required\s+)?skills?$/i, key: "skills" },
  { re: /^what\s+you.*(bring|offer)$/i, key: "skills" },
  { re: /^(key\s+)?performance\s*(indicators?)?$|^kpis?$/i, key: "kpis" },
  { re: /^(compensation|salary|remuneration)(\s+package)?$/i, key: "compensation" },
  { re: /^benefits?(\s+package)?$/i, key: "benefits" },
  { re: /^(career\s+)?growth(\s+path)?$/i, key: "growth" },
];

// Metadata headings handled separately — never become section content
const TITLE_RE = /^(job\s+)?(title|position|role)$/i;
const LOCATION_RE = /^location(\s*[/\/]\s*region)?$/i;
const SALARY_META_RE = /^salary(\s+range)?$/i;
const QUESTIONS_RE = /^(application\s+)?questions?(\s+for\s+applicants)?$/i;

// ─── Parser utilities ─────────────────────────────────────────────────────────

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

/** Normalize non-standard bullet characters to "- " while preserving indentation */
function normalizeBullet(line: string): string {
  return line.replace(/^(\s*)[•·◦▸▪►✓✗→]\s+/, "$1- ");
}

/** Extract salary min/max numbers from a string like "KES 150,000 – 200,000" */
function extractSalaryRange(text: string): { min: number | null; max: number | null } {
  const s = text.replace(/KES|KShs?|Ksh|USD|\$|£|€/gi, " ").trim();
  const rangeM = s.match(/([\d,]+)\s*([kK])?\s*(?:[-–—]|to)\s*([\d,]+)\s*([kK])?/);
  if (rangeM) {
    const parse = (n: string, k?: string) =>
      Math.round(parseFloat(n.replace(/,/g, "")) * (k ? 1000 : 1));
    return { min: parse(rangeM[1], rangeM[2]), max: parse(rangeM[3], rangeM[4]) };
  }
  const singleM = s.match(/([\d,]+)\s*([kK])?/);
  if (singleM) {
    const val = Math.round(parseFloat(singleM[1].replace(/,/g, "")) * (singleM[2] ? 1000 : 1));
    return { min: val, max: null };
  }
  return { min: null, max: null };
}

/** Parse a single question line into a Question object */
function parseQuestionLine(line: string): Question | null {
  const t = line.trim();
  if (!t || t.length < 5) return null;
  // Strip leading numbering or bullet prefix
  const cleaned = t.replace(/^(?:\d+[.)]\s*|[Q#]\d+[.)]\s*|[•\-*]\s*)/i, "").trim();
  if (!cleaned || cleaned.length < 5) return null;
  const isYesNo =
    /\(yes\s*\/\s*no\)/i.test(cleaned) ||
    /\(y\s*\/\s*n\)/i.test(cleaned) ||
    /\byes\s+or\s+no\b/i.test(cleaned);
  return {
    type: isYesNo ? "yes_no" : "text",
    prompt: cleaned
      .replace(/\s*\(yes\s*\/\s*no\)\s*$/i, "")
      .replace(/\s*\(y\s*\/\s*n\)\s*$/i, "")
      .trim(),
    required: false,
  };
}

// ─── Full JD paste parser ─────────────────────────────────────────────────────

type ParsedJD = {
  sections: Sections;
  title: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  questions: Question[];
};

/**
 * Parses a raw pasted job description document into structured fields.
 * Handles: title, location, salary extraction; section detection; bullet
 * normalisation; application questions parsing.
 */
function parseFullJD(rawText: string): ParsedJD {
  const result: ParsedJD = {
    sections: emptySections(),
    title: null,
    salaryMin: null,
    salaryMax: null,
    questions: [],
  };
  if (!rawText?.trim()) return result;

  // Normalise line endings
  const lines = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  type Bucket = SectionKey | "questions" | "skip" | "pre";
  let bucket: Bucket = "pre";
  let accumulated: string[] = [];
  let prevBlank = true;
  let nonBlankSeen = 0;

  function commit() {
    const trimmed = accumulated.map(normalizeBullet).join("\n").trim();
    if (!trimmed) { accumulated = []; return; }

    if (bucket === "pre") {
      if (!result.sections.overview) result.sections.overview = trimmed;
    } else if (bucket === "questions") {
      for (const l of accumulated) {
        const q = parseQuestionLine(l);
        if (q) result.questions.push({ ...q, order: result.questions.length });
      }
    } else if (bucket !== "skip") {
      result.sections[bucket] = result.sections[bucket]
        ? result.sections[bucket] + "\n\n" + trimmed
        : trimmed;
    }
    accumulated = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();

    // Blank line
    if (!t) {
      prevBlank = true;
      if (bucket !== "skip" && bucket !== "pre") accumulated.push(raw);
      continue;
    }

    nonBlankSeen++;

    // ── "Key: value" metadata lines ────────────────────────────────────
    const colonIdx = t.indexOf(":");
    const hasInlineValue = colonIdx > 0 && colonIdx < t.length - 1;
    const kPart = hasInlineValue ? t.slice(0, colonIdx).trim() : "";
    const vPart = hasInlineValue ? t.slice(colonIdx + 1).trim() : "";

    if ((bucket === "pre" || bucket === "skip") && hasInlineValue && kPart && !/^[\-•*\d]/.test(t)) {
      if (TITLE_RE.test(kPart) && vPart) {
        if (!result.title) result.title = vPart;
        prevBlank = false;
        continue;
      }
      if (LOCATION_RE.test(kPart) && vPart) {
        const loc = `Location: ${vPart}`;
        result.sections.overview = result.sections.overview
          ? `${loc}\n\n${result.sections.overview}`
          : loc;
        prevBlank = false;
        continue;
      }
      if (SALARY_META_RE.test(kPart) && vPart) {
        const { min, max } = extractSalaryRange(vPart);
        if (min !== null && result.salaryMin === null) result.salaryMin = min;
        if (max !== null && result.salaryMax === null) result.salaryMax = max;
        prevBlank = false;
        continue;
      }
    }

    // ── First non-blank line as implicit title (ALL-CAPS header) ──────
    if (bucket === "pre" && !result.title && nonBlankSeen === 1) {
      const wc = t.replace(/:$/, "").trim();
      if (
        wc === wc.toUpperCase() &&
        /[A-Z]/.test(wc) &&
        wc.length >= 3 && wc.length <= 70 &&
        !wc.includes(",") && !/[.!?]/.test(wc)
      ) {
        result.title = wc;
        prevBlank = false;
        continue;
      }
    }

    // ── Section heading detection ──────────────────────────────────────
    const withoutColon = t.replace(/:$/, "").trim();

    // Questions section
    if (QUESTIONS_RE.test(withoutColon)) {
      commit(); bucket = "questions"; prevBlank = false; continue;
    }

    // Metadata-only standalone headings
    if (TITLE_RE.test(withoutColon) || LOCATION_RE.test(withoutColon) || SALARY_META_RE.test(withoutColon)) {
      commit(); bucket = "skip"; prevBlank = false; continue;
    }

    // Known JD sections
    let matched: SectionKey | null = null;
    for (const { re, key } of HEADING_MAP) {
      if (re.test(withoutColon)) { matched = key; break; }
    }
    if (matched) {
      commit(); bucket = matched; prevBlank = false; continue;
    }

    // Generic heading (ALL-CAPS or colon-terminated) — only after a blank line
    const isAllCaps =
      withoutColon === withoutColon.toUpperCase() &&
      /[A-Z]/.test(withoutColon) &&
      withoutColon.length >= 3 && withoutColon.length <= 55 &&
      !/[.!?]/.test(withoutColon) &&
      !withoutColon.startsWith("-") &&
      !/^\d/.test(withoutColon) &&
      !withoutColon.includes(",");

    const isColonEnd =
      t.endsWith(":") &&
      withoutColon.length >= 2 && withoutColon.length <= 50 &&
      !withoutColon.includes(",") &&
      !/^\d/.test(withoutColon);

    if (prevBlank && (isAllCaps || isColonEnd)) {
      commit(); bucket = "skip"; prevBlank = false; continue;
    }

    // ── Regular content line ───────────────────────────────────────────
    accumulated.push(raw);
    prevBlank = false;
  }

  commit();

  // Fallback: try to extract salary from compensation section text
  if (result.salaryMin === null && result.sections.compensation) {
    const firstContentLine = result.sections.compensation.split("\n").find((l) => l.trim()) ?? "";
    const { min, max } = extractSalaryRange(firstContentLine);
    if (min !== null) { result.salaryMin = min; result.salaryMax = max; }
  }

  return result;
}

// ─── Round-trip converters (saved description ↔ section fields) ───────────────

/** Parse an already-structured saved description back into section fields */
function descriptionToSections(description: string): Sections {
  const result = emptySections();
  if (!description?.trim()) return result;

  const lines = description.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
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

  const hasAny = Object.values(result).some((v) => v.trim());
  if (!hasAny && description.trim()) {
    result.overview = description.trim();
  }
  return result;
}

/** Reassemble section fields into a structured plain-text description */
function sectionsToDescription(sections: Sections): string {
  return SECTIONS.filter(({ key }) => sections[key]?.trim())
    .map(({ key, label }) => `${label}:\n${sections[key].trim()}`)
    .join("\n\n");
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatForInputDateTime(v: any): string {
  if (!v) return "";
  if (typeof v === "string") {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) return v.slice(0, 16);
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 16);
    return "";
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 16);
  return "";
}

function normalizeDateTimeForWire(input: any): string | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input === "string") {
    const s = input.trim();
    if (s === "") return null;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s;
    const m2 = s.replace(",", "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})$/);
    if (m2) {
      const [, dd, mm, yyyy, HH, MM] = m2;
      const pad = (n: string | number) => String(n).padStart(2, "0");
      return `${yyyy}-${pad(mm)}-${pad(dd)}T${pad(HH)}:${pad(MM)}`;
    }
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 16);
    return s;
  }
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input.toISOString().slice(0, 16);
  return null;
}

async function readError(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { status: res.status, statusText: res.statusText, body: text?.slice(0, 800) }; }
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

  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(!initialJob);

  const isEdit = !!initialJob;
  const up = (k: string, v: any) => setJob((s: any) => ({ ...s, [k]: v }));
  const upSection = (key: SectionKey, value: string) =>
    setSections((s) => ({ ...s, [key]: value }));

  function parseAndFill() {
    if (!pasteText.trim()) return;
    const hasContent =
      Object.values(sections).some((v) => v.trim()) ||
      (job.questions ?? []).length > 0;
    if (hasContent && !confirm("This will overwrite current section content and questions. Continue?"))
      return;

    const parsed = parseFullJD(pasteText);
    setSections(parsed.sections);
    setJob((prev: any) => ({
      ...prev,
      ...(parsed.title ? { title: parsed.title } : {}),
      ...(parsed.salaryMin !== null ? { salaryMin: String(parsed.salaryMin) } : {}),
      ...(parsed.salaryMax !== null ? { salaryMax: String(parsed.salaryMax) } : {}),
      ...(parsed.questions.length > 0 ? { questions: parsed.questions } : {}),
    }));
    setPasteText("");
    setShowPaste(false);
  }

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

  // Dark input shared class
  const inputCls =
    "w-full border border-gray-600 p-2 rounded text-sm text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">{isEdit ? "Edit Job" : "New Job"}</h1>

      {/* ── Paste Full JD ─────────────────────────────────────────────── */}
      <div className="border border-amber-500/40 rounded-lg overflow-hidden bg-amber-950/30">
        <button
          type="button"
          onClick={() => setShowPaste((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-900/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-amber-400"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
            <span className="text-sm font-semibold text-amber-300">Paste Full JD</span>
            <span className="text-xs text-amber-500 hidden sm:inline">
              — auto-fills title, salary, sections &amp; questions
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-amber-500 transition-transform ${showPaste ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showPaste && (
          <div className="px-4 pb-4 space-y-3 border-t border-amber-500/30">
            <p className="text-xs text-amber-400/80 pt-3">
              Paste a complete job description. The parser extracts{" "}
              <strong className="text-amber-300">title, location, salary</strong>, splits content into{" "}
              <strong className="text-amber-300">section fields</strong>, and converts{" "}
              <strong className="text-amber-300">application questions</strong> into the questions list.
              Bullet points are preserved.
            </p>
            <textarea
              className="w-full border border-amber-500/40 rounded p-3 text-sm text-gray-100 bg-gray-900 resize-y focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-600"
              rows={12}
              placeholder="Paste the full job description here…"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={parseAndFill}
                disabled={!pasteText.trim()}
                className="px-4 py-2 rounded text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Parse &amp; Fill
              </button>
              <button
                type="button"
                onClick={() => setPasteText("")}
                className="px-3 py-2 rounded text-sm border border-amber-500/40 text-amber-400 hover:bg-amber-900/30 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Title ─────────────────────────────────────────────────────── */}
      <label className="block">
        <div className="text-sm font-semibold mb-1 text-gray-300">Title</div>
        <input
          className={inputCls}
          value={job.title}
          onChange={(e) => up("title", e.target.value)}
        />
      </label>

      {/* ── Category ──────────────────────────────────────────────────── */}
      <label className="block">
        <div className="text-sm font-semibold mb-1 text-gray-300">Category</div>
        <select
          className={inputCls}
          value={job.categoryId}
          onChange={(e) => up("categoryId", e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-gray-800">
              {c.label}
            </option>
          ))}
        </select>
      </label>

      {/* ── JD Sections ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-sm font-semibold text-gray-300">Job Description</div>
          <div className="text-xs text-gray-500">Each section renders as a card on the public listing</div>
        </div>

        <div className="space-y-3">
          {SECTIONS.map(({ key, label, hint, rows, accent, accentText }) => (
            <div
              key={key}
              className={`border border-gray-700 border-l-4 ${accent} rounded-lg overflow-hidden`}
            >
              <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between gap-4">
                <span className={`text-sm font-semibold ${accentText}`}>{label}</span>
                <span className="text-xs text-gray-500 text-right hidden sm:block">{hint}</span>
              </div>
              <p className="text-xs text-gray-500 px-3 pt-2 sm:hidden">{hint}</p>
              <textarea
                className="w-full px-3 py-2 text-sm text-gray-100 bg-gray-900 resize-y focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 placeholder-gray-600"
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
        <div className="text-sm font-semibold mb-1 text-gray-300">Salary</div>
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
        <div className="text-sm font-semibold mb-2 text-gray-300">Required Documents</div>
        <div className="flex gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-blue-500"
              checked={job.requireCV}
              onChange={(e) => up("requireCV", e.target.checked)}
            />
            <span className="text-sm text-gray-300">Require CV</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-blue-500"
              checked={job.requireCoverLetter}
              onChange={(e) => up("requireCoverLetter", e.target.checked)}
            />
            <span className="text-sm text-gray-300">Require Cover Letter</span>
          </label>
        </div>
      </div>

      {/* ── Expires At ────────────────────────────────────────────────── */}
      <label className="block">
        <div className="text-sm font-semibold mb-1 text-gray-300">Expires At</div>
        <input
          type="datetime-local"
          className="border border-gray-600 p-2 rounded text-sm text-gray-100 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formatForInputDateTime(job.expiresAt)}
          onChange={(e) => up("expiresAt", e.target.value)}
        />
      </label>

      {/* ── Custom Questions ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-300">Application Questions</div>
          <div className="flex gap-2">
            <button
              type="button"
              className="border border-gray-600 px-2 py-1 rounded text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              onClick={() => addQuestion("yes_no")}
            >
              + Yes/No
            </button>
            <button
              type="button"
              className="border border-gray-600 px-2 py-1 rounded text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              onClick={() => addQuestion("text")}
            >
              + Input
            </button>
          </div>
        </div>

        {(job.questions ?? []).map((q: Question, i: number) => (
          <div key={i} className="border border-gray-700 bg-gray-800 rounded p-2 flex items-start gap-2">
            <select
              value={q.type}
              onChange={(e) => {
                const arr = [...job.questions];
                arr[i] = { ...q, type: e.target.value as any };
                up("questions", arr);
              }}
              className="border border-gray-600 p-1 rounded text-sm text-gray-200 bg-gray-700 focus:outline-none"
            >
              <option value="yes_no">Yes/No</option>
              <option value="text">Input</option>
            </select>

            <input
              className="flex-1 border border-gray-600 p-2 rounded text-sm text-gray-100 bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Question prompt"
              value={q.prompt}
              onChange={(e) => {
                const arr = [...job.questions];
                arr[i] = { ...q, prompt: e.target.value };
                up("questions", arr);
              }}
            />

            <label className="inline-flex items-center gap-1 text-sm text-gray-300 whitespace-nowrap">
              <input
                type="checkbox"
                className="accent-blue-500"
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
              className="text-red-400 text-sm hover:text-red-300 whitespace-nowrap"
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
      <div className="flex gap-3 pt-2 border-t border-gray-700">
        <button
          type="button"
          className="border border-gray-600 px-4 py-2 rounded text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          onClick={() => save(false)}
        >
          Save Draft
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded text-sm bg-white text-black hover:bg-gray-200 font-medium transition-colors"
          onClick={() => save(true)}
        >
          Publish
        </button>
        {isEdit && (
          <button
            type="button"
            className="border border-red-800 px-4 py-2 rounded text-sm text-red-400 hover:bg-red-900/30 ml-auto transition-colors"
            onClick={del}
          >
            Delete
          </button>
        )}
      </div>
    </main>
  );
}
