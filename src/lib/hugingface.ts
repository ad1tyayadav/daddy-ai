import { InferenceClient } from "@huggingface/inference";

// Initialize the Hugging Face client
const client = process.env.HF_TOKEN
  ? new InferenceClient(process.env.HF_TOKEN)
  : null;

// Mock responses
const MOCK_FEEDBACK = {
  score: 7,
  tldr: "Solid technical background but lacks quantifiable achievements and specific keywords from the job description.",
  suggestions: [
    "Add metrics to quantify achievements (e.g., 'improved performance by 25%')",
    "Incorporate more keywords from the job description",
    "Highlight leadership experience more prominently",
    "Add a projects section to showcase specific work",
  ],
  keywords: [
    "cloud architecture",
    "Agile methodology",
    "CI/CD",
    "containerization",
  ],
  exampleBullets: [
    "Reduced API response time by 40% through optimization techniques",
    "Led a team of 5 developers to deliver a project 2 weeks ahead of schedule",
    "Implemented CI/CD pipeline that reduced deployment time by 60%",
  ],
};

const MOCK_QUESTIONS = [
  {
    q: "Can you describe your experience with cloud technologies?",
    answer:
      "In my previous role at TechCorp, I designed and implemented a cloud infrastructure on AWS that supported over 10,000 daily users. I utilized services like EC2, S3, and RDS to create a scalable architecture that reduced costs by 30% while improving reliability.",
    tip: "Focus on specific technologies and quantifiable results",
  },
  {
    q: "How do you handle tight deadlines?",
    answer:
      "I prioritize tasks based on impact and communicate clearly with stakeholders about timelines. For example, on the X project, we faced a tight deadline but I organized the team into focused squads and we delivered 2 days early.",
    tip: "Use a specific example to demonstrate your approach",
  },
];

/**
 * Call Hugging Face API with chat completion
 */
async function callHuggingFaceChat(
  prompt: string,
  model: string = "Qwen/Qwen3-Next-80B-A3B-Instruct"
) {
  if (!client) {
    throw new Error("HF_TOKEN not configured");
  }

  try {
    const chatCompletion = await client.chatCompletion({
      provider: "novita",
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful career coach that provides constructive feedback on resumes based on job descriptions. Always respond with valid JSON in the specified format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error: any) {
    console.error("Hugging Face API error:", error);
    throw new Error(`Hugging Face API error: ${error.message}`);
  }
}

/**
 * Extract JSON from response text
 */
function extractJsonFromResponse(responseText: string) {
  try {
    // First try parsing directly
    const parsed = JSON.parse(responseText);

    // If parsed is an array, wrap it into { questions: [...] }
    if (Array.isArray(parsed)) {
      return { questions: parsed };
    }

    // Otherwise, return the parsed object
    return parsed;
  } catch (e) {
    console.error("Failed to extract JSON from response:", responseText);
    // Return fallback mock instead of throwing
    return MOCK_QUESTIONS;
  }
}

/**
 * Generate feedback for a resume based on a job description
 */
export async function generateFeedback(
  parsedResume: any,
  jobDescription: string
) {
  // Use mock response if no API key
  if (!process.env.HF_TOKEN) {
    return MOCK_FEEDBACK;
  }

  try {
    const prompt = `
You are a ruthless hiring mentor for mid/senior-level technical roles. Given the parsed resume JSON and the job description, produce:
1. One-line TL;DR suitability score (1-10) and why.
2. Actionable resume changes prioritized by impact (bulleted, < 8 items).
3. Key missing keywords/skills to add, exact phrasing to use.
4. Top 5 example bullet points (result-quantified) rewritten to match the job.

RESUME:
${JSON.stringify(parsedResume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

### Example Expected Output

{
  "score": 7,
  "tldr": "Strong backend engineer with Node.js/React but resume lacks quantified impact.",
  "suggestions": [
    "Add measurable results to each bullet point.",
    "Mention Kubernetes deployment experience explicitly."
  ],
  "keywords": ["Node.js", "React", "Kubernetes", "GraphQL", "CI/CD"],
  "exampleBullets": [
    "Reduced API latency by 35% by optimizing Postgres queries and caching layer.",
    "Led migration to Kubernetes, improving deployment frequency by 50%.",
    "Built GraphQL API used by 1M+ monthly active users."
  ],
  "strongPoints": [
    "Experience with full-stack (Node.js + React).",
    "Hands-on with databases (Postgres, MongoDB).",
    "Exposure to CI/CD workflows."
  ]
}
`;

    const responseText = await callHuggingFaceChat(prompt);
    return extractJsonFromResponse(responseText);
  } catch (error) {
    console.error("Error generating feedback with Hugging Face:", error);
    return MOCK_FEEDBACK;
  }
}

/**
 * Generate interview questions based on a resume and job description
 */
export async function generateInterviewQuestions(
  parsedResume: any,
  jobDescription: string,
  count: number = 8
) {
  // Use mock response if no API key
  if (!process.env.HF_TOKEN) {
    return MOCK_QUESTIONS; // Return the array directly
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

IMPORTANT: Respond with ONLY valid JSON in this exact structure:
[
  {
    "q": "Question text",
    "answer": "Model answer text",
    "tip": "Brief tip on how to answer"
  }
]
`;

    const responseText = await callHuggingFaceChat(prompt);
    const result = extractJsonFromResponse(responseText);

    // Handle both array and object formats
    return Array.isArray(result) ? result : result.questions || [];
  } catch (error) {
    console.error(
      "Error generating interview questions with Hugging Face:",
      error
    );
    return MOCK_QUESTIONS; // Return the array directly
  }
}
