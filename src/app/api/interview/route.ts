import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/hugingface";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { parsedResume, jobDescription, count } = await req.json();

    if (!parsedResume || !jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Both parsedResume and jobDescription are required",
        },
        { status: 400 }
      );
    }

    // Generate interview questions using our LLM function
    const questions = await generateInterviewQuestions(
      parsedResume,
      jobDescription,
      count || 8
    );

    return NextResponse.json({
      success: true,
      questions: questions || [], // Ensure we always return an array
      isMock: !process.env.HF_TOKEN, // Fixed to check HF_TOKEN instead of OPENAI_API_KEY
    });
  } catch (err: any) {
    console.error("Interview questions error:", err);

    // Return mock data if there's an error
    const mockQuestions = [
      {
        q: "Tell me about your experience with React and how you've used it in previous projects.",
        answer:
          "I have 3 years of experience with React, having built several single-page applications including an e-commerce platform and a project management tool. I'm proficient with hooks, context API, and state management with Redux.",
        tip: "Focus on specific projects and quantify your experience when possible.",
      },
      {
        q: "How do you handle state management in large React applications?",
        answer:
          "For smaller applications, I use React's built-in useState and useContext. For larger applications, I prefer Redux with Redux Toolkit for its predictable state container and dev tools. I also consider React Query for server state management.",
        tip: "Mention different approaches for different scales of applications.",
      },
    ];

    return NextResponse.json({
      success: true,
      questions: mockQuestions,
      isMock: true,
    });
  }
}
