import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ name: z.string().trim().min(2).max(80), workspace: z.string().trim().min(2).max(80), email: z.string().email(), password: z.string().min(12).max(128) });
function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "";
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const email = input.email.toLowerCase();
    const emailLimit = rateLimit(`signup:email:${email}`, 3, 3_600_000);
    const ip = clientIp(request);
    const ipLimit = ip ? rateLimit(`signup:ip:${ip}`, 20, 15 * 60_000) : { allowed: true, retryAfter: 0 };
    if (!emailLimit.allowed || !ipLimit.allowed) return NextResponse.json({ error: "Please wait a few minutes before creating another account." }, { status: 429, headers: { "Retry-After": String(Math.max(emailLimit.retryAfter, ipLimit.retryAfter)) } });
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "An account already exists for that email." }, { status: 409 });
    const slug = input.workspace.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const user = await db.user.create({ data: { name: input.name, email, passwordHash: await hash(input.password, 12), memberships: { create: { role: "ADMIN", workspace: { create: { name: input.workspace, slug: `${slug}-${crypto.randomUUID().slice(0, 6)}` } } } } } });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? "Please check the form and try again." : "We could not create your workspace." }, { status: 400 });
  }
}
