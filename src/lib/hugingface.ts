/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mockFeedback, mockQuestion } from "@/data/mockData/mockData";
import { InferenceClient } from "@huggingface/inference";

const client = process.env.HF_TOKEN
  ? new InferenceClient(process.env.HF_TOKEN)
  : null;

const MOCK_FEEDBACK = mockFeedback;
const MOCK_QUESTIONS = mockQuestion;

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

    // For specific model overload errors, try a fallback model
    if (error.message.includes("overload") || error.message.includes("503")) {
      console.log("Primary model overloaded, trying fallback model...");
      return callHuggingFaceChat(prompt, "meta-llama/Llama-3.3-70B-Instruct");
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
      return MOCK_FEEDBACK;
    }

    return MOCK_QUESTIONS;
  }
}

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
You are an extremely critical technical hiring manager with 20+ years of experience at top tech companies. 
Your task is to provide brutally honest, no-BS feedback on this resume for the specific role described.

IMPORTANT: Do NOT flag or criticize dates on the resume, even if they are before or after the job's stated start date. Focus only on skills, experience, formatting, and relevance. Ignore chronological sequencing unless it affects skill relevance.

RESUME:
${JSON.stringify(parsedResume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

ANALYSIS REQUIREMENTS:

1. HARSH SUITABILITY ASSESSMENT (1-10 scale):
   - Score with decimal precision (e.g., 6.7/10)
   - Direct comparison to top candidates you've hired for similar roles
   - Specific reasons why this candidate would struggle compared to top performers

2. BRUTAL RESUME CRITIQUE:
   - Identify every weakness, gap, and red flag (except dates)
   - Point out vague language, unquantified claims, and missing evidence
   - Highlight any experience that seems exaggerated or insufficient for the role level
   - Call out missing technologies/methodologies mentioned in the JD

3. ACTIONABLE IMPROVEMENTS (Prioritized by impact):
   - Specific wording changes (exact before/after examples)
   - Quantification opportunities with realistic numbers
   - Structural changes to highlight relevant experience
   - Skills to emphasize or de-emphasize

4. KEYWORD GAP ANALYSIS:
   - Missing hard skills from JD with exact terms to add
   - Missing soft skills/competencies from JD
   - Overused or weak phrases to eliminate

5. BULLET POINT REWRITES (Top 5 most important):
   - Transform vague responsibilities into quantified achievements
   - Apply STAR method (Situation, Task, Action, Result)
   - Match language and terminology from job description

6. HARD TRUTHS SECTION:
   - What would make you reject this resume immediately in a pile of 100+ applications
   - Where this candidate truly stands against the competition
   - Whether they should even apply for this role level

TONE: Ruthlessly honest, direct, and critical. No sugarcoating. 
Assume the candidate needs to hear the brutal truth to improve.

### Expected JSON Output Format

{
  "score": 6.7,
  "scoreExplanation": "Detailed explanation of weaknesses leading to this score",
  "tldr": "Brutally honest one-line assessment",
  "brutalTruths": [
    "Hard truth 1 about why they might not get hired",
    "Hard truth 2 about experience gaps",
    "Hard truth 3 about competition"
  ],
  "redFlags": [
    "Specific red flag 1",
    "Specific red flag 2"
  ],
  "suggestions": [
    {
      "priority": "Critical/High/Medium",
      "current": "Current weak phrasing",
      "improved": "Stronger alternative with quantification"
    }
  ],
  "missingKeywords": {
    "hardSkills": ["Specific technology 1", "Specific technology 2"],
    "softSkills": ["Specific competency 1", "Specific competency 2"]
  },
  "exampleBullets": [
    {
      "original": "Original weak bullet point",
      "improved": "Rewritten with quantification and impact",
      "explanation": "Why this rewrite is more effective"
    }
  ],
  "structuralIssues": [
    "Issue with resume structure 1",
    "Issue with resume structure 2"
  ]
}
`;

    const responseText: string | any = await callHuggingFaceChat(prompt);
    return extractJsonFromResponse(responseText);
  } catch (error) {
    console.error("Error generating feedback with Hugging Face:", error);
    return MOCK_FEEDBACK;
  }
}

export async function generateInterviewQuestions(
  parsedResume: any,
  jobDescription: string,
  count: number = 10
) {
  if (!process.env.HF_TOKEN) {
    return MOCK_QUESTIONS;
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

    const responseText: string | any = await callHuggingFaceChat(prompt);
    const result = extractJsonFromResponse(responseText);

    // Handle both array and object formats
    return Array.isArray(result) ? result : result.questions || [];
  } catch (error) {
    console.error(
      "Error generating interview questions with Hugging Face:",
      error
    );
    return MOCK_QUESTIONS;
  }
}
