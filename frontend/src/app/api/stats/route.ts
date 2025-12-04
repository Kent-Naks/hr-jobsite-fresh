// src/app/api/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseDateParam(s: string | null) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const range = (url.searchParams.get("range") || "day").toLowerCase();
    // support date=YYYY-MM-DD for day/week, and year & month for month
    const dateParam = url.searchParams.get("date"); // YYYY-MM-DD
    const yearParam = url.searchParams.get("year");
    const monthParam = url.searchParams.get("month"); // 1-12

    const now = new Date();

    // determine target date context
    let ctxDate = parseDateParam(dateParam) ?? now;

    // If month param provided use its first day
    if (yearParam && monthParam) {
      const y = Number(yearParam);
      const m = Number(monthParam);
      if (!Number.isNaN(y) && !Number.isNaN(m) && m >= 1 && m <= 12) {
        ctxDate = new Date(y, m - 1, 1);
      }
    }

    // compute start / end based on range (and ctxDate)
    let start: Date;
    let end: Date;

    if (range === "day") {
      start = new Date(ctxDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    } else if (range === "week") {
      // week containing ctxDate; week starts Sunday (0)
      const d = new Date(ctxDate);
      const day = d.getDay();
      start = new Date(d);
      start.setDate(d.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      // month
      const y = ctxDate.getFullYear();
      const m = ctxDate.getMonth();
      start = new Date(y, m, 1, 0, 0, 0, 0);
      // last day of month:
      end = new Date(y, m + 1, 0, 23, 59, 59, 999);
    }

    // --- Fetch events in the range (pageviews) ---
    const events = await prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: start, lte: end }, type: "pageview" },
      select: { createdAt: true },
    });

    type EventType = { createdAt: Date };
    let timeSeries: { ts: string; count: number }[] = [];

    if (range === "day") {
      // hourly buckets 0..23
      const buckets: number[] = Array.from({ length: 24 }).map(() => 0);
      (events as EventType[]).forEach((e) => {
        const h = new Date(e.createdAt).getHours();
        if (h >= 0 && h < 24) buckets[h]++;
      });
      timeSeries = buckets.map((count, h) => {
        const d = new Date(start);
        d.setHours(h, 0, 0, 0);
        return { ts: d.toISOString(), count };
      });
    } else if (range === "week") {
      // day buckets Sun..Sat
      const buckets: number[] = Array.from({ length: 7 }).map(() => 0);
      (events as EventType[]).forEach((e) => {
        const day = new Date(e.createdAt).getDay();
        buckets[day]++;
      });
      timeSeries = buckets.map((count, day) => {
        const dt = new Date(start);
        dt.setDate(start.getDate() + day);
        dt.setHours(0, 0, 0, 0);
        return { ts: dt.toISOString(), count };
      });
    } else {
      // month: dynamic weeks
      // compute how many weeks this month spans:
      const year = start.getFullYear();
      const month = start.getMonth(); // 0-indexed
      const firstOfMonth = new Date(year, month, 1);
      const firstWeekday = firstOfMonth.getDay(); // 0..6 (Sun..Sat)
      const lastOfMonth = new Date(year, month + 1, 0);
      const daysInMonth = lastOfMonth.getDate();

      // number of weeks in calendar view for this month
      const numWeeks = Math.ceil((firstWeekday + daysInMonth) / 7);

      // week index: 1..numWeeks
      const weeks: number[] = Array.from({ length: numWeeks }).map(() => 0);

      const getWeekIndex = (d: Date) => {
        // dayOfMonth 1..daysInMonth
        const dayOfMonth = d.getDate();
        // zero-based index: Math.floor((firstWeekday + dayOfMonth - 1) / 7)
        const zeroIndex = Math.floor((firstWeekday + (dayOfMonth - 1)) / 7);
        return zeroIndex; // 0..numWeeks-1
      };

      (events as EventType[]).forEach((e) => {
        const d = new Date(e.createdAt);
        if (d.getMonth() !== month || d.getFullYear() !== year) return;
        const idx = getWeekIndex(d);
        if (idx >= 0 && idx < weeks.length) weeks[idx] += 1;
      });

      // produce timeSeries entries with ts being the week-start date (calendar)
      timeSeries = weeks.map((count, idx) => {
        // compute week start date: first cell of calendar + idx*7 days then clamp to month start
        const weekStart = new Date(year, month, 1 - firstWeekday + idx * 7);
        // If weekStart is before month start, keep it — it's the calendar start for that week.
        // set time to midnight
        weekStart.setHours(0, 0, 0, 0);
        return { ts: weekStart.toISOString(), count };
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

    // --- Average session seconds (placeholder) ---
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
