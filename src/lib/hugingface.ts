/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InferenceClient } from "@huggingface/inference";

// Alag clients for different services
const feedbackClient = process.env.HF_TOKEN_FEEDBACK
  ? new InferenceClient(process.env.HF_TOKEN_FEEDBACK)
  : null;

const questionsClient = process.env.HF_TOKEN_QUESTIONS
  ? new InferenceClient(process.env.HF_TOKEN_QUESTIONS)
  : null;

// Fallback to main token if specific tokens are not provided
const mainClient = process.env.HF_TOKEN
  ? new InferenceClient(process.env.HF_TOKEN)
  : null;

// Helper function to get appropriate client
function getClient(service: "feedback" | "questions"): InferenceClient | null {
  if (service === "feedback" && feedbackClient) return feedbackClient;
  if (service === "questions" && questionsClient) return questionsClient;
  return mainClient; // fallback
}

// Custom error class for API limit exceeded
export class APILimitExceededError extends Error {
  public limitType: "feedback" | "questions" | "both";

  constructor(
    limitType: "feedback" | "questions" | "both" = "both",
    message?: string
  ) {
    super(message || `API limit exceeded for ${limitType}`);
    this.name = "APILimitExceededError";
    this.limitType = limitType;
  }
}

// Detect if error means API limit
function isLimitExceededError(error: any): boolean {
  const limitIndicators = [
    "rate limit",
    "quota exceeded",
    "limit exceeded",
    "too many requests",
    "403",
    "429",
    "overload",
    "usage limit",
    "billing",
    "subscription",
  ];

  const errorMessage = error.message?.toLowerCase() || "";
  const errorStatus = error.status || error.code || 0;

  return (
    limitIndicators.some((indicator) => errorMessage.includes(indicator)) ||
    [403, 429, 503].includes(errorStatus)
  );
}

