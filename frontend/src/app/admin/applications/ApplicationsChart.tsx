"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export type ChartApplication = {
  createdAt: string; // ISO string
  category: string;
};

const COLORS = [
  "#34D399", "#60A5FA", "#F472B6", "#FBBF24", "#A78BFA",
  "#38BDF8", "#FB923C", "#4ADE80", "#E879F9", "#94A3B8",
];

function dateInNairobi(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function ApplicationsChart({ applications }: { applications: ChartApplication[] }) {
  // Build sorted list of unique categories and assign colors
  const categories = Array.from(new Set(applications.map((a) => a.category))).sort();
  const colorMap: Record<string, string> = {};
  categories.forEach((cat, i) => {
    colorMap[cat] = COLORS[i % COLORS.length];
  });

  // Group by date (Nairobi) → { date, [category]: count }
  const byDate: Record<string, Record<string, number>> = {};
  applications.forEach((a) => {
    const date = dateInNairobi(a.createdAt);
    if (!byDate[date]) byDate[date] = {};
    byDate[date][a.category] = (byDate[date][a.category] ?? 0) + 1;
  });

  const timelineData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));

  // Pie data: total per category
  const pieData = categories.map((cat) => ({
    name: cat,
    value: applications.filter((a) => a.category === cat).length,
  }));

  if (applications.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {["Applications Over Time", "By Category"].map((title) => (
          <div key={title} className="bg-gray-900 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
            <p className="text-gray-500 text-sm">No data yet.</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Applications Over Time */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-3">Applications Over Time</h2>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 4, right: 12, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 6 }}
                labelStyle={{ color: "#F9FAFB" }}
                itemStyle={{ color: "#D1FAE5" }}
              />
              {categories.map((cat) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={colorMap[cat]} name={cat} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By Category Pie */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-3">By Category</h2>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 6 }}
                itemStyle={{ color: "#F9FAFB" }}
                formatter={(v: unknown) => [String(v), "applications"] as [string, string]}
              />
              <Legend wrapperStyle={{ color: "#9CA3AF", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
