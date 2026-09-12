"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Code2, 
  Server, 
  Briefcase, 
  BookOpen, 
  Target, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Timer,
  MessageCircle,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Timer", href: "/time", icon: Timer },
  { name: "DSA Tracker", href: "/dsa", icon: Code2 },
  { name: "System Design", href: "/system-design", icon: Server },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Interview Q&A", href: "/interview-questions", icon: MessageCircle },
  { name: "Mock Interview", href: "/mock-interview", icon: MessageCircle },
  { name: "Study Plans", href: "/study-plans", icon: GraduationCap },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`hidden md:flex flex-col border-r border-[var(--border)] bg-[var(--bg-base)] h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)] h-[73px]">
        {!collapsed && (
          <span className="font-bold text-xl tracking-tight text-[var(--text-primary)] truncate">
            PrepTracker
          </span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mx-auto"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive 
                  ? "bg-[var(--accent-dim)] text-[var(--accent-border)] font-semibold" 
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={22} className={isActive ? "text-[var(--accent-border)]" : "text-[var(--text-muted)]"} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={() => signOut()}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={22} className="text-[var(--text-muted)]" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
