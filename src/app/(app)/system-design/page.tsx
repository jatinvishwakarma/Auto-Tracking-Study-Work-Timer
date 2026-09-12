"use client";

import { useState, useEffect } from "react";
import { Plus, Server, BookOpen, Loader2, Trash2, X } from "lucide-react";

type Topic = {
  id: string;
  name: string;
  status: string;
  progress: number;
  confidence: number | null;
  notes: string | null;
  timeInvested: number;
  _count?: { studyNotes: number };
};

type CaseStudy = {
  id: string;
  title: string;
  status: string;
  problemStatement: string | null;
  timeSpent: number;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  NotStarted: { bg: "var(--bg-elevated)", text: "var(--text-muted)" },
  Learning: { bg: "var(--cat-dsa-dim)", text: "var(--cat-dsa)" },
  Practicing: { bg: "var(--warning-dim)", text: "var(--warning)" },
  Comfortable: { bg: "var(--success-dim)", text: "var(--success)" },
  NeedsReview: { bg: "var(--error-dim)", text: "var(--error)" },
  InProgress: { bg: "var(--cat-sd-dim)", text: "var(--cat-sd)" },
  Completed: { bg: "var(--success-dim)", text: "var(--success)" },
};

export default function SystemDesignPage() {
  const [tab, setTab] = useState<"topics" | "cases">("topics");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState("NotStarted");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [topicsRes, casesRes] = await Promise.all([
        fetch("/api/system-design/topics"),
        fetch("/api/system-design/case-studies"),
      ]);
      const topicsData = await topicsRes.json();
      const casesData = await casesRes.json();
      setTopics(topicsData.data || []);
      setCases(casesData.data || []);
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const url = tab === "topics" ? "/api/system-design/topics" : "/api/system-design/case-studies";
      const body = tab === "topics"
        ? { name: formName, status: formStatus }
        : { title: formName, status: formStatus };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFormName("");
        setFormStatus("NotStarted");
        setShowAdd(false);
        await fetchData();
      }
    } catch {
      console.error("Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/system-design/topics/${id}`, { method: "DELETE" });
      await fetchData();
    } catch {
      console.error("Failed to delete");
    }
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    try {
      await fetch(`/api/system-design/topics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      });
      setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, progress } : t)));
    } catch {
      console.error("Failed to update progress");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">System Design</h1>
          <p className="text-[var(--text-muted)] mt-1">Track HLD/LLD topics and case study practice.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus size={18} /> Add {tab === "topics" ? "Topic" : "Case Study"}
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--bg-elevated)] rounded-xl w-fit">
        <button
          onClick={() => setTab("topics")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "topics" ? "bg-[var(--bg-card-solid)] text-[var(--text-primary)] shadow" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
        >
          <Server size={16} className="inline mr-1.5 mb-0.5" />
          Topics ({topics.length})
        </button>
        <button
          onClick={() => setTab("cases")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "cases" ? "bg-[var(--bg-card-solid)] text-[var(--text-primary)] shadow" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
        >
          <BookOpen size={16} className="inline mr-1.5 mb-0.5" />
          Case Studies ({cases.length})
        </button>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Add {tab === "topics" ? "Topic" : "Case Study"}</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
                <X size={20} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">{tab === "topics" ? "Topic Name" : "Case Study Title"}</label>
              <input className="input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={tab === "topics" ? "e.g., Load Balancing" : "e.g., Design Twitter"} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Status</label>
              <select className="input" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                {tab === "topics" ? (
                  <>
                    <option value="NotStarted">Not Started</option>
                    <option value="Learning">Learning</option>
                    <option value="Practicing">Practicing</option>
                    <option value="Comfortable">Comfortable</option>
                    <option value="NeedsReview">Needs Review</option>
                  </>
                ) : (
                  <>
                    <option value="NotStarted">Not Started</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="NeedsReview">Needs Review</option>
                  </>
                )}
              </select>
            </div>
            <button onClick={handleAdd} disabled={!formName.trim() || saving} className="btn btn-primary w-full">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {saving ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : tab === "topics" ? (
        /* Topics Grid */
        topics.length === 0 ? (
          <div className="card p-12 text-center text-[var(--text-muted)]">No topics yet. Add your first system design topic!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => {
              const st = STATUS_COLORS[topic.status] || STATUS_COLORS.NotStarted;
              return (
                <div key={topic.id} className="card p-5 space-y-3 group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)]">{topic.name}</h3>
                      <span className="badge mt-1" style={{ backgroundColor: st.bg, color: st.text }}>
                        {topic.status.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(topic.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-dim)] opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--text-muted)]">Progress</span>
                      <span className="text-[var(--text-secondary)] font-mono">{topic.progress}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={topic.progress}
                      onChange={(e) => handleUpdateProgress(topic.id, parseInt(e.target.value))}
                      className="w-full accent-[var(--cat-sd)] h-1.5"
                    />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span>{topic.timeInvested}m invested</span>
                    {topic._count && <span>{topic._count.studyNotes} notes</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Case Studies List */
        cases.length === 0 ? (
          <div className="card p-12 text-center text-[var(--text-muted)]">No case studies yet. Add your first one!</div>
        ) : (
          <div className="space-y-3">
            {cases.map((cs) => {
              const st = STATUS_COLORS[cs.status] || STATUS_COLORS.NotStarted;
              return (
                <div key={cs.id} className="card p-5 flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-[var(--text-primary)]">{cs.title}</h3>
                    {cs.problemStatement && (
                      <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-1">{cs.problemStatement}</p>
                    )}
                  </div>
                  <span className="badge" style={{ backgroundColor: st.bg, color: st.text }}>
                    {cs.status.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{cs.timeSpent}m</span>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
