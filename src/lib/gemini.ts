import { GoogleGenAI } from "@google/genai";

// Initialize GenAI client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Mock responses (fallbacks)
const MOCK_FEEDBACK = {
  score: 7,
  tldr: "Solid technical background but lacks quantifiable achievements and specific keywords from the job description.",
  suggestions: [
    "Add metrics to quantify achievements (e.g., 'improved performance by 25%')",
    "Incorporate more keywords from the job description",
    "Highlight leadership experience more prominently",
    "Add a projects section to showcase specific work"
  ],
  keywords: ["cloud architecture", "Agile methodology", "CI/CD", "containerization"],
  exampleBullets: [
    "Reduced API response time by 40% through optimization techniques",
    "Led a team of 5 developers to deliver a project 2 weeks ahead of schedule",
    "Implemented CI/CD pipeline that reduced deployment time by 60%"
  ]
};

const MOCK_QUESTIONS = [
  {
    q: "Can you describe your experience with cloud technologies?",
    answer: "In my previous role at TechCorp, I designed and implemented a cloud infrastructure on AWS that supported over 10,000 daily users. I utilized services like EC2, S3, and RDS to create a scalable architecture that reduced costs by 30% while improving reliability.",
    tip: "Focus on specific technologies and quantifiable results"
  },
  {
    q: "How do you handle tight deadlines?",
    answer: "I prioritize tasks based on impact and communicate clearly with stakeholders about timelines. For example, on the X project, we faced a tight deadline but I organized the team into focused squads and we delivered 2 days early.",
    tip: "Use a specific example to demonstrate your approach"
  }
];

/**
 * Safely parse JSON returned by Gemini
 */
function safeParseJSON(text: string) {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Always wrap array responses
    if (Array.isArray(parsed)) return { questions: parsed };
    return parsed;
  } catch (err) {
    console.error("Failed to parse JSON from Gemini:", text);
    return null;
  }
}

/**
 * Generate resume feedback
 */
export async function generateFeedback(parsedResume: any, jobDescription: string) {
  if (!ai) return MOCK_FEEDBACK;

  const prompt = `
You are a ruthless hiring mentor for mid/senior-level technical roles. Given the parsed resume JSON and the job description, produce:
1. One-line TL;DR suitability score (1-10) and why.
2. Actionable resume changes prioritized by impact (bulleted, < 8 items).
3. Key missing keywords/skills to add, exact phrasing to use.
4. Top 3 example bullet points (result-quantified) rewritten to match the job.

RESUME:
${JSON.stringify(parsedResume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

IMPORTANT: Respond with ONLY valid JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const parsed = safeParseJSON(response.text);
    // Return feedback object or fallback
    if (parsed && parsed.score) return parsed;
    return MOCK_FEEDBACK;
  } catch (err) {
    console.error("Gemini feedback error:", err);
    return MOCK_FEEDBACK;
  }
}

/**
 * Generate interview questions
 */
export async function generateInterviewQuestions(parsedResume: any, jobDescription: string, count: number = 8) {
  if (!ai) return MOCK_QUESTIONS;

  const prompt = `
Given the parsed resume JSON and job description, produce ${count} likely interview questions (mix technical and behavioral).
For each question, provide a 2-4 sentence model answer tailored to the resume and job.
Also provide a one-line tip for how to answer.

RESUME:
${JSON.stringify(parsedResume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

IMPORTANT: Respond with ONLY valid JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    const parsed = safeParseJSON(response.text);

    // Always return an array
    if (Array.isArray(parsed?.questions)) return parsed.questions;
    if (Array.isArray(parsed)) return parsed;
    return MOCK_QUESTIONS;
  } catch (err) {
    console.error("Gemini interview questions error:", err);
    return MOCK_QUESTIONS;
  }
}
