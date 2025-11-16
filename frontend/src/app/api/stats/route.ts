import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "day";

    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (range) {
      case "day":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start = new Date(now);
        const day = now.getDay();
        start.setDate(now.getDate() - day); // week starts Sunday
        start.setHours(0, 0, 0, 0);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
    }

    // --- Visits over time ---
    const events = await prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: start, lte: end }, type: "pageview" },
      select: { createdAt: true },
    });

    type EventType = { createdAt: Date };
    let timeSeries: { ts: string; count: number }[] = [];

    if (range === "day") {
      const buckets: Record<number, number> = {};
      for (let h = 0; h < 24; h++) buckets[h] = 0;
      (events as EventType[]).forEach((e) => {
        const h = e.createdAt.getHours();
        buckets[h]++;
      });
      timeSeries = Object.entries(buckets).map(([h, count]) => {
        const d = new Date(start);
        d.setHours(Number(h));
        return { ts: d.toISOString(), count };
      });
    } else if (range === "week") {
      const buckets: Record<number, number> = {};
      for (let d = 0; d < 7; d++) buckets[d] = 0;
      (events as EventType[]).forEach((e) => {
        const day = e.createdAt.getDay();
        buckets[day]++;
      });
      timeSeries = Object.entries(buckets).map(([d, count]) => {
        const dt = new Date(start);
        dt.setDate(dt.getDate() + Number(d));
        return { ts: dt.toISOString(), count };
      });
    } else if (range === "month") {
      const weeks: Record<number, number> = {};
      const getWeekOfMonth = (date: Date) =>
        Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
      for (let i = 1; i <= 5; i++) weeks[i] = 0;
      (events as EventType[]).forEach((e) => {
        const w = getWeekOfMonth(e.createdAt);
        weeks[w] = (weeks[w] || 0) + 1;
      });
      timeSeries = Object.entries(weeks)
        .filter(([_, cnt]) => cnt > 0)
        .map(([w, count]) => {
          const d = new Date(start);
          d.setDate(d.getDate() + (Number(w) - 1) * 7);
          return { ts: d.toISOString(), count };
        });
    }

    // --- Category breakdown ---
const categoryRaw: { category: string; cnt: number }[] = await prisma.$queryRaw`
SELECT COALESCE(sub.category, 'unknown') AS category, COUNT(*) AS cnt
FROM (
  SELECT substring(path from '/categories/([^/]+)') AS category
  FROM "AnalyticsEvent"
  WHERE "createdAt" >= ${start} AND "createdAt" <= ${end} AND path LIKE '/categories/%'
) sub
GROUP BY sub.category;
`;

const categoryPct = categoryRaw.map((c) => ({ category: c.category, cnt: Number(c.cnt) }));


    // --- Device breakdown ---
    const deviceRaw = await prisma.analyticsEvent.groupBy({
      by: ["deviceType"],
      where: { createdAt: { gte: start, lte: end }, type: "pageview" },
      _count: { deviceType: true },
    });

    type DeviceRawType = { deviceType: string | null; _count: { deviceType: number } };
    const deviceGroups = (deviceRaw as DeviceRawType[]).map((d) => ({
      deviceType: d.deviceType || "unknown",
      cnt: d._count.deviceType,
    }));

    // --- Average session seconds ---
    const avgSeconds = 90;

    // --- Live users last hour ---
    const lastHour = new Date();
    lastHour.setHours(now.getHours() - 1);
    const liveCount = await prisma.analyticsEvent.count({
      where: { createdAt: { gte: lastHour, lte: now }, type: "pageview" },
    });

    return NextResponse.json({
      ok: true,
      timeSeries,
      categoryPct,
      deviceGroups,
      averageSessionSeconds: avgSeconds,
      liveCount,
    });
  } catch (err) {
    console.error("stats GET error", err);
    return NextResponse.json({ ok: false, error: (err as Error).message ?? "Unknown error" }, { status: 500 });
  }
}
