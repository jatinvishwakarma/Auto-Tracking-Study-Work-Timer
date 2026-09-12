"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Save, Loader2, BookOpen } from "lucide-react";
import { format, addDays, subDays } from "date-fns";

type Journal = {
  id: string;
  date: string;
  dsaActivity: string | null;
  systemDesignActivity: string | null;
  projectActivity: string | null;
  generalLearning: string | null;
  notes: string | null;
  wins: string | null;
  blockers: string | null;
  tomorrowPriorities: string | null;
};

export default function JournalPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return format(d, "yyyy-MM-dd");
  });
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form fields
  const [dsaActivity, setDsaActivity] = useState("");
  const [systemDesignActivity, setSystemDesignActivity] = useState("");
  const [projectActivity, setProjectActivity] = useState("");
  const [generalLearning, setGeneralLearning] = useState("");
  const [notes, setNotes] = useState("");
  const [wins, setWins] = useState("");
  const [blockers, setBlockers] = useState("");
  const [tomorrowPriorities, setTomorrowPriorities] = useState("");

  const fetchJournal = useCallback(async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/journal?date=${currentDate}`);
      const json = await res.json();
      const entry = json.data?.[0] || null;
      setJournal(entry);

      // Populate form
      setDsaActivity(entry?.dsaActivity || "");
      setSystemDesignActivity(entry?.systemDesignActivity || "");
      setProjectActivity(entry?.projectActivity || "");
      setGeneralLearning(entry?.generalLearning || "");
      setNotes(entry?.notes || "");
      setWins(entry?.wins || "");
      setBlockers(entry?.blockers || "");
      setTomorrowPriorities(entry?.tomorrowPriorities || "");
    } catch {
      console.error("Failed to fetch journal");
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJournal();
  }, [fetchJournal]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: currentDate,
          dsaActivity: dsaActivity || null,
          systemDesignActivity: systemDesignActivity || null,
          projectActivity: projectActivity || null,
          generalLearning: generalLearning || null,
          notes: notes || null,
          wins: wins || null,
          blockers: blockers || null,
          tomorrowPriorities: tomorrowPriorities || null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        const json = await res.json();
        setJournal(json.data);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      console.error("Failed to save journal");
    } finally {
      setSaving(false);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const d = new Date(currentDate + "T00:00:00");
    const newDate = direction === "prev" ? subDays(d, 1) : addDays(d, 1);
    setCurrentDate(format(newDate, "yyyy-MM-dd"));
  };

  const isToday = currentDate === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
          <BookOpen className="text-[var(--accent)]" />
          Daily Journal
        </h1>
        <p className="text-[var(--text-muted)] mt-1">Reflect on your day and plan for tomorrow.</p>
      </header>

      {/* Date Navigator */}
      <div className="flex items-center justify-between card p-3">
        <button onClick={() => navigateDate("prev")} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <div className="font-bold text-lg text-[var(--text-primary)]">
            {format(new Date(currentDate + "T00:00:00"), "EEEE, MMMM d, yyyy")}
          </div>
          {isToday && <span className="text-xs text-[var(--accent)] font-bold uppercase tracking-wider">Today</span>}
        </div>
        <button onClick={() => navigateDate("next")} disabled={isToday} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors disabled:opacity-30">
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Activity Sections */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-lg text-[var(--text-primary)]">What did you work on?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JournalField label="DSA Practice" color="var(--cat-dsa)" value={dsaActivity} onChange={setDsaActivity} placeholder="Problems solved, topics reviewed..." />
              <JournalField label="System Design" color="var(--cat-sd)" value={systemDesignActivity} onChange={setSystemDesignActivity} placeholder="Concepts studied, diagrams drawn..." />
              <JournalField label="Project Work" color="var(--cat-project)" value={projectActivity} onChange={setProjectActivity} placeholder="Features built, bugs fixed..." />
              <JournalField label="Extra Learning" color="var(--cat-learning)" value={generalLearning} onChange={setGeneralLearning} placeholder="Articles read, courses completed..." />
            </div>
          </div>

          {/* Reflection */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-lg text-[var(--text-primary)]">Reflections</h2>
            <JournalField label="🏆 Wins" color="var(--success)" value={wins} onChange={setWins} placeholder="What went well today?" />
            <JournalField label="🚧 Blockers" color="var(--error)" value={blockers} onChange={setBlockers} placeholder="What slowed you down?" />
            <JournalField label="📝 Notes" color="var(--text-secondary)" value={notes} onChange={setNotes} placeholder="Any other thoughts..." />
          </div>

          {/* Tomorrow */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-lg text-[var(--text-primary)]">Plan for Tomorrow</h2>
            <JournalField label="🎯 Priorities" color="var(--accent)" value={tomorrowPriorities} onChange={setTomorrowPriorities} placeholder="Top 3 things to tackle tomorrow..." />
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-4">
            {saved && (
              <span className="text-sm text-[var(--success)] font-semibold animate-in fade-in">✓ Saved!</span>
            )}
            <button onClick={handleSave} disabled={saving} className="btn btn-primary px-6">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Saving..." : journal ? "Update Journal" : "Save Journal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function JournalField({
  label,
  color,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  color: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color }}>
        {label}
      </label>
      <textarea
        className="input min-h-[70px] resize-y text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
