/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import UploadForm from "@/components/UploadForm";
import Tabs from "@/components/Tabs";
import Feedback from "@/components/Feedback";
import InterviewQuestions from "@/components/Interview";
import PDFExport from "@/components/PdfExport";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { motion } from "framer-motion";

const LOADING_STATES = [
  { text: "Uploading your masterpiece...." },
  { text: "Scanning for typos, typos everywhere..." },
  { text: "Parsing that ‘experience’ section..." },
  { text: "Bro! WTF is this?..." },
  { text: "Checking if skills are real..." },
  { text: "Evaluating achievements..." },
  { text: "Spotting cringe-worthy hobbies..." },
  { text: "Detecting buzzwords nobody uses...lol" },
  { text: "Analyzing leadership claims..." },
  { text: "Checking grammar...." },
  { text: "Holy shit, brace yourself!..." },
  { text: "Verifying LinkedIn link..." },
  { text: "skills != job requirements..." },
  { text: "Finding strengths....404 not found :)" },
  { text: "Listing weaknesses....]" },
  { text: "Generating witty feedback..." },
  { text: "Creating interview questions..." },
  { text: "Making suggestions you’ll probably ignore..." },
  { text: "Almost done… try not to cry..." },
  { text: "Final check… alright, you survived… barely!" },
];

// Define the structure of our stored data
interface StoredData {
  parsed: any;
  feedback: any;
  questions: any[];
  jobDescription: string;
  timestamp: number;
}

export default function ResumePage() {
  const [parsed, setParsed] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [activeTab, setActiveTab] = useState("feedback");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window === "undefined") return; // ⬅ SSR guard

    const savedData = localStorage.getItem("resumeAnalysisData");
    if (savedData) {
      try {
        const data: StoredData = JSON.parse(savedData);

        const isDataFresh = Date.now() - data.timestamp < 24 * 60 * 60 * 1000;

        if (isDataFresh) {
          setParsed(data.parsed);
          setFeedback(data.feedback);
          setQuestions(data.questions);
          setJobDescription(data.jobDescription);
        } else {
          localStorage.removeItem("resumeAnalysisData");
        }
      } catch (e) {
        console.error("Error parsing saved data:", e);
        localStorage.removeItem("resumeAnalysisData");
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (parsed || feedback || questions.length > 0) {
      const dataToStore: StoredData = {
        parsed,
        feedback,
        questions,
        jobDescription,
        timestamp: Date.now()
      };

      localStorage.setItem("resumeAnalysisData", JSON.stringify(dataToStore));
    }
  }, [parsed, feedback, questions, jobDescription]);

  async function handleSubmit(file: File, jobDesc: string) {
    setLoading(true);
    setError(null);
    setJobDescription(jobDesc);
    setParsed(null);
    setFeedback(null);
    setQuestions([]);

    // Clear old data when starting a new analysis
    localStorage.removeItem("resumeAnalysisData");

    try {
      // 1. First upload the file to get a fileId
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("File upload failed");
      }

      const uploadData = await uploadRes.json();
      const fileId = uploadData.fileId;

      // 2. Parse the uploaded file using the fileId
      const parsedRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!parsedRes.ok) {
        throw new Error("Parsing failed");
      }

      const parsedData = await parsedRes.json();
      setParsed(parsedData);

      // 3. Get feedback
      const feedbackRes = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsedResume: parsedData,
          jobDescription: jobDesc,
        }),
      });

      if (!feedbackRes.ok) {
        throw new Error("Feedback generation failed");
      }

      const feedbackData = await feedbackRes.json();
      setFeedback(feedbackData);

      // 4. Get interview questions
      const questionRes = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsedResume: parsedData,
          jobDescription: jobDesc,
        }),
      });

      if (!questionRes.ok) {
        throw new Error("Question generation failed");
      }

      const questionData = await questionRes.json();
      setQuestions(questionData.questions || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Clear all stored data
  const clearSavedData = () => {
    setParsed(null);
    setFeedback(null);
    setQuestions([]);
    setJobDescription("");
    localStorage.removeItem("resumeAnalysisData");
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <UploadForm onSubmit={handleSubmit} initialJobDescription={jobDescription} />

        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <MultiStepLoader
              loadingStates={LOADING_STATES}
              loading={loading}
              duration={2000}
            />
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-300">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {(feedback || questions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200/60 dark:border-neutral-700/50 p-6"
          >
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
                  Analysis Results
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Based on your resume and the job description
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <PDFExport
                  feedback={feedback?.feedback}
                  questions={questions}
                  parsedResume={parsed}
                />
                <button
                  onClick={clearSavedData}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Results
                </button>
              </div>
            </div>

            <Tabs
              active={activeTab}
              onChange={setActiveTab}
              tabs={[
                { id: "feedback", label: "Resume Feedback" },
                { id: "questions", label: "Interview Questions" },
              ]}
            />

            <div className="mt-6">
              {activeTab === "feedback" && feedback && (
                <Feedback feedback={feedback.feedback} />
              )}
              {activeTab === "questions" && (
                <InterviewQuestions questions={questions} />
              )}
            </div>
          </motion.div>
        )}

        {/* Show message if data was loaded from storage */}
        {localStorage.getItem("resumeAnalysisData") && !loading && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Your previous analysis has been restored. You can continue where you left off.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}