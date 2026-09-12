"use client";

import { useState, useEffect } from "react";
import { Plus, Target, Loader2, X, Trash2, CheckCircle2 } from "lucide-react";

type Goal = {
  id: string;
  title: string;
  type: string;
  category: string | null;
  targetValue: number;
  targetUnit: string;
  currentValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const TYPE_COLORS: Record<string, string> = {
  Daily: "var(--cat-dsa)",
  Weekly: "var(--cat-sd)",
  Monthly: "var(--cat-project)",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "Daily",
    category: "",
    targetValue: 1,
    targetUnit: "problems",
  });

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/goals?active=${!showArchived}`);
      const json = await res.json();
      setGoals(json.data || []);
    } catch {
      console.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: "", type: "Daily", category: "", targetValue: 1, targetUnit: "problems" });
        setShowAdd(false);
        await fetchGoals();
      }
    } catch {
      console.error("Failed to add goal");
    } finally {
      setSaving(false);
    }
  };

  const handleIncrement = async (goal: Goal) => {
    const newVal = Math.min(goal.currentValue + 1, goal.targetValue);
    try {
      await fetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue: newVal }),
      });
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, currentValue: newVal } : g))
      );
    } catch {
      console.error("Failed to update");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      await fetchGoals();
    } catch {
      console.error("Failed to archive");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await fetch(`/api/goals/${id}`, { method: "DELETE" });
      await fetchGoals();
    } catch {
      console.error("Failed to delete");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Target className="text-[var(--accent)]" />
            Goals
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Set targets and track your progress.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="btn btn-secondary"
          >
            {showArchived ? "Show Active" : "Show Archived"}
          </button>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            <Plus size={18} /> New Goal
          </button>
        </div>
      </header>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">New Goal</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
                <X size={20} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Goal Title <span className="text-[var(--error)]">*</span></label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Solve 3 DSA problems" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Category</label>
                <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">General</option>
                  <option value="DSA">DSA</option>
                  <option value="SystemDesign">System Design</option>
                  <option value="Project">Project</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Target</label>
                <input type="number" min={1} className="input" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Unit</label>
                <select className="input" value={form.targetUnit} onChange={(e) => setForm({ ...form, targetUnit: e.target.value })}>
                  <option value="problems">Problems</option>
                  <option value="hours">Hours</option>
                  <option value="sessions">Sessions</option>
                  <option value="chapters">Chapters</option>
                  <option value="case_studies">Case Studies</option>
                </select>
              </div>
            </div>
            <button onClick={handleAdd} disabled={!form.title.trim() || saving} className="btn btn-primary w-full">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {saving ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-36 rounded-xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="card p-12 text-center text-[var(--text-muted)]">
          {showArchived ? "No archived goals." : "No active goals. Set your first target!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isComplete = goal.currentValue >= goal.targetValue;
            const typeColor = TYPE_COLORS[goal.type] || "var(--accent)";

            return (
              <div key={goal.id} className={`card p-5 space-y-3 group ${isComplete ? "border-[var(--success)]/30" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge text-[10px]" style={{ backgroundColor: typeColor + "22", color: typeColor }}>
                        {goal.type}
                      </span>
                      {goal.category && (
                        <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{goal.category}</span>
                      )}
                    </div>
                    <h3 className={`font-bold text-[var(--text-primary)] ${isComplete ? "line-through opacity-60" : ""}`}>
                      {goal.title}
                    </h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {goal.isActive && (
                      <button onClick={() => handleArchive(goal.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--success)] hover:bg-[var(--success-dim)]" title="Archive">
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-dim)]" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bg-elevated)" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="16" fill="none"
                        stroke={isComplete ? "var(--success)" : typeColor}
                        strokeWidth="3"
                        strokeDasharray={`${percent} 100`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
                      {percent}%
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-black text-[var(--text-primary)] tabular-nums">
                      {goal.currentValue} <span className="text-sm font-normal text-[var(--text-muted)]">/ {goal.targetValue} {goal.targetUnit}</span>
                    </div>
                    {goal.isActive && !isComplete && (
                      <button onClick={() => handleIncrement(goal)} className="mt-2 btn btn-secondary text-xs py-1 px-3">
                        <Plus size={14} /> Add 1
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
