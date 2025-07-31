import { notFound } from "next/navigation";
import type { Job } from "@/types";
import AdSlot   from "@/components/AdSlot";
import JobForm  from "./JobForm";

import business   from "../../data/business.json";
import hr         from "../../data/hr.json";
import admin      from "../../data/admin.json";
import marketing  from "../../data/marketing.json";
import sales      from "../../data/sales.json";
import account    from "../../data/account.json";
import operations from "../../data/operations.json";
import projects   from "../../data/projects.json";
import strategy   from "../../data/strategy.json";
import logistics  from "../../data/logistics.json";
import legal      from "../../data/legal.json";
import it         from "../../data/it.json";

const allJobs: Job[] = [
  ...business,
  ...hr,
  ...admin,
  ...marketing,
  ...sales,
  ...account,
  ...operations,
  ...projects,
  ...strategy,
  ...logistics,
  ...legal,
  ...it,
];

export default async function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>;  // <-- Promise here
}) {
  const { id } = await params;      // <-- unwrap it


  const job = allJobs.find((j) => j.id === id);
  if (!job) return notFound();

  const recommendations = allJobs.filter(
    (j) => j.id !== job.id && j.keywords.some((k) => job.keywords.includes(k))
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* ─── Ad above description ─── */}
      <div className="mb-4">
        <AdSlot slot="4455667788" />
      </div>

      {/* Job header */}
      <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
      <p className="mb-4 text-sm text-gray-500">{job.location}</p>

      {/* Main description */}
      <p className="mb-6 whitespace-pre-line leading-relaxed">
        {job.description}
      </p>

      {/* Benefits block */}
      {job.benefits?.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-2">Benefits</h2>
          <ul className="list-disc pl-6 space-y-1 mb-8">
            {job.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </>
      )}

      {/* ─── Ad before application form ─── */}
      <div className="mb-4">
        <AdSlot slot="5566778899" />
      </div>

      {/* Application form */}
      <JobForm recommendations={recommendations} />
    </div>
  );
}
