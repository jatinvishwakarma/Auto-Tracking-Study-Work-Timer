"use client";

import { Play, Square, Pause } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  "DSA": "var(--cat-dsa)",
  "System Design": "var(--cat-sd)",
  "Project": "var(--cat-project)",
  "Extra Learning": "var(--cat-learning)",
  "Office Work": "var(--cat-other)",
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

type TimerData = {
  id: string;
  category: string;
  startedAt: string;
  pausedAt: string | null;
  pausedDuration: number;
  isRunning: boolean;
};

export function GlobalTimer() {
  const [timer, setTimer] = useState<TimerData | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTimer = useCallback(async () => {
    try {
      const res = await fetch("/api/timer");
      const json = await res.json();
      setTimer(json.active || null);
    } catch {
      // Silently ignore — don't break the UI
    }
  }, []);

  // Poll for active timer every 10 seconds
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTimer();
    pollRef.current = setInterval(fetchTimer, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchTimer]);

  // Live elapsed counter
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (timer && timer.isRunning) {
      const compute = () => {
        const start = new Date(timer.startedAt).getTime();
        let total = Math.floor((Date.now() - start) / 1000);
        let paused = timer.pausedDuration;
        if (timer.pausedAt) {
          paused += Math.floor((Date.now() - new Date(timer.pausedAt).getTime()) / 1000);
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
  }, [timer]);

  const handleAction = async (action: "pause" | "resume" | "stop") => {
    try {
      await fetch("/api/timer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await fetchTimer();
    } catch {
      // Silently ignore
    }
  };

  if (!timer) return null;

  const isPaused = timer.pausedAt !== null;
  const color = CATEGORY_COLORS[timer.category] || "var(--text-muted)";
  const dimColor = color + "22";

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
      <div className="card-flat bg-[var(--bg-card-solid)] shadow-xl border-[var(--accent-border)]/30 flex items-center gap-3 p-2 pr-3 rounded-full animate-in slide-in-from-bottom-5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: dimColor, color }}>
          {isPaused ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" />}
        </div>
        
        <Link href="/time" className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider leading-tight" style={{ color }}>
            {timer.category}
          </span>
          <span className="text-sm font-mono font-bold text-white tabular-nums leading-tight">
            {formatTime(elapsed)}
          </span>
        </Link>
        
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-[var(--border)]">
          {isPaused ? (
            <button
              onClick={() => handleAction("resume")}
              className="p-2 rounded-full text-[var(--success)] hover:bg-[var(--success-dim)] transition-colors"
              title="Resume"
            >
              <Play size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={() => handleAction("pause")}
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)] transition-colors"
              title="Pause"
            >
              <Pause size={16} fill="currentColor" />
            </button>
          )}
          <button 
            onClick={() => handleAction("stop")}
            className="p-2 rounded-full text-[var(--error)] hover:bg-[var(--error-dim)] transition-colors"
            title="Stop"
          >
            <Square size={16} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
