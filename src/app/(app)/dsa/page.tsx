"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Upload, Search, ExternalLink, Star, X, Loader2, Trash2, RotateCcw, ChevronDown } from "lucide-react";
import Link from "next/link";

type DSAProblem = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  subTopic: string | null;
  pattern: string | null;
  status: string;
  confidence: number | null;
  reviewAt: string | null;
  problemUrl: string | null;
  leetcodeUrl: string | null;
  notes: string | null;
  approach: string | null;
  mistakes: string | null;
  attempts: number;
};

const DIFFICULTY_STYLES = {
  Easy: "bg-[var(--diff-easy-dim)] text-[var(--diff-easy)]",
  Medium: "bg-[var(--diff-medium-dim)] text-[var(--diff-medium)]",
  Hard: "bg-[var(--diff-hard-dim)] text-[var(--diff-hard)]",
};

const STATUS_OPTIONS = ["NotStarted", "InProgress", "Solved", "NeedsReview", "Revisit"];
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/([A-Z])/g, " $1").trim();
  const colors: Record<string, string> = {
    Solved: "bg-[var(--success-dim)] text-[var(--success)]",
    InProgress: "bg-[var(--cat-dsa-dim)] text-[var(--cat-dsa)]",
    NeedsReview: "bg-[var(--warning-dim)] text-[var(--warning)]",
    Revisit: "bg-[var(--error-dim)] text-[var(--error)]",
    NotStarted: "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
  };
  return <span className={`badge ${colors[status] || colors.NotStarted}`}>{label}</span>;
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} type="button" className={`text-xl transition-transform hover:scale-125 ${n <= value ? "text-yellow-400" : "text-[var(--bg-elevated)]"}`}>★</button>
      ))}
    </div>
  );
}

