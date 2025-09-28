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
      const feedback = await generateFeedback(parsedResume, jobDescription);
      feedback.isMock = false;
      return feedback;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("503") && i < retries - 1) {
        await new Promise((res) => setTimeout(res, 2000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Feedback API unavailable after retries");
}

export async function POST(req: Request) {
  try {
    const { parsedResume, jobDescription } = await req.json();
    if (!parsedResume || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "Missing parsedResume or jobDescription" },
        { status: 400 }
      );
    }

    const limitedResume: ParsedResume = {
      ...parsedResume,
      rawText: parsedResume.rawText?.substring(0, 5000) || "",
    };

    let feedback: Feedback;
    try {
      feedback = await generateFeedbackWithRetry(limitedResume, jobDescription);
    }catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.warn("⚠️ Using mock feedback due to API error:", message);
  feedback = { ...MOCK_FEEDBACK, isMock: true };
}

    return NextResponse.json({ success: true, feedback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message || "Unknown error" },
      { status: 500 }
    );
  }
}
