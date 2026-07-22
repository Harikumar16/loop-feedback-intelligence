"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function Login() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: form.get("email"), password: form.get("password"), redirect: false });
    if (result?.error) setMessage("We could not sign you in. Check your email and password.");
    else window.location.assign("/dashboard");
  }
  return <main className="grid min-h-screen place-items-center p-5"><form onSubmit={submit} className="card w-full max-w-md"><div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 font-black text-white">L</div><h1 className="mt-5 text-2xl font-bold">Welcome back</h1><p className="mt-1 text-sm text-[var(--muted)]">Sign in to your customer intelligence workspace.</p><div className="mt-4 rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">Local preview is enabled. Try <strong>demo@loop.app</strong> with <strong>LoopDemo!2026</strong>.</div><div className="mt-6 space-y-4"><label className="form-label">Work email<input name="email" type="email" required placeholder="you@company.com" /></label><label className="form-label">Password<input name="password" type="password" required minLength={12} /></label></div>{message && <p className="mt-4 text-sm text-rose-600">{message}</p>}<button className="primary-button mt-6 w-full">Sign in</button><p className="mt-5 text-center text-sm text-[var(--muted)]">New to LOOP? <Link href="/signup" className="font-semibold text-indigo-600">Create a workspace</Link></p></form></main>;
}
