import { NextResponse } from "next/server";
import { generateFeedback } from "@/lib/hugingface";
import { mockFeedback } from "@/data/mockData/mockData";

export interface Feedback {
  score: number;
  tldr: string;
  suggestions: string[];
  keywords: string[];
  exampleBullets: string[];
  isMock: boolean;
}

export interface ParsedResume {
  rawText?: string;
  [key: string]: unknown;
}

const MOCK_FEEDBACK = mockFeedback;

async function generateFeedbackWithRetry(
  parsedResume: ParsedResume,
  jobDescription: string,
  retries = 3
): Promise<Feedback> {
  for (let i = 0; i < retries; i++) {
    try {
      return await generateFeedback(parsedResume, jobDescription);
    } catch (err) {
      if (err instanceof Error && err.message.includes("503") && i < retries - 1) {
        console.warn(`⚠️ Gemini overloaded. Retrying attempt ${i + 1}...`);
        await new Promise((res) => setTimeout(res, 2000 * (i + 1))); // 2s, 4s, 6s
        continue;
      }
      console.error("❌ Error generating feedback:", err);
      throw err;
    }
  }
  throw new Error("Gemini unavailable after retries");
}

export async function POST(req: Request) {
  try {
    const { parsedResume, jobDescription } = (await req.json()) as {
      parsedResume: ParsedResume;
      jobDescription: string;
    };

    if (!parsedResume || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "Missing parsedResume or jobDescription" },
        { status: 400 }
      );
    }

    const limitedResume: ParsedResume = {
      ...parsedResume,
      rawText: parsedResume.rawText
        ? parsedResume.rawText.substring(0, 5000)
        : "",
    };

    let feedback: Feedback;
    try {
      feedback = await generateFeedbackWithRetry(limitedResume, jobDescription);
      feedback.isMock = false;
    } catch (err) {
      console.warn("⚠️ Using mock feedback due to API error:", err);
      feedback = { ...MOCK_FEEDBACK, isMock: true };
    }

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    console.error("❌ Feedback route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
