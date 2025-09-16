import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

export const runtime = "nodejs";

// Mock feedback if no API key or error occurs
const mockFeedback = {
  summary: "Overall, this is a strong resume with relevant experience. However, there are areas that could be improved to better match the target job description.",
  strengths: [
    "Relevant technical skills in modern web development",
    "Good progression of responsibility in work history",
    "Clear formatting and organization"
  ],
  weaknesses: [
    "Limited quantifiable achievements in experience section",
    "Could benefit from more keywords from the job description",
    "Education section lacks details about relevant coursework"
  ],
  suggestions: [
    "Add metrics to quantify your achievements (e.g., 'improved performance by 25%')",
    "Incorporate more keywords from the job description",
    "Consider adding a projects section to showcase specific work"
  ]
};

export async function POST(req: NextRequest) {
  try {
    const { parsedResume, jobDescription } = await req.json();

    if (!parsedResume || !jobDescription) {
      return NextResponse.json({
        success: false,
        error: "Both parsedResume and jobDescription are required"
      }, { status: 400 });
    }

    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      console.log("No Hugging Face token found, returning mock feedback");
      return NextResponse.json({
        success: true,
        feedback: mockFeedback,
        isMock: true
      });
    }

    try {
      const client = new InferenceClient(hfToken);

      const prompt = `
        Analyze this resume against the provided job description and give constructive feedback.
        
        RESUME:
        ${JSON.stringify(parsedResume, null, 2)}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        Provide feedback in the following JSON format:
        {
          "summary": "Overall summary of fit",
          "strengths": ["strength1", "strength2", "strength3"],
          "weaknesses": ["weakness1", "weakness2", "weakness3"],
          "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
        }
      `;

      const chatCompletion = await client.chatCompletion({
        provider: "auto",
        model: "Qwen/Qwen3-Next-80B-A3B-Instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful career coach that provides constructive feedback on resumes based on job descriptions. Always respond with valid JSON in the specified format."
          },
          { role: "user", content: prompt }
        ],
      });

      const feedbackText = chatCompletion.choices[0]?.message?.content || "";

      try {
        const feedback = JSON.parse(feedbackText);
        return NextResponse.json({ success: true, feedback, isMock: false });
      } catch (e) {
        console.error("Failed to parse Hugging Face response:", feedbackText);
        return NextResponse.json({
          success: false,
          error: "Failed to parse feedback response"
        }, { status: 500 });
      }
    } catch (hfError: any) {
      console.error("Hugging Face API error:", hfError);
      return NextResponse.json({
        success: true,
        feedback: mockFeedback,
        isMock: true
      });
    }
  } catch (err: any) {
    console.error("Feedback error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Feedback generation failed"
    }, { status: 500 });
  }
}