async function callHuggingFaceChat(
  prompt: string,
  service: "feedback" | "questions",
  model: string = "Qwen/Qwen3-Next-80B-A3B-Instruct"
) {
  const client = getClient(service);

  if (!client) {
    const tokenName =
      service === "feedback" ? "HF_TOKEN_FEEDBACK" : "HF_TOKEN_QUESTIONS";
    throw new Error(`${tokenName} or HF_TOKEN not configured`);
  }

  try {
    const chatCompletion = await client.chatCompletion({
      provider: "novita",
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful career coach that provides constructive feedback on resumes based on job descriptions. Always respond with valid JSON in the specified format. Your response must be valid JSON without any additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error: any) {
    console.error("Hugging Face API error:", error);

    // Check if it's a limit exceeded error
    if (isLimitExceededError(error)) {
      throw new APILimitExceededError(
        service,
        `Your ${service} API usage limit has been reached. Please upgrade to continue.`
      );
    }

    // For specific model overload errors, try a fallback model
    if (error.message.includes("overload") || error.message.includes("503")) {
      console.log("Primary model overloaded, trying fallback model...");
      try {
        return await callHuggingFaceChat(
          prompt,
          service,
          "meta-llama/Llama-3.3-70B-Instruct"
        );
      } catch (fallbackError: any) {
        if (isLimitExceededError(fallbackError)) {
          throw new APILimitExceededError(
            service,
            `Your ${service} API usage limit has been reached. Please upgrade to continue.`
          );
        }
        throw fallbackError;
      }
    }

    throw new Error(`Hugging Face API error: ${error.message}`);
  }
}

/**
 * Extract JSON from response text
 */
function extractJsonFromResponse(responseText: string) {
  try {
    // Clean the response text first
    let cleanedText = responseText.trim();

    // Remove any markdown code blocks if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Parse the JSON
    const parsed = JSON.parse(cleanedText);

    // If parsed is an array, wrap it into { questions: [...] }
    if (Array.isArray(parsed)) {
      return { questions: parsed };
    }

    // Otherwise, return the parsed object
    return parsed;
  } catch (e) {
    console.error(
      "Failed to extract JSON from response. Response length:",
      responseText.length
    );
    console.error("Response preview:", responseText.substring(0, 500) + "...");

    // For feedback responses, return mock feedback instead of mock questions
    if (
      responseText.includes("score") ||
      responseText.includes("suggestions")
    ) {
      throw new Error("Failed to parse feedback response");
    }

    throw new Error("Failed to parse questions response");
  }
}

export async function generateFeedback(
  parsedResume: any,
  jobDescription: string
) {
  // Check if any token is available for feedback
  if (!feedbackClient && !mainClient) {
    throw new Error("HF_TOKEN_FEEDBACK or HF_TOKEN not configured");
  }

  try {
    const prompt = `
You are an experienced recruiter with 10+ years of experience reviewing resumes. 
Your task is to provide **genuine, constructive, human-like feedback** for this resume based on the job description.

IMPORTANT:
- Be fair and balanced. Highlight both **strengths** and areas for improvement.
- Give a **realistic score** out of 10 with varied decimals (e.g., 7.3, 8.7, 6.5) — do not use fixed increments.
- Focus on **skills, achievements, formatting, and relevance**.
- Avoid overly harsh or "roasting" language. Be encouraging and human.
- Provide actionable advice that a candidate could realistically apply.

RESUME:
${JSON.stringify(parsedResume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

ANALYSIS REQUIREMENTS:

1. BALANCED ASSESSMENT:
   - Realistic score (1-10) with decimal precision
   - Compare fairly against role requirements
   - Mention strengths explicitly

2. CONSTRUCTIVE FEEDBACK:
   - Identify gaps or areas to improve
   - Suggest better phrasing or quantification

3. ACTIONABLE IMPROVEMENTS:
   - Specific wording improvements with examples
   - Quantification opportunities
   - Structural suggestions

4. KEYWORD ANALYSIS:
   - Missing hard skills and soft skills from JD

5. BULLET POINT ENHANCEMENTS (Top 3-5):
   - Transform responsibilities into achievements
   - Apply STAR method suggestions

TONE: Professional, constructive, and humanistic. Balance criticism with encouragement.

### Expected JSON Output Format

{
  "score": 8.2,
  "scoreExplanation": "Balanced explanation of strengths and areas for improvement",
  "summary": "Constructive overall assessment",
  "strengths": [
    "Key strength 1",
    "Key strength 2"
  ],
  "areasForImprovement": [
    "Constructive area 1",
    "Constructive area 2"
  ],
  "suggestions": [
    {
      "priority": "High/Medium/Low",
      "suggestion": "Specific improvement suggestion",
      "example": "Example implementation"
    }
  ],
  "missingKeywords": {
    "hardSkills": ["Technology 1", "Technology 2"],
    "softSkills": ["Skill 1", "Skill 2"]
  },
  "exampleBullets": [
    {
      "original": "Original bullet point",
      "improved": "Enhanced version",
      "reasoning": "Why this improves the resume"
    }
  ]
}
`;

    const responseText: string | any = await callHuggingFaceChat(
      prompt,
      "feedback"
    );
    return extractJsonFromResponse(responseText);
  } catch (error) {
    if (error instanceof APILimitExceededError) {
      // Already set to "feedback" in callHuggingFaceChat
      throw error;
    }

    console.error("Error generating feedback with Hugging Face:", error);
    throw error;
  }
}

export async function generateInterviewQuestions(
  parsedResume: any,
  jobDescription: string,
  count: number = 10
) {
  // Check if any token is available for questions
  if (!questionsClient && !mainClient) {
    throw new Error("HF_TOKEN_QUESTIONS or HF_TOKEN not configured");
  }

  try {
    const prompt = `
You are a senior technical interviewer with 20+ years of experience at FAANG companies.
Create challenging, realistic interview questions specifically tailored to this candidate's background and the target role.

RESUME:
${JSON.stringify(parsedResume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

INTERVIEW QUESTION REQUIREMENTS:

1. QUESTION MIX:
   - 40% Technical questions (specific to technologies mentioned in JD and resume)
   - 30% Behavioral questions (STAR format, based on resume experience)
   - 20% System design/architecture questions (appropriate for role level)
   - 10% Culture fit/motivation questions

2. QUESTION DEPTH:
   - Technical questions should be challenging but fair for the role level
   - Include follow-up questions that might be asked during the interview
   - Behavioral questions should probe for specific examples and measurable outcomes
   - System design questions should be relevant to the company's domain

3. ANSWER GUIDANCE:
   - Provide model answers that incorporate the candidate's actual experience
   - Include specific tips on what makes a strong vs weak answer
   - Highlight red flags interviewers would watch for in responses
   - Suggest how to quantify achievements even if not in original resume

4. DIFFICULTY GRADING:
   - Rate each question's difficulty (Easy/Medium/Hard)
   - Note which questions are likely to be elimination questions
   - Suggest preparation resources for each topic

5. TAILORING:
   - Questions must be specifically tailored to both the candidate's background and the JD
   - Reference specific technologies, projects, or experiences from the resume
   - Align with the company's industry, size, and mentioned technologies

TONE: Direct, challenging, and practical. Questions should reflect what would actually be asked in a competitive interview.

### Expected JSON Output Format

[
  {
    "type": "technical/behavioral/system-design/cultural",
    "difficulty": "Easy/Medium/Hard",
    "question": "The actual interview question",
    "modelAnswer": "Comprehensive answer that incorporates the candidate's experience and quantifies results",
    "tips": [
      "Tip 1 for answering effectively",
      "Tip 2 on what to emphasize",
      "What interviewers are really looking for"
    ],
    "followUps": [
      "Potential follow-up question 1",
      "Potential follow-up question 2"
    ],
    "preparationResources": [
      "Resource 1 to prepare for this question",
      "Resource 2 for deeper understanding"
    ],
    "redFlags": [
      "Response patterns that would raise concerns",
      "Common mistakes candidates make"
    ]
  }
]
`;

    const responseText: string | any = await callHuggingFaceChat(
      prompt,
      "questions"
    );
    const result = extractJsonFromResponse(responseText);

    // Handle both array and object formats
    return Array.isArray(result) ? result : result.questions || [];
  } catch (error) {
    if (error instanceof APILimitExceededError) {
      // Already set to "questions" in callHuggingFaceChat
      throw error;
    }

    console.error(
      "Error generating interview questions with Hugging Face:",
      error
    );
    throw error;
  }
}

// Utility function to check if both limits are exceeded
export function checkBothLimitsExceeded(
  feedbackError: any,
  questionsError: any
): boolean {
  return (
    feedbackError instanceof APILimitExceededError &&
    questionsError instanceof APILimitExceededError
  );
}

// Utility to check token availability
export function checkTokenAvailability(): {
  feedbackAvailable: boolean;
  questionsAvailable: boolean;
} {
  return {
    feedbackAvailable: !!(feedbackClient || mainClient),
    questionsAvailable: !!(questionsClient || mainClient),
  };
}
