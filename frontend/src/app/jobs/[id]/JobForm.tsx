// src/app/jobs/[id]/JobForm.tsx
"use client";

import { useState, ChangeEvent, useRef, useEffect } from "react";
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
  const [coverLetterText, setCoverLetterText] = useState("");
  const [extrasErrors, setExtrasErrors] = useState({ salary: false, date: false });

  // success banner (on the job page)
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const dateRef = useRef<HTMLInputElement | null>(null);

  const sortedQs = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  function updateAnswer(key: string, value: any) {
    setAnswers((s) => ({ ...s, [key]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) {
    setter(e.target.files?.[0] ?? null);
  }

  useEffect(() => {
    // NOTE: Do not forcibly lock document scrolling here.
    // Older implementation set document.documentElement.style.overflow = "hidden" when modal open,
    // which prevented wheel/touch events from reaching the inner modal on some browsers/devices.
    // We keep this effect only to ensure any stray style is cleaned up on unmount.
    return () => {
      try {
        if (document.documentElement.style.overflow === "hidden") {
          document.documentElement.style.overflow = "";
        }
      } catch {}
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    // Extract applicant details for the confirmation email
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const applicantName = (formData.get("fullName") as string) || "";
    const applicantEmail = (formData.get("email") as string) || "";

    // Fire confirmation email — non-blocking, result does not affect submission flow
    if (jobId && applicantEmail) {
      fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: applicantName, email: applicantEmail }),
      }).catch(() => {});
    }

    // Validate mandatory extras
    const salaryVal = (formData.get("expectedSalary") as string) || "";
    const dateVal = (formData.get("availableFrom") as string) || "";
    const newErrors = { salary: !salaryVal.trim(), date: !dateVal.trim() };
    if (newErrors.salary || newErrors.date) {
      setExtrasErrors(newErrors);
      setSubmitting(false);
      return;
    }
    setExtrasErrors({ salary: false, date: false });

    // simulate upload / POST
    await new Promise((r) => setTimeout(r, 700));

    // show success toast (on this page)
    setShowSuccess(true);
    setTimeout(() => setFadeOut(true), 300);

    try {
      sessionStorage.setItem("flash_banner", "Application submitted successfully!");
    } catch {}

    setTimeout(() => {
      router.replace("/");
    }, REDIRECT_DELAY_MS);
  }

  // Helper: try to open native date picker (supported in some browsers)
  function openDatePicker() {
    const el = dateRef.current;
    if (!el) return;
    // @ts-ignore
    if (typeof el.showPicker === "function") {
      // @ts-ignore
      el.showPicker();
    } else {
      el.focus();
    }
  }

  // Strong visible styles
  const sectionClass = "rounded-lg p-5 border border-white bg-black/95 text-white shadow";
  const inputClass =
    "w-full p-2 rounded border border-white/70 bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-shadow";

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Personal & Contact */}
        <section className={sectionClass}>
          <h2 className="text-lg font-bold mb-3 text-white">
            <span className="block">APPLY BELOW:</span>
            <span className="block text-base font-semibold">Personal &amp; Contact</span>
          </h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
              className={inputClass}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className={inputClass}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              className={inputClass}
            />
          </div>

          <div className="mt-2 text-xs text-gray-300">Tip: use a professional email (e.g. jane.doe@example.com).</div>
        </section>

        {/* Documents */}
        <section className={sectionClass}>
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-bold text-white">Documents</h2>
            {(requireCV || requireCoverLetter) && (
              <div className="text-sm text-gray-200">
                <div className="font-medium">Required documents</div>
                <div className="text-sm">
                  {requireCV ? <span className="font-semibold">CV required</span> : <span>CV optional</span>} ·{" "}
                  {requireCoverLetter ? <span className="font-semibold">Cover letter required</span> : <span>Cover letter optional</span>}
                </div>
              </div>
            )}
          </div>

          {(requireCV || requireCoverLetter) && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {requireCV && (
                <div className="relative">
                  <div className="absolute -top-6 left-4 flex items-center gap-2 pointer-events-none z-10">
                    <svg className="w-7 h-7 animate-bounce text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs text-white">Attach CV here</span>
                  </div>

                  <label
                    htmlFor="cv-upload"
                    className="group block border-2 border-white/70 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-colors bg-white/3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-white/5">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-white">Curriculum Vitae (CV)</div>
                            <div className="text-xs text-gray-200">{requireCV ? "Required" : "Optional"}</div>
                          </div>

                          <div className="text-sm text-white group-hover:text-white">
                            {cv ? <span className="truncate max-w-[10rem] block">{cv.name}</span> : <span>Click to choose a file</span>}
                          </div>
                        </div>

                        {cv && (
                          <div className="mt-2 text-xs text-gray-200 flex items-center gap-3">
                            <span>{(cv.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button
                              type="button"
                              onClick={() => setCv(null)}
                              className="text-xs underline text-gray-200"
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

              {requireCoverLetter && (
                <div className="relative">
                  <div className="absolute -top-6 left-4 flex items-center gap-2 pointer-events-none z-10">
                    <svg className="w-7 h-7 animate-bounce text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs text-white">Attach cover letter</span>
                  </div>

                  <label
                    htmlFor="cover-upload"
                    className="group block border-2 border-white/70 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-colors bg-white/3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-white/5">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 3h8v4H8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-white">Cover Letter</div>
                            <div className="text-xs text-gray-200">{requireCoverLetter ? "Required" : "Optional"}</div>
                          </div>

                          <div className="text-sm text-white group-hover:text-white">
                            {cover ? <span className="truncate max-w-[10rem] block">{cover.name}</span> : <span>Click to choose a file</span>}
                          </div>
                        </div>

                        {cover && (
                          <div className="mt-2 text-xs text-gray-200 flex items-center gap-3">
                            <span>{(cover.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button
                              type="button"
                              onClick={() => setCover(null)}
                              className="text-xs underline text-gray-200"
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
          )}

          {/* Cover letter textarea — always shown */}
          <div className="mt-4">
            <div className="text-sm font-semibold mb-1 text-white">
              Cover Letter{requireCoverLetter && <span className="text-red-400 ml-1">*</span>}
            </div>
            <textarea
              name="coverLetterText"
              rows={6}
              placeholder="Write your cover letter here..."
              required={requireCoverLetter}
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              maxLength={2000}
              className={`${inputClass} resize-y`}
            />
            <div className="mt-1 text-xs text-gray-400 text-right">{coverLetterText.length} / 2000</div>
          </div>
        </section>

        {/* Application Questions */}
        {sortedQs.length > 0 && (
          <section className={sectionClass}>
            <h2 className="text-lg font-bold mb-3 text-white">Application Questions</h2>
            <div className="space-y-3">
              {sortedQs.map((q, idx) => {
                const key = q.id ?? `q_${idx}`;
                return (
                  <div key={key} className="space-y-1">
                    <div className="text-sm font-semibold text-white">
                      {q.prompt} {q.required && <span className="text-amber-400">*</span>}
                    </div>

                    {q.type === "yes_no" ? (
                      <div className="flex gap-4">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name={key}
                            value="yes"
                            required={q.required}
                            onChange={() => updateAnswer(key, "yes")}
                            className="accent-emerald-500"
                          />
                          <span className="text-white">Yes</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name={key}
                            value="no"
                            required={q.required}
                            onChange={() => updateAnswer(key, "no")}
                            className="accent-emerald-500"
                          />
                          <span className="text-white">No</span>
                        </label>
                      </div>
                    ) : (
                      <input
                        className={`${inputClass} bg-transparent text-white`}
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

        {/* Extras */}
        <section className={sectionClass}>
          <h2 className="text-lg font-bold mb-3 text-white">Extras</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="url" name="linkedin" placeholder="LinkedIn Profile URL" className={`${inputClass} text-white`} />
            <input type="url" name="portfolio" placeholder="Portfolio / GitHub URL" className={`${inputClass} text-white`} />

            <label className="block">
              <div className="text-sm font-semibold mb-1 text-white">
                Expected Salary (KES) <span className="text-red-400">*</span>
              </div>
              <input
                type="number"
                name="expectedSalary"
                placeholder="e.g. 80000"
                required
                onChange={() => setExtrasErrors((s) => ({ ...s, salary: false }))}
                className={`${inputClass} text-white${extrasErrors.salary ? " border-red-400" : ""}`}
              />
              {extrasErrors.salary && (
                <p className="mt-1 text-xs text-red-400">Please enter your expected salary.</p>
              )}
            </label>

            <label className="block relative">
              <div className="text-sm font-semibold mb-1 text-white">
                Available From <span className="text-red-400">*</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={dateRef}
                  type="date"
                  name="availableFrom"
                  required
                  onChange={() => setExtrasErrors((s) => ({ ...s, date: false }))}
                  className={`${inputClass} text-white${extrasErrors.date ? " border-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={openDatePicker}
                  aria-label="Open date picker"
                  className="p-2 rounded bg-white/5 hover:bg-white/10 transition"
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 8h18M7 4v4M17 4v4M5 20h14V8H5v12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </div>
              {extrasErrors.date ? (
                <p className="mt-1 text-xs text-red-400">Please select your available from date.</p>
              ) : (
                <div className="mt-2 text-xs text-gray-300">Click the calendar icon to pick a date.</div>
              )}
            </label>
          </div>
        </section>

        {/* Legal + Submit */}
        <section className={sectionClass}>
          <div className="flex items-center gap-3 mb-4">
            <input
              id="accept"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              required
              className="accent-emerald-500"
            />
            <label htmlFor="accept" className="text-sm text-white">
              I accept the{" "}
              <button
                type="button"
                className="underline text-white"
                onClick={() => setShowLegal(true)}
              >
                Terms &amp; Legal Notice
              </button>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">You can print the page after submitting (optional)</div>

            <button
              type="submit"
              disabled={!accepted || submitting}
              className={[
                "px-4 py-2 rounded transition-colors duration-200 font-medium inline-flex items-center gap-2",
                (!accepted || submitting) ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                accepted
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow"
                  : "bg-white text-black hover:bg-gray-100",
              ].join(" ")}
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"></circle>
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
                  </svg>
                  <span>Submitting…</span>
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </section>
      </form>

      {/* Legal Modal */}
      {showLegal && (
        <div
          className="fixed inset-0 z-50 overflow-auto bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-title"
          onKeyDown={(e) => e.key === "Escape" && setShowLegal(false)}
          // close only when clicking the overlay (wrapper) — clicking inside the dialog won't close it
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLegal(false);
          }}
        >
          {/* Dialog panel — stop clicks from bubbling to wrapper */}
          <div
            className="relative z-10 mx-4 w-full max-w-3xl rounded-lg bg-white text-black shadow-xl"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
              <h2 id="legal-title" className="text-lg font-bold">Official Legal Notice &amp; Consent</h2>
            </div>

            <div
              className="px-6 py-4 text-sm"
              style={{ maxHeight: "80vh", overflowY: "auto", WebkitOverflowScrolling: "touch" }}
              tabIndex={0}
            >
              {/* --- START: Full Official Legal Notice & Consent --- */}

              <h3 className="mt-2 font-semibold">1. Introduction</h3>
              <p className="text-sm text-gray-700">
                This <strong>Official Legal Notice &amp; Consent</strong> ("<em>Notice</em>") constitutes a binding agreement
                between <strong>Talent Africa</strong> ("<em>the Platform</em>", "<em>we</em>", "<em>us</em>") and any individual
                or entity ("<em>you</em>", "<em>User</em>", "<em>Applicant</em>") accessing or using our website, mobile
                applications, or related online services (collectively, the "<em>Services</em>"). By using, accessing,
                registering, or submitting information through the Platform you acknowledge that you have read, understood,
                and agree to be legally bound by the terms set forth in this Notice and any related Policies.
              </p>

              <h3 className="mt-4 font-semibold">2. Purpose and Scope</h3>
              <p className="text-sm text-gray-700">
                This Notice governs the collection, processing, storage, disclosure, transmission and retention of Personal
                Data and Professional Data submitted in connection with job listings, recruitment activities, profile creation,
                candidate evaluation, and ancillary services. It applies to all interactions with the Platform whether via web,
                mobile, API integrations, or third-party partner channels.
              </p>

              <h3 className="mt-4 font-semibold">3. Voluntary Submission of Data</h3>
              <p className="text-sm text-gray-700">
                All information you submit, including but not limited to your name, contact details, CV, educational and
                employment history, references, remuneration expectations, and attachments, is submitted voluntarily. You
                represent and warrant that any data submitted is truthful, accurate, complete, and that you have the right to
                disclose such data to the Platform and its authorized partners.
              </p>

              <h3 className="mt-4 font-semibold">4. Consent to Data Processing</h3>
              <p className="text-sm text-gray-700">
                By submitting data you expressly consent to the collection, processing, analysis, storage, and limited
                disclosure of your personal and professional information for recruitment facilitation, candidate sourcing,
                shortlisting, background verification, analytics, and related operational purposes. Processing may be performed
                by Talent Africa or by authorized third-party processors on our behalf.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Your data may be transferred to and processed in jurisdictions that afford different levels of protection.</li>
                <li>For analytical purposes we may aggregate or pseudonymize data to produce de-identified reports.</li>
                <li>We may share candidate information with prospective employers only for legitimate hiring purposes.</li>
              </ul>

              <h3 className="mt-4 font-semibold">5. Legal Bases and Compliance</h3>
              <p className="text-sm text-gray-700">
                Where applicable, Talent Africa processes data on lawful grounds including consent, contract performance,
                legitimate interest, and legal compliance. We endeavour to comply with applicable data protection laws,
                including but not limited to the Kenya Data Protection Act and internationally recognized frameworks where
                relevant.
              </p>

              <h3 className="mt-4 font-semibold">6. Data Retention, Deletion and Right to Erasure</h3>
              <p className="text-sm text-gray-700">
                We retain Personal Data only for as long as necessary to fulfil the purposes described, to comply with legal
                obligations, to enforce agreements, or for legitimate business purposes. Upon valid request we will delete or
                anonymize your data within a commercially reasonable period unless retention is required by law, pending
                litigation, or otherwise necessary for legitimate business reasons.
              </p>

              <h3 className="mt-4 font-semibold">7. Data Subject Rights</h3>
              <p className="text-sm text-gray-700">
                Where applicable, you have certain rights regarding your personal data including access, rectification,
                portability, restriction, objection, and deletion. To exercise these rights contact our Data Protection Officer
                at <strong>legal@thetalentafrica.org</strong> or via the channels published in our Privacy Policy.
              </p>

              <h3 className="mt-4 font-semibold">8. Security Measures &amp; Confidentiality</h3>
              <p className="text-sm text-gray-700">
                Talent Africa employs organisational, technical and administrative safeguards designed to protect data against
                unauthorized access, loss or unlawful processing. While we take commercially reasonable steps to secure your
                information, no system is impervious to intrusion; absolute security cannot be guaranteed.
              </p>

              <h3 className="mt-4 font-semibold">9. Employer Responsibilities and Acceptable Use</h3>
              <p className="text-sm text-gray-700">
                Employers, recruiters and partners that access candidate data agree to use such data solely for legitimate hiring
                activities and to comply with non-discrimination, labour and privacy laws. Employers must not misuse candidate
                information, engage in predatory recruitment practices, or disclose data beyond the scope permitted by this
                Notice.
              </p>

              <h3 className="mt-4 font-semibold">10. Intellectual Property</h3>
              <p className="text-sm text-gray-700">
                All content on the Platform including text, graphics, logos, designs, code, algorithms and trademarks is
                the intellectual property of Talent Africa or its licensors. You are granted a limited, revocable license to use
                the Platform solely for lawful recruitment purposes; you may not copy, reproduce or create derivative works
                without our prior written consent.
              </p>

              <h3 className="mt-4 font-semibold">11. Limitation of Liability &amp; Disclaimers</h3>
              <p className="text-sm text-gray-700">
                To the fullest extent permitted by law, Talent Africa disclaims all warranties, whether express or implied,
                including but not limited to merchantability, fitness for a particular purpose, or non-infringement. We shall not
                be liable for indirect, incidental, special, consequential, punitive or exemplary damages arising from your use
                of the Platform. Where liability cannot be excluded, it shall be limited to the greater of (i) the fees you have
                paid Talent Africa in the preceding 12 months, or (ii) USD 100.
              </p>

              <h3 className="mt-4 font-semibold">12. Indemnification</h3>
              <p className="text-sm text-gray-700">
                You agree to indemnify and hold Talent Africa, its officers, directors, employees and agents harmless from any
                claims, liabilities, losses or expenses (including reasonable legal fees) arising out of your breach of this Notice,
                misuse of the Platform, or infringement of third-party rights.
              </p>

              <h3 className="mt-4 font-semibold">13. Governing Law &amp; Dispute Resolution</h3>
              <p className="text-sm text-gray-700">
                This Notice is governed by the laws of the <strong>Republic of Kenya</strong>. Any dispute arising out of or in
                connection with this Notice shall be subject to the exclusive jurisdiction of the courts located in <strong>Nairobi, Kenya</strong>,
                unless otherwise agreed in writing.
              </p>

              <h3 className="mt-4 font-semibold">14. Amendments</h3>
              <p className="text-sm text-gray-700">
                Talent Africa reserves the right to modify or update this Notice at any time. Material changes will be posted on
                the Platform with an updated effective date. Continued use of the Services following publication constitutes
                acceptance of the revised Notice.
              </p>

              <h3 className="mt-4 font-semibold">15. Contact &amp; Data Protection Officer</h3>
              <p className="text-sm text-gray-700">
                For questions, complaints, or requests concerning this Notice or your personal data, contact:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li><strong>Talent Africa – Legal &amp; Compliance</strong></li>
                <li>Email: <strong>legal@thetalentafrica.org</strong></li>
                <li>Data access / privacy requests: <strong>privacy@thetalentafrica.org</strong></li>
                <li>Postal / business address: Nairobi, Kenya</li>
              </ul>

              <h3 className="mt-4 font-semibold">16. Acknowledgement</h3>
              <p className="text-sm text-gray-700">
                By closing this dialog, checking the acceptance box, or submitting an application you acknowledge that you have read,
                understood and agreed to be bound by this Official Legal Notice &amp; Consent. If you do not agree, do not submit any
                information and discontinue use of the Platform immediately.
              </p>

              {/* --- END: Full Official Legal Notice & Consent --- */}
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-white px-6 py-3">
              <span className="text-xs text-gray-500">Press <kbd className="rounded border px-1">Esc</kbd> to close</span>
              <div className="flex gap-2">
                <button className="rounded border px-3 py-2 text-sm hover:bg-gray-50" onClick={() => window.print()} type="button">
                  Print / Save PDF
                </button>
                <button className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" onClick={() => setShowLegal(false)} autoFocus type="button">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showSuccess && (
        <div
          className={[
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-md bg-emerald-600 text-white px-4 py-2 shadow-lg transition-opacity duration-1000",
            fadeOut ? "opacity-0" : "opacity-100",
          ].join(" ")}
          role="status"
        >
          Application submitted successfully!
        </div>
      )}

      {/* Ad */}
      <div className="mt-4">
        <AdSlot slot="7788990011" />
      </div>
    </div>
  );
}
