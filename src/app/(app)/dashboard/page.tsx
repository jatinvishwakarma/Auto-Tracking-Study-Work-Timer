import { Target, Code2, Server, Briefcase, Activity } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDistanceToNow, subDays, format } from "date-fns";
import { ActivityChart } from "@/components/dashboard/ActivityChart";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch top stats
  const [dsaSolved, designTopics, activeProjects, recentJournals] = await Promise.all([
    prisma.dSAProblem.count({ where: { userId, status: "Solved" } }),
    prisma.systemDesignTopic.count({ where: { userId } }),
    prisma.project.count({ where: { userId, status: "Active" } }),
    prisma.dailyJournal.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30, // Get last 30 days to calculate streak
    }),
  ]);

  // Calculate simple streak (consecutive days with a journal entry)
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < recentJournals.length; i++) {
    const journalDate = new Date(recentJournals[i].date);
    journalDate.setHours(0, 0, 0, 0);
    
    // Check if this journal is for today or the (streak) days ago
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (journalDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  // Fetch review due
  const dsaReviews = await prisma.dSAProblem.findMany({
    where: { 
      userId, 
      reviewAt: { lte: new Date() },
      status: { not: "NotStarted" }
    },
    take: 3,
    orderBy: { reviewAt: "asc" }
  });

  const sdReviews = await prisma.systemDesignTopic.findMany({
    where: { 
      userId, 
      nextReview: { lte: new Date() } 
    },
    take: 3,
    orderBy: { nextReview: "asc" }
  });

  const reviewsDue = [
    ...dsaReviews.map(r => ({ id: r.id, title: r.title, type: "DSA" })),
    ...sdReviews.map(r => ({ id: r.id, title: r.name, type: "System Design" }))
  ].slice(0, 5);

  // Fetch recent activity (time logs)
  const recentActivity = await prisma.timeLog.findMany({
    where: { userId, durationMinutes: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  // Chart data (last 7 days)
  const sevenDaysAgo = subDays(new Date(), 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const logsLastWeek = await prisma.timeLog.findMany({
    where: {
      userId,
      startedAt: { gte: sevenDaysAgo },
      durationMinutes: { not: null }
    }
  });

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, "MMM dd");
    
    const logsForDay = logsLastWeek.filter(
      log => format(new Date(log.startedAt), "MMM dd") === dateStr
    );

    let dsaTime = 0;
    let sdTime = 0;
    let projTime = 0;

    logsForDay.forEach(log => {
      const dur = log.durationMinutes || 0;
      if (log.category === "DSA") dsaTime += dur;
      else if (log.category === "System Design") sdTime += dur;
      else if (log.category === "Project") projTime += dur;
    });

    return {
      date: dateStr,
      DSA: dsaTime,
      "System Design": sdTime,
      Project: projTime
    };
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-[var(--text-muted)] mt-1">Welcome back. Here&apos;s your preparation overview.</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="DSA Solved" value={dsaSolved} subtitle="Total completed" icon={Code2} color="var(--cat-dsa)" />
        <StatCard title="Design Topics" value={designTopics} subtitle="Tracked" icon={Server} color="var(--cat-sd)" />
        <StatCard title="Active Projects" value={activeProjects} subtitle="In progress" icon={Briefcase} color="var(--cat-project)" />
        <StatCard title="Study Streak" value={`${streak} Days`} subtitle="Keep it up!" icon={Activity} color="var(--success)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="text-[var(--accent)]" size={20} />
              Today&apos;s Goals
            </h2>
            <div className="space-y-4">
              <GoalProgress label="Solve 3 DSA Problems" current={1} target={3} color="var(--cat-dsa)" />
              <GoalProgress label="Study System Design (1h)" current={45} target={60} color="var(--cat-sd)" />
            </div>
          </div>

          <div className="card p-6 min-h-[300px]">
            <h2 className="text-lg font-bold mb-4">Activity Overview (Last 7 Days)</h2>
            <div className="h-64">
              <ActivityChart data={chartData} />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="card p-6 border-[var(--warning-border)]">
            <h2 className="text-lg font-bold mb-4 text-[var(--warning-text)] flex items-center gap-2">
              Review Due
            </h2>
            <div className="space-y-3">
              {reviewsDue.length === 0 ? (
                <div className="text-[var(--text-muted)] text-sm">You are all caught up!</div>
              ) : (
                reviewsDue.map(item => (
                  <ReviewItem key={item.id} title={item.title} type={item.type} />
                ))
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-[var(--text-muted)] text-sm">No recent activity.</div>
              ) : (
                recentActivity.map(activity => (
                  <ActivityItem 
                    key={activity.id}
                    text={activity.note || `Logged ${activity.durationMinutes}m on ${activity.category}`} 
                    time={formatDistanceToNow(activity.createdAt, { addSuffix: true })} 
                    type={activity.category} 
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents (can be extracted later) ─────────────────────────────────

function StatCard({ title, value, subtitle, icon: Icon, color }: { title: string; value: string | number; subtitle: string; icon: React.ElementType; color: string }) {
  return (
    <div className="card p-5 flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity" style={{ color }}>
        <Icon size={48} />
      </div>
      <span className="text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider mb-2">{title}</span>
      <span className="text-3xl font-black tracking-tight text-white">{value}</span>
      <span className="text-[var(--text-faint)] text-xs mt-1">{subtitle}</span>
    </div>
  );
}

function GoalProgress({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const percent = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-muted)] font-mono text-xs">{current} / {target}</span>
      </div>
      <div className="h-2 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ReviewItem({ title, type }: { title: string; type: string }) {
  return (
    <div className="flex flex-col p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--warning)]/50 transition-colors cursor-pointer">
      <span className="font-semibold text-sm text-[var(--text-primary)]">{title}</span>
      <span className="text-xs text-[var(--text-muted)] mt-1">{type}</span>
    </div>
  );
}

function ActivityItem({ text, time, type }: { text: string; time: string; type: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ 
        backgroundColor: type === "DSA" ? "var(--cat-dsa)" : type === "System Design" ? "var(--cat-sd)" : "var(--cat-project)" 
      }} />
      <div className="flex flex-col">
        <span className="text-sm text-[var(--text-secondary)]">{text}</span>
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{time}</span>
      </div>
    </div>
  );
}
