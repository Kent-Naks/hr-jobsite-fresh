'use client';

import { useEffect, useState } from 'react';

type Job = {
  id: number;
  title: string;
  description: string;
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async (term = '') => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/jobs?search=${term}`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchJobs(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">HR Job Search</h1>

      {/* 📺 Google AdSense Top Banner */}
      <div className="w-full mb-6 flex justify-center">
        <div className="w-full h-20 bg-gray-100 border rounded flex items-center justify-center text-gray-500 text-sm">
          {/* Replace with actual Google AdSense code */}
          AdSense Banner Placeholder
        </div>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for a job (e.g. Admin)..."
        className="w-full p-3 rounded border border-gray-300 mb-6 shadow"
      />

      {/* 🎥 Mid-page Video Ad Placeholder */}
      <div className="w-full h-48 bg-gray-200 border rounded mb-6 flex items-center justify-center text-gray-600 text-sm">
        {/* Embed real video ad script or iframe here */}
        Video Ad Placeholder
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading jobs...</p>
      ) : jobs.length > 0 ? (
        jobs.map((job) => (
          <div
            key={job.id}
            className="p-4 border rounded mb-4 shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-600">{job.description}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400">No jobs found.</p>
      )}

      {/* 📢 Bottom Ad Block */}
      <div className="w-full h-28 bg-gray-100 border mt-10 rounded flex items-center justify-center text-gray-500 text-sm">
        Bottom Ad Placeholder (Image/Banner/Responsive)
      </div>
    </main>
  );
}
