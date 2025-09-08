import type { Job } from "@/types";

import account    from "@/data/account.json";
import admin      from "@/data/admin.json";
import business   from "@/data/business.json";
import hr         from "@/data/hr.json";
import it         from "@/data/it.json";
import legal      from "@/data/legal.json";
import logistics  from "@/data/logistics.json";
import marketing  from "@/data/marketing.json";
import operations from "@/data/operations.json";
import projects   from "@/data/projects.json";
import sales      from "@/data/sales.json";
import strategy   from "@/data/strategy.json";

const allJobs: Job[] = [
  ...business, ...hr, ...admin, ...marketing, ...sales, ...account,
  ...operations, ...projects, ...strategy, ...logistics, ...legal, ...it,
];

export async function GET() {
  return Response.json(allJobs, { status: 200 });
}
