import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { rateLimit } from "@/lib/rate-limit";
import { requireWorkspace } from "@/lib/auth";
import { classifyFeedback } from "@/lib/ai";

const createFeedback = z.object({ content: z.string().trim().min(3).max(10_000), channel: z.string().trim().min(2).max(40), customer: z.string().trim().max(120).optional(), sourceDate: z.coerce.date().optional() });
function error(message: string, status: number) { return NextResponse.json({ error: message }, { status }); }
export async function GET(request: NextRequest) {
  try { const { workspaceId } = await requireWorkspace(); const query = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(25), search: z.string().max(120).optional() }).parse(Object.fromEntries(request.nextUrl.searchParams)); const where = { workspaceId, ...(query.search ? { content: { contains: query.search, mode: "insensitive" as const } } : {}) }; const [items, total] = await db.$transaction([db.feedback.findMany({ where, take: query.limit, skip: (query.page - 1) * query.limit, orderBy: { sourceDate: "desc" }, include: { themes: { include: { theme: true } } } }), db.feedback.count({ where })]); return NextResponse.json({ items, total, page: query.page, pages: Math.ceil(total / query.limit) }); } catch { return error("Unable to load feedback.", 401); }
}
export async function POST(request: NextRequest) {
  try { const membership = await requireWorkspace(); if (!can(membership.role, "writeFeedback")) return error("You don’t have permission to add feedback.", 403); const limiter = rateLimit(`feedback:${membership.id}`, 20); if (!limiter.allowed) return NextResponse.json({ error: "Please wait before trying again." }, { status: 429, headers: { "Retry-After": String(limiter.retryAfter) } }); const input = createFeedback.parse(await request.json()); const data = await classifyFeedback(input.content); const themes = await Promise.all(data.themes.map(name => db.theme.upsert({ where: { workspaceId_name: { workspaceId: membership.workspaceId, name } }, update: {}, create: { workspaceId: membership.workspaceId, name } }))); const item = await db.feedback.create({ data: { workspaceId: membership.workspaceId, content: input.content, channel: input.channel, customer: input.customer, sourceDate: input.sourceDate, sentiment: data.sentiment, score: data.score, featureArea: data.featureArea, classifiedAt: new Date(), themes: { create: themes.map(theme => ({ themeId: theme.id })) } } }); return NextResponse.json({ item }, { status: 201 }); } catch (cause) { if (cause instanceof z.ZodError) return error("Please check the feedback details and try again.", 400); return error("We couldn’t save that feedback. Please try again.", 500); }
}
