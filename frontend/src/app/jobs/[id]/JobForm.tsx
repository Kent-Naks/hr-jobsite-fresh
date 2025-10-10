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

{/* Legal Modal (scrollable, accessible, sticky footer) */}
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

        <h3 className="mt-4 font-semibold">2. Voluntary Submission of Data</h3>
        <p className="text-sm text-gray-700">
          Any personal, professional, or contact information you submit is provided voluntarily and at your discretion.
          You represent and warrant that such information is accurate, complete, lawful, and that you possess the
          authority to disclose it. Submitting data does not create any fiduciary, confidential, agency, or employment
          relationship between you and Talent Africa.
        </p>

        <h3 className="mt-4 font-semibold">3. Consent to Data Processing</h3>
        <p className="text-sm text-gray-700">
          You grant Talent Africa, its affiliates, subprocessors, and authorized service providers a perpetual,
          worldwide, royalty-free license to collect, host, store, reproduce, transmit, analyze, process, and use your
          submitted data for legitimate operational purposes, including but not limited to: recruitment facilitation,
          application routing, platform analytics, service improvement, record maintenance, legal compliance, fraud
          prevention, and security. Processing may occur on cloud infrastructure inside or outside your jurisdiction,
          subject to appropriate safeguards.
        </p>

        <h3 className="mt-4 font-semibold">4. Data Retention &amp; Deletion</h3>
        <p className="text-sm text-gray-700">
          Talent Africa retains data for as long as necessary to fulfill the purposes described herein, comply with
          applicable laws, resolve disputes, and enforce agreements. You may request deletion via the contact channel
          in our Privacy Policy; however, deletion will not apply to information already shared with third parties,
          anonymized datasets, system backups retained for integrity, or content we are legally required to preserve.
        </p>

        <h3 className="mt-4 font-semibold">5. No Guarantee or Warranty</h3>
        <p className="text-sm text-gray-700">
          The Platform and all content are provided strictly on an &quot;as is&quot; and &quot;as available&quot;
          basis without warranties of any kind, whether express, implied, or statutory, including any warranties of
          merchantability, fitness for a particular purpose, non-infringement, accuracy, or uninterrupted availability.
          Talent Africa does not guarantee that use of the Platform will result in employment, interviews, offers, or
          professional advancement.
        </p>

        <h3 className="mt-4 font-semibold">6. Limitation of Liability</h3>
        <p className="text-sm text-gray-700">
          To the maximum extent permitted by law, Talent Africa and its directors, officers, employees, agents,
          licensors, and affiliates shall not be liable for indirect, incidental, special, consequential, exemplary,
          punitive, or similar damages, including loss of profits, goodwill, data, or business interruption, arising
          from or related to your use of the Platform. Where liability cannot be fully disclaimed, it is limited to
          the greater of (i) the amount you paid (if any) to access the Platform in the 12 months preceding the claim,
          or (ii) USD $100.
        </p>

        <h3 className="mt-4 font-semibold">7. Third-Party Content &amp; Links</h3>
        <p className="text-sm text-gray-700">
          The Platform may reference or link to external websites, APIs, or services operated by third parties.
          Talent Africa does not endorse and is not responsible for any third-party content, privacy practices,
          availability, or security. Access to such resources is at your sole risk and subject to the third party’s
          terms and policies.
        </p>

        <h3 className="mt-4 font-semibold">8. Intellectual Property</h3>
        <p className="text-sm text-gray-700">
          All trademarks, service marks, trade names, designs, logos, software, text, graphics, and other content
          displayed on the Platform are the property of Talent Africa or its licensors and are protected by applicable
          intellectual-property laws. Unauthorized reproduction, distribution, reverse engineering, scraping, or
          creation of derivative works is strictly prohibited.
        </p>

        <h3 className="mt-4 font-semibold">9. Prohibited Uses</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Submitting false, misleading, or fraudulent information;</li>
          <li>Harassing, abusing, or harming other users or Talent Africa personnel;</li>
          <li>Interfering with or compromising the security or integrity of the Platform;</li>
          <li>Mining, harvesting, or scraping data except as explicitly permitted;</li>
          <li>Using the Platform for unlawful purposes or in violation of any applicable law or regulation.</li>
        </ul>

        <h3 className="mt-4 font-semibold">10. No Employment Relationship</h3>
        <p className="text-sm text-gray-700">
          Nothing on the Platform constitutes an offer of employment or creates an employer-employee, principal-agent,
          or joint-venture relationship with Talent Africa. Opportunities listed on the Platform may be illustrative,
          simulated, expired, or posted by third parties.
        </p>

        <h3 className="mt-4 font-semibold">11. Compliance &amp; Governing Law</h3>
        <p className="text-sm text-gray-700">
          You agree to comply with all applicable laws, including data-protection, privacy, export, and anti-spam laws.
          Unless otherwise required by mandatory local law, this Notice is governed by the laws of the jurisdiction in
          which Talent Africa primarily operates, without regard to conflict-of-law rules, and disputes shall be
          resolved in the competent courts of that jurisdiction.
        </p>

        <h3 className="mt-4 font-semibold">12. International Transfers</h3>
        <p className="text-sm text-gray-700">
          Your information may be transferred to, stored in, or processed within jurisdictions that may provide
          different levels of data protection than your own. By using the Platform, you consent to such transfers
          subject to appropriate safeguards and contractual protections.
        </p>

        <h3 className="mt-4 font-semibold">13. Changes to this Notice</h3>
        <p className="text-sm text-gray-700">
          Talent Africa may update this Notice at any time. Material changes will be indicated by updating the
          effective date or by reasonable means. Continued use of the Platform after changes take effect constitutes
          your acceptance of the revised Notice.
        </p>

        <h3 className="mt-4 font-semibold">14. Contact</h3>
        <p className="text-sm text-gray-700">
          Questions or requests (including access, correction, deletion, or complaint handling) should be directed to
          Talent Africa via the contact method listed in our Privacy Policy.
        </p>

        <h3 className="mt-4 font-semibold">15. Acknowledgement</h3>
        <p className="text-sm text-gray-700">
          By closing this dialog or submitting any information through the Platform, you acknowledge that you have
          read and understood this Notice and that you consent to the collection, processing, storage, and disclosure
          of your information as described above.
        </p>
        {/* END CONTENT */}
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
