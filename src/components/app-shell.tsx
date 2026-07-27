"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Bot,
  CircleHelp,
  ChevronDown,
  FileText,
  Inbox,
  Layers3,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

const navigation: [string, string, LucideIcon][] = [
  ["Dashboard", "/dashboard", BarChart3],
  ["Inbox", "/inbox", Inbox],
  ["Trends", "/trends", Layers3],
  ["Ask LOOP", "/ask", Bot],
  ["Reports", "/reports", FileText],
];
const secondary: [string, string, LucideIcon][] = [
  ["Settings", "/settings", Settings],
  ["Help", "/help", CircleHelp],
  ["About", "/about", BookOpen],
];
const subscribeToTheme = () => () => undefined;
const getStoredTheme = () => localStorage.getItem("loop-theme") === "dark";
const getServerTheme = () => false;

export function AppShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } }) {
  const pathname = usePathname();
  const storedDark = useSyncExternalStore(
    subscribeToTheme,
    getStoredTheme,
    getServerTheme,
  );
  const [themeOverride, setThemeOverride] = useState<boolean | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const dark = themeOverride ?? storedDark;
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("loop-theme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <div className="workspace-shell min-h-screen bg-[#f7f8fc] text-slate-900 dark:bg-[#111421] dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 bg-[#0b1228] px-4 py-6 text-indigo-100 lg:flex lg:flex-col">
        <Link href="/dashboard" className="mb-10 flex items-center gap-3 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-500 text-lg font-black text-white shadow-lg shadow-indigo-500/30">
            L
          </span>
          <span>
            <strong className="block text-lg tracking-tight text-white">
              Project LOOP
            </strong>
            <small className="text-[10px] text-indigo-200/60">
              AI Feedback Intelligence
            </small>
          </span>
        </Link>
        <p className="px-3 text-[10px] font-bold uppercase tracking-[.16em] text-indigo-200/45">
          Workspace
        </p>
        <nav className="mt-2 space-y-1">
          {navigation.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === href ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/30" : "text-indigo-100/65 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <p className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-indigo-200/45">
          Workspace tools
        </p>
        <nav className="mt-2 space-y-1">
          {secondary.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === href ? "bg-white/10 text-white" : "text-indigo-100/65 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="relative mt-auto border-t border-white/10 pt-4">
          {accountOpen && (
            <div className="absolute bottom-full mb-3 w-full rounded-xl border border-white/10 bg-[#161d38] p-2 shadow-xl">
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-indigo-100 hover:bg-white/10"
              >
                <UserRound size={15} />
                Account settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-200 hover:bg-rose-400/10"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
          <button
            onClick={() => setAccountOpen((value) => !value)}
            className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-bold text-white">
              {user.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm text-white">
                {user.name}
              </strong>
              <small className="block truncate text-xs text-indigo-200/55">
                {user.email}
              </small>
            </span>
            <ChevronDown size={15} className="text-indigo-200/60" />
          </button>
        </div>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur dark:border-slate-800 dark:bg-[#171b25]/90 lg:px-9">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold lg:hidden"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
              L
            </span>
            LOOP
          </Link>
          <div className="hidden flex-1 lg:block">
            <label className="ml-auto flex w-72 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900">
              <span>⌕</span>
              <input
                className="w-full bg-transparent outline-none"
                placeholder="Search feedback, users, reports..."
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle color theme"
              onClick={() => setThemeOverride(!dark)}
              className="icon-button"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setAccountOpen((value) => !value)}
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-bold text-white lg:hidden"
            >
              {user.name.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-9">{children}</div>
      </main>
    </div>
  );
}