export default function DSAPage() {
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTopic, setFilterTopic] = useState("");

  // Add problem modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", topic: "General", difficulty: "Medium", status: "NotStarted", problemUrl: "", pattern: "", notes: "" });
  const [saving, setSaving] = useState(false);

  // Edit modal
  const [editProblem, setEditProblem] = useState<DSAProblem | null>(null);
  const [editForm, setEditForm] = useState<Partial<DSAProblem>>({});

  // Review modal
  const [reviewProblem, setReviewProblem] = useState<DSAProblem | null>(null);
  const [reviewForm, setReviewForm] = useState({ confidence: 3, notes: "", mistakes: "" });
  const [reviewing, setReviewing] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProblems = useCallback(async (reset = false) => {
    if (reset) {
      setPage(1);
      setProblems([]);
    }
    const currentPage = reset ? 1 : page;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage.toString(), limit: "100" });
      if (filterDiff) params.set("difficulty", filterDiff);
      if (filterStatus) params.set("status", filterStatus);
      if (search) params.set("search", search);
      const res = await fetch(`/api/dsa/problems?${params}`);
      const json = await res.json();
      const newProblems = json.data || [];
      if (newProblems.length < 100) setHasMore(false);
      else setHasMore(true);

      setProblems(prev => reset ? newProblems : [...prev, ...newProblems]);
    } catch { console.error("Failed to fetch"); }
    finally { setLoading(false); }
  }, [filterDiff, filterStatus, search, page]);

  useEffect(() => {
    setPage(1);
    setProblems([]);
  }, [filterDiff, filterStatus, search]);

  useEffect(() => { 
    const t = setTimeout(() => fetchProblems(page === 1), 300); 
    return () => clearTimeout(t);
  }, [fetchProblems, page]);

  const filtered = problems;

  const topics = [...new Set(problems.map((p) => p.topic))].sort();
  const reviewsDue = problems.filter((p) => p.reviewAt && new Date(p.reviewAt) <= new Date() && p.status !== "NotStarted");

  const handleAdd = async () => {
    if (!addForm.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dsa/problems", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) });
      if (res.ok) { setShowAdd(false); setAddForm({ title: "", topic: "General", difficulty: "Medium", status: "NotStarted", problemUrl: "", pattern: "", notes: "" }); fetchProblems(); }
    } catch { console.error("Failed"); } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editProblem) return;
    setSaving(true);
    try {
      await fetch(`/api/dsa/problems/${editProblem.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      setEditProblem(null); fetchProblems();
    } catch { console.error("Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this problem?")) return;
    await fetch(`/api/dsa/problems/${id}`, { method: "DELETE" });
    fetchProblems();
  };

  const handleReview = async () => {
    if (!reviewProblem) return;
    setReviewing(true);
    try {
      await fetch(`/api/dsa/problems/${reviewProblem.id}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reviewForm) });
      setReviewProblem(null); setReviewForm({ confidence: 3, notes: "", mistakes: "" }); fetchProblems();
    } catch { console.error("Failed"); } finally { setReviewing(false); }
  };

  const openEdit = (p: DSAProblem) => { setEditProblem(p); setEditForm({ title: p.title, topic: p.topic, difficulty: p.difficulty, status: p.status, pattern: p.pattern || "", notes: p.notes || "", approach: p.approach || "", mistakes: p.mistakes || "", problemUrl: p.problemUrl || "", leetcodeUrl: p.leetcodeUrl || "" }); };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">DSA Tracker</h1>
          <p className="text-[var(--text-muted)] mt-1">{problems.length} problems tracked{reviewsDue.length > 0 && <span className="text-[var(--warning)] ml-2 font-semibold">· {reviewsDue.length} review{reviewsDue.length > 1 ? "s" : ""} due</span>}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dsa/import" className="btn btn-secondary"><Upload size={18} /><span className="hidden sm:inline">Import</span></Link>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus size={18} /> Add Problem</button>
        </div>
      </header>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search problems, topics..." className="input pl-9 text-sm" />
        </div>
        <select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)} className="input w-auto text-sm">
          <option value="">All Difficulties</option>
          {DIFFICULTY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input w-auto text-sm">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/([A-Z])/g, " $1").trim()}</option>)}
        </select>
        <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} className="input w-auto text-sm">
          <option value="">All Topics</option>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {(search || filterDiff || filterStatus || filterTopic) && (
          <button onClick={() => { setSearch(""); setFilterDiff(""); setFilterStatus(""); setFilterTopic(""); }} className="btn btn-ghost text-sm text-[var(--error)]"><X size={14} /> Clear</button>
        )}
      </div>

      {/* Stats Bar */}
      {!loading && problems.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm">
          {["Easy", "Medium", "Hard"].map((d) => {
            const count = problems.filter(p => p.difficulty === d).length;
            const solved = problems.filter(p => p.difficulty === d && p.status === "Solved").length;
            return (
              <div key={d} className="flex items-center gap-2">
                <span className={`badge ${DIFFICULTY_STYLES[d as keyof typeof DIFFICULTY_STYLES]}`}>{d}</span>
                <span className="text-[var(--text-muted)] font-mono">{solved}/{count}</span>
              </div>
            );
          })}
          <div className="ml-auto text-[var(--text-muted)]">Showing {filtered.length} of {problems.length}</div>
        </div>
      )}

      {/* Problems Table (hidden on mobile) / Cards */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-[var(--text-muted)]">No problems found. Try adjusting filters.</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                  <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">Problem</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">Difficulty</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">Topic</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">Confidence</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[var(--text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prob) => (
                  <tr key={prob.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] group transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">{prob.title}</span>
                        {prob.leetcodeUrl && <a href={prob.leetcodeUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[var(--text-faint)] hover:text-[var(--accent)]"><ExternalLink size={12} /></a>}
                        {prob.reviewAt && new Date(prob.reviewAt) <= new Date() && <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--warning-dim)] text-[var(--warning)]">REVIEW</span>}
                      </div>
                      {prob.pattern && <span className="text-[11px] text-[var(--text-faint)]">{prob.pattern}</span>}
                    </td>
                    <td className="py-3 px-4"><span className={`badge ${DIFFICULTY_STYLES[prob.difficulty]}`}>{prob.difficulty}</span></td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{prob.topic}</td>
                    <td className="py-3 px-4"><StatusBadge status={prob.status} /></td>
                    <td className="py-3 px-4">
                      {prob.confidence ? (
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <span key={n} className={n <= prob.confidence! ? "text-yellow-400" : "text-[var(--bg-elevated)]"}>★</span>)}</div>
                      ) : <span className="text-[var(--text-faint)]">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setReviewProblem(prob); setReviewForm({ confidence: prob.confidence || 3, notes: "", mistakes: "" }); }} className="p-1.5 rounded-lg hover:bg-[var(--accent-dim)] text-[var(--text-muted)] hover:text-[var(--accent)]" title="Review"><RotateCcw size={14} /></button>
                        <button onClick={() => openEdit(prob)} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-white" title="Edit"><ChevronDown size={14} /></button>
                        <button onClick={() => handleDelete(prob.id)} className="p-1.5 rounded-lg hover:bg-[var(--error-dim)] text-[var(--text-muted)] hover:text-[var(--error)]" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((prob) => (
              <div key={prob.id} className="card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[var(--text-primary)]">{prob.title}</span>
                      {prob.leetcodeUrl && <a href={prob.leetcodeUrl} target="_blank" rel="noreferrer" className="text-[var(--text-faint)]"><ExternalLink size={12} /></a>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`badge ${DIFFICULTY_STYLES[prob.difficulty]}`}>{prob.difficulty}</span>
                      <StatusBadge status={prob.status} />
                      <span className="text-xs text-[var(--text-muted)]">{prob.topic}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setReviewProblem(prob); setReviewForm({ confidence: prob.confidence || 3, notes: "", mistakes: "" }); }} className="p-2 rounded-lg hover:bg-[var(--accent-dim)] text-[var(--text-muted)]"><RotateCcw size={14} /></button>
                    <button onClick={() => openEdit(prob)} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><ChevronDown size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && !loading && (
            <div className="flex justify-center pt-6 pb-2">
              <button onClick={() => setPage(p => p + 1)} className="btn btn-secondary">
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Problem Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold">Add Problem</h3><button onClick={() => setShowAdd(false)} className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><X size={20} /></button></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Title <span className="text-[var(--error)]">*</span></label><input className="input" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} placeholder="Two Sum" /></div>
              <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Difficulty</label><select className="input" value={addForm.difficulty} onChange={(e) => setAddForm({ ...addForm, difficulty: e.target.value })}>{DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Status</label><select className="input" value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/([A-Z])/g, " $1").trim()}</option>)}</select></div>
              <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Topic</label><input className="input" value={addForm.topic} onChange={(e) => setAddForm({ ...addForm, topic: e.target.value })} placeholder="Arrays" /></div>
              <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Pattern</label><input className="input" value={addForm.pattern} onChange={(e) => setAddForm({ ...addForm, pattern: e.target.value })} placeholder="Two Pointers" /></div>
              <div className="col-span-2"><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">LeetCode / Problem URL</label><input className="input" value={addForm.problemUrl} onChange={(e) => setAddForm({ ...addForm, problemUrl: e.target.value })} placeholder="https://leetcode.com/problems/..." /></div>
              <div className="col-span-2"><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Notes</label><textarea className="input min-h-[60px]" value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} /></div>
            </div>
            <button onClick={handleAdd} disabled={!addForm.title.trim() || saving} className="btn btn-primary w-full">{saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}{saving ? "Adding..." : "Add Problem"}</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editProblem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setEditProblem(null)}>
          <div className="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold">Edit Problem</h3><button onClick={() => setEditProblem(null)} className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><X size={20} /></button></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Title</label><input className="input" value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Difficulty</label><select className="input" value={editForm.difficulty || ""} onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value as "Easy" | "Medium" | "Hard" })}>{DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Status</label><select className="input" value={editForm.status || ""} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/([A-Z])/g, " $1").trim()}</option>)}</select></div>
              <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Topic</label><input className="input" value={editForm.topic || ""} onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })} /></div>
              <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Pattern</label><input className="input" value={editForm.pattern || ""} onChange={(e) => setEditForm({ ...editForm, pattern: e.target.value })} /></div>
              <div className="col-span-2"><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">LeetCode URL</label><input className="input" value={editForm.leetcodeUrl || ""} onChange={(e) => setEditForm({ ...editForm, leetcodeUrl: e.target.value })} /></div>
              <div className="col-span-2"><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Approach</label><textarea className="input min-h-[60px]" value={editForm.approach || ""} onChange={(e) => setEditForm({ ...editForm, approach: e.target.value })} /></div>
              <div className="col-span-2"><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Notes</label><textarea className="input min-h-[60px]" value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { handleDelete(editProblem.id); setEditProblem(null); }} className="btn btn-danger flex-shrink-0"><Trash2 size={16} /></button>
              <button onClick={handleEdit} disabled={saving} className="btn btn-primary flex-1">{saving ? <Loader2 size={18} className="animate-spin" /> : null}{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewProblem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setReviewProblem(null)}>
          <div className="card p-6 w-full max-w-md space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <div><h3 className="text-lg font-bold">Review Session</h3><p className="text-sm text-[var(--text-muted)] mt-0.5">{reviewProblem.title}</p></div>
              <button onClick={() => setReviewProblem(null)} className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><X size={20} /></button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Confidence (1 = Hard recall, 5 = Easy recall)</label>
              <StarRating value={reviewForm.confidence} onChange={(n) => setReviewForm({ ...reviewForm, confidence: n })} />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Next review: {reviewForm.confidence === 1 ? "Tomorrow" : reviewForm.confidence === 2 ? "In 3 days" : reviewForm.confidence === 3 ? "In 1 week" : reviewForm.confidence === 4 ? "In 2 weeks" : "In 1 month"}
              </p>
            </div>
            <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Mistakes / What to remember</label><textarea className="input min-h-[60px]" value={reviewForm.mistakes} onChange={(e) => setReviewForm({ ...reviewForm, mistakes: e.target.value })} placeholder="Edge cases missed, approach notes..." /></div>
            <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Notes</label><textarea className="input min-h-[50px]" value={reviewForm.notes} onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })} placeholder="Key insights..." /></div>
            <button onClick={handleReview} disabled={reviewing} className="btn btn-primary w-full">{reviewing ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />}{reviewing ? "Saving..." : "Submit Review"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
