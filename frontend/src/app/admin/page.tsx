// src/app/admin/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import AdminSearch from "./AdminSearch";

export const dynamic = "force-dynamic";

function formatDate(d: string | null | undefined) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "-";
    return dt.toLocaleString("en-KE", {
      timeZone: "Africa/Nairobi",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "-";
  }
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const { q, status, category } = await searchParams;

  // server-side check: only show the Analytics link when the admin_session cookie matches
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  const authed = !!session && !!expected && session === expected;

  let jobs: any[] = [];
  let dbError = false;

  try {
    jobs = await prisma.job.findMany({
      where: {
        ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
        ...(status === "archived"
          ? { OR: [{ status: "archived" }, { status: "published", expiresAt: { lt: new Date() } }] }
          : status
          ? { status }
          : {}),
        ...(category
          ? { category: { label: { contains: category, mode: "insensitive" } } }
          : {}),
      },
      include: { category: true },
      orderBy: { updatedAt: "asc" },
    });
  } catch (err) {
    console.error("prisma.job.findMany error in admin:", err);
    dbError = true;
  }

  const now = Date.now();

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 gap-3">
        {/* Header reverted to neutral (no forced color) */}
        <h1 className="text-2xl font-bold">Admin · Jobs</h1>
        <div className="flex gap-2">
          {/* Buttons reverted to neutral styling (as before) */}
          <Link href="/admin/categories" className="px-3 py-2 border rounded">
            Manage Categories
          </Link>

          <Link href="/admin/jobs/new" className="px-3 py-2 border rounded">
            + New Job
          </Link>

          <Link href="/admin/applications" className="px-3 py-2 border rounded">
            Applications
          </Link>

          {authed && (
            <Link href="/admin/analytics" className="px-3 py-2 border rounded">
              Analytics
            </Link>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <AdminSearch />
      </Suspense>

      {dbError && (
        <div className="mb-4 rounded border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
          Warning: cannot reach the database — showing cached/empty results. Check your
          DATABASE_URL or start a local Postgres.
        </div>
      )}

      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left text-gray-800 font-medium">Title</th>
            <th className="p-2 text-left text-gray-800 font-medium">Category</th>
            <th className="p-2 text-left text-gray-800 font-medium">Status</th>
            <th className="p-2 text-left text-gray-800 font-medium">Posted</th>
            <th className="p-2 text-left text-gray-800 font-medium">Updated</th>
            <th className="p-2 text-left text-gray-800 font-medium">Expiring</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-4 text-center text-sm text-gray-500">
                No jobs available.
              </td>
            </tr>
          ) : (
            jobs.map((j: any) => {
              const expiresAt = j.expiresAt ? new Date(j.expiresAt).getTime() : null;
              const isExpired = expiresAt !== null && expiresAt < now;

              // non-expired rows use green text; expired rows are red with light-gray background
              const rowTextClass = isExpired ? "text-red-800" : "text-green-700";
              const rowBgClass = isExpired ? "bg-gray-100" : "";

              return (
                <tr key={j.id} className={`border-t ${rowBgClass}`}>
                  <td className={`p-2 ${rowTextClass}`}>{j.title}</td>
                  <td className={`p-2 ${rowTextClass}`}>{j.category?.label ?? "-"}</td>
                  <td className={`p-2 ${rowTextClass}`}>{j.status}</td>
                  <td className={`p-2 ${rowTextClass}`}>
                    {j.publishedAt ? formatDate(j.publishedAt) : "-"}
                  </td>
                  <td className={`p-2 ${rowTextClass}`}>{formatDate(j.updatedAt)}</td>
                  <td className={`p-2 ${rowTextClass}`}>
                    {j.expiresAt ? formatDate(j.expiresAt) : "—"}
                  </td>
                  <td className="p-2 text-right">
  <Link
    href={`/admin/jobs/${j.id}`}
    className={`underline font-medium ${
      isExpired ? "text-gray-900 hover:text-black" : "text-green-800 hover:text-green-900"
    }`}
  >
    Edit
  </Link>
</td>

                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </main>
  );
}
