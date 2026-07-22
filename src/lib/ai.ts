import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const classification = z.object({ sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]), score: z.number().min(-1).max(1), themes: z.array(z.string().min(1).max(60)).min(1).max(3), featureArea: z.string().min(1).max(80) });
export type Classification = z.infer<typeof classification>;
export async function classifyFeedback(content: string): Promise<Classification> {
  if (!process.env.ANTHROPIC_API_KEY) return { sentiment: "NEUTRAL", score: 0, themes: ["Unclassified"], featureArea: "General" };
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const result = await client.messages.create({ model: "claude-sonnet-4-20250514", max_tokens: 300, system: "Classify customer feedback. Return only JSON with sentiment (POSITIVE|NEUTRAL|NEGATIVE), score (-1 to 1), themes (1-3 strings), and featureArea.", messages: [{ role: "user", content }] });
  const text = result.content.find(block => block.type === "text")?.text ?? "";
  return classification.parse(JSON.parse(text));
}
