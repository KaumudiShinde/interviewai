"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function Header() {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[72px] flex items-center justify-between px-6 border-b border-border-default">
      {/* Left side - Page title / Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer"
          >
            <Search size={20} />
          </button>
          {showSearch && (
            <div className="absolute left-0 top-12 z-50 animate-scale-in">
              <input
                type="text"
                placeholder="Search interviews, reports..."
                className="input-dark w-80 px-4 py-3 rounded-xl text-sm"
                autoFocus
                onBlur={() => setShowSearch(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right side - Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-purple rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-hover transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-text-primary">
                {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-text-muted">
                {user?.email || ""}
              </p>
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-14 w-56 glass-strong rounded-xl overflow-hidden animate-scale-in z-50">
              <div className="p-3 border-b border-border-default">
                <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
              <div className="p-1">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer">
                  <User size={16} />
                  Profile
                </button>
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer">
                  <Settings size={16} />
                  Settings
                </button>
                <button
                  onClick={async () => { await signOut(); router.push("/login"); router.refresh(); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-error hover:bg-error/10 transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
