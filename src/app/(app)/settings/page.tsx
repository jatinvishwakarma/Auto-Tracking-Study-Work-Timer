"use client";

import { Settings as SettingsIcon, User, Clock, LogOut, Shield } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
          <SettingsIcon className="text-[var(--accent)]" />
          Settings
        </h1>
        <p className="text-[var(--text-muted)] mt-1">Manage your profile and preferences.</p>
      </header>

      {/* Profile Section */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
          <User size={20} className="text-[var(--text-muted)]" />
          Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Name</label>
            <div className="input bg-[var(--bg-elevated)] cursor-not-allowed opacity-70">
              {session?.user?.name || "User"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Email</label>
            <div className="input bg-[var(--bg-elevated)] cursor-not-allowed opacity-70">
              {session?.user?.email || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
          <Clock size={20} className="text-[var(--text-muted)]" />
          Preferences
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Timezone</label>
            <div className="input bg-[var(--bg-elevated)] cursor-not-allowed opacity-70">
              Asia/Kolkata (IST)
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Configured via APP_TIME_ZONE env variable</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Theme</label>
            <div className="input bg-[var(--bg-elevated)] cursor-not-allowed opacity-70">
              Dark Mode
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Light mode coming in a future update</p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
          <Shield size={20} className="text-[var(--text-muted)]" />
          Security
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          You are authenticated via password-based credentials. Your session is valid for 30 days.
        </p>
      </div>

      {/* About */}
      <div className="card p-6 space-y-3">
        <h2 className="font-bold text-lg text-[var(--text-primary)]">About</h2>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">App</span>
            <span className="font-semibold">PrepTracker</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Version</span>
            <span className="font-mono">0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Stack</span>
            <span>Next.js 16 · Prisma · PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn btn-danger w-full py-3"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
