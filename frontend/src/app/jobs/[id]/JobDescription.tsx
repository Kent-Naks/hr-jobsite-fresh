// src/app/jobs/[id]/JobDescription.tsx
"use client";

import { useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ParsedSection = {
  heading: string | null;
  iconKey: string | null;
  lines: string[];
};

// ─── Section definitions ─────────────────────────────────────────────────────

const KNOWN_HEADINGS: { re: RegExp; iconKey: string }[] = [
  { re: /^overview$/i, iconKey: "briefcase" },
  { re: /^(key\s+)?responsibilities$/i, iconKey: "list" },
  { re: /^education\s*(&|and)\s*experience$/i, iconKey: "academic" },
  { re: /^education\s*,?\s*(qualifications?)?$/i, iconKey: "academic" },
  { re: /^experience$/i, iconKey: "academic" },
  { re: /^(required\s+)?skills?$/i, iconKey: "bolt" },
  { re: /^(key\s+)?performance\s*(indicators?)?$|^kpis?$/i, iconKey: "chart" },
  { re: /^(compensation|salary|remuneration)(\s+package)?$/i, iconKey: "money" },
  { re: /^benefits?(\s+package)?$/i, iconKey: "heart" },
  { re: /^(career\s+)?growth(\s+path)?$/i, iconKey: "growth" },
  { re: /^about(\s+(the\s+)?(role|position|company|us))?$/i, iconKey: "briefcase" },
  { re: /^what\s+you.*(bring|do|offer)$/i, iconKey: "bolt" },
  { re: /^requirements?$/i, iconKey: "academic" },
  { re: /^qualifications?$/i, iconKey: "academic" },
  { re: /^responsibilities?\s*(include)?$/i, iconKey: "list" },
  { re: /^duties$/i, iconKey: "list" },
];

const ICON_TEXT_COLORS: Record<string, string> = {
  briefcase: "text-blue-400",
  list: "text-amber-400",
  academic: "text-purple-400",
  bolt: "text-cyan-400",
  chart: "text-rose-400",
  money: "text-emerald-400",
  heart: "text-pink-400",
  growth: "text-teal-400",
  default: "text-gray-400",
};

const CARD_COLORS: Record<string, string> = {
  briefcase: "bg-blue-500/10 border-blue-500/20",
  list: "bg-amber-500/10 border-amber-500/20",
  academic: "bg-purple-500/10 border-purple-500/20",
  bolt: "bg-cyan-500/10 border-cyan-500/20",
  chart: "bg-rose-500/10 border-rose-500/20",
  money: "bg-emerald-500/10 border-emerald-500/20",
  heart: "bg-pink-500/10 border-pink-500/20",
  growth: "bg-teal-500/10 border-teal-500/20",
  default: "bg-white/5 border-white/10",
};

// ─── Icon SVGs ────────────────────────────────────────────────────────────────

function Icon({ k }: { k: string | null }) {
  const cls = "w-5 h-5 flex-shrink-0";
  switch (k) {
    case "briefcase":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="12.01" />
        </svg>
      );
    case "list":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="6" x2="20" y2="6" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="1.5" fill="currentColor" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" />
          <circle cx="4" cy="18" r="1.5" fill="currentColor" />
        </svg>
      );
    case "academic":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case "bolt":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      );
    case "money":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v2m0 8v2M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
        </svg>
      );
    case "heart":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      );
    case "growth":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}

// ─── Parser ──────────────────────────────────────────────────────────────────

function matchKnown(text: string): string | null {
  const normalized = text.toLowerCase().replace(/:$/, "").trim();
  for (const def of KNOWN_HEADINGS) {
    if (def.re.test(normalized)) return def.iconKey;
  }
  return null;
}

function detectHeading(
  line: string,
  prevBlank: boolean
): { heading: string; iconKey: string | null } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 80) return null;

  const withoutColon = trimmed.replace(/:$/, "").trim();
  const iconKey = matchKnown(withoutColon);

  // Known section → always a heading, regardless of blank line before it
  if (iconKey !== null) {
    return { heading: withoutColon, iconKey };
  }

  // For generic detection, only trigger after a blank line
  if (!prevBlank) return null;

  // ALL-CAPS line (3–55 chars, no sentence-ending punctuation, not a number)
  const isAllCaps =
    withoutColon === withoutColon.toUpperCase() &&
    /[A-Z]/.test(withoutColon) &&
    withoutColon.length >= 3 &&
    withoutColon.length <= 55 &&
    !/[.!?]/.test(withoutColon) &&
    !/^\d+$/.test(withoutColon) &&
    !withoutColon.includes(",");

  if (isAllCaps) return { heading: withoutColon, iconKey: null };

  // Short line ending with colon, no commas, not starting with a digit
  if (
    trimmed.endsWith(":") &&
    withoutColon.length >= 2 &&
    withoutColon.length <= 45 &&
    !withoutColon.includes(",") &&
    !/^\d/.test(withoutColon)
  ) {
    return { heading: withoutColon, iconKey: null };
  }

  return null;
}

