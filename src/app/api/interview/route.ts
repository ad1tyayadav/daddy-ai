import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/hugingface";
import { mockQuestion } from "@/data/mockData/mockData";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { parsedResume, jobDescription, count } = await req.json();
    if (!parsedResume || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "Both parsedResume and jobDescription are required" },
        { status: 400 }
      );
    }

    let questions;
    let isMock = false;
    try {
      questions = await generateInterviewQuestions(parsedResume, jobDescription, count || 8);
    } catch (err) {
      console.warn("⚠️ Using mock interview questions due to API error:", err);
      questions = mockQuestion;
      isMock = true;
    }

    return NextResponse.json({
      success: true,
      questions: questions || [],
      isMock,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message || "Unknown error" },
      { status: 500 }
    );
  }
}
