"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Bot,
  CircleHelp,
  FileText,
  Inbox,
  Layers3,
  Moon,
  Settings,
  Sun,
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const storedDark = useSyncExternalStore(
    subscribeToTheme,
    getStoredTheme,
    getServerTheme,
  );
  const [themeOverride, setThemeOverride] = useState<boolean | null>(null);
  const dark = themeOverride ?? storedDark;
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("loop-theme", dark ? "dark" : "light");
  }, [dark]);
  const item = ([label, href, Icon]: [string, string, LucideIcon]) => (
    <Link
      key={href}
      href={href}
      className={`nav-item ${pathname === href ? "nav-active" : ""}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[var(--line)] bg-[var(--surface)] px-4 py-5 lg:flex lg:flex-col">
        <Link href="/dashboard" className="mb-9 flex items-center gap-3 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-lg font-black text-white">
            L
          </span>
          <span className="text-xl font-bold tracking-tight">LOOP</span>
        </Link>
        <p className="section-label px-2">Workspace</p>
        <nav className="mt-2 space-y-1">{navigation.map(item)}</nav>
        <p className="section-label mt-8 px-2">Support</p>
        <nav className="mt-2 space-y-1">
          {secondary.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href ? "nav-active" : ""}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3">
          <p className="text-sm font-semibold">Acme workspace</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Product intelligence
          </p>
        </div>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[var(--surface)]/90 px-5 backdrop-blur lg:px-9">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold lg:hidden"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
              L
            </span>
            LOOP
          </Link>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle color theme"
              onClick={() => setThemeOverride(!dark)}
              className="icon-button"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
              AK
            </span>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-9">{children}</div>
      </main>
    </div>
  );
}
