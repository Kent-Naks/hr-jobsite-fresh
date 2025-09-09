// src/app/admin/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const jobs = await prisma.job.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold">Admin · Jobs</h1>
        <div className="flex gap-2">
          <Link href="/admin/categories" className="px-3 py-2 border rounded">
            Manage Categories
          </Link>
          <Link href="/admin/jobs/new" className="px-3 py-2 border rounded">
            + New Job
          </Link>
        </div>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Posted</th>
            <th className="p-2 text-left">Updated</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className="border-t">
              <td className="p-2">{j.title}</td>
              <td className="p-2">{j.category?.label}</td>
              <td className="p-2">{j.status}</td>
              <td className="p-2">
                {j.publishedAt ? new Date(j.publishedAt).toLocaleString() : "-"}
              </td>
              <td className="p-2">{new Date(j.updatedAt).toLocaleString()}</td>
              <td className="p-2 text-right">
                <Link href={`/admin/jobs/${j.id}`} className="underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