function trimBlankEnds(lines: string[]): string[] {
  let s = 0;
  let e = lines.length - 1;
  while (s <= e && !lines[s].trim()) s++;
  while (e >= s && !lines[e].trim()) e--;
  return lines.slice(s, e + 1);
}

function parseDescription(text: string): ParsedSection[] {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  let current: ParsedSection = { heading: null, iconKey: null, lines: [] };
  let prevBlank = true;

  for (const line of lines) {
    if (!line.trim()) {
      prevBlank = true;
      current.lines.push(line);
      continue;
    }

    const h = detectHeading(line, prevBlank);
    if (h) {
      const trimmed = trimBlankEnds(current.lines);
      if (current.heading !== null || trimmed.some((l) => l.trim())) {
        sections.push({ ...current, lines: trimmed });
      }
      current = { heading: h.heading, iconKey: h.iconKey, lines: [] };
    } else {
      current.lines.push(line);
    }
    prevBlank = false;
  }

  const last = trimBlankEnds(current.lines);
  if (current.heading !== null || last.some((l) => l.trim())) {
    sections.push({ ...current, lines: last });
  }

  return sections;
}

// ─── Content rendering ────────────────────────────────────────────────────────

function toTitleCase(s: string): string {
  const acronyms: Record<string, string> = { kpis: "KPIs", kpi: "KPI" };
  return s
    .toLowerCase()
    .replace(/\b\w+/g, (w) => acronyms[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .replace(/\bAnd\b/g, "and")
    .replace(/\bOf\b/g, "of")
    .replace(/\bThe\b/g, "the")
    .replace(/^(.)/, (c) => c.toUpperCase()); // capitalise first char always
}

function renderContent(lines: string[], iconKey: string | null): React.ReactNode {
  // Skill-like sections: detect comma-separated inline lists
  const joined = lines
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ");

  const commaItems = joined.split(",").map((t) => t.trim()).filter(Boolean);
  const looksLikeTagList =
    iconKey === "bolt" &&
    commaItems.length >= 3 &&
    joined.length < 400 &&
    !joined.includes("\n") &&
    lines.filter((l) => l.trim()).length <= 3;

  if (looksLikeTagList) {
    return (
      <div className="flex flex-wrap gap-2">
        {commaItems.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  }

  // General: paragraphs + bullet lists
  const elements: React.ReactNode[] = [];
  let bullets: string[] = [];
  let paraLines: string[] = [];
  let key = 0;

  const flushPara = () => {
    const text = paraLines.join(" ").trim();
    if (text) {
      elements.push(
        <p key={key++} className="text-sm leading-relaxed text-gray-300">
          {text}
        </p>
      );
    }
    paraLines = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    elements.push(
      <ul key={key++} className="space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed">
            <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushPara();
      continue;
    }
    const bulletMatch = t.match(/^[-•*]\s+(.*)/);
    const numMatch = t.match(/^\d+[.)]\s+(.*)/);
    if (bulletMatch || numMatch) {
      flushPara();
      bullets.push((bulletMatch?.[1] ?? numMatch?.[1] ?? t).trim());
    } else {
      flushBullets();
      paraLines.push(t);
    }
  }

  flushPara();
  flushBullets();

  return <div className="space-y-2">{elements}</div>;
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ section }: { section: ParsedSection }) {
  const ik = section.iconKey ?? "default";
  const iconColor = ICON_TEXT_COLORS[ik] ?? ICON_TEXT_COLORS.default;
  const cardBg = CARD_COLORS[ik] ?? CARD_COLORS.default;

  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${cardBg}`}>
      {section.heading && (
        <div className={`flex items-center gap-2.5 mb-3 ${iconColor}`}>
          <Icon k={ik} />
          <h3 className="font-semibold text-white text-sm sm:text-base tracking-wide">
            {toTitleCase(section.heading)}
          </h3>
        </div>
      )}
      {renderContent(section.lines, section.iconKey)}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function JobDescription({ description }: { description: string }) {
  const [showSticky, setShowSticky] = useState(true);

  useEffect(() => {
    const formEl = document.getElementById("apply-form");
    if (!formEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(formEl);
    return () => observer.disconnect();
  }, []);

  const sections = parseDescription(description ?? "");

  if (!sections.length) return null;

  return (
    <>
      <div className="space-y-3 mb-6">
        {sections.map((section, i) => (
          <SectionCard key={i} section={section} />
        ))}
      </div>

      {/* Sticky Apply Now button */}
      {showSticky && (
        <button
          type="button"
          onClick={() =>
            document
              .getElementById("apply-form")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-40
            flex items-center gap-2 px-5 py-3 rounded-full
            bg-emerald-600 text-white font-semibold text-sm shadow-xl
            hover:bg-emerald-500 active:scale-95 transition-all duration-150
            ring-2 ring-emerald-400/30"
          aria-label="Scroll to application form"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Apply Now
        </button>
      )}
    </>
  );
}
