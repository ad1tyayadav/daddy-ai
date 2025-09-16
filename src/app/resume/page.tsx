"use client";

import { useState } from "react";

export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [parsed, setParsed] = useState<any>(null);
    const [feedback, setFeedback] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        setParsed(null);
        setFeedback(null);

        try {
            // 1. Upload file
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const uploadText = await uploadRes.text();
            let uploadJson;
            try {
                uploadJson = JSON.parse(uploadText);
            } catch (e) {
                throw new Error(`Upload failed: ${uploadRes.status} ${uploadText}`);
            }

            if (!uploadJson.success || !uploadJson.fileId) {
                throw new Error(uploadJson.error || "No fileId received");
            }

            const fileId = uploadJson.fileId;

            // 2. Parse file
            const parseRes = await fetch("/api/parse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId }),
            });
            
            const parseText = await parseRes.text();
            let parseJson;
            try {
                parseJson = JSON.parse(parseText);
            } catch (e) {
                throw new Error(`Parse failed: ${parseRes.status} ${parseText}`);
            }

            if (!parseRes.ok || !parseJson.success) {
                throw new Error(parseJson.error || "Parse failed");
            }

            setParsed(parseJson);

            // 3. Get feedback if job description is provided
            if (jobDescription.trim()) {
                const feedbackRes = await fetch("/api/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        parsedResume: parseJson.parsed.structured,
                        jobDescription
                    }),
                });
                
                const feedbackText = await feedbackRes.text();
                let feedbackJson;
                try {
                    feedbackJson = JSON.parse(feedbackText);
                } catch (e) {
                    throw new Error(`Feedback failed: ${feedbackRes.status} ${feedbackText}`);
                }

                if (!feedbackRes.ok || !feedbackJson.success) {
                    throw new Error(feedbackJson.error || "Feedback failed");
                }

                setFeedback(feedbackJson);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
            <h1>Resume Parser Demo</h1>

            <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="file" style={{ display: "block", marginBottom: "0.5rem" }}>
                        Upload Resume:
                    </label>
                    <input
                        id="file"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                </div>
                
                <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="jobDescription" style={{ display: "block", marginBottom: "0.5rem" }}>
                        Job Description (optional):
                    </label>
                    <textarea
                        id="jobDescription"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={5}
                        style={{ width: "100%", padding: "0.5rem" }}
                        placeholder="Paste the job description here to get tailored feedback"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={!file || loading} 
                    style={{ 
                        padding: "0.5rem 1rem", 
                        backgroundColor: !file || loading ? "#ccc" : "#0070f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: !file || loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Processing..." : "Upload & Parse"}
                </button>
            </form>

            {error && (
                <div style={{ color: "red", marginBottom: "1rem", padding: "1rem", backgroundColor: "#ffe6e6" }}>
                    ❌ Error: {error}
                </div>
            )}

            {parsed && (
                <div style={{ marginBottom: "2rem" }}>
                    <h2>Parsed Resume</h2>
                    <div style={{ 
                        background: "#f4f4f4", 
                        padding: "1rem", 
                        borderRadius: "4px",
                        maxHeight: "500px", 
                        overflow: "auto", 
                        fontSize: "0.9rem" 
                    }}>
                        <pre>{JSON.stringify(parsed.parsed.structured, null, 2)}</pre>
                    </div>
                </div>
            )}

            {feedback && (
                <div>
                    <h2>Feedback {feedback.isMock && "(Mock Response - Add OPENAI_API_KEY for AI feedback)"}</h2>
                    <div style={{ 
                        background: "#f0f8ff", 
                        padding: "1rem", 
                        borderRadius: "4px",
                        border: "1px solid #cce5ff" 
                    }}>
                        <h3>Summary</h3>
                        <p>{feedback.feedback.summary}</p>
                        
                        <h3>Strengths</h3>
                        <ul>
                            {feedback.feedback.strengths.map((strength: string, i: number) => (
                                <li key={i}>{strength}</li>
                            ))}
                        </ul>
                        
                        <h3>Areas for Improvement</h3>
                        <ul>
                            {feedback.feedback.weaknesses.map((weakness: string, i: number) => (
                                <li key={i}>{weakness}</li>
                            ))}
                        </ul>
                        
                        <h3>Suggestions</h3>
                        <ul>
                            {feedback.feedback.suggestions.map((suggestion: string, i: number) => (
                                <li key={i}>{suggestion}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}