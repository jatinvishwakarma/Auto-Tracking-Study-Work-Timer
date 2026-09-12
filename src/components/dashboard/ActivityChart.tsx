"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  date: string;
  DSA: number;
  "System Design": number;
  Project: number;
};

export function ActivityChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
        No activity data available.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: "var(--text-muted)", fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis 
            tick={{ fill: "var(--text-muted)", fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "var(--bg-elevated)", 
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-primary)"
            }}
            itemStyle={{ fontSize: 14 }}
            labelStyle={{ color: "var(--text-muted)", marginBottom: "4px" }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "14px" }} />
          <Bar dataKey="DSA" stackId="a" fill="var(--cat-dsa)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="System Design" stackId="a" fill="var(--cat-sd)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Project" stackId="a" fill="var(--cat-project)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
