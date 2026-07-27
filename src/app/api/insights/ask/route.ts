import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireWorkspace } from "@/lib/auth";
import { geminiModel, getGeminiClient } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

const inputSchema = z.object({ question: z.string().trim().min(3).max(500) });

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Gemini AI is not configured yet." }, { status: 503 });
    const membership = await requireWorkspace();
    const limit = rateLimit(`ask:${membership.id}`, 12, 60_000);
    if (!limit.allowed) return NextResponse.json({ error: "Please wait a moment before asking another question." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    const { question } = inputSchema.parse(await request.json());
    const feedback = await db.feedback.findMany({ where: { workspaceId: membership.workspaceId }, orderBy: { sourceDate: "desc" }, take: 20, select: { id: true, content: true, channel: true, customer: true, sentiment: true, sourceDate: true } });
    if (!feedback.length) return NextResponse.json({ error: "Add feedback before asking LOOP a question." }, { status: 400 });
    const evidence = feedback.map((item, index) => `[${index + 1}] ${item.content} | channel: ${item.channel} | customer: ${item.customer ?? "Unknown"} | sentiment: ${item.sentiment ?? "Unclassified"}`).join("\n");
    const response = await getGeminiClient().models.generateContent({ model: geminiModel, contents: `Question: ${question}\n\nWorkspace feedback:\n${evidence}`, config: { systemInstruction: "You are LOOP, a customer-feedback analyst. Answer only from the supplied feedback. Be concise, state when evidence is insufficient, and cite evidence numbers like [1]. Do not invent facts or quotes.", maxOutputTokens: 700 } });
    return NextResponse.json({ answer: response.text ?? "I could not generate an answer from the available feedback.", sources: feedback.slice(0, 4) });
  } catch (cause) {
    if (cause instanceof z.ZodError) return NextResponse.json({ error: "Please enter a valid question." }, { status: 400 });
    if (cause instanceof Error && cause.message === "GEMINI_NOT_CONFIGURED") return NextResponse.json({ error: "Gemini AI is not configured yet." }, { status: 503 });
    return NextResponse.json({ error: "LOOP could not answer right now. Please try again." }, { status: 500 });
  }
}
