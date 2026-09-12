import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { subDays, format } from "date-fns";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const thirtyDaysAgo = subDays(new Date(), 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Fetch all time logs from last 30 days
  const logs = await prisma.timeLog.findMany({
    where: {
      userId,
      startedAt: { gte: thirtyDaysAgo },
      durationMinutes: { not: null },
    },
    orderBy: { startedAt: "asc" },
  });

  // All-time stats
  const allLogs = await prisma.timeLog.findMany({
    where: { userId, durationMinutes: { not: null } },
  });

  const totalMinutes = allLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const totalSessions = allLogs.length;
  const avgSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  // Category distribution (all time)
  const categoryMap: Record<string, number> = {};
  allLogs.forEach((l) => {
    categoryMap[l.category] = (categoryMap[l.category] || 0) + (l.durationMinutes || 0);
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Most productive category
  const topCategory = categoryData.sort((a, b) => b.value - a.value)[0]?.name || "N/A";

  // Daily trend (last 30 days)
  const dailyMap: Record<string, Record<string, number>> = {};
  logs.forEach((l) => {
    const dateStr = format(new Date(l.startedAt), "MMM dd");
    if (!dailyMap[dateStr]) dailyMap[dateStr] = {};
    dailyMap[dateStr][l.category] = (dailyMap[dateStr][l.category] || 0) + (l.durationMinutes || 0);
  });

  const trendData = Array.from({ length: 30 }).map((_, i) => {
    const d = subDays(new Date(), 29 - i);
    const dateStr = format(d, "MMM dd");
    const dayData = dailyMap[dateStr] || {};
    return {
      date: dateStr,
      DSA: dayData["DSA"] || 0,
      "System Design": dayData["System Design"] || 0,
      Project: dayData["Project"] || 0,
      "Extra Learning": dayData["Extra Learning"] || 0,
      "Office Work": dayData["Office Work"] || 0,
      total: Object.values(dayData).reduce((s, v) => s + v, 0),
    };
  });

  // Active days count
  const activeDays = new Set(logs.map((l) => format(new Date(l.startedAt), "yyyy-MM-dd"))).size;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Analytics</h1>
        <p className="text-[var(--text-muted)] mt-1">Deep dive into your study and work patterns.</p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Hours" value={`${Math.round(totalMinutes / 60)}`} sub={`${totalMinutes} mins`} />
        <StatCard label="Sessions" value={`${totalSessions}`} sub="All time" />
        <StatCard label="Avg Session" value={`${avgSession}m`} sub="Per session" />
        <StatCard label="Active Days" value={`${activeDays}`} sub="Last 30 days" />
        <StatCard label="Top Category" value={topCategory} sub="Most time" />
      </div>

      <AnalyticsCharts categoryData={categoryData} trendData={trendData} />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-5 flex flex-col">
      <span className="text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider mb-2">{label}</span>
      <span className="text-2xl font-black tracking-tight text-white">{value}</span>
      <span className="text-[var(--text-faint)] text-xs mt-1">{sub}</span>
    </div>
  );
}
