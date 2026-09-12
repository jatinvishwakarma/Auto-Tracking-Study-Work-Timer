"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, X, ChevronDown, ChevronUp, Loader2, Trash2 } from "lucide-react";

type InterviewQuestion = {
  id: string;
  category: string;
  subCategory: string | null;
  question: string;
  answer: string | null;
  difficulty: string;
  tags: string | null;
  confidence: number | null;
  reviewAt: string | null;
};

const CATEGORIES = [
  "Java Core", "Collections", "Multithreading", "Streams",
  "SpringBoot", "SQL", "System Design", "Behavioral", "DSA Concepts"
];

const DIFF_STYLES: Record<string, string> = {
  Easy: "bg-[var(--diff-easy-dim)] text-[var(--diff-easy)]",
  Medium: "bg-[var(--diff-medium-dim)] text-[var(--diff-medium)]",
  Hard: "bg-[var(--diff-hard-dim)] text-[var(--diff-hard)]",
};

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} type="button" className={`text-lg transition-transform hover:scale-125 ${n <= value ? "text-yellow-400" : "text-[var(--bg-elevated)]"}`}>★</button>
      ))}
    </div>
  );
}

export default function InterviewQuestionsPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({ question: "", category: "Java Core", difficulty: "Medium", answer: "", tags: "" });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchQuestions = useCallback(async (reset = false) => {
    if (reset) {
      setPage(1);
      setQuestions([]);
    }
    const currentPage = reset ? 1 : page;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage.toString(), limit: "1000" });
      if (activeCategory) params.set("category", activeCategory);
      if (search) params.set("search", search);
      const res = await fetch(`/api/interview-questions?${params}`);
      const json = await res.json();
      const newQuestions = json.data || [];
      if (newQuestions.length < 100) setHasMore(false);
      else setHasMore(true);
      
      setQuestions(prev => reset ? newQuestions : [...prev, ...newQuestions]);
    } catch { console.error("Failed"); }
    finally { setLoading(false); }
  }, [activeCategory, search, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1); // Reset page on filter change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions([]);
  }, [activeCategory, search]);

  useEffect(() => {
    const t = setTimeout(() => fetchQuestions(page === 1), 300);
    return () => clearTimeout(t);
  }, [fetchQuestions, page]);

  const handleConfidence = async (id: string, confidence: number) => {
    try {
      await fetch(`/api/interview-questions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confidence }) });
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, confidence } : q));
    } catch { console.error("Failed"); }
  };

  const handleSaveAnswer = async (id: string) => {
    setSaving(true);
    try {
      await fetch(`/api/interview-questions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer: answerDraft }) });
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, answer: answerDraft } : q));
      setEditingAnswer(null);
    } catch { console.error("Failed"); } finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!addForm.question.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/interview-questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) });
      if (res.ok) { setShowAdd(false); setAddForm({ question: "", category: "Java Core", difficulty: "Medium", answer: "", tags: "" }); fetchQuestions(); }
    } catch { console.error("Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/interview-questions/${id}`, { method: "DELETE" });
    fetchQuestions();
  };

  // Group by category
  const grouped = questions.reduce((acc, q) => {
    (acc[q.category] = acc[q.category] || []).push(q);
    return acc;
  }, {} as Record<string, InterviewQuestion[]>);

  const reviewDue = questions.filter(q => q.reviewAt && new Date(q.reviewAt) <= new Date());

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Interview Questions</h1>
          <p className="text-[var(--text-muted)] mt-1">
            {questions.length} questions
            {reviewDue.length > 0 && <span className="text-[var(--warning)] ml-2 font-semibold">· {reviewDue.length} due for review</span>}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus size={18} /> Add Question</button>
      </header>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions, answers, tags..." className="input pl-9 text-sm w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory("")} className={`badge cursor-pointer transition-all ${!activeCategory ? "bg-[var(--accent-dim)] text-[var(--accent)]" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>All</button>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)} className={`badge cursor-pointer transition-all ${activeCategory === cat ? "bg-[var(--accent-dim)] text-[var(--accent)]" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
              {cat} {grouped[cat] ? `(${grouped[cat].length})` : ""}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : questions.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)] mb-4">No questions found. Add your first one or use the seed script to import a curated bank!</p>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus size={16} /> Add Question</button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, qs]) => (
            <div key={cat}>
              <h2 className="font-bold text-base text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-[var(--border)]" />
                {cat} ({qs.length})
                <span className="h-px flex-1 bg-[var(--border)]" />
              </h2>
              <div className="space-y-2">
                {qs.map((q) => {
                  const expanded = expandedId === q.id;
                  const isDue = q.reviewAt && new Date(q.reviewAt) <= new Date();
                  return (
                    <div key={q.id} className={`card overflow-hidden ${isDue ? "border-[var(--warning)]/30" : ""}`}>
                      <div className="p-4 cursor-pointer" onClick={() => setExpandedId(expanded ? null : q.id)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`badge text-[10px] ${DIFF_STYLES[q.difficulty] || DIFF_STYLES.Medium}`}>{q.difficulty}</span>
                              {q.subCategory && <span className="text-[10px] text-[var(--text-faint)] uppercase font-bold tracking-wider">{q.subCategory}</span>}
                              {isDue && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--warning-dim)] text-[var(--warning)]">REVIEW DUE</span>}
                            </div>
                            <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{q.question}</p>
                            {q.tags && <p className="text-xs text-[var(--text-faint)] mt-1">{q.tags}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {q.confidence && (
                              <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <span key={n} className={`text-xs ${n <= q.confidence! ? "text-yellow-400" : "text-[var(--bg-elevated)]"}`}>★</span>)}</div>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }} className="p-1.5 rounded hover:bg-[var(--error-dim)] text-[var(--text-faint)] hover:text-[var(--error)] opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={12} />
                            </button>
                            {expanded ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
                          </div>
                        </div>
                      </div>

                      {expanded && (
                        <div className="border-t border-[var(--border)] p-4 space-y-4 bg-[var(--bg-elevated)]">
                          {/* Answer */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Answer</label>
                              {editingAnswer !== q.id && (
                                <button onClick={() => { setEditingAnswer(q.id); setAnswerDraft(q.answer || ""); }} className="text-xs text-[var(--accent)] hover:underline">Edit</button>
                              )}
                            </div>
                            {editingAnswer === q.id ? (
                              <div className="space-y-2">
                                <textarea className="input min-h-[100px] text-sm" value={answerDraft} onChange={(e) => setAnswerDraft(e.target.value)} placeholder="Write your answer..." />
                                <div className="flex gap-2">
                                  <button onClick={() => handleSaveAnswer(q.id)} disabled={saving} className="btn btn-primary text-sm px-4">{saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}</button>
                                  <button onClick={() => setEditingAnswer(null)} className="btn btn-ghost text-sm">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                                {q.answer || <span className="text-[var(--text-faint)] italic">No answer yet. Click Edit to add one.</span>}
                              </p>
                            )}
                          </div>

                          {/* Confidence */}
                          <div>
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Confidence</label>
                            <StarRating value={q.confidence || 0} onChange={(n) => handleConfidence(q.id, n)} />
                            {q.confidence && (
                              <p className="text-xs text-[var(--text-faint)] mt-1">
                                Next review: {q.reviewAt ? new Date(q.reviewAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Not scheduled"}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {hasMore && !loading && (
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => setPage(p => p + 1)}
                className="btn btn-secondary"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold">Add Interview Question</h3><button onClick={() => setShowAdd(false)} className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><X size={20} /></button></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Question <span className="text-[var(--error)]">*</span></label><textarea className="input min-h-[70px]" value={addForm.question} onChange={(e) => setAddForm({ ...addForm, question: e.target.value })} placeholder="What is the difference between abstract class and interface?" /></div>
              <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Category</label><select className="input" value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Difficulty</label><select className="input" value={addForm.difficulty} onChange={(e) => setAddForm({ ...addForm, difficulty: e.target.value })}><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select></div>
              <div className="col-span-2"><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Answer (optional)</label><textarea className="input min-h-[80px]" value={addForm.answer} onChange={(e) => setAddForm({ ...addForm, answer: e.target.value })} placeholder="Your answer..." /></div>
              <div className="col-span-2"><label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Tags (comma-separated)</label><input className="input" value={addForm.tags} onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })} placeholder="OOP, inheritance, polymorphism" /></div>
            </div>
            <button onClick={handleAdd} disabled={!addForm.question.trim() || saving} className="btn btn-primary w-full">{saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}{saving ? "Adding..." : "Add Question"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
