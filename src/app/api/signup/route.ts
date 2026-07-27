import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ name: z.string().trim().min(2).max(80), workspace: z.string().trim().min(2).max(80), email: z.string().email(), password: z.string().min(12).max(128) });
export async function POST(request: Request) { const limit = rateLimit(`signup:${request.headers.get("x-forwarded-for") ?? "local"}`, 5, 3_600_000); if (!limit.allowed) return NextResponse.json({ error: "Please wait before creating another account." }, { status: 429 }); try { const input = schema.parse(await request.json()); const existing = await db.user.findUnique({ where: { email: input.email } }); if (existing) return NextResponse.json({ error: "An account already exists for that email." }, { status: 409 }); const slug = input.workspace.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); const user = await db.user.create({ data: { name: input.name, email: input.email, passwordHash: await hash(input.password, 12), memberships: { create: { role: "ADMIN", workspace: { create: { name: input.workspace, slug: `${slug}-${crypto.randomUUID().slice(0, 6)}` } } } } } }); return NextResponse.json({ id: user.id }, { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? "Please check the form and try again." : "We could not create your workspace." }, { status: 400 }); } }
