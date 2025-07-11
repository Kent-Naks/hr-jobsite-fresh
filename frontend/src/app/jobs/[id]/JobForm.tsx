// frontend/src/app/jobs/[id]/JobForm.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Job } from '@/../types'

export default function JobForm({
  recommendations,
}: {
  recommendations: Job[]
}) {
  const [submitted, setSubmitted] = useState(false)

  return !submitted ? (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
      className="space-y-4"
    >
      <input
        type="text"
        placeholder="Full Name"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="tel"
        placeholder="Phone Number"
        required
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit Application
      </button>
    </form>
  ) : (
    <div>
      <p className="text-green-600 font-medium">
        Application submitted successfully!
      </p>
      <h3 className="text-lg font-semibold mt-6">Recommended Jobs:</h3>
      <ul className="list-disc pl-6">
        {recommendations.map((j) => (
          <li key={j.id}>
            <Link
              href={`/jobs/${j.id}`}
              className="text-blue-700 underline"
            >
              {j.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/"
        className="inline-block mt-4 bg-gray-700 text-white px-4 py-2 rounded"
      >
        Back to Listings
      </Link>
    </div>
  )
}
