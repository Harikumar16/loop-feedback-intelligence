import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace } from "@/lib/auth";
import { geminiModel, getGeminiClient } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

type ReportFeedback = { content: string; channel: string; sentiment: string | null; featureArea: string | null };

function reportEvidence(feedback: ReportFeedback[]) {
  const maxCharacters = 45_000;
  let evidence = "";
  for (const [index, item] of feedback.entries()) {
    const entry = `[${index + 1}] ${item.content.replace(/\s+/g, " ").slice(0, 1_200)} | ${item.channel} | ${item.sentiment ?? "Unclassified"} | ${item.featureArea ?? "General"}\n`;
    if (evidence.length + entry.length > maxCharacters) break;
    evidence += entry;
  }
  return evidence;
}

function fallbackReport(feedback: ReportFeedback[]) {
  const sentiment = feedback.reduce<Record<string, number>>((totals, item) => {
    const key = item.sentiment ?? "Unclassified";
    totals[key] = (totals[key] ?? 0) + 1;
    return totals;
  }, {});
  const themes = [...new Set(feedback.map((item) => item.featureArea).filter(Boolean))].slice(0, 5).join(", ") || "No themes classified yet";
  const evidence = feedback.slice(0, 3).map((item, index) => `- [${index + 1}] ${item.content.slice(0, 280)}`).join("\n");
  return `## Executive summary\nBased on ${feedback.length} feedback item${feedback.length === 1 ? "" : "s"}, this report is a grounded summary while AI analysis is unavailable.\n\n## Top themes\n${themes}\n\n## Sentiment shifts\n${Object.entries(sentiment).map(([name, count]) => `- ${name}: ${count}`).join("\n")}\n\n## Customer evidence\n${evidence}\n\n## Recommended actions\n- Review the recurring themes above with the product team.\n- Prioritize the most frequent negative feedback.\n- Collect more feedback to strengthen trend confidence.`;
}

function logGeminiError(error: unknown) {
  const providerError = error as { code?: unknown; name?: unknown; message?: unknown; status?: unknown; stack?: unknown; error?: unknown };
  console.error("[GEMINI_REPORT_ERROR]", {
    code: providerError.code,
    name: providerError.name,
    status: providerError.status,
    message: providerError.message,
    response: providerError.error,
    stack: providerError.stack,
  });
}

export async function POST() {
  try {
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Gemini AI is not configured yet." }, { status: 503 });
    const membership = await requireWorkspace();
    const limit = rateLimit(`report:${membership.id}`, 4, 60 * 60_000);
    if (!limit.allowed) return NextResponse.json({ error: "Please wait before generating another report." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd); periodStart.setDate(periodStart.getDate() - 7);
    const feedback = await db.feedback.findMany({ where: { workspaceId: membership.workspaceId, sourceDate: { gte: periodStart, lte: periodEnd } }, orderBy: { sourceDate: "desc" }, take: 100, select: { content: true, channel: true, sentiment: true, featureArea: true } });
    if (!feedback.length) return NextResponse.json({ error: "Add feedback before generating a report." }, { status: 400 });
    const source = reportEvidence(feedback);
    let markdown = fallbackReport(feedback);
    try {
      const response = await Promise.race([
        getGeminiClient().models.generateContent({ model: geminiModel, contents: `Create the weekly report from this feedback:\n${source}`, config: { systemInstruction: "Write a concise Voice of Customer report using only supplied feedback. Use these exact sections: Executive summary, Top themes, Sentiment shifts, Customer evidence, Recommended actions. Cite evidence numbers in brackets. Never invent facts or quotes.", maxOutputTokens: 1200 } }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("REPORT_TIMEOUT")), 15_000)),
      ]);
      markdown = response.text?.trim() || markdown;
    } catch (error) {
      logGeminiError(error);
    }
    const report = await db.report.create({ data: { workspaceId: membership.workspaceId, title: "Weekly customer pulse", periodStart, periodEnd, content: { markdown } } });
    return NextResponse.json({ report: { id: report.id, title: report.title, markdown, periodStart, periodEnd } }, { status: 201 });
  } catch (cause) {
    if (cause instanceof Error && cause.message === "GEMINI_NOT_CONFIGURED") return NextResponse.json({ error: "Gemini AI is not configured yet." }, { status: 503 });
    return NextResponse.json({ error: "LOOP could not generate a report right now. Please try again." }, { status: 500 });
  }
}
