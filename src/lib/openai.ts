import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Mock responses for when no API key is provided
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

const MOCK_QUESTIONS = {
  questions: [
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
  ]
};

/**
 * Generate feedback for a resume based on a job description
 */
export async function generateFeedback(parsedResume: any, jobDescription: string) {
  // Use mock response if no API key
  if (!process.env.OPENAI_API_KEY) {
    return MOCK_FEEDBACK;
  }

  try {
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

Output valid JSON with this structure:
{
  "score": 7,
  "tldr": "Brief explanation of score",
  "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2"],
  "keywords": ["Keyword 1", "Keyword 2"],
  "exampleBullets": ["Rewritten bullet 1", "Rewritten bullet 2"]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful career coach that provides constructive feedback on resumes based on job descriptions. Always respond with valid JSON in the specified format." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse OpenAI feedback response:", responseText);
      return MOCK_FEEDBACK;
    }
  } catch (error) {
    console.error("Error generating feedback:", error);
    return MOCK_FEEDBACK;
  }
}

/**
 * Generate interview questions based on a resume and job description
 */
export async function generateInterviewQuestions(parsedResume: any, jobDescription: string, count: number = 8) {
  // Use mock response if no API key
  if (!process.env.OPENAI_API_KEY) {
    return MOCK_QUESTIONS;
  }

  try {
    const prompt = `
Given the parsed resume JSON and job description, produce ${count} likely interview questions (mix technical and behavioral).
For each question, provide a 2-4 sentence model answer tailored to the resume and job.
Also provide a one-line tip for how to answer (style or example to highlight).

RESUME:
${JSON.stringify(parsedResume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Output valid JSON with this structure:
{
  "questions": [
    {
      "q": "Question text",
      "answer": "Model answer text",
      "tip": "Brief tip on how to answer"
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful career coach that generates interview questions based on resumes and job descriptions. Always respond with valid JSON in the specified format." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse OpenAI questions response:", responseText);
      return MOCK_QUESTIONS;
    }
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return MOCK_QUESTIONS;
  }
}