import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const pad2 = (n: number) => String(n).padStart(2, "0");

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const range = (url.searchParams.get("range") || "day").toLowerCase();
    const dateParam = url.searchParams.get("date");

    const now = new Date();

    // Parse date param (YYYY-MM-DD)
    let ctxDate = now;
    if (dateParam) {
      const d = new Date(dateParam + "T00:00:00");
      if (!isNaN(d.getTime())) ctxDate = d;
    }

    // Compute start/end
    let start: Date;
    let end: Date;

    if (range === "day") {
      start = new Date(ctxDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(ctxDate);
      end.setHours(23, 59, 59, 999);
    } else if (range === "week") {
      // Week starts Monday
      const d = new Date(ctxDate);
      const day = d.getDay(); // 0=Sun
      const diffToMon = day === 0 ? -6 : 1 - day;
      start = new Date(d);
      start.setDate(d.getDate() + diffToMon);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      // month
      start = new Date(ctxDate.getFullYear(), ctxDate.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(ctxDate.getFullYear(), ctxDate.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // 1. totalVisits
    const totalVisits = await prisma.analyticsEvent.count({
      where: { createdAt: { gte: start, lte: end }, type: "pageview" },
    });

    // 2. uniqueSessions
    const uniqueSessionsRaw: { cnt: bigint }[] = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "sessionId") AS cnt
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    `;
    const uniqueSessions = Number(uniqueSessionsRaw[0]?.cnt ?? 0);

    // 3. liveVisitors (last 60 minutes)
    const sixtyMinsAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const liveVisitors = await prisma.analyticsEvent.count({
      where: { createdAt: { gte: sixtyMinsAgo }, type: "pageview" },
    });

    // 4. avgSessionSeconds
    const avgRaw: { avg: number | null }[] = await prisma.$queryRaw`
      SELECT AVG(duration)::float AS avg
      FROM "AnalyticsEvent"
      WHERE type = 'unload' AND duration > 0
      AND "createdAt" >= ${start} AND "createdAt" <= ${end}
    `;
    const avgSessionSeconds =
      avgRaw[0]?.avg != null ? Math.round(Number(avgRaw[0].avg)) : null;

    // 5. timeSeries — fetch all pageviews in range and bucket client-side
    const tsEvents = await prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: start, lte: end }, type: "pageview" },
      select: { createdAt: true },
    });

    let timeSeries: { label: string; count: number }[];

    if (range === "day") {
      const buckets = new Array(24).fill(0);
      tsEvents.forEach((e) => {
        buckets[new Date(e.createdAt).getHours()]++;
      });
      timeSeries = buckets.map((count, h) => ({ label: `${pad2(h)}:00`, count }));
    } else if (range === "week") {
      // Mon(0)..Sun(6) buckets
      const buckets = new Array(7).fill(0);
      tsEvents.forEach((e) => {
        const day = new Date(e.createdAt).getDay(); // 0=Sun
        const idx = day === 0 ? 6 : day - 1;
        buckets[idx]++;
      });
      timeSeries = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
        label: d,
        count: buckets[i],
      }));
    } else {
      // month: weekly buckets
      const year = start.getFullYear();
      const month = start.getMonth();
      const firstWeekday = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const numWeeks = Math.ceil((firstWeekday + daysInMonth) / 7);
      const buckets = new Array(numWeeks).fill(0);
      tsEvents.forEach((e) => {
        const d = new Date(e.createdAt);
        if (d.getMonth() !== month || d.getFullYear() !== year) return;
        const idx = Math.floor((firstWeekday + d.getDate() - 1) / 7);
        if (idx >= 0 && idx < numWeeks) buckets[idx]++;
      });
      timeSeries = buckets.map((count, i) => ({ label: `Week ${i + 1}`, count }));
    }

    // 6. hourlyDistribution — always 24 buckets
    const hourlyRaw: { hour: number; cnt: bigint }[] = await prisma.$queryRaw`
      SELECT EXTRACT(HOUR FROM "createdAt")::int AS hour, COUNT(*) AS cnt
      FROM "AnalyticsEvent"
      WHERE type = 'pageview'
      AND "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY hour
      ORDER BY hour
    `;
    const hourlyBuckets = new Array(24).fill(0);
    hourlyRaw.forEach((r) => {
      const h = Number(r.hour);
      if (h >= 0 && h < 24) hourlyBuckets[h] = Number(r.cnt);
    });
    const hourlyDistribution = hourlyBuckets.map((count, h) => ({
      hour: `${pad2(h)}:00`,
      count,
    }));

    // 7. deviceBreakdown
    const deviceRaw = await prisma.analyticsEvent.groupBy({
      by: ["deviceType"],
      where: { createdAt: { gte: start, lte: end }, type: "pageview" },
      _count: { deviceType: true },
    });
    const deviceBreakdown = deviceRaw.map((d) => ({
      deviceType: d.deviceType || "unknown",
      count: d._count.deviceType,
    }));

    // 8. categoryVisits
    const catRaw: { slug: string; cnt: bigint }[] = await prisma.$queryRaw`
      SELECT COALESCE(substring(path FROM '/categories/([^/]+)'), 'unknown') AS slug, COUNT(*) AS cnt
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
      AND path LIKE '/categories/%'
      GROUP BY slug
      ORDER BY cnt DESC
    `;
    const categoryVisits = catRaw.map((r) => ({
      slug: r.slug,
      count: Number(r.cnt),
    }));

    // 9. totalApplications
    const totalApplications = await prisma.jobApplication.count({
      where: { createdAt: { gte: start, lte: end } },
    });

    // 10. applicationsByCategory
    const appsByCatRaw: { category: string; cnt: bigint }[] = await prisma.$queryRaw`
      SELECT c.label AS category, COUNT(*) AS cnt
      FROM "JobApplication" ja
      JOIN "Category" c ON ja."categoryId" = c.id
      WHERE ja."createdAt" >= ${start} AND ja."createdAt" <= ${end}
      GROUP BY c.label
      ORDER BY cnt DESC
    `;
    const applicationsByCategory = appsByCatRaw.map((r) => ({
      category: r.category,
      count: Number(r.cnt),
    }));

    // 11. applicationsByJob
    const appsByJobRaw: { job: string; category: string; cnt: bigint }[] = await prisma.$queryRaw`
      SELECT j.title AS job, c.label AS category, COUNT(*) AS cnt
      FROM "JobApplication" ja
      JOIN "Job" j ON ja."jobId" = j.id
      JOIN "Category" c ON ja."categoryId" = c.id
      WHERE ja."createdAt" >= ${start} AND ja."createdAt" <= ${end}
      GROUP BY j.title, c.label
      ORDER BY cnt DESC
      LIMIT 10
    `;
    const applicationsByJob = appsByJobRaw.map((r) => ({
      job: r.job,
      category: r.category,
      count: Number(r.cnt),
    }));

    const response = {
      ok: true,
      totalVisits,
      uniqueSessions,
      liveVisitors,
      avgSessionSeconds,
      timeSeries,
      hourlyDistribution,
      deviceBreakdown,
      categoryVisits,
      totalApplications,
      applicationsByCategory,
      applicationsByJob,
    };

    // Safety: throws if any BigInt leaked through
    JSON.stringify(response);

    return NextResponse.json(response);
  } catch (err) {
    console.error("stats GET error", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
