"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Square, Pause, RotateCcw, Clock, FileText } from "lucide-react";

const CATEGORIES = [
  { key: "DSA", label: "DSA", color: "var(--cat-dsa)", dim: "var(--cat-dsa-dim)" },
  { key: "System Design", label: "System Design", color: "var(--cat-sd)", dim: "var(--cat-sd-dim)" },
  { key: "Project", label: "Project", color: "var(--cat-project)", dim: "var(--cat-project-dim)" },
  { key: "Extra Learning", label: "Extra Learning", color: "var(--cat-learning)", dim: "var(--cat-learning-dim)" },
  { key: "Office Work", label: "Office Work", color: "var(--cat-other)", dim: "var(--cat-other-dim)" },
];

const NOTE_REQUIRED = ["System Design", "Extra Learning"];
const NOTE_NOT_ACCEPTED = ["Office Work"];

type TimerData = {
  id: string;
  category: string;
  startedAt: string;
  pausedAt: string | null;
  pausedDuration: number;
  isRunning: boolean;
  durationMinutes: number | null;
  note: string | null;
  endedAt: string | null;
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function TimerPage() {
  const [active, setActive] = useState<TimerData | null>(null);
  const [recent, setRecent] = useState<TimerData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [note, setNote] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTimer = useCallback(async () => {
    try {
      const res = await fetch("/api/timer");
      const json = await res.json();
      setActive(json.active || null);
      setRecent(json.recent || []);
    } catch {
      console.error("Failed to fetch timer");
    }
  }, []);

  // Calculate elapsed seconds
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (active && active.isRunning) {
      const compute = () => {
        const start = new Date(active.startedAt).getTime();
        let total = Math.floor((Date.now() - start) / 1000);
        let paused = active.pausedDuration;
        if (active.pausedAt) {
          paused += Math.floor((Date.now() - new Date(active.pausedAt).getTime()) / 1000);
        }
        total -= paused;
        setElapsed(Math.max(0, total));
      };
      compute();
      intervalRef.current = setInterval(compute, 1000);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsed(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTimer();
  }, [fetchTimer]);

  const isPaused = active?.pausedAt !== null && active?.pausedAt !== undefined;

  const handleStart = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await fetchTimer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start timer");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "pause" | "resume" | "stop") => {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, string> = { action };
      if (action === "stop" && note) body.note = note;

      const res = await fetch("/api/timer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      if (action === "stop") {
        setNote("");
        setSelectedCategory("");
      }
      await fetchTimer();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} timer`);
    } finally {
      setLoading(false);
    }
  };

  const canStop = () => {
    if (!active) return false;
    if (NOTE_REQUIRED.includes(active.category) && !note.trim()) return false;
    return true;
  };

  const getCategoryColor = (cat: string) => {
    return CATEGORIES.find((c) => c.key === cat)?.color || "var(--text-muted)";
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Timer</h1>
        <p className="text-[var(--text-muted)] mt-1">Track your focused study and work sessions.</p>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-[var(--error-dim)] border border-[var(--error)] text-[var(--error-text)] text-sm">
          {error}
        </div>
      )}

      {/* Active Timer Display */}
      {active ? (
        <div className="card p-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold" style={{ backgroundColor: getCategoryColor(active.category) + "22", color: getCategoryColor(active.category) }}>
            <Clock size={16} />
            {active.category}
          </div>

          <div className="text-7xl font-mono font-black tracking-tight text-[var(--text-primary)] tabular-nums">
            {formatTime(elapsed)}
          </div>

          {isPaused && (
            <div className="text-[var(--warning)] font-semibold text-sm animate-pulse">
              ⏸ PAUSED
            </div>
          )}

          {/* Note input */}
          {!NOTE_NOT_ACCEPTED.includes(active.category) && (
            <div className="max-w-md mx-auto text-left">
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">
                <FileText size={14} className="inline mr-1" />
                Session Notes {NOTE_REQUIRED.includes(active.category) && <span className="text-[var(--error)]">*</span>}
              </label>
              <textarea
                className="input min-h-[80px] resize-y"
                placeholder={NOTE_REQUIRED.includes(active.category) ? "Required — what did you study?" : "Optional notes..."}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {isPaused ? (
              <button onClick={() => handleAction("resume")} disabled={loading} className="btn btn-primary px-6 py-3 text-lg">
                <Play size={20} className="ml-0.5" /> Resume
              </button>
            ) : (
              <button onClick={() => handleAction("pause")} disabled={loading} className="btn btn-secondary px-6 py-3 text-lg">
                <Pause size={20} fill="currentColor" /> Pause
              </button>
            )}
            <button
              onClick={() => handleAction("stop")}
              disabled={loading || !canStop()}
              className="btn btn-danger px-6 py-3 text-lg"
            >
              <Square size={20} fill="currentColor" /> Stop & Save
            </button>
          </div>
        </div>
      ) : (
        /* Category Selector */
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Select Category & Start</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedCategory === cat.key
                    ? "border-current scale-105 shadow-lg"
                    : "border-[var(--border)] hover:border-current"
                }`}
                style={{ color: cat.color, backgroundColor: selectedCategory === cat.key ? cat.dim : "transparent" }}
              >
                <span className="text-sm font-bold block">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button onClick={handleStart} disabled={!selectedCategory || loading} className="btn btn-primary px-8 py-3 text-lg">
              <Play size={20} className="ml-0.5" /> Start Timer
            </button>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <RotateCcw size={18} className="text-[var(--text-muted)]" />
          Recent Sessions
        </h2>
        {recent.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">No sessions yet. Start your first timer above!</p>
        ) : (
          <div className="space-y-3">
            {recent.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryColor(log.category) }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[var(--text-primary)]">{log.category}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {log.endedAt ? new Date(log.endedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>
                  {log.note && (
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{log.note}</p>
                  )}
                </div>
                <span className="font-mono text-sm font-bold text-[var(--text-secondary)] tabular-nums">
                  {log.durationMinutes}m
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
