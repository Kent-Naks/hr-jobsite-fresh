"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  BarChart,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  Bar,
  Pie,
} from "recharts";

type TimePoint = { label: string; count: number };
type HourlyPoint = { hour: string; count: number };
type DevicePoint = { deviceType: string; count: number };
type CategoryVisit = { slug: string; count: number };
type AppByCategory = { category: string; count: number };
type AppByJob = { job: string; category: string; count: number };

const DEVICE_COLORS = ["#60A5FA", "#818CF8", "#FB923C", "#F472B6", "#94A3B8"];
const CAT_COLORS = [
  "#38BDF8", "#818CF8", "#34D399", "#FB923C",
  "#F472B6", "#A78BFA", "#4ADE80", "#FBBF24",
];
const APP_COLORS = ["#4ADE80", "#22D3EE", "#34D399", "#A3E635", "#86EFAC"];

function formatDuration(s: number | null | undefined): string {
  if (s == null) return "—";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalVisits, setTotalVisits] = useState(0);
  const [uniqueSessions, setUniqueSessions] = useState(0);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [avgSessionSeconds, setAvgSessionSeconds] = useState<number | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimePoint[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<HourlyPoint[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DevicePoint[]>([]);
  const [categoryVisits, setCategoryVisits] = useState<CategoryVisit[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [applicationsByCategory, setApplicationsByCategory] = useState<AppByCategory[]>([]);
  const [applicationsByJob, setApplicationsByJob] = useState<AppByJob[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/stats?range=${range}&date=${selectedDate}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "API error");

      setTotalVisits(data.totalVisits ?? 0);
      setUniqueSessions(data.uniqueSessions ?? 0);
      setLiveVisitors(data.liveVisitors ?? 0);
      setAvgSessionSeconds(data.avgSessionSeconds ?? null);
      setTimeSeries(data.timeSeries ?? []);
      setHourlyDistribution(data.hourlyDistribution ?? []);
      setDeviceBreakdown(data.deviceBreakdown ?? []);
      setCategoryVisits(data.categoryVisits ?? []);
      setTotalApplications(data.totalApplications ?? 0);
      setApplicationsByCategory(data.applicationsByCategory ?? []);
      setApplicationsByJob(data.applicationsByJob ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [range, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4">
        ← Back to Admin
      </Link>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* ROW 1: Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded capitalize text-sm font-medium transition-colors ${
                range === r
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 text-white text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
        {loading && <span className="text-sm text-gray-400">Loading…</span>}
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-900/40 border border-red-700 p-3 text-sm text-red-300">
          Error: {error}
        </div>
      )}

      {/* ROW 2: Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Live Visitors", value: liveVisitors, tip: "People who visited your site in the last 60 minutes" },
          { label: "Total Visits", value: totalVisits, tip: "Total page views in the selected period. One person viewing 5 pages = 5 visits" },
          { label: "Unique Sessions", value: uniqueSessions, tip: "Number of individual visitors (browser sessions) in the selected period" },
          { label: "Avg Session Time", value: formatDuration(avgSessionSeconds), tip: "Average time visitors spend on your site before leaving" },
          { label: "Total Applications", value: totalApplications, tip: "Number of job applications submitted in the selected period" },
        ].map(({ label, value, tip }) => (
          <div key={label} className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm text-gray-600">{label}</span>
              <div className="relative group/tip cursor-help">
                <span className="text-gray-400 text-xs">ⓘ</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 text-xs bg-gray-800 text-white rounded p-2 hidden group-hover/tip:block z-10 pointer-events-none">
                  {tip}
                </div>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? "…" : value}
            </p>
          </div>
        ))}
      </div>

      {/* ROW 3: Visits Over Time */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Visits Over Time</h2>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 6 }}
                labelStyle={{ color: "#F9FAFB" }}
                itemStyle={{ color: "#60A5FA" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                fill="url(#blueGrad)"
                name="Visits"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 4: Peak Hours */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Peak Hours</h2>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyDistribution}
              margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" tick={{ fill: "#9CA3AF", fontSize: 10 }} interval={2} />
              <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 6 }}
                labelStyle={{ color: "#F9FAFB" }}
                itemStyle={{ color: "#A78BFA" }}
              />
              <Bar dataKey="count" name="Visits" isAnimationActive={false}>
                {hourlyDistribution.map((_, i) => (
                  <Cell key={i} fill="#7C3AED" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 5: Device Breakdown + Category Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Device Breakdown</h2>
          {deviceBreakdown.length === 0 && !loading ? (
            <p className="text-gray-500 text-sm">No data</p>
          ) : (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    dataKey="count"
                    nameKey="deviceType"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {deviceBreakdown.map((_, i) => (
                      <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 6 }}
                    itemStyle={{ color: "#F9FAFB" }}
                    formatter={(v: unknown) => [String(v), "visits"] as [string, string]}
                  />
                  <Legend wrapperStyle={{ color: "#9CA3AF" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Category Traffic</h2>
          {categoryVisits.length === 0 && !loading ? (
            <p className="text-gray-500 text-sm">No data</p>
          ) : (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryVisits}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 16, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    dataKey="slug"
                    type="category"
                    width={120}
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 6 }}
                    labelStyle={{ color: "#F9FAFB" }}
                    itemStyle={{ color: "#38BDF8" }}
                    formatter={(v: unknown) => [String(v), "visits"] as [string, string]}
                  />
                  <Bar dataKey="count" name="Visits" isAnimationActive={false}>
                    {categoryVisits.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ROW 6: Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Applications by Category</h2>
          {applicationsByCategory.length === 0 && !loading ? (
            <p className="text-gray-500 text-sm">No data</p>
          ) : (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={applicationsByCategory}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 16, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={140}
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 6 }}
                    labelStyle={{ color: "#F9FAFB" }}
                    itemStyle={{ color: "#4ADE80" }}
                    formatter={(v: unknown) => [String(v), "applications"] as [string, string]}
                  />
                  <Bar dataKey="count" name="Applications" isAnimationActive={false}>
                    {applicationsByCategory.map((_, i) => (
                      <Cell key={i} fill={APP_COLORS[i % APP_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Top Applied Jobs</h2>
          {applicationsByJob.length === 0 && !loading ? (
            <p className="text-gray-500 text-sm">No data</p>
          ) : (
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={applicationsByJob}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 16, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    dataKey="job"
                    type="category"
                    width={180}
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 6 }}
                    labelStyle={{ color: "#F9FAFB" }}
                    itemStyle={{ color: "#4ADE80" }}
                    formatter={(v: unknown, _: unknown, props: { payload?: AppByJob }) => [
                      String(v),
                      `applications (${props?.payload?.category ?? ""})`,
                    ] as [string, string]}
                  />
                  <Bar dataKey="count" name="Applications" isAnimationActive={false}>
                    {applicationsByJob.map((_, i) => (
                      <Cell key={i} fill={APP_COLORS[i % APP_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
