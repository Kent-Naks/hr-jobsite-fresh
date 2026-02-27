import { prisma } from "@/lib/prisma";
import ApplicationsChart from "./ApplicationsChart";

export const dynamic = "force-dynamic";

function formatAppliedAt(date: Date): string {
  return date.toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }) + " (EAT)";
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default async function AdminApplicationsPage() {
  const applications = await prisma.jobApplication.findMany({
    include: { job: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  const chartData = applications.map((a) => ({
    createdAt: a.createdAt.toISOString(),
    category: a.category.label,
  }));

  return (
    <main className="min-h-screen bg-gray-950 p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Admin · Applications</h1>
        <span className="text-sm text-gray-400">{applications.length} total</span>
      </div>

      <ApplicationsChart applications={chartData} />

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 text-left text-white font-medium w-8">#</th>
            <th className="p-2 text-left text-white font-medium">Job Title</th>
            <th className="p-2 text-left text-white font-medium">Category</th>
            <th className="p-2 text-left text-white font-medium">Applied At</th>
            <th className="p-2 text-left text-white font-medium">Time Ago</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-sm text-gray-500 bg-gray-900">
                No applications yet.
              </td>
            </tr>
          ) : (
            applications.map((a, i) => (
              <tr
                key={a.id}
                className={`border-t border-gray-700 ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}`}
              >
                <td className="p-2 text-gray-500">{i + 1}</td>
                <td className="p-2 text-white font-medium">{a.job.title}</td>
                <td className="p-2 text-emerald-400">{a.category.label}</td>
                <td className="p-2 text-blue-300 whitespace-nowrap">
                  {formatAppliedAt(a.createdAt)}
                </td>
                <td className="p-2 text-gray-400">{timeAgo(a.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}
