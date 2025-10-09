// src/app/jobs/[id]/JobForm.tsx
"use client";

import { useState } from "react";
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
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Basic info */}
        <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" />
        <input type="email" placeholder="Email" required className="w-full p-2 border rounded" />
        <input type="tel" placeholder="Phone Number" required className="w-full p-2 border rounded" />

        {/* Admin-defined questions */}
        {sortedQs.length > 0 && (
          <>
            <h2 className="text-lg font-semibold">Application Questions</h2>
            <div className="space-y-3">
              {sortedQs.map((q, idx) => {
                const key = q.id ?? `q_${idx}`;
                return (
                  <div key={key} className="space-y-1">
                    <div className="text-sm font-medium">
                      {q.prompt} {q.required && <span className="text-red-500">*</span>}
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
                        className="w-full border p-2 rounded"
                        placeholder="Type your answer"
                        required={q.required}
                        onChange={(e) => updateAnswer(key, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Ad slot */}
        <div className="my-4">
          <AdSlot slot="1122334455" />
        </div>

        {/* Documents */}
        {(requireCV || requireCoverLetter) && (
          <>
            <h2 className="text-lg font-semibold">Documents</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {requireCV && (
                <label className="block">
                  <span className="text-sm font-medium">
                    CV <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="mt-1 block w-full"
                    required
                    onChange={(e) => setCv(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
              {requireCoverLetter && (
                <label className="block">
                  <span className="text-sm font-medium">
                    Cover Letter <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="mt-1 block w-full"
                    required
                    onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>
          </>
        )}

        {/* Optional extras */}
        <input type="url" placeholder="LinkedIn Profile URL" className="w-full p-2 border rounded" />
        <input type="url" placeholder="Portfolio / GitHub URL" className="w-full p-2 border rounded" />
        <input type="number" placeholder="Expected Salary (KES)" className="w-full p-2 border rounded" />
        <label className="block">
          <span className="text-sm font-medium">Available From</span>
          <input type="date" className="mt-1 block w-full p-2 border rounded" />
        </label>

        {/* Legal acceptance */}
        <div className="flex items-center space-x-2 mb-2">
          <input
            id="accept"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            required
            className="accent-blue-600"
          />
          <label htmlFor="accept" className="text-sm">
            I accept the{" "}
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => setShowLegal(true)}
            >
              Terms & Legal Notice
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={!accepted || submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </form>

      {/* Legal Modal */}
      {showLegal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white max-w-lg w-full rounded p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-2">Official Legal Notice &amp; Consent</h2>
            <div className="text-sm text-gray-700 mb-4 max-h-80 overflow-y-auto space-y-2">
              <p>
                <strong>AAJobs.ke (AfricaForAfricaJobsKenya)</strong> is a job listing platform intended to showcase
                employment opportunities across Africa. By submitting your application through this website, you
                acknowledge and consent that all listings, company profiles, and job openings may be illustrative,
                simulated, or used for any purposes. We do not guarantee the authenticity, availability, or outcome
                of any opportunity listed herein. Always exercise discretion and verify any opportunity independently.
              </p>
              <ul className="list-disc pl-5">
                <li>All information you provide is submitted voluntarily and at your own discretion. You are solely responsible for the accuracy and truthfulness of all details shared.</li>
                <li>By submitting your application, you grant AAJobs.ke and its administrators the right to store, process, and share your information with potential employers, partners, or service providers as deemed necessary for recruitment or networking purposes.</li>
                <li>AAJobs.ke administrators may retain submitted information for record keeping, analytics, and service improvement, in accordance with our privacy policy.</li>
                <li>You may request the deletion of your information at any time, but we cannot guarantee the removal of data already shared with third parties prior to your request.</li>
              </ul>
              <p className="font-semibold">
                By accepting these terms and submitting your application, you agree to the collection, storage,
                and sharing of your personal data as described above. If you do not agree, please do not submit your
                information through this website.
              </p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowLegal(false)}>
              Close
            </button>
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
