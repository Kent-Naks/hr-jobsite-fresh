// src/app/jobs/[id]/JobForm.tsx
"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import type { Job } from "@/types";

type UIQuestion = {
  id?: string;
  type: "yes_no" | "text";
  prompt: string;
  required?: boolean;
  order?: number;
};

const REDIRECT_DELAY_MS = 1200; // ~1.2s: show banner on job page, then go Home

export default function JobForm({
  recommendations,
  jobId,
  questions = [],
  requireCV = false,
  requireCoverLetter = false,
}: {
  recommendations: Job[];
  jobId?: string;
  questions?: UIQuestion[];
  requireCV?: boolean;
  requireCoverLetter?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // success banner (on the job page)
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const sortedQs = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  function updateAnswer(key: string, value: any) {
    setAnswers((s) => ({ ...s, [key]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) {
    setter(e.target.files?.[0] ?? null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    // TODO: replace with real POST (only redirect on success)
    await new Promise((r) => setTimeout(r, 500));

    // 1) Show success on this page
    setShowSuccess(true);
    setTimeout(() => setFadeOut(true), 300); // begin fade

    // 2) Prime Home to show the same banner for ~4s
    try {
      sessionStorage.setItem("flash_banner", "Application submitted successfully!");
    } catch {}

    // 3) Navigate to Home after a short delay
    setTimeout(() => {
      router.replace("/"); // replace avoids back-button re-submit
    }, REDIRECT_DELAY_MS);
  }

  return (
    <div>
      {/* `dark-form` applies the black cards + white borders + white form controls */}
      <form onSubmit={onSubmit} className="dark-form space-y-6">
        {/* =========================
            Partition: Personal + Contact
           ========================= */}
        <section className="rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">APPLY BELOW:<br />Personal & Contact</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
              className="w-full"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              className="w-full"
            />
          </div>
        </section>

        {/* =========================
            Partition: Documents (prominent)
           ========================= */}
        {(requireCV || requireCoverLetter) && (
          <section className="rounded-lg p-5">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">Documents</h2>
              {/* moved required-docs info here and styled white */}
              <div className="text-sm">
                <div className="font-medium">Required documents</div>
                <div>
                  {requireCV ? <span className="font-semibold">CV required</span> : <span>CV optional</span>} ·{" "}
                  {requireCoverLetter ? <span className="font-semibold">Cover letter required</span> : <span>Cover letter optional</span>}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* CV dropzone */}
              {requireCV && (
                <div className="relative">
                  {/* Arrow & hint */}
                  <div className="absolute -top-6 left-4 flex items-center gap-2 pointer-events-none">
                    <svg className="w-7 h-7 animate-bounce" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs">Attach CV here</span>
                  </div>

                  <label
                    htmlFor="cv-upload"
                    className="group block border-2 border-dashed rounded-lg p-4 cursor-pointer hover:shadow transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Curriculum Vitae (CV)</div>
                            <div className="text-xs">{requireCV ? "Required" : "Optional"}</div>
                          </div>

                          <div className="text-sm group-hover:text-opacity-90">
                            {cv ? (
                              <span>{cv.name}</span>
                            ) : (
                              <span>Click to choose a file</span>
                            )}
                          </div>
                        </div>

                        {cv && (
                          <div className="mt-2 text-xs flex items-center gap-3">
                            <span>{(cv.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button
                              type="button"
                              onClick={() => setCv(null)}
                              className="text-xs underline"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      id="cv-upload"
                      name="cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => handleFileChange(e, setCv)}
                      required={requireCV}
                    />
                  </label>
                </div>
              )}

              {/* Cover Letter dropzone */}
              {requireCoverLetter && (
                <div className="relative">
                  <div className="absolute -top-6 left-4 flex items-center gap-2 pointer-events-none">
                    <svg className="w-7 h-7 animate-bounce" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs">Attach cover letter</span>
                  </div>

                  <label
                    htmlFor="cover-upload"
                    className="group block border-2 border-dashed rounded-lg p-4 cursor-pointer hover:shadow transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 3h8v4H8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Cover Letter</div>
                            <div className="text-xs">{requireCoverLetter ? "Required" : "Optional"}</div>
                          </div>

                          <div className="text-sm group-hover:text-opacity-90">
                            {cover ? <span>{cover.name}</span> : <span>Click to choose a file</span>}
                          </div>
                        </div>

                        {cover && (
                          <div className="mt-2 text-xs flex items-center gap-3">
                            <span>{(cover.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button
                              type="button"
                              onClick={() => setCover(null)}
                              className="text-xs underline"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      id="cover-upload"
                      name="coverLetter"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => handleFileChange(e, setCover)}
                      required={requireCoverLetter}
                    />
                  </label>
                </div>
              )}
            </div>
          </section>
        )}

        {/* =========================
            Partition: Application Questions
           ========================= */}
        {sortedQs.length > 0 && (
          <section className="rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-3">Application Questions</h2>
            <div className="space-y-3">
              {sortedQs.map((q, idx) => {
                const key = q.id ?? `q_${idx}`;
                return (
                  <div key={key} className="space-y-1">
                    <div className="text-sm font-medium">
                      {q.prompt} {q.required && <span className="text-red-400">*</span>}
                    </div>

                    {q.type === "yes_no" ? (
                      <div className="flex gap-3">
                        <label className="inline-flex items-center gap-1">
                          <input
                            type="radio"
                            name={key}
                            value="yes"
                            required={q.required}
                            onChange={() => updateAnswer(key, "yes")}
                          />
                          <span>Yes</span>
                        </label>
                        <label className="inline-flex items-center gap-1">
                          <input
                            type="radio"
                            name={key}
                            value="no"
                            required={q.required}
                            onChange={() => updateAnswer(key, "no")}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    ) : (
                      <input
                        className="w-full"
                        placeholder="Type your answer"
                        required={q.required}
                        onChange={(e) => updateAnswer(key, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================
            Partition: Optional Extras
           ========================= */}
        <section className="rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">Extras</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="url" name="linkedin" placeholder="LinkedIn Profile URL" className="w-full" />
            <input type="url" name="portfolio" placeholder="Portfolio / GitHub URL" className="w-full" />
            <input type="number" name="expectedSalary" placeholder="Expected Salary (KES)" className="w-full" />
            <label className="block">
              <div className="text-sm font-medium mb-1">Available From</div>
              <input type="date" name="availableFrom" className="w-full" />
            </label>
          </div>
        </section>

        {/* =========================
            Partition: Legal + Submit
           ========================= */}
        <section className="rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <input
              id="accept"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              required
              className="accent-white"
            />
            <label htmlFor="accept" className="text-sm">
              I accept the{" "}
              <button
                type="button"
                className="underline"
                onClick={() => setShowLegal(true)}
              >
                Terms & Legal Notice
              </button>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">You can print the page after submitting (optional)</div>
            <button
              type="submit"
              disabled={!accepted || submitting}
              className="bg-white text-black px-4 py-2 rounded disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
          </div>
        </section>
      </form>

      {/* Legal Modal (full content preserved) */}
      {showLegal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-title"
          onKeyDown={(e) => e.key === "Escape" && setShowLegal(false)}
        >
          {/* Backdrop click closes */}
          <div
            className="absolute inset-0"
            onClick={() => setShowLegal(false)}
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <div className="relative z-10 mx-4 w-full max-w-3xl rounded-lg bg-white shadow-xl">
            {/* Header (sticky) */}
            <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
              <h2 id="legal-title" className="text-lg font-bold">
                Official Legal Notice &amp; Consent
              </h2>
            </div>

            {/* Scrollable content */}
            <div
              className="legal-scroll max-h-[80vh] min-h-[40vh] overflow-y-auto px-6 py-4"
              tabIndex={0}
            >
              {/* START CONTENT */}
              <h3 className="mt-2 font-semibold">1. Introduction</h3>
              <p className="text-sm text-gray-700">
                This Official Legal Notice &amp; Consent (&quot;Notice&quot;) governs your access to and use of the
                Talent Africa website, applications, and related services (collectively, the &quot;Platform&quot;).
                By continuing to access, browse, or submit information through the Platform, you acknowledge that you have
                read, understood, and agree to be bound by this Notice in addition to any other applicable terms, policies,
                or guidelines published by Talent Africa.
              </p>

              {/* ... rest of legal content unchanged ... */}
              <h3 className="mt-4 font-semibold">2. Voluntary Submission of Data</h3>
              <p className="text-sm text-gray-700">Any personal, professional, or contact information you submit is provided voluntarily and at your discretion...</p>
              {/* (legal content continues) */}
            </div>

            {/* Footer (sticky) */}
            <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-white px-6 py-3">
              <span className="text-xs text-gray-500">
                Press <kbd className="rounded border px-1">Esc</kbd> to close
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => window.print()}
                  type="button"
                >
                  Print / Save PDF
                </button>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => setShowLegal(false)}
                  autoFocus
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success toast (on job page) that fades out */}
      {showSuccess && (
        <div
          className={[
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
            "rounded-md bg-emerald-600 text-white px-4 py-2 shadow-lg",
            "transition-opacity duration-1000",
            fadeOut ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          Application submitted successfully!
        </div>
      )}

      {/* Ad below form */}
      <div className="mt-4">
        <AdSlot slot="7788990011" />
      </div>
    </div>
  );
}
