"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export type ChartApplication = {
  createdAt: string; // ISO string
  category: string;
};

const PIE_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
];

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    timeZone: "Africa/Nairobi",
    day: "2-digit",
    month: "short",
  });
}

function nairobiDateKey(iso: string): string {
  // YYYY-MM-DD in Nairobi for grouping
  return new Date(new Date(iso).getTime() + 3 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

export default function ApplicationsChart({
  applications,
}: {
  applications: ChartApplication[];
}) {
  if (applications.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {["Applications Over Time", "By Category"].map((title) => (
          <div key={title} className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-base font-semibold text-gray-800 mb-3">{title}</h2>
            <p className="text-gray-400 text-sm">No data yet.</p>
          </div>
        ))}
      </div>
    );
  }

  // Group by Nairobi date → total count per day
  const byDate: Record<string, number> = {};
  applications.forEach((a) => {
    const key = nairobiDateKey(a.createdAt);
    byDate[key] = (byDate[key] ?? 0) + 1;
  });

  const barData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => ({
      date: dateLabel(key + "T12:00:00+03:00"),
      count,
    }));

  // Pie: total per category
  const byCat: Record<string, number> = {};
  applications.forEach((a) => {
    byCat[a.category] = (byCat[a.category] ?? 0) + 1;
  });
  const pieData = Object.entries(byCat)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Applications Over Time */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Applications Over Time
        </h2>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 20, right: 16, left: 0, bottom: 28 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6B7280", fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fill: "#6B7280" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
                labelStyle={{ color: "#111827", fontWeight: 600 }}
                itemStyle={{ color: "#10b981" }}
                formatter={(v: unknown) => [String(v), "applications"] as [string, string]}
              />
              <Bar dataKey="count" fill="#10b981" name="Applications" radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fill: "#374151", fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By Category */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-base font-semibold text-gray-800 mb-4">By Category</h2>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={95}
                label={({ name, value }) => `${name} (${value})`}
                labelLine={true}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                }}
                itemStyle={{ color: "#111827" }}
                formatter={(v: unknown, name: unknown) =>
                  [String(v), String(name)] as [string, string]
                }
              />
              <Legend wrapperStyle={{ color: "#374151", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
