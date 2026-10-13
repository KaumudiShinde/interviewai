"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Compass,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/interview/setup", icon: MessageSquare, label: "Interviews" },
  { href: "/dashboard/reports", icon: BarChart3, label: "Reports" },
  { href: "/dashboard/career-coach", icon: Compass, label: "Career Coach" },
  { href: "/dashboard", icon: Settings, label: "Settings" },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full z-40
        glass-strong flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-border-default">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center flex-shrink-0">
          <Sparkles size={20} className="text-white" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold font-[family-name:var(--font-outfit)] gradient-text animate-fade-in">
            InterView AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl
                transition-all duration-200 group relative
                ${
                  isActive
                    ? "bg-gradient-to-r from-accent-blue/15 to-accent-purple/15 text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-gradient-to-b from-accent-blue to-accent-purple" />
              )}

              <item.icon
                size={20}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? "text-accent-purple" : "group-hover:text-accent-blue"
                }`}
              />

              {!isCollapsed && (
                <span className="text-sm font-medium animate-fade-in">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 pb-3 space-y-2">
        {/* Logout */}
        <button
          onClick={async () => { await signOut(); router.push("/login"); router.refresh(); }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl w-full
            text-text-secondary hover:text-error hover:bg-error/10
            transition-all duration-200 cursor-pointer"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-xl
            text-text-muted hover:text-text-primary hover:bg-surface-hover
            transition-all duration-200 cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>
    </aside>
  );
}
