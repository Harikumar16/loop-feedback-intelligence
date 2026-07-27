"use client";

import Link from "next/link";

export default function AskError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-[60vh] place-items-center p-6">
      <section className="card max-w-md text-center">
        <h1 className="text-xl font-bold">Ask LOOP needs a moment</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Your workspace data is safe. Please try again, or add feedback before asking a question.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="primary-button">Try again</button>
          <Link href="/dashboard" className="secondary-button">Dashboard</Link>
        </div>
      </section>
    </main>
  );
}
