"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink, Loader2, X, Trash2, GitBranch } from "lucide-react";

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
  _count?: { logs: number };
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Planned: { bg: "var(--bg-elevated)", text: "var(--text-muted)" },
  Active: { bg: "var(--success-dim)", text: "var(--success)" },
  OnHold: { bg: "var(--warning-dim)", text: "var(--warning)" },
  Completed: { bg: "var(--cat-dsa-dim)", text: "var(--cat-dsa)" },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  Low: { bg: "var(--success-dim)", text: "var(--success)" },
  Medium: { bg: "var(--warning-dim)", text: "var(--warning)" },
  High: { bg: "var(--error-dim)", text: "var(--error)" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", techStack: "", repoUrl: "", priority: "Medium", goals: "" });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      setProjects(json.data || []);
    } catch {
      console.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", description: "", techStack: "", repoUrl: "", priority: "Medium", goals: "" });
        setShowAdd(false);
        await fetchProjects();
      }
    } catch {
      console.error("Failed to add project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project and all its logs?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      await fetchProjects();
    } catch {
      console.error("Failed to delete");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    } catch {
      console.error("Failed to update status");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Projects</h1>
          <p className="text-[var(--text-muted)] mt-1">Track your side projects and portfolio work.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus size={18} /> New Project
        </button>
      </header>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">New Project</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Project Name <span className="text-[var(--error)]">*</span></label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Portfolio App" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Description</label>
                <textarea className="input min-h-[60px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Tech Stack</label>
                <input className="input" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="Next.js, Tailwind, Prisma" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Priority</label>
                <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Repo URL</label>
                <input className="input" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} placeholder="https://github.com/..." />
              </div>
            </div>
            <button onClick={handleAdd} disabled={!form.name.trim() || saving} className="btn btn-primary w-full">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {saving ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-48 rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center text-[var(--text-muted)]">
          No projects yet. Click &quot;New Project&quot; to start tracking!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const status = STATUS_STYLES[project.status] || STATUS_STYLES.Planned;
            const priority = PRIORITY_STYLES[project.priority] || PRIORITY_STYLES.Medium;
            return (
              <div key={project.id} className="card p-5 space-y-4 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-[var(--text-primary)] truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-dim)] opacity-0 group-hover:opacity-100 transition-all ml-2">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusUpdate(project.id, e.target.value)}
                    className="badge cursor-pointer border-0 appearance-none pr-6"
                    style={{ backgroundColor: status.bg, color: status.text }}
                  >
                    <option value="Planned">Planned</option>
                    <option value="Active">Active</option>
                    <option value="OnHold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <span className="badge" style={{ backgroundColor: priority.bg, color: priority.text }}>
                    {project.priority}
                  </span>
                </div>

                {project.techStack && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.split(",").map((tech, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress */}
                <div>
                  <div className="h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--cat-project)] transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] mt-1">{project.progress}% complete</span>
                </div>

                <div className="flex items-center gap-3 pt-1 border-t border-[var(--border)]">
                  {project.repoUrl && (
                    <a href={project.repoUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                      <GitBranch size={12} /> Repo
                    </a>
                  )}
                  {project.deployUrl && (
                    <a href={project.deployUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
                      <ExternalLink size={12} /> Live
                    </a>
                  )}
                  <span className="text-xs text-[var(--text-muted)] ml-auto">{project._count?.logs || 0} logs</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
