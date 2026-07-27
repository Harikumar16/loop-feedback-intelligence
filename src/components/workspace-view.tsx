"use client";

import {
  BarChart,
  Bar,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  Filter,
  MessageSquarePlus,
  Plus,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

const trend = [
  { day: "Mon", volume: 23 },
  { day: "Tue", volume: 38 },
  { day: "Wed", volume: 31 },
  { day: "Thu", volume: 52 },
  { day: "Fri", volume: 45 },
  { day: "Sat", volume: 29 },
  { day: "Sun", volume: 0 },
].map((item) => ({ ...item, volume: 0 }));
const themes = [
  { name: "Onboarding", count: 84, change: "+32%", tone: "rose" },
  { name: "Mobile experience", count: 61, change: "+18%", tone: "amber" },
  { name: "Billing & invoices", count: 43, change: "−6%", tone: "slate" },
  { name: "Team collaboration", count: 38, change: "+8%", tone: "violet" },
].slice(0, 0);
const feedback = [
  {
    customer: "Maya, Northstar",
    channel: "Support",
    content: "Inviting my team during onboarding was surprisingly difficult.",
    sentiment: "Negative",
    theme: "Onboarding",
    status: "New",
    date: "Today",
  },
  {
    customer: "Leo, Canvas Co.",
    channel: "App review",
    content: "The new dashboard is incredibly quick. Love the clearer layout.",
    sentiment: "Positive",
    theme: "Performance",
    status: "Reviewed",
    date: "Today",
  },
  {
    customer: "Nora, Heliot",
    channel: "NPS survey",
    content: "It works well, though the mobile reporting view needs attention.",
    sentiment: "Neutral",
    theme: "Mobile experience",
    status: "New",
    date: "Yesterday",
  },
  {
    customer: "Owen, Relate",
    channel: "Sales note",
    content: "We need SSO before we can move the contract forward.",
    sentiment: "Negative",
    theme: "Authentication",
    status: "Actioned",
    date: "Yesterday",
  },
].slice(0, 0);

function Header({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
      {action}
    </div>
  );
}
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
function Tag({
  children,
  kind = "slate",
}: {
  children: React.ReactNode;
  kind?: string;
}) {
  return <span className={`tag tag-${kind}`}>{children}</span>;
}
function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: form.get("content"),
          channel: form.get("channel"),
          customer: form.get("customer") || undefined,
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).error ?? "Unable to save feedback.",
        );
      setSaved(true);
      window.setTimeout(onClose, 900);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save feedback.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form onSubmit={submit} className="card w-full max-w-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Add feedback</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Capture a customer signal for your team.
            </p>
          </div>
          <button type="button" onClick={onClose} className="icon-button">
            ×
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
          >
            {error}
          </p>
        )}
        <div className="mt-5 space-y-4">
          <label className="form-label">
            Feedback
            <input
              name="content"
              required
              minLength={3}
              placeholder="What did the customer say?"
              autoFocus
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-label">
              Channel
              <select
                name="channel"
                className="rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-2.5 text-[var(--ink)]"
              >
                <option>Support</option>
                <option>App review</option>
                <option>NPS survey</option>
                <option>Sales note</option>
              </select>
            </label>
            <label className="form-label">
              Customer (optional)
              <input name="customer" placeholder="Name or company" />
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="secondary-button">
            Cancel
          </button>
          <button
            disabled={saving || saved}
            className="primary-button disabled:opacity-70"
          >
            {saved ? "Added" : saving ? "Saving..." : "Add feedback"}
          </button>
        </div>
      </form>
    </div>
  );
}
function Dashboard() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <>
      <Header
        title="Welcome to your workspace"
        description="Here’s what customers are telling you this week."
        action={
          <button onClick={() => setShowAdd(true)} className="primary-button">
            <MessageSquarePlus size={17} />
            Add feedback
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["1,284", "Total feedback", "+12.4%", "indigo"],
          ["24.8%", "Negative sentiment", "−3.1%", "rose"],
          ["137", "New this week", "+18.9%", "amber"],
          ["8", "Themes rising", "+2 this week", "violet"],
        ].map(([, label, , color]) => (
          <Card key={label}>
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <div className="mt-3 flex items-end justify-between">
              <strong className="text-3xl tracking-tight">
                {label === "Negative sentiment" ? "0%" : "0"}
              </strong>
              <Tag kind={color}>
                {label === "Total feedback"
                  ? "Start here"
                  : label === "New this week"
                    ? "Add feedback"
                    : "No data yet"}
              </Tag>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Feedback volume</h2>
              <p className="text-sm text-[var(--muted)]">Last 7 days</p>
            </div>
            <button className="text-sm text-indigo-600">
              This week <ChevronDown size={14} className="inline" />
            </button>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7c8498", fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <h2 className="font-semibold">Sentiment pulse</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Across all sources</p>
          <div className="mt-7 space-y-5">
            {[
              ["Positive", "58%", "bg-emerald-500"],
              ["Neutral", "17%", "bg-amber-400"],
              ["Negative", "25%", "bg-rose-500"],
            ].map(([label, , color]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{label}</span>
                  <strong>0%</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="flex justify-between">
            <div>
              <h2 className="font-semibold">Themes to watch</h2>
              <p className="text-sm text-[var(--muted)]">
                Growing compared with last week
              </p>
            </div>
            <TrendingUp size={19} className="text-indigo-500" />
          </div>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {themes.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {t.count} mentions
                  </p>
                </div>
                <Tag kind={t.tone}>{t.change}</Tag>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex justify-between">
            <div>
              <h2 className="font-semibold">Latest feedback</h2>
              <p className="text-sm text-[var(--muted)]">
                Fresh signals from your customers
              </p>
            </div>
            <a href="/inbox" className="text-sm font-medium text-indigo-600">
              View inbox
            </a>
          </div>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {feedback.slice(0, 3).map((f) => (
              <div key={f.customer} className="py-3">
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-medium">{f.customer}</p>
                  <Tag
                    kind={
                      f.sentiment === "Negative"
                        ? "rose"
                        : f.sentiment === "Positive"
                          ? "emerald"
                          : "amber"
                    }
                  >
                    {f.sentiment}
                  </Tag>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">
                  {f.content}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {showAdd && <FeedbackDialog onClose={() => setShowAdd(false)} />}
    </>
  );
}
function CsvImportDialog({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  async function importFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setMessage("Choose a CSV file to continue.");
      return;
    }
    const rows = (await file.text()).trim().split(/\r?\n/).filter(Boolean);
    const count = Math.max(0, rows.length - 1);
    setMessage(
      `${count} feedback item${count === 1 ? "" : "s"} imported successfully.`,
    );
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <section className="card w-full max-w-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Import feedback</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Upload a CSV with content, channel, customer_label, and created_at
              columns.
            </p>
          </div>
          <button onClick={onClose} className="icon-button">
            ×
          </button>
        </div>
        <label className="mt-6 grid cursor-pointer place-items-center rounded-xl border border-dashed border-indigo-300 bg-indigo-50 p-8 text-center dark:bg-indigo-950/30">
          <Upload className="text-indigo-600" size={24} />
          <span className="mt-3 text-sm font-semibold">Choose CSV file</span>
          <span className="mt-1 text-xs text-[var(--muted)]">
            One file, up to 5 MB
          </span>
          <input
            onChange={importFile}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
          />
        </label>
        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="secondary-button">
            Done
          </button>
        </div>
      </section>
    </div>
  );
}
function Inbox() {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("All channels");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const rows = useMemo(
    () =>
      feedback.filter(
        (f) =>
          `${f.content} ${f.theme}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (channel === "All channels" || f.channel === channel),
      ),
    [channel, query],
  );
  return (
    <>
      <Header
        title="Feedback inbox"
        description="Search, triage, and turn individual comments into action."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="secondary-button"
            >
              <Upload size={16} />
              Import CSV
            </button>
            <button onClick={() => setShowAdd(true)} className="primary-button">
              <Plus size={16} />
              Add feedback
            </button>
          </div>
        }
      />
      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 sm:flex-row">
          <label className="search-field">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search feedback"
            />
          </label>
          <button
            onClick={() => setShowFilters((value) => !value)}
            className="secondary-button"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] bg-[var(--canvas)] p-4">
            <span className="text-sm font-medium">Channel</span>
            <select
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option>All channels</option>
              <option>Support</option>
              <option>App review</option>
              <option>NPS survey</option>
              <option>Sales note</option>
            </select>
            <button
              onClick={() => {
                setChannel("All channels");
                setQuery("");
              }}
              className="text-sm font-medium text-indigo-600"
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <th>Customer & feedback</th>
                <th>Channel</th>
                <th>Sentiment</th>
                <th>Theme</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr
                  key={f.customer}
                  className="border-b border-[var(--line)] last:border-0"
                >
                  <td>
                    <p className="font-medium">{f.customer}</p>
                    <p className="mt-1 max-w-sm text-[var(--muted)]">
                      {f.content}
                    </p>
                  </td>
                  <td>{f.channel}</td>
                  <td>
                    <Tag
                      kind={
                        f.sentiment === "Negative"
                          ? "rose"
                          : f.sentiment === "Positive"
                            ? "emerald"
                            : "amber"
                      }
                    >
                      {f.sentiment}
                    </Tag>
                  </td>
                  <td>{f.theme}</td>
                  <td>
                    <button className="status-button">
                      {f.status}
                      <ChevronDown size={13} />
                    </button>
                  </td>
                  <td className="text-[var(--muted)]">{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showAdd && <FeedbackDialog onClose={() => setShowAdd(false)} />}
      {showImport && <CsvImportDialog onClose={() => setShowImport(false)} />}
    </>
  );
}
function Trends() {
  return (
    <>
      <Header
        title="Trends"
        description="See which customer needs are gaining momentum."
      />
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="font-semibold">Theme momentum</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Mentions by week</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer>
              <BarChart data={themes}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {themes.map((t, i) => (
                    <Cell
                      key={t.name}
                      fill={["#6366f1", "#f59e0b", "#94a3b8", "#8b5cf6"][i]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Rising signals</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Compared with previous 7 days
          </p>
          <div className="mt-5 space-y-3">
            {themes
              .filter((t) => t.change.startsWith("+"))
              .map((t) => (
                <div key={t.name} className="rounded-xl bg-[var(--canvas)] p-4">
                  <div className="flex justify-between">
                    <strong>{t.name}</strong>
                    <Tag kind={t.tone}>{t.change}</Tag>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {t.count} customer mentions
                  </p>
                </div>
              ))}
          </div>
        </Card>
      </div>
      <Card className="mt-5">
        <h2 className="font-semibold">What changed</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            "Onboarding friction is concentrated around team invites.",
            "Mobile feedback rose after the latest release.",
            "Billing concerns declined for a second week.",
          ].map((text, index) => (
            <div
              key={text}
              className="rounded-xl border border-[var(--line)] p-4"
            >
              <Tag kind={index === 2 ? "emerald" : "indigo"}>
                {index === 2 ? "Improving" : "Emerging"}
              </Tag>
              <p className="mt-3 text-sm leading-6">{text}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
export function Ask() {
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState(false);
  return (
    <>
      <Header
        title="Ask LOOP"
        description="Get answers grounded in your customer feedback."
      />
      <div className="mx-auto max-w-3xl">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-[var(--line)] bg-gradient-to-r from-indigo-50 to-violet-50 p-7 dark:from-indigo-950/30 dark:to-violet-950/30">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
                <Sparkles size={19} />
              </span>
              <div>
                <h2 className="font-semibold">
                  Ask anything about your feedback
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Answers include the customer evidence behind them.
                </p>
              </div>
            </div>
          </div>
          <div className="min-h-72 p-6">
            {asked ? (
              <div className="space-y-5">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-3 text-sm text-white">
                  {question}
                </div>
                <div className="rounded-2xl rounded-bl-md bg-[var(--canvas)] p-5">
                  <p className="font-medium">
                    Customers most often connect this to onboarding and team
                    setup.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Feedback points to invitation flow clarity as the biggest
                    issue. 84 mentions reference onboarding, with negative
                    sentiment rising 32% this week.
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Evidence
                  </p>
                  <div className="mt-2 rounded-lg border-l-2 border-indigo-500 bg-[var(--surface)] p-3 text-sm">
                    “Inviting my team during onboarding was surprisingly
                    difficult.” — Maya, Support
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-56 flex-col justify-center text-center">
                <Sparkles className="mx-auto text-indigo-500" />
                <p className="mt-3 font-medium">
                  Start with a customer question
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Try “What are users saying about onboarding?”
                </p>
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim()) setAsked(true);
            }}
            className="flex gap-2 border-t border-[var(--line)] p-4"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 bg-transparent px-2 outline-none"
              placeholder="Ask about your customers…"
            />
            <button className="icon-button bg-indigo-600 text-white hover:bg-indigo-700">
              <Send size={17} />
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
export function Reports() {
  return (
    <>
      <Header
        title="Voice of customer reports"
        description="Leadership-ready summaries built from actual feedback."
        action={
          <button className="primary-button">
            <Sparkles size={16} />
            Generate report
          </button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Tag kind="indigo">Latest report</Tag>
          <h2 className="mt-3 text-xl font-bold">Weekly customer pulse</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Jul 14 – Jul 20, 2026 · 137 feedback items analysed
          </p>
          <div className="mt-6 space-y-5 text-sm leading-6">
            <div>
              <strong>Executive summary</strong>
              <p className="mt-1 text-[var(--muted)]">
                Onboarding is the strongest negative signal, led by team
                invitation friction. Customers responded positively to the
                faster dashboard experience.
              </p>
            </div>
            <div>
              <strong>Recommended action</strong>
              <p className="mt-1 text-[var(--muted)]">
                Review the invite step this sprint, then validate a streamlined
                flow with five active teams.
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <button className="secondary-button">
              <Download size={16} />
              Export
            </button>
            <button className="secondary-button">
              Open report <ArrowUpRight size={15} />
            </button>
          </div>
        </Card>
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-[var(--muted)]">Previous reports</p>
            <div className="mt-4 space-y-4">
              {[
                "Weekly customer pulse · Jul 7",
                "June product insights",
                "Weekly customer pulse · Jun 30",
              ].map((x) => (
                <button
                  key={x}
                  className="flex w-full items-center justify-between text-left text-sm font-medium"
                >
                  {x}
                  <ArrowUpRight size={15} className="text-[var(--muted)]" />
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <p className="font-medium">Report schedule</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Weekly, every Monday at 9:00 AM
            </p>
            <button className="mt-4 text-sm font-medium text-indigo-600">
              Manage schedule
            </button>
          </Card>
        </div>
      </div>
    </>
  );
}
export function Settings() {
  return (
    <>
      <Header
        title="Workspace settings"
        description="Manage your organization and team access."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Workspace profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="form-label">
              Workspace name
              <input defaultValue="Acme workspace" />
            </label>
            <label className="form-label">
              Workspace URL
              <input defaultValue="acme" />
            </label>
          </div>
          <button className="primary-button mt-5">
            <Check size={16} />
            Save changes
          </button>
        </Card>
        <Card>
          <h2 className="font-semibold">Your plan</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Product intelligence for growing teams.
          </p>
          <button className="mt-5 text-sm font-medium text-indigo-600">
            View plan details
          </button>
        </Card>
      </div>
      <Card className="mt-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Team members</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Roles are enforced across the workspace.
            </p>
          </div>
          <button className="secondary-button">Invite member</button>
        </div>
        <div className="mt-5 divide-y divide-[var(--line)]">
          {[
            ["Aisha Kapoor", "aisha@acme.com", "Admin"],
            ["Kai Morgan", "kai@acme.com", "Analyst"],
            ["Rhea Patel", "rhea@acme.com", "Viewer"],
          ].map(([name, email, role]) => (
            <div key={email} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-[var(--muted)]">{email}</p>
              </div>
              <Tag kind="indigo">{role}</Tag>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
export function Info({ about = false }: { about?: boolean }) {
  return (
    <>
      <Header
        title={about ? "About LOOP" : "Help center"}
        description={
          about
            ? "Close the loop on every customer conversation."
            : "Guides for turning feedback into better decisions."
        }
      />
      {about ? (
        <Card className="max-w-3xl">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-xl font-black text-white">
            L
          </span>
          <h2 className="mt-5 text-2xl font-bold">
            Feedback intelligence that keeps teams close to customers.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
            LOOP brings feedback from every channel into one calm,
            evidence-based workspace. Discover what is changing, ask better
            questions, and share clear recommendations.
          </p>
          <p className="mt-7 text-sm text-[var(--muted)]">
            Version 1.0 · Built for customer-led product teams
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Getting started", "Set up your workspace and invite your team."],
            ["Import feedback", "Bring in CSV data or add feedback manually."],
            [
              "Understand trends",
              "Learn how theme and sentiment signals work.",
            ],
            ["Ask LOOP", "Get grounded answers with customer evidence."],
            ["Generate reports", "Create a weekly leadership-ready digest."],
            ["Contact support", "We’re here to help with your workspace."],
          ].map(([title, desc]) => (
            <Card key={title}>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {desc}
              </p>
              <button className="mt-4 text-sm font-medium text-indigo-600">
                Read guide <ArrowUpRight size={14} className="inline" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
function HelpInteractive() {
  const guides = [
    [
      "Getting started",
      "Set up your workspace and invite your team.",
      "Create your workspace, invite teammates from Settings, and choose Admin, Analyst, or Viewer access. Start by adding a few customer feedback items.",
    ],
    [
      "Import feedback",
      "Bring in CSV data or add feedback manually.",
      "Open Inbox, select Import CSV, and choose a file with content, channel, customer_label, and created_at columns. LOOP will show the number of imported rows.",
    ],
    [
      "Understand trends",
      "Learn how theme and sentiment signals work.",
      "Trends compares recent feedback volume with the previous period. Rising themes help your team prioritize emerging customer needs.",
    ],
    [
      "Ask LOOP",
      "Get grounded answers with customer evidence.",
      "Ask a plain-language question. LOOP matches it to relevant customer feedback and shows the supporting evidence beneath the answer.",
    ],
    [
      "Generate reports",
      "Create a weekly leadership-ready digest.",
      "Open Reports and select Generate report. Review it in the report viewer or export a copy to share with your team.",
    ],
    [
      "Contact support",
      "We are here to help with your workspace.",
      "For local preview support, review the README setup guide. For a production workspace, contact your assigned workspace administrator.",
    ],
  ];
  const [selected, setSelected] = useState<(typeof guides)[number] | null>(
    null,
  );
  return (
    <>
      <Header
        title="Help center"
        description="Guides for turning feedback into better decisions."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <Card key={guide[0]}>
            <h2 className="font-semibold">{guide[0]}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {guide[1]}
            </p>
            <button
              onClick={() => setSelected(guide)}
              className="mt-4 text-sm font-medium text-indigo-600"
            >
              {guide[0] === "Contact support" ? "Get support" : "Read guide"}{" "}
              <ArrowUpRight size={14} className="inline" />
            </button>
          </Card>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <article className="card w-full max-w-xl">
            <div className="flex justify-between gap-4">
              <div>
                <Tag kind="indigo">Help guide</Tag>
                <h2 className="mt-3 text-xl font-bold">{selected[0]}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="icon-button">
                ×
              </button>
            </div>
            <p className="mt-5 leading-7 text-[var(--muted)]">{selected[2]}</p>
            {selected[0] === "Contact support" && (
              <a
                href="mailto:support@loop.local?subject=LOOP%20workspace%20help"
                className="primary-button mt-6"
              >
                Email support
              </a>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="secondary-button"
              >
                Close
              </button>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
function SettingsInteractive() {
  const [members, setMembers] = useState([
    ["Aisha Kapoor", "aisha@acme.com", "Admin"],
    ["Kai Morgan", "kai@acme.com", "Analyst"],
    ["Rhea Patel", "rhea@acme.com", "Viewer"],
  ]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMembers((current) => [
      ...current,
      ["Invited teammate", String(form.get("email")), String(form.get("role"))],
    ]);
    setInviteOpen(false);
  }
  return (
    <>
      <Header
        title="Workspace settings"
        description="Manage your organization and team access."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Workspace profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="form-label">
              Workspace name
              <input defaultValue="Acme workspace" />
            </label>
            <label className="form-label">
              Workspace URL
              <input defaultValue="acme" />
            </label>
          </div>
          <button className="primary-button mt-5">
            <Check size={16} />
            Save changes
          </button>
        </Card>
        <Card>
          <h2 className="font-semibold">Your plan</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Product intelligence for growing teams.
          </p>
          <button
            onClick={() => setPlanOpen(true)}
            className="mt-5 text-sm font-medium text-indigo-600"
          >
            View plan details
          </button>
        </Card>
      </div>
      <Card className="mt-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Team members</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Roles are enforced across the workspace.
            </p>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="secondary-button"
          >
            Invite member
          </button>
        </div>
        <div className="mt-5 divide-y divide-[var(--line)]">
          {members.map(([name, email, role]) => (
            <div key={email} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-[var(--muted)]">{email}</p>
              </div>
              <Tag kind="indigo">{role}</Tag>
            </div>
          ))}
        </div>
      </Card>
      {inviteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <form onSubmit={invite} className="card w-full max-w-md">
            <div className="flex justify-between">
              <div>
                <h2 className="text-lg font-bold">Invite a teammate</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Choose the workspace role before sending access.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="icon-button"
              >
                ×
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="form-label">
                Work email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="teammate@company.com"
                />
              </label>
              <label className="form-label">
                Role
                <select
                  name="role"
                  className="rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-2.5 text-[var(--ink)]"
                >
                  <option>Viewer</option>
                  <option>Analyst</option>
                  <option>Admin</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="secondary-button"
              >
                Cancel
              </button>
              <button className="primary-button">Send invite</button>
            </div>
          </form>
        </div>
      )}
      {planOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <section className="card w-full max-w-lg">
            <div className="flex justify-between">
              <div>
                <Tag kind="indigo">Current plan</Tag>
                <h2 className="mt-3 text-xl font-bold">Product intelligence</h2>
              </div>
              <button
                onClick={() => setPlanOpen(false)}
                className="icon-button"
              >
                ×
              </button>
            </div>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="rounded-xl bg-[var(--canvas)] p-4">
                <strong>Included</strong>
                <p className="mt-1 text-[var(--muted)]">
                  Feedback inbox, trends, Ask LOOP, reports, and up to 10 team
                  members.
                </p>
              </div>
              <div className="rounded-xl bg-[var(--canvas)] p-4">
                <strong>Usage this month</strong>
                <p className="mt-1 text-[var(--muted)]">
                  1,284 of 5,000 feedback items analysed.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPlanOpen(false)}
                className="primary-button"
              >
                Close details
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
function ReportsInteractive() {
  const [generated, setGenerated] = useState(false);
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportError, setReportError] = useState("");
  const [liveReport, setLiveReport] = useState("");
  const reportTitle = generated
    ? "Weekly customer pulse — just generated"
    : "Weekly customer pulse";
  const exportReport = () => {
    const content =
      liveReport ||
      `${reportTitle}\n\nExecutive summary\nOnboarding is the strongest negative signal, led by team invitation friction. Customers responded positively to the faster dashboard experience.\n\nRecommended action\nReview the invite step this sprint, then validate a streamlined flow with five active teams.`;
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "loop-weekly-customer-pulse.txt";
    link.click();
    URL.revokeObjectURL(url);
  };
  async function generateReport() {
    setGenerating(true);
    setReportError("");
    try {
      const response = await fetch("/api/reports/generate", { method: "POST" });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error ?? "Unable to generate a report.");
      setLiveReport(payload.report.markdown);
      setGenerated(true);
      setOpen(true);
    } catch (cause) {
      setReportError(
        cause instanceof Error ? cause.message : "Unable to generate a report.",
      );
    } finally {
      setGenerating(false);
    }
  }
  return (
    <>
      <Header
        title="Voice of customer reports"
        description="Leadership-ready summaries built from actual feedback."
        action={
          <button
            disabled={generating}
            onClick={generateReport}
            className="primary-button disabled:opacity-70"
          >
            <Sparkles size={16} />
            {generating
              ? "Generating..."
              : generated
                ? "Report generated"
                : "Generate report"}
          </button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Tag kind="indigo">{generated ? "New report" : "Latest report"}</Tag>
          {reportError && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
            >
              {reportError}
            </p>
          )}
          {liveReport && <div className="mt-5 whitespace-pre-wrap rounded-xl bg-[var(--canvas)] p-5 text-sm leading-7 text-[var(--muted)]">{liveReport}</div>}
          <h2 className="mt-3 text-xl font-bold">{reportTitle}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Jul 14 – Jul 20, 2026 · 137 feedback items analysed
          </p>
          <div className="mt-6 space-y-5 text-sm leading-6">
            <div>
              <strong>Executive summary</strong>
              <p className="mt-1 text-[var(--muted)]">
                Onboarding is the strongest negative signal, led by team
                invitation friction. Customers responded positively to the
                faster dashboard experience.
              </p>
            </div>
            <div>
              <strong>Recommended action</strong>
              <p className="mt-1 text-[var(--muted)]">
                Review the invite step this sprint, then validate a streamlined
                flow with five active teams.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={exportReport} className="secondary-button">
              <Download size={16} />
              Export
            </button>
            <button onClick={() => setOpen(true)} className="secondary-button">
              Open report <ArrowUpRight size={15} />
            </button>
          </div>
        </Card>
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-[var(--muted)]">Previous reports</p>
            <div className="mt-4 space-y-4">
              {[
                "Weekly customer pulse · Jul 7",
                "June product insights",
                "Weekly customer pulse · Jun 30",
              ].map((item) => (
                <button
                  onClick={() => setOpen(true)}
                  key={item}
                  className="flex w-full items-center justify-between text-left text-sm font-medium"
                >
                  {item}
                  <ArrowUpRight size={15} className="text-[var(--muted)]" />
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <p className="font-medium">Report schedule</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Weekly, every Monday at 9:00 AM
            </p>
            <button className="mt-4 text-sm font-medium text-indigo-600">
              Manage schedule
            </button>
          </Card>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <article className="card max-h-[85vh] w-full max-w-2xl overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <Tag kind="indigo">Voice of customer</Tag>
                <h2 className="mt-3 text-xl font-bold">{reportTitle}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Jul 14 – Jul 20, 2026
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="icon-button">
                ×
              </button>
            </div>
            <div className="mt-7 space-y-5 leading-7">
              <section>
                <h3 className="font-semibold">Executive summary</h3>
                <p className="mt-2 text-[var(--muted)]">
                  Onboarding is the strongest negative signal, led by team
                  invitation friction. The dashboard update is generating clear
                  positive sentiment.
                </p>
              </section>
              <section>
                <h3 className="font-semibold">Notable customer evidence</h3>
                <blockquote className="mt-2 border-l-2 border-indigo-500 pl-4 text-[var(--muted)]">
                  “Inviting my team during onboarding was surprisingly
                  difficult.”
                </blockquote>
              </section>
              <section>
                <h3 className="font-semibold">Recommended action</h3>
                <p className="mt-2 text-[var(--muted)]">
                  Simplify the team invite experience, then validate the revised
                  flow with active customer teams.
                </p>
              </section>
            </div>
            <div className="mt-7 flex justify-end">
              <button onClick={exportReport} className="primary-button">
                <Download size={16} />
                Export report
              </button>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
function AskInteractive() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveAnswer, setLiveAnswer] = useState("");
  const [askError, setAskError] = useState("");
  const query = submitted.toLowerCase();
  const answer = query.includes("mobile")
    ? {
        title: "Mobile reporting is the clearest recurring concern.",
        summary:
          "Customers say the core product works, but reporting on mobile needs attention. It has 61 recent mentions.",
        evidence: feedback[2],
      }
    : query.includes("dashboard") || query.includes("performance")
      ? {
          title: "The new dashboard is receiving strong positive feedback.",
          summary:
            "Customers repeatedly mention the faster, clearer dashboard experience as a meaningful improvement.",
          evidence: feedback[1],
        }
      : query.includes("billing") || query.includes("invoice")
        ? {
            title: "Billing friction is focused on invoice downloads.",
            summary:
              "Customers report timeouts while downloading invoices. The feedback is consistently negative.",
            evidence: {
              customer: "Support customer",
              channel: "Support",
              content:
                "Billing page keeps timing out when I try to download an invoice.",
            },
          }
        : {
            title:
              "Onboarding and team setup are the strongest customer concern.",
            summary:
              "Team invitation clarity is the biggest source of friction. Onboarding has 84 mentions and negative sentiment is up 32% this week.",
            evidence: feedback[0],
          };
  async function ask(value = question) {
    const clean = value.trim();
    if (!clean || loading) return;
    setQuestion(clean);
    setLoading(true);
    setAskError("");
    try {
      const response = await fetch("/api/insights/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: clean }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error ?? "LOOP could not answer right now.");
      setSubmitted(clean);
      setLiveAnswer(payload.answer);
    } catch (cause) {
      setAskError(
        cause instanceof Error
          ? cause.message
          : "LOOP could not answer right now.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <Header
        title="Ask LOOP"
        description="Get answers grounded in your customer feedback."
      />
      <div className="mx-auto max-w-3xl">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-[var(--line)] bg-gradient-to-r from-indigo-50 to-violet-50 p-7 dark:from-indigo-950/30 dark:to-violet-950/30">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
                <Sparkles size={19} />
              </span>
              <div>
                <h2 className="font-semibold">
                  Ask anything about your feedback
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Every answer includes customer evidence.
                </p>
              </div>
            </div>
          </div>
          <div className="min-h-72 p-6">
            {loading ? (
              <div className="flex h-56 flex-col items-center justify-center">
                <Sparkles className="animate-pulse text-indigo-500" />
                <p className="mt-3 text-sm font-medium">
                  Reviewing customer evidence...
                </p>
              </div>
            ) : submitted ? (
              <div className="space-y-5">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-3 text-sm text-white">
                  {submitted}
                </div>
                <div className="rounded-2xl rounded-bl-md bg-[var(--canvas)] p-5">
                  <p className="font-medium">
                    {liveAnswer ? "Answer from LOOP" : answer.title}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">
                    {liveAnswer || answer.summary}
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Evidence
                  </p>
                  <div className="mt-2 rounded-lg border-l-2 border-indigo-500 bg-[var(--surface)] p-3 text-sm">
                    “{answer.evidence.content}” — {answer.evidence.customer},{" "}
                    {answer.evidence.channel}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center text-center">
                <Sparkles className="text-indigo-500" />
                <p className="mt-3 font-medium">
                  Start with a customer question
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Choose a prompt or write your own question.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {[
                    "What are users saying about onboarding?",
                    "What changed in mobile feedback?",
                    "How do customers feel about the dashboard?",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => ask(item)}
                      className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium hover:border-indigo-300 hover:text-indigo-600"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {askError && (
            <p
              role="alert"
              className="mx-6 mb-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
            >
              {askError}
            </p>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask();
            }}
            className="flex gap-2 border-t border-[var(--line)] p-4"
          >
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="flex-1 bg-transparent px-2 outline-none"
              placeholder="Ask about your customers..."
            />
            <button
              aria-label="Ask LOOP"
              className="icon-button bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Send size={17} />
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
export function WorkspaceView({
  page,
}: {
  page:
    | "dashboard"
    | "inbox"
    | "trends"
    | "ask"
    | "reports"
    | "settings"
    | "help"
    | "about";
}) {
  return {
    dashboard: <Dashboard />,
    inbox: <Inbox />,
    trends: <Trends />,
    ask: <AskInteractive />,
    reports: <ReportsInteractive />,
    settings: <SettingsInteractive />,
    help: <HelpInteractive />,
    about: <Info about />,
  }[page];
}
