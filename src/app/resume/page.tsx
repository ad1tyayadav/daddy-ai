"use client";
import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import Tabs from "@/components/Tabs";
import Feedback from "@/components/Feedback";
import InterviewQuestions from "@/components/Interview";
import ParsedResume from "@/components/ParsedResume";

export default function ResumePage() {
    const [parsed, setParsed] = useState<any>(null);
    const [feedback, setFeedback] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("feedback");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(file: File, jobDescription: string) {
        setLoading(true);
        setError(null);

        try {
            // 1. Upload resume & parse
            const formData = new FormData();
            formData.append("file", file);
            const parsedRes = await fetch("/api/parse", { method: "POST", body: formData });
            const parsedData = await parsedRes.json();
            setParsed(parsedData);

            // 2. Get feedback
            const feedbackRes = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ parsedResume: parsedData, jobDescription }),
            });
            const feedbackData = await feedbackRes.json();
            setFeedback(feedbackData);

            // 3. Get interview questions
            const questionRes = await fetch("/api/interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ parsedResume: parsedData, jobDescription }),
            });
            const questionData = await questionRes.json();
            setQuestions(questionData.questions || []);
        } catch (err) {
            console.error(err);
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
            <h1>Resume Parser & Career Coach</h1>
            <UploadForm onSubmit={handleSubmit} />

            {loading && <p>⏳ Analyzing resume...</p>}
            {error && <div style={{ color: "red" }}>❌ {error}</div>}

            {(feedback || questions.length > 0 || parsed) && (
                <>
                    <Tabs
                        active={activeTab}
                        onChange={setActiveTab}
                        tabs={[
                            { id: "feedback", label: "Resume Feedback" },
                            { id: "questions", label: "Interview Questions" },
                            { id: "resume", label: "Parsed Resume" },
                        ]}
                    />
                    {activeTab === "feedback" && feedback && <Feedback feedback={feedback.feedback} />}
                    {activeTab === "questions" && <InterviewQuestions questions={questions} />}
                    {activeTab === "resume" && parsed && <ParsedResume parsed={parsed?.parsed?.structured} />}
                </>
            )}
        </div>
    );
}
