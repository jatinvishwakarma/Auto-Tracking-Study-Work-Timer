"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, ExternalLink, GitBranch, Loader2, X, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  techStack: string | null;
  repoUrl: string | null;
  deployUrl: string | null;
  goals: string | null;
  notes: string | null;
  githubRepo: string | null;
  lastSyncedAt: string | null;
};

type ProjectLog = {
  id: string;
  date: string;
  timeSpent: number;
  workedOn: string;
  completed: string | null;
  blockers: string | null;
  nextSteps: string | null;
  githubCommitSha: string | null;
  githubCommitUrl: string | null;
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [logForm, setLogForm] = useState({ timeSpent: 30, workedOn: "", completed: "", blockers: "", nextSteps: "" });

  const fetchData = useCallback(async () => {
    try {
      const [pRes, lRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/logs`),
      ]);
      const pJson = await pRes.json();
      const lJson = await lRes.json();
      setProject(pJson.data);
      setLogs(lJson.data || []);
    } catch { console.error("Failed to load project"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddLog = async () => {
    if (!logForm.workedOn.trim()) return;
    setSavingLog(true);
    try {
      const res = await fetch(`/api/projects/${id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logForm),
      });
      if (res.ok) { setShowLog(false); setLogForm({ timeSpent: 30, workedOn: "", completed: "", blockers: "", nextSteps: "" }); fetchData(); }
    } catch { console.error("Failed"); } finally { setSavingLog(false); }
  };

  const handleGitHubSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/projects/${id}/github-sync`, { method: "POST" });
      if (res.ok) fetchData();
    } catch { console.error("Sync failed"); } finally { setSyncing(false); }
  };

  const handleProgressUpdate = async (progress: number) => {
    try {
      await fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ progress }) });
      if (project) setProject({ ...project, progress });
    } catch { console.error("Failed"); }
  };

  if (loading) return <div className="p-8 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>;
  if (!project) return <div className="p-8 text-center text-[var(--text-muted)]">Project not found. <Link href="/projects" className="text-[var(--accent)]">Go back</Link></div>;

  const totalTime = logs.reduce((s, l) => s + l.timeSpent, 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/projects")} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{project.name}</h1>
          {project.description && <p className="text-[var(--text-muted)] mt-0.5">{project.description}</p>}
        </div>
        <div className="flex gap-2">
          {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary text-sm"><GitBranch size={16} />Repo</a>}
          {project.deployUrl && <a href={project.deployUrl} target="_blank" rel="noreferrer" className="btn btn-secondary text-sm"><ExternalLink size={16} />Live</a>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Info */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="font-bold text-[var(--text-primary)]">Overview</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Status</span><span className="font-semibold text-[var(--text-primary)]">{project.status}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Priority</span><span className="font-semibold text-[var(--text-primary)]">{project.priority}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Total Logs</span><span className="font-mono font-bold">{logs.length}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Time Invested</span><span className="font-mono font-bold">{Math.round(totalTime / 60)}h {totalTime % 60}m</span></div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-[var(--text-muted)]">Progress</span><span className="font-mono text-[var(--text-secondary)]">{project.progress}%</span></div>
              <input type="range" min={0} max={100} value={project.progress} onChange={(e) => handleProgressUpdate(parseInt(e.target.value))} className="w-full accent-[var(--cat-project)] h-1.5" />
            </div>
          </div>

          {project.techStack && (
            <div className="card p-5">
              <h2 className="font-bold text-[var(--text-primary)] mb-3">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.split(",").map((t, i) => (
                  <span key={i} className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">{t.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {project.goals && (
            <div className="card p-5">
              <h2 className="font-bold text-[var(--text-primary)] mb-2">Goals</h2>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{project.goals}</p>
            </div>
          )}

          {project.githubRepo && (
            <div className="card p-5">
              <h2 className="font-bold text-[var(--text-primary)] mb-3">GitHub</h2>
              <p className="text-sm text-[var(--text-muted)] mb-3">{project.githubRepo}</p>
              <button onClick={handleGitHubSync} disabled={syncing} className="btn btn-secondary w-full text-sm">
                {syncing ? <Loader2 size={14} className="animate-spin" /> : <GitBranch size={14} />}
                {syncing ? "Syncing..." : "Sync Commits"}
              </button>
              {project.lastSyncedAt && <p className="text-xs text-[var(--text-faint)] mt-2">Last synced: {format(new Date(project.lastSyncedAt), "MMM d, h:mm a")}</p>}
            </div>
          )}
        </div>

        {/* Right — Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-[var(--text-primary)]">Work Logs</h2>
            <button onClick={() => setShowLog(true)} className="btn btn-primary text-sm"><Plus size={16} /> Log Session</button>
          </div>

          {logs.length === 0 ? (
            <div className="card p-10 text-center text-[var(--text-muted)]">No logs yet. Record your first session!</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="card p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{format(new Date(log.date), "EEE, MMM d")}</span>
                      <span className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1"><Clock size={11} />{log.timeSpent}m</span>
                      {log.githubCommitUrl && (
                        <a href={log.githubCommitUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                          <GitBranch size={11} />{log.githubCommitSha?.slice(0, 7)}
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{log.workedOn}</p>
                  {log.completed && (
                    <div className="flex items-start gap-1.5 text-xs text-[var(--success)]">
                      <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" /><span>{log.completed}</span>
                    </div>
                  )}
                  {log.blockers && (
                    <div className="flex items-start gap-1.5 text-xs text-[var(--error)]">
                      <AlertCircle size={13} className="mt-0.5 flex-shrink-0" /><span>{log.blockers}</span>
                    </div>
                  )}
                  {log.nextSteps && <p className="text-xs text-[var(--text-faint)] italic">Next: {log.nextSteps}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Log Modal */}
      {showLog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowLog(false)}>
          <div className="card p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold">Log Work Session</h3><button onClick={() => setShowLog(false)} className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><X size={20} /></button></div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Time Spent (minutes)</label>
              <input type="number" min={1} className="input" value={logForm.timeSpent} onChange={(e) => setLogForm({ ...logForm, timeSpent: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">What did you work on? <span className="text-[var(--error)]">*</span></label>
              <textarea className="input min-h-[70px]" value={logForm.workedOn} onChange={(e) => setLogForm({ ...logForm, workedOn: e.target.value })} placeholder="Features built, code written..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">What did you complete?</label>
              <textarea className="input min-h-[50px]" value={logForm.completed} onChange={(e) => setLogForm({ ...logForm, completed: e.target.value })} placeholder="Completed items..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Blockers?</label>
              <input className="input" value={logForm.blockers} onChange={(e) => setLogForm({ ...logForm, blockers: e.target.value })} placeholder="Any issues or blockers..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Next Steps</label>
              <input className="input" value={logForm.nextSteps} onChange={(e) => setLogForm({ ...logForm, nextSteps: e.target.value })} placeholder="What to tackle next..." />
            </div>
            <button onClick={handleAddLog} disabled={!logForm.workedOn.trim() || savingLog} className="btn btn-primary w-full">
              {savingLog ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}{savingLog ? "Saving..." : "Save Log"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
