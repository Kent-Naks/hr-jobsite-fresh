import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const pad2 = (n: number) => String(n).padStart(2, "0");

// Africa/Nairobi = UTC+3, no DST ever
const NAIROBI_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Returns "YYYY-MM-DD" for a Date in Africa/Nairobi time */
function toNairobiDateStr(date: Date): string {
  return new Date(date.getTime() + NAIROBI_OFFSET_MS).toISOString().slice(0, 10);
}

/** 0–23 hour of day in Africa/Nairobi */
function nairobiHour(date: Date): number {
  return (date.getUTCHours() + 3) % 24;
}

/** 0–6 (Sun=0…Sat=6) day of week for a "YYYY-MM-DD" string in Nairobi */
function dowForDate(dateStr: string): number {
  // Noon in Nairobi avoids any midnight edge case
  return new Date(dateStr + "T12:00:00+03:00").getUTCDay();
}

/** Add n calendar days to a "YYYY-MM-DD" string, return new "YYYY-MM-DD" */
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** UTC Date = start of "YYYY-MM-DD" in Nairobi (00:00 EAT) */
function nairobiMidnight(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00+03:00");
}

/** UTC Date = end of "YYYY-MM-DD" in Nairobi (23:59:59.999 EAT) */
function nairobiEndOfDay(dateStr: string): Date {
  return new Date(dateStr + "T23:59:59.999+03:00");
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const range = (url.searchParams.get("range") || "day").toLowerCase();
    const dateParam = url.searchParams.get("date");

    const now = new Date();
    // Reference date in Nairobi — fall back to today in Nairobi if no param given
    const dateStr = dateParam || toNairobiDateStr(now);

    // ── Compute start/end as UTC Dates respecting Nairobi day boundaries ──
    let start: Date;
    let end: Date;
    let rangeYear: number;
    let rangeMonth: number; // 1-based
    let firstOfMonthDow: number; // used for monthly week bucketing

    if (range === "day") {
      start = nairobiMidnight(dateStr);
      end = nairobiEndOfDay(dateStr);
      rangeYear = parseInt(dateStr.slice(0, 4));
      rangeMonth = parseInt(dateStr.slice(5, 7));
      firstOfMonthDow = 0; // unused for day
    } else if (range === "week") {
      const dow = dowForDate(dateStr);
      const diffToMon = dow === 0 ? -6 : 1 - dow;
      const mondayStr = addDays(dateStr, diffToMon);
      const sundayStr = addDays(mondayStr, 6);
      start = nairobiMidnight(mondayStr);
      end = nairobiEndOfDay(sundayStr);
      rangeYear = parseInt(mondayStr.slice(0, 4));
      rangeMonth = parseInt(mondayStr.slice(5, 7));
      firstOfMonthDow = 0; // unused for week
    } else {
      // month
      const y = parseInt(dateStr.slice(0, 4));
      const mo = parseInt(dateStr.slice(5, 7));
      const firstDayStr = `${y}-${pad2(mo)}-01`;
      const lastDay = new Date(Date.UTC(y, mo, 0)).getUTCDate();
      const lastDayStr = `${y}-${pad2(mo)}-${pad2(lastDay)}`;
      start = nairobiMidnight(firstDayStr);
      end = nairobiEndOfDay(lastDayStr);
      rangeYear = y;
      rangeMonth = mo;
      firstOfMonthDow = dowForDate(firstDayStr);
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

    // 3. liveVisitors (last 60 minutes, always real-time)
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

    // 5. timeSeries — bucket by Nairobi local time
    const tsEvents = await prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: start, lte: end }, type: "pageview" },
      select: { createdAt: true },
    });

    let timeSeries: { label: string; count: number }[];

    if (range === "day") {
      const buckets = new Array(24).fill(0);
      tsEvents.forEach((e) => {
        buckets[nairobiHour(e.createdAt)]++;
      });
      timeSeries = buckets.map((count, h) => ({ label: `${pad2(h)}:00`, count }));
    } else if (range === "week") {
      // Mon(0)…Sun(6)
      const buckets = new Array(7).fill(0);
      tsEvents.forEach((e) => {
        const dow = new Date(e.createdAt.getTime() + NAIROBI_OFFSET_MS).getUTCDay();
        const idx = dow === 0 ? 6 : dow - 1;
        buckets[idx]++;
      });
      timeSeries = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
        label: d,
        count: buckets[i],
      }));
    } else {
      // month: weekly buckets using Nairobi dates
      const daysInMonth = new Date(Date.UTC(rangeYear, rangeMonth, 0)).getUTCDate();
      const numWeeks = Math.ceil((firstOfMonthDow + daysInMonth) / 7);
      const buckets = new Array(numWeeks).fill(0);
      tsEvents.forEach((e) => {
        const nDate = toNairobiDateStr(e.createdAt);
        const eYear = parseInt(nDate.slice(0, 4));
        const eMo = parseInt(nDate.slice(5, 7));
        const eDay = parseInt(nDate.slice(8, 10));
        if (eYear !== rangeYear || eMo !== rangeMonth) return;
        const idx = Math.floor((firstOfMonthDow + eDay - 1) / 7);
        if (idx >= 0 && idx < numWeeks) buckets[idx]++;
      });
      timeSeries = buckets.map((count, i) => ({ label: `Week ${i + 1}`, count }));
    }

    // 6. hourlyDistribution — always 24 buckets in Nairobi hours
    const hourlyRaw: { hour: number; cnt: bigint }[] = await prisma.$queryRaw`
      SELECT EXTRACT(HOUR FROM "createdAt" AT TIME ZONE 'Africa/Nairobi')::int AS hour, COUNT(*) AS cnt
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
    const categoryVisits = catRaw.map((r) => ({ slug: r.slug, count: Number(r.cnt) }));

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

    JSON.stringify(response); // throws if BigInt leaked
    return NextResponse.json(response);
  } catch (err) {
    console.error("stats GET error", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
