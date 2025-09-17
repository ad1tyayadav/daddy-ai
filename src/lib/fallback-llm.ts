// Fallback implementation using fetch directly to Google's API
async function callGoogleAI(prompt: string, isJson: boolean = true) {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  
  if (!apiKey) {
    throw new Error("No Google AI API key configured");
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Google AI API call failed:", error);
    throw error;
  }
}

// Export the same functions as the Gemini implementation
export { generateFeedback, generateInterviewQuestions } from "./gemini";