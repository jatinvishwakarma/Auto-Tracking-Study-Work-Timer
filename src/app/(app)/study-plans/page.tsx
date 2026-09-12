"use client";

import { useState, useEffect } from "react";
import { Target, CheckCircle2, Loader2, Calendar, BookOpen } from "lucide-react";
import { format, addDays } from "date-fns";

type Phase = {
  id: string;
  order: number;
  name: string;
  description: string | null;
  targetProblems: number;
  targetHours: number;
  topics: string | null;
};

type UserPlan = {
  id: string;
  currentPhase: number;
  startDate: string;
  completedAt: string | null;
  phaseProgress: Array<{ phaseId: string; problemsSolved: number; hoursStudied: number; completedAt: string | null }>;
};

type StudyPlan = {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  phases: Phase[];
  userPlans: UserPlan[];
};

const PLAN_ICONS: Record<string, string> = {
  "8-Week DSA Mastery": "💻",
  "4-Week System Design": "🏗",
  "Complete Interview Prep (12 Weeks)": "🎯",
};

export default function StudyPlansPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/study-plans");
      const json = await res.json();
      setPlans(json.data || []);
    } catch { console.error("Failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleEnroll = async (planId: string) => {
    setEnrolling(planId);
    try {
      const res = await fetch("/api/study-plans/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (res.ok) fetchPlans();
    } catch { console.error("Failed"); } finally { setEnrolling(null); }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
          <BookOpen className="text-[var(--accent)]" />
          Study Plans
        </h1>
        <p className="text-[var(--text-muted)] mt-1">Structured learning paths for interview preparation.</p>
      </header>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="skeleton h-48 rounded-xl" />)}</div>
      ) : plans.length === 0 ? (
        <div className="card p-12 text-center text-[var(--text-muted)]">
          No study plans found. Run <code className="px-2 py-1 rounded bg-[var(--bg-elevated)] font-mono text-sm">npx tsx prisma/seed.ts</code> to add curated plans.
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => {
            const userPlan = plan.userPlans[0] || null;
            const isEnrolled = !!userPlan;
            const icon = PLAN_ICONS[plan.name] || "📚";
            const expanded = expandedPlan === plan.id;
            const completionDate = userPlan ? format(addDays(new Date(userPlan.startDate), plan.durationWeeks * 7), "MMMM d, yyyy") : null;

            const totalProblems = plan.phases.reduce((s, p) => s + p.targetProblems, 0);
            const totalHours = plan.phases.reduce((s, p) => s + p.targetHours, 0);

            return (
              <div key={plan.id} className={`card overflow-hidden ${isEnrolled ? "border-[var(--accent)]/30" : ""}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{icon}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold text-[var(--text-primary)]">{plan.name}</h2>
                          {isEnrolled && (
                            <span className="badge bg-[var(--accent-dim)] text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider">Enrolled</span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xl">{plan.description}</p>
                        <div className="flex gap-4 mt-3 text-xs text-[var(--text-muted)]">
                          <span className="flex items-center gap-1"><Calendar size={12} />{plan.durationWeeks} weeks</span>
                          {totalProblems > 0 && <span>🎯 {totalProblems}+ problems</span>}
                          <span>⏱ ~{totalHours}h total</span>
                          <span>📋 {plan.phases.length} phases</span>
                        </div>
                        {isEnrolled && completionDate && (
                          <p className="text-xs mt-2 text-[var(--accent)]">
                            Started: {format(new Date(userPlan!.startDate), "MMM d, yyyy")} · Target completion: {completionDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setExpandedPlan(expanded ? null : plan.id)} className="btn btn-secondary text-sm">
                        {expanded ? "Hide" : "View"} Phases
                      </button>
                      {!isEnrolled && (
                        <button onClick={() => handleEnroll(plan.id)} disabled={enrolling === plan.id} className="btn btn-primary text-sm">
                          {enrolling === plan.id ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
                          {enrolling === plan.id ? "Enrolling..." : "Enroll"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar if enrolled */}
                  {isEnrolled && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-muted)]">Phase {userPlan!.currentPhase + 1} of {plan.phases.length}</span>
                        <span className="text-[var(--text-secondary)] font-semibold">{Math.round((userPlan!.currentPhase / plan.phases.length) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${(userPlan!.currentPhase / plan.phases.length) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Phases */}
                {expanded && (
                  <div className="border-t border-[var(--border)] bg-[var(--bg-elevated)]">
                    <div className="p-4 space-y-3">
                      {plan.phases.map((phase, idx) => {
                        const phaseProgress = userPlan?.phaseProgress.find(p => p.phaseId === phase.id);
                        const isCurrentPhase = isEnrolled && userPlan!.currentPhase === idx;
                        const isDone = isEnrolled && userPlan!.currentPhase > idx;

                        return (
                          <div key={phase.id} className={`flex gap-4 p-3 rounded-xl transition-colors ${isCurrentPhase ? "bg-[var(--accent-dim)] border border-[var(--accent)]/30" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${isDone ? "bg-[var(--success)] text-white" : isCurrentPhase ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-card)] text-[var(--text-muted)]"}`}>
                              {isDone ? <CheckCircle2 size={16} /> : phase.order}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div>
                                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">{phase.name}</h3>
                                  {phase.description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{phase.description}</p>}
                                </div>
                                <div className="flex gap-3 text-xs text-[var(--text-faint)] flex-shrink-0">
                                  {phase.targetProblems > 0 && <span>🎯 {phaseProgress?.problemsSolved || 0}/{phase.targetProblems}</span>}
                                  <span>⏱ ~{phase.targetHours}h</span>
                                </div>
                              </div>
                              {phase.topics && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {phase.topics.split(",").map((t, i) => (
                                    <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)]">{t.trim()}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
