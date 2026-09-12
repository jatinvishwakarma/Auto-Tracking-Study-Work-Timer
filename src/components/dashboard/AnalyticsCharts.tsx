"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  DSA: "#6384ff",
  "System Design": "#ff9f40",
  Project: "#4bc0c0",
  "Extra Learning": "#9966ff",
  "Office Work": "#ff6384",
};

type CategoryItem = { name: string; value: number };
type TrendItem = {
  date: string;
  DSA: number;
  "System Design": number;
  Project: number;
  "Extra Learning": number;
  "Office Work": number;
  total: number;
};

export function AnalyticsCharts({
  categoryData,
  trendData,
}: {
  categoryData: CategoryItem[];
  trendData: TrendItem[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pie Chart */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">Time Distribution</h2>
        <div className="h-64">
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
              No data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  strokeWidth={2}
                  stroke="var(--bg-base)"
                   label={({ name, percent }) =>
                     `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : ""}%`
                   }
                  labelLine={false}
                >
                  {categoryData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name] || "#8884d8"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                  }}
                   formatter={(value) => [`${value} min`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {categoryData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] || "#8884d8" }} />
              {item.name}
            </div>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card p-6 lg:col-span-2">
        <h2 className="text-lg font-bold mb-4">Daily Trend (30 Days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                interval={4}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                }}
                labelStyle={{ color: "var(--text-muted)", marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }} />
              <Bar dataKey="DSA" stackId="a" fill="#6384ff" />
              <Bar dataKey="System Design" stackId="a" fill="#ff9f40" />
              <Bar dataKey="Project" stackId="a" fill="#4bc0c0" />
              <Bar dataKey="Extra Learning" stackId="a" fill="#9966ff" />
              <Bar dataKey="Office Work" stackId="a" fill="#ff6384" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
