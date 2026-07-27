import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const classification = z.object({ sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]), score: z.number().min(-1).max(1), themes: z.array(z.string().min(1).max(60)).min(1).max(3), featureArea: z.string().min(1).max(80) });
export type Classification = z.infer<typeof classification>;
export const geminiModel = "gemini-3.6-flash";
const fallbackClassification: Classification = {
  sentiment: "NEUTRAL",
  score: 0,
  themes: ["Unclassified"],
  featureArea: "General",
};

function extractJson(text: string) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

export function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_NOT_CONFIGURED");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function classifyFeedback(content: string): Promise<Classification> {
  if (!process.env.GEMINI_API_KEY) return fallbackClassification;

  try {
    const response = await Promise.race([
      getGeminiClient().models.generateContent({
        model: geminiModel,
        contents: content,
        config: {
          systemInstruction:
            "Classify customer feedback. Return only JSON with sentiment (POSITIVE|NEUTRAL|NEGATIVE), score (-1 to 1), themes (1-3 strings), and featureArea.",
          responseMimeType: "application/json",
          maxOutputTokens: 1024,
        },
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("AI_CLASSIFICATION_TIMEOUT")), 12_000);
      }),
    ]);

    return classification.parse(JSON.parse(extractJson(response.text ?? "")));
  } catch {
    // Feedback must remain usable when AI classification is temporarily unavailable.
    return fallbackClassification;
  }
}
