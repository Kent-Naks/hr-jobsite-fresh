// src/app/admin/analytics/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { motion } from "framer-motion";

/* -----------------------
   Types & helpers
   ----------------------- */
type DeviceGroup = { deviceType: string; cnt: number };
type TimePoint = { ts: string; count: number };
type CategoryPct = { category: string; cnt: number };

const SAFE_EMPTY_SERIES: TimePoint[] = [];
const SAFE_EMPTY_DEVICES: DeviceGroup[] = [];
const SAFE_EMPTY_CATS: CategoryPct[] = [];

const pad2 = (n: number) => String(n).padStart(2, "0");

// CSV helper (keeps previous TS fix)
function downloadCsv(filename: string, rows: Array<Record<string, any>>) {
  if (!rows || rows.length === 0) {
    const emptyBlob = new Blob([""], { type: "text/csv;charset=utf-8;" });
    const emptyUrl = URL.createObjectURL(emptyBlob);
    const a = document.createElement("a");
    a.href = emptyUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(emptyUrl);
    return;
  }

  const keySet = rows.reduce<Set<string>>((set, row) => {
    Object.keys(row).forEach((k) => set.add(k));
    return set;
  }, new Set<string>());

  const keys = Array.from(keySet);

  const csvLines = [keys.join(",")].concat(
    rows.map((row) =>
      keys
        .map((k) => {
          const v = row[k] ?? "";
          const s = String(v).replace(/"/g, '""'); // escape quotes
          return `"${s}"`;
        })
        .join(",")
    )
  );

  const csv = csvLines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* -----------------------
   Normalizers (defensive)
   ----------------------- */
function normalizeTimeSeries(raw: any): TimePoint[] {
  if (!Array.isArray(raw)) return SAFE_EMPTY_SERIES;
  return raw
    .map((p) => {
      try {
        const ts = p?.ts ? String(p.ts) : new Date().toISOString();
        const count = Number(p?.count ?? 0);
        if (!Number.isFinite(count)) return null;
        return { ts, count };
      } catch {
        return null;
      }
    })
    .filter((x): x is TimePoint => x !== null)
    .sort((a, b) => {
      const da = isNaN(Number(a.ts)) ? new Date(a.ts).getTime() : Number(a.ts);
      const db = isNaN(Number(b.ts)) ? new Date(b.ts).getTime() : Number(b.ts);
      return da - db;
    });
}

function normalizeDevices(raw: any): DeviceGroup[] {
  if (!Array.isArray(raw)) return SAFE_EMPTY_DEVICES;
  return raw
    .map((d) => {
      const deviceType = d?.deviceType ? String(d.deviceType) : "unknown";
      const cnt = Number(d?.cnt ?? d?._count ?? 0);
      if (!Number.isFinite(cnt)) return null;
      return { deviceType, cnt };
    })
    .filter((x): x is DeviceGroup => x !== null);
}

function normalizeCats(raw: any): CategoryPct[] {
  if (!Array.isArray(raw)) return SAFE_EMPTY_CATS;
  return raw
    .map((c) => {
      const category = c?.category ? String(c.category) : "unknown";
      const cnt = Number(c?.cnt ?? c?.count ?? 0);
      if (!Number.isFinite(cnt)) return null;
      return { category, cnt };
    })
    .filter((x): x is CategoryPct => x !== null);
}

function collapseCategories(cats: CategoryPct[]) {
  const map = new Map<string, number>();
  for (const c of cats) {
    const key = String(c.category ?? "unknown");
    map.set(key, (map.get(key) || 0) + c.cnt);
  }
  return Array.from(map.entries()).map(([category, cnt]) => ({ category, cnt }));
}

/* -----------------------
   Custom tooltip for AreaChart (dedupes entries when Area + Line have same dataKey)
   ----------------------- */
// Replace your existing AreaDedupTooltip with this function
function AreaDedupTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  // find the primary value for "value" dataKey (dedupe)
  const first = payload.find((p: any) => p.dataKey === "value") ?? payload[0];
  const value = first?.value ?? first?.payload?.value ?? 0;

  return (
    <div className="bg-white border rounded shadow p-2 text-sm">
      {/* Time / label — make this pure black and bold for max contrast */}
      <div className="font-semibold mb-1 text-black">{label}</div>

      {/* The metric line — label in black, value emphasized */}
      <div className="text-sm">
        <span className="text-black">visitors: </span>
        <span className="font-medium" style={{ color: "#5B21B6" /* example highlight, keep palette if you want */ }}>
          {value}
        </span>
      </div>
    </div>
  );
}


/* -----------------------
   Component
   ----------------------- */
export default function AdminAnalyticsPage(): React.JSX.Element {
  const [range, setRange] = useState<"day" | "week" | "month">("day");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeSeries, setTimeSeries] = useState<TimePoint[]>(SAFE_EMPTY_SERIES);
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>(SAFE_EMPTY_DEVICES);
  const [avgSeconds, setAvgSeconds] = useState<number | null>(null);
  const [categoryPct, setCategoryPct] = useState<CategoryPct[]>(SAFE_EMPTY_CATS);
  const [liveCount, setLiveCount] = useState<number>(0);
  const [sampleMode, setSampleMode] = useState(false);

  // sparklines
  const SPARK_MAX = 12;
  const [liveHistory, setLiveHistory] = useState<number[]>([]);
  const [totalHistory, setTotalHistory] = useState<number[]>([]);

  // prev for delta calc
  const prevLiveRef = useRef<number | null>(null);
  const prevTotalRef = useRef<number | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const areaDataLocalRef = useRef<Array<{ label: string; value: number }> | null>(null);

  /* fetchStats - same logic as before */
  const fetchStats = async (r?: "day" | "week" | "month") => {
    if (sampleMode) return;
    const q = r ?? range;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stats?range=${encodeURIComponent(q)}`, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${body.substring(0, 200)}`);
      }
      const data = await res.json().catch(() => {
        throw new Error("Invalid JSON response from /api/stats");
      });
      if (data && data.ok === false) throw new Error("/api/stats returned ok=false");

      if (!mountedRef.current) return;

      prevLiveRef.current = liveCount;
      prevTotalRef.current = areaDataLocalRef.current ? areaDataLocalRef.current.reduce((s, p) => s + (p.value ?? 0), 0) : null;

      const ts = normalizeTimeSeries(data?.timeSeries);
      const dev = normalizeDevices(data?.deviceGroups);
      const avg = data?.averageSessionSeconds;
      const cats = collapseCategories(normalizeCats(data?.categoryPct));
      const live = data?.liveCount ?? (Array.isArray(data?.timeSeries) ? data.timeSeries.reduce((s: number, p: any) => s + (Number(p?.count) || 0), 0) : 0);

      setTimeSeries(ts);
      setDeviceGroups(dev);
      setAvgSeconds(Number.isFinite(Number(avg)) ? Math.round(Number(avg)) : null);
      setCategoryPct(cats);
      setLiveCount(Number.isFinite(Number(live)) ? Number(live) : 0);

      const totalVisits = Array.isArray(ts) ? ts.reduce((s, p) => s + (Number(p.count) || 0), 0) : 0;

      setLiveHistory((prev) => {
        const next = [...(prev ?? []), Number.isFinite(Number(live)) ? Number(live) : 0];
        return next.slice(-SPARK_MAX);
      });
      setTotalHistory((prev) => {
        const next = [...(prev ?? []), Number.isFinite(Number(totalVisits)) ? Number(totalVisits) : 0];
        return next.slice(-SPARK_MAX);
      });

      setError(null);
    } catch (err: any) {
      console.error("fetchStats error", err);
      if (!mountedRef.current) return;
      setError(err?.message ?? String(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const pollMs = range === "day" ? 60 * 1000 : range === "week" ? 5 * 60 * 1000 : 10 * 60 * 1000;
    const id = setInterval(() => fetchStats(), pollMs);

    const now = new Date();
    let msToBoundary = Infinity;
    if (range === "day") {
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 3);
      msToBoundary = tomorrow.getTime() - now.getTime();
    } else if (range === "week") {
      const day = now.getDay();
      const daysToNext = (7 - day) || 7;
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToNext, 0, 0, 3);
      msToBoundary = next.getTime() - now.getTime();
    } else {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 3);
      msToBoundary = nextMonth.getTime() - now.getTime();
    }

    let boundaryId: NodeJS.Timeout | null = null;
    if (isFinite(msToBoundary) && msToBoundary < 24 * 3600 * 1000) {
      boundaryId = setTimeout(() => fetchStats(), msToBoundary);
    }

    return () => {
      clearInterval(id);
      if (boundaryId) clearTimeout(boundaryId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, sampleMode]);

  /* Chart normalization */
  const chartData = useMemo(() => {
    if (!timeSeries || timeSeries.length === 0) {
      if (range === "day") return Array.from({ length: 24 }).map((_, i) => ({ label: `${pad2(i)}:00`, value: 0 }));
      if (range === "week") return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => ({ label: d, value: 0 }));
      return Array.from({ length: 5 }).map((_, i) => ({ label: `Week ${i + 1}`, value: 0 }));
    }

    const parsed = timeSeries.map((p) => {
      const n = Number(p.ts);
      if (!Number.isNaN(n) && String(n) === String(p.ts)) return { date: null as Date | null, bucket: n, v: p.count };
      const d = new Date(p.ts);
      if (!isNaN(d.getTime())) return { date: d, bucket: null as number | null, v: p.count };
      return { date: null as Date | null, bucket: null as number | null, v: p.count };
    });

    if (range === "day") {
      const byHour = new Array<number>(24).fill(0);
      parsed.forEach((pt) => {
        if (pt.date) byHour[pt.date.getHours()] += pt.v;
        else if (pt.bucket !== null && pt.bucket >= 0 && pt.bucket < 24) byHour[pt.bucket] += pt.v;
      });
      return byHour.map((v, i) => ({ label: `${pad2(i)}:00`, value: v }));
    }

    if (range === "week") {
      const byDay = new Array<number>(7).fill(0);
      parsed.forEach((pt) => {
        if (pt.date) byDay[pt.date.getDay()] += pt.v;
        else if (pt.bucket !== null && pt.bucket >= 0 && pt.bucket < 7) byDay[pt.bucket] += pt.v;
      });
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => ({ label: d, value: byDay[i] }));
    }

    const byWeek = new Array<number>(5).fill(0);
    const getWeekOfMonth = (date: Date) =>
      Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
    parsed.forEach((pt) => {
      if (pt.date) {
        const w = getWeekOfMonth(pt.date);
        if (w >= 1 && w <= 5) byWeek[w - 1] += pt.v;
      } else if (pt.bucket !== null) {
        const idx = Math.min(Math.max(pt.bucket - 1, 0), 4);
        byWeek[idx] += pt.v;
      }
    });
    return byWeek.map((v, i) => ({ label: `Week ${i + 1}`, value: v }));
  }, [timeSeries, range]);

  const areaData = useMemo(() => chartData.map((p) => ({ label: p.label, value: p.value })), [chartData]);
  areaDataLocalRef.current = areaData;

  const categoryData = useMemo(() => categoryPct.map((c) => ({ name: c.category, value: c.cnt })), [categoryPct]);
  const deviceData = useMemo(() => deviceGroups.map((d) => ({ name: d.deviceType, value: d.cnt })), [deviceGroups]);

  const totalDevices = deviceGroups.reduce((s, g) => s + g.cnt, 0) || 0;
  const totalCategory = categoryPct.reduce((s, c) => s + c.cnt, 0) || 0;

  const PALETTE_DAY = ["#60A5FA", "#2563EB", "#1E40AF"];
  const PALETTE_WEEK = ["#A78BFA", "#7C3AED", "#4C1D95"];
  const PALETTE_MONTH = ["#34D399", "#10B981", "#059669"];
  const DEVICE_COLORS = ["#A3E635", "#60A5FA", "#FDE68A", "#FBCFE8", "#C7B2FF"];

  const palette = range === "day" ? PALETTE_DAY : range === "week" ? PALETTE_WEEK : PALETTE_MONTH;

  const formatSeconds = (s: number | null) => {
    if (s === null) return "—";
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return `${m}m ${sec}s`;
  };

  // CSV exporters
  const exportVisitsCsv = () => {
    const rows = areaData.map((r) => ({ label: r.label, visitors: r.value }));
    downloadCsv(`visits-${range}.csv`, rows);
  };
  const exportCategoryCsv = () => {
    const rows = categoryData.map((r) => ({ category: r.name, visitors: r.value }));
    downloadCsv(`categories-${range}.csv`, rows);
  };
  const exportDeviceCsv = () => {
    const rows = deviceData.map((r) => ({ device: r.name, visitors: r.value }));
    downloadCsv(`devices-${range}.csv`, rows);
  };

  // totals and deltas
  const totalVisits = areaData.reduce((s, p) => s + (Number(p.value) || 0), 0);
  const prevLive = prevLiveRef.current;
  const prevTotal = prevTotalRef.current;
  const liveDelta = prevLive === null ? 0 : liveCount - (prevLive ?? 0);
  const totalDelta = prevTotal === null ? 0 : totalVisits - (prevTotal ?? 0);

  const renderDelta = (delta: number) => {
    if (delta === 0) return <span className="text-gray-700">—</span>;
    const positive = delta > 0;
    return (
      <span className={`text-sm font-medium ${positive ? "text-emerald-600" : "text-rose-600"}`}>
        {positive ? "▲" : "▼"} {Math.abs(delta)}
      </span>
    );
  };

  /* Sparkline renderer */
  const Sparkline = ({ data, color }: { data: number[]; color?: string }) => {
    const chartData = data.map((v, i) => ({ i, v }));
    const safeData = chartData.length >= 2 ? chartData : [...chartData, { i: chartData.length, v: chartData[chartData.length - 1] ?? 0 }];
    return (
      <div style={{ width: 96, height: 28 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safeData} margin={{ top: 2, right: 6, left: 0, bottom: 2 }}>
            <Line type="monotone" dataKey="v" stroke={color ?? "#2563eb"} strokeWidth={2} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // sample payload for testing UI
  const samplePayload = {
    ok: true,
    liveCount: 5,
    deviceGroups: [
      { deviceType: "desktop", cnt: 3 },
      { deviceType: "mobile", cnt: 1 },
      { deviceType: "tablet", cnt: 1 },
    ],
    averageSessionSeconds: 92,
    timeSeries: Array.from({ length: 12 }).map((_, i) => ({
      ts: new Date(Date.now() - (11 - i) * 3600 * 1000).toISOString(),
      count: Math.floor(Math.random() * 10),
    })),
    categoryPct: [
      { category: "hr", cnt: 4 },
      { category: "marketing", cnt: 1 },
    ],
  };

  const loadSample = () => {
    setSampleMode(true);
    setTimeSeries(normalizeTimeSeries(samplePayload.timeSeries));
    setDeviceGroups(normalizeDevices(samplePayload.deviceGroups));
    setAvgSeconds(samplePayload.averageSessionSeconds);
    setCategoryPct(collapseCategories(normalizeCats(samplePayload.categoryPct)));
    setLiveCount(samplePayload.liveCount);
    setLiveHistory((prev) => [...(prev ?? []), samplePayload.liveCount].slice(-SPARK_MAX));
    setTotalHistory((prev) => [...(prev ?? []), samplePayload.timeSeries.reduce((s: number, p: any) => s + (p.count || 0), 0)].slice(-SPARK_MAX));
    setError(null);
  };

  const useLiveData = () => {
    setSampleMode(false);
    fetchStats();
  };

  /* -----------------------
     Render
     ----------------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">Admin · Analytics</h1>

      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => { setRange("day"); setSampleMode(false); }}
            className={`px-3 py-1 rounded ${range === "day" ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white" : "bg-white text-gray-800 border"}`}
          >
            Day
          </button>
          <button
            onClick={() => { setRange("week"); setSampleMode(false); }}
            className={`px-3 py-1 rounded ${range === "week" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "bg-white text-gray-800 border"}`}
          >
            Week
          </button>
          <button
            onClick={() => { setRange("month"); setSampleMode(false); }}
            className={`px-3 py-1 rounded ${range === "month" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" : "bg-white text-gray-800 border"}`}
          >
            Month
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => { setSampleMode(false); fetchStats(); }} className="px-3 py-1 rounded border">Refresh</button>
          <button onClick={loadSample} className="px-3 py-1 rounded border">Load sample data</button>
          {sampleMode && <button onClick={useLiveData} className="px-3 py-1 rounded border">Use live data</button>}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">Error loading stats: {error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div layout initial={{ opacity: 0.9, scale: 0.995 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-lg shadow bg-white">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-800" title="Active unique sessions that produced events within the last 60 minutes">Live visitors (active sessions in past hour)</p>
            <button onClick={exportVisitsCsv} className="text-xs text-gray-600 hover:text-gray-800">Export</button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <motion.p layout key={liveCount} className="text-3xl font-semibold text-gray-900">{loading ? "…" : liveCount}</motion.p>
            <div>{renderDelta(liveDelta)}</div>
            <div className="ml-auto">
              <Sparkline data={liveHistory} color={palette[1]} />
            </div>
          </div>
        </motion.div>

        <motion.div layout initial={{ opacity: 0.9, scale: 0.995 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-lg shadow bg-white">
          <p className="text-sm text-gray-800" title="Average duration of recorded sessions (rounded)">Avg session</p>
          <motion.p layout key={avgSeconds} className="text-3xl font-semibold text-gray-900 mt-2">{loading ? "…" : formatSeconds(avgSeconds)}</motion.p>
        </motion.div>

        <motion.div layout initial={{ opacity: 0.9, scale: 0.995 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-lg shadow bg-white">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-800" title="Sum of recorded visits (events) across the selected range">Total visits (sum over selected range)</p>
            <button onClick={exportVisitsCsv} className="text-xs text-gray-600 hover:text-gray-800">Export</button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <motion.p layout key={totalVisits} className="text-3xl font-semibold text-gray-900">{loading ? "…" : totalVisits}</motion.p>
            <div>{renderDelta(totalDelta)}</div>
            <div className="ml-auto">
              <Sparkline data={totalHistory} color={palette[2]} />
            </div>
          </div>
        </motion.div>

        <motion.div layout initial={{ opacity: 0.9, scale: 0.995 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-lg shadow bg-white">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-800" title="Distinct category slugs observed in your visits">Categories tracked</p>
            <button onClick={exportCategoryCsv} className="text-xs text-gray-600 hover:text-gray-800">Export</button>
          </div>
          <motion.p layout key={categoryPct.length} className="text-3xl font-semibold text-gray-900 mt-2">{loading ? "…" : categoryPct.length}</motion.p>
        </motion.div>
      </div>

      {/* Visits over time */}
      <section className="mb-6">
        <div className="p-4 rounded-lg shadow bg-white">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-lg font-medium text-gray-900">Visits over time ({range})</h2>
            <div className="flex items-center gap-2">
              <button onClick={exportVisitsCsv} className="px-2 py-1 text-xs rounded border text-gray-700">Export CSV</button>
            </div>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={areaData} margin={{ top: 12, right: 12, left: 0, bottom: 6 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette[0]} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={palette[2]} stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#111827" }} />
                <YAxis allowDecimals={false} tick={{ fill: "#111827" }} />
                {/* custom tooltip that shows a single "visitors" line and prevents duplicate entries */}
                <Tooltip content={<AreaDedupTooltip />} />
                <Area type="monotone" dataKey="value" stroke={palette[1]} fillOpacity={1} fill="url(#colorUv)" name="visitors" />
                {/* keep the decorative line but it uses same dataKey — our tooltip dedupes */}
                <Line type="monotone" dataKey="value" stroke={palette[2]} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-gray-800">Live-updating chart — refreshed according to range.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Device breakdown */}
        <motion.div layout initial={{ opacity: 0.95, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg shadow bg-white">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Device breakdown</h3>
            <button onClick={exportDeviceCsv} className="px-2 py-1 text-xs rounded border text-gray-700">Export CSV</button>
          </div>

          {deviceData.length === 0 && !loading ? (
            <div className="text-sm text-gray-800">No device data</div>
          ) : (
            <div className="flex gap-4 items-center">
              <div style={{ width: 160, height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={64} paddingAngle={6} isAnimationActive>
                      {deviceData.map((entry, idx) => (
                        <Cell key={`cell-${entry.name}-${idx}`} fill={DEVICE_COLORS[idx % DEVICE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [v, "visitors"]} />
                    <Legend verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1">
                {deviceData.map((d, i) => {
                  const pct = totalDevices ? (d.value / totalDevices) * 100 : 0;
                  return (
                    <div key={`${d.name}-${i}`} className="flex items-center gap-3 mb-2">
                      <div className="w-36 text-sm text-gray-900 capitalize">{d.name}</div>
                      <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-4"
                          style={{
                            width: `${Math.round(pct)}%`,
                            background: `linear-gradient(90deg, ${DEVICE_COLORS[i % DEVICE_COLORS.length]}, ${DEVICE_COLORS[(i + 1) % DEVICE_COLORS.length]})`,
                          }}
                        />
                      </div>
                      <div className="w-14 text-right text-sm text-gray-900">{d.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Visitors by category */}
<motion.div layout initial={{ opacity: 0.95, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg shadow bg-white lg:col-span-2">
  <div className="flex items-start justify-between mb-2">
    <h3 className="text-sm font-medium text-gray-900">Visitors by category ({range})</h3>
    <button onClick={exportCategoryCsv} className="px-2 py-1 text-xs rounded border text-gray-700">Export CSV</button>
  </div>

  {categoryData.length === 0 && !loading ? (
    <div className="text-sm text-gray-800">No category data</div>
  ) : (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart
          data={categoryData}
          layout="vertical"
          margin={{ top: 10, left: 20, right: 20, bottom: 10 }}
          barCategoryGap="10%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fill: "#111827", fontSize: 12 }} />
          <YAxis
            dataKey="name"
            type="category"
            width={180}
            tick={{ fill: "#111827", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            labelStyle={{ color: "#000", fontWeight: 600 }}
            itemStyle={{ color: "#000" }}
            formatter={(v: any) => [v, "visitors"]}
          />
          <Bar dataKey="value" isAnimationActive>
            {categoryData.map((entry, idx) => (
              <Cell key={`cat-${entry.name}-${idx}`} fill={palette[idx % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )}

  {/* Category list below chart */}
  <div className="mt-3 space-y-2">
    {categoryPct.map((c, i) => {
      const pct = totalCategory ? (c.cnt / totalCategory) * 100 : 0;
      return (
        <div key={`${c.category}-${i}`} className="flex items-center gap-3">
          <div className="w-44 text-sm text-gray-900">{c.category}</div>
          <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-6 bg-gradient-to-r from-emerald-400 to-teal-600"
              style={{ width: `${Math.round(pct)}%` }}
            />
          </div>
          <div className="w-20 text-right text-sm text-gray-900">{c.cnt}</div>
        </div>
      );
    })}
  </div>
</motion.div>

      </div>

      <section>
        <h2 className="text-lg font-medium mb-2 text-gray-900">Notes</h2>
        <div className="p-4 rounded-lg shadow bg-white text-sm text-gray-800">
          <p>
            The dashboard aggregates analytics events stored in your <code>AnalyticsEvent</code> table.
            Category stats assume routes like <code>/categories/:slug</code>. The charts poll the server automatically.
          </p>
          <p className="mt-2 text-xs text-gray-700">
            Use "Load sample data" to preview UI locally. Toggle "Use live data" to go back to live stats.
          </p>
        </div>
      </section>
    </div>
  );
}
