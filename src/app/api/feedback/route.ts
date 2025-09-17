import { NextResponse } from "next/server";
import { generateFeedback } from "@/lib/hugingface";
// Mock feedback to use if API fails
const MOCK_FEEDBACK = {
  score: 7,
  tldr: "Good match, but missing cloud CI/CD keywords",
  suggestions: [
    "Add CI/CD experience",
    "Highlight AWS projects",
    "Include quantified achievements"
  ],
  keywords: ["CI/CD", "AWS", "Cloud"],
  exampleBullets: [
    "Implemented CI/CD pipelines using GitHub Actions",
    "Managed cloud deployment on AWS",
    "Optimized application performance resulting in 20% faster load times"
  ],
  isMock: true
};

async function generateFeedbackWithRetry(parsedResume: any, jobDescription: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await generateFeedback(parsedResume, jobDescription);
    } catch (err: any) {
      // Retry only on 503 (model overloaded)
      if (err?.message.includes("503") && i < retries - 1) {
        console.warn(`Gemini overloaded. Retrying attempt ${i + 1}...`);
        await new Promise(res => setTimeout(res, 2000 * (i + 1))); // 2s, 4s, 6s
        continue;
      }
      console.error("Error generating feedback:", err);
      throw err;
    }
  }
  throw new Error("Gemini unavailable after retries");
}

export async function POST(req: Request) {
  try {
    const { parsedResume, jobDescription } = await req.json();

    if (!parsedResume || !jobDescription) {
      return NextResponse.json({ success: false, error: "Missing parsedResume or jobDescription" }, { status: 400 });
    }

    let feedback; 
    try {
      feedback = await generateFeedbackWithRetry(parsedResume, jobDescription, 3);
      feedback.isMock = false;
    } catch (err) {
      console.warn("Using mock feedback due to Gemini API error.");
      feedback = MOCK_FEEDBACK;
    }

    return NextResponse.json({ success: true, feedback });
  } catch (err: any) {
    console.error("Feedback route error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}