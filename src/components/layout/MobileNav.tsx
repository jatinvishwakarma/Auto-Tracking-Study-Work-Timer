"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Code2, 
  Server, 
  Menu,
  Timer,
} from "lucide-react";

const mainTabs = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Timer", href: "/time", icon: Timer },
  { name: "DSA", href: "/dsa", icon: Code2 },
  { name: "Design", href: "/system-design", icon: Server },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--bg-base)]/90 backdrop-blur-md pb-safe z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {mainTabs.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 gap-1 p-1 rounded-xl transition-colors ${
                isActive 
                  ? "text-[var(--accent-border)]" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <div className={`p-1.5 rounded-full ${isActive ? "bg-[var(--accent-dim)]" : ""}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
        
        {/* 'More' tab for other sections (Journal, Goals, Analytics, Settings) */}
        <Link
          href="/settings" // Or a dedicated menu page
          className={`flex flex-col items-center justify-center w-16 gap-1 p-1 rounded-xl transition-colors ${
            ["/settings", "/journal", "/goals", "/analytics", "/projects"].some(p => pathname.startsWith(p))
              ? "text-[var(--accent-border)]" 
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <div className="p-1.5 rounded-full">
            <Menu size={22} />
          </div>
          <span className="text-[10px] font-semibold">More</span>
        </Link>
      </div>
    </nav>
  );
}
