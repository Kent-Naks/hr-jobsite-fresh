// src/app/jobs/[id]/JobForm.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import type { Job } from '@/../types';

export default function JobForm({ recommendations }: { recommendations: Job[] }) {
  const [submitted, setSubmitted] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  return (
    <div>
      {!submitted ? (
        <>
          {/* Ad above form */}
          <div className="mb-4">
            <AdSlot slot="5566778899" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" />
            <input type="email" placeholder="Email" required className="w-full p-2 border rounded" />
            <input type="tel" placeholder="Phone Number" required className="w-full p-2 border rounded" />

            {/* Legal acceptance */}
            <div className="flex items-center space-x-2 mb-2">
              <input
                id="accept"
                type="checkbox"
                checked={accepted}
                onChange={e => setAccepted(e.target.checked)}
                required
                className="accent-blue-600"
              />
              <label htmlFor="accept" className="text-sm">
                I accept the{' '}
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
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={!accepted}
            >
              Submit Application
            </button>
          </form>

          {/* Legal Modal */}
          {showLegal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white max-w-lg w-full rounded p-6 shadow-lg">
                <h2 className="text-lg font-bold mb-2">Official Legal Notice & Consent</h2>
                <div className="text-sm text-gray-700 mb-4 max-h-80 overflow-y-auto">
                  <p>
                    <strong>AAJobs.ke (AfricaForAfricaJobsKenya)</strong> is a job listing platform intended to showcase employment opportunities across Africa. By submitting your application through this website, you acknowledge and consent that all listings, company profiles, and job openings may be illustrative, simulated, or used for any purposes. We do not guarantee the authenticity, availability, or outcome of any opportunity listed herein. Always exercise discretion and verify any opportunity independently.:
                  </p>
                  <ul className="list-disc pl-5 my-3 space-y-1">
                    <li>
                      All information you provide is submitted voluntarily and at your own discretion. You are solely responsible for the accuracy and truthfulness of all details shared.
                    </li>
                    <li>
                      By submitting your application, you grant AAJobs.ke and its administrators the right to store, process, and share your information with potential employers, partners, or service providers as deemed necessary for recruitment or networking purposes.
                    </li>
                    <li>
                      AAJobs.ke administrators may retain submitted information for record keeping, analytics, and service improvement, in accordance with our privacy policy.
                    </li>
                    <li>
                      You may request the deletion of your information at any time by contacting the site administrators, but we cannot guarantee the removal of data already shared with third parties prior to your request.
                    </li>
                  </ul>
                  <p>
                    <strong>
                      By accepting these terms and submitting your application, you agree to the collection, storage, and sharing of your personal data as described above. If you do not agree, please do not submit your information through this website.
                    </strong>
                  </p>
                </div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowLegal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Ad below form */}
          <div className="mt-4">
            <AdSlot slot="7788990011" />
          </div>
        </>
      ) : (
        <div>
          <p className="text-green-600 font-medium">Application submitted successfully!</p>
          <h3 className="text-lg font-semibold mt-6">Recommended Jobs:</h3>
          <ul className="list-disc pl-6">
            {recommendations.map((j) => (
              <li key={j.id}>
                <Link href={`/jobs/${j.id}`} className="text-blue-700 underline">
                  {j.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
