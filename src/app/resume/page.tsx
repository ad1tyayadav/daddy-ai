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
import UpgradePopup from "@/components/PopUp";

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
  { text: "Listing weaknesses...." },
  { text: "Generating witty feedback..." },
  { text: "Creating interview questions..." },
  { text: "Making suggestions you’ll probably ignore..." },
  { text: "Almost done… try not to cry..." },
  { text: "Final check… alright, you survived… barely!" },
  { text: "Preparing your report card..." }
];

interface StoredData {
  parsed: any;
  feedback: any;
  questions: any[];
  jobDescription: string;
  timestamp: number;
}

const DATA_FRESHNESS_THRESHOLD = 12 * 60 * 60 * 1000;

function ResumePage() {
  const [parsed, setParsed] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [activeTab, setActiveTab] = useState("feedback");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [limitType, setLimitType] = useState<"feedback" | "questions" | "both">("both");


  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedData = localStorage.getItem("resumeAnalysisData");
    if (savedData) {
      try {
        const data: StoredData = JSON.parse(savedData);
        const isDataFresh = Date.now() - data.timestamp < DATA_FRESHNESS_THRESHOLD;
        if (isDataFresh) {
          setParsed(data.parsed);
          setFeedback(data.feedback);
          setQuestions(data.questions || []);
          setJobDescription(data.jobDescription || "");
          setHasSavedData(true);
        } else localStorage.removeItem("resumeAnalysisData");
      } catch {
        localStorage.removeItem("resumeAnalysisData");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (parsed || feedback || questions.length > 0) {
      const dataToStore: StoredData = {
        parsed,
        feedback,
        questions,
        jobDescription,
        timestamp: Date.now(),
      };
      localStorage.setItem("resumeAnalysisData", JSON.stringify(dataToStore));
      setHasSavedData(true);
    }
  }, [parsed, feedback, questions, jobDescription]);

  async function handleSubmit(file: File, jobDesc: string) {
    setLoading(true);
    setError(null);
    setJobDescription(jobDesc);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload resume
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { fileId } = await uploadRes.json();

      // Parse resume
      const parsedRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });
      if (!parsedRes.ok) throw new Error("Parsing failed");
      const parsedData = await parsedRes.json();
      setParsed(parsedData);

      // Fetch feedback + interview in parallel
      const [feedbackRes, questionRes] = await Promise.all([
        fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parsedResume: parsedData, jobDescription: jobDesc }),
        }),
        fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parsedResume: parsedData, jobDescription: jobDesc }),
        }),
      ]);

      const feedbackData = await feedbackRes.json();
      const questionData = await questionRes.json();

      // ---- Handle UpgradePopup ----
      if (feedbackData.feedback.isMock && questionData.isMock) {
        setLimitType("both");
        setShowUpgradePopup(true);
      } else if (feedbackData.feedback.isMock) {
        setLimitType("feedback");
        setShowUpgradePopup(true);
      } else if (questionData.isMock) {
        setLimitType("questions");
        setShowUpgradePopup(true);
      }

      // ---- Only set non-mock results to state ----
      if (!feedbackData.feedback.isMock) {
        setFeedback(feedbackData.feedback);
      } else {
        setFeedback(null);
      }

      if (!questionData.isMock) {
        setQuestions(questionData.questions || []);
      } else {
        setQuestions([]);
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const clearSavedData = () => {
    setParsed(null);
    setFeedback(null);
    setQuestions([]);
    setJobDescription("");
    setHasSavedData(false);
    setActiveTab("feedback");
    localStorage.removeItem("resumeAnalysisData");
  };

  const hasResults = feedback || questions.length > 0;

  return (
    <div className="min-h-screen py-8 px-4 text-gray-100">
      <div className="max-w-6xl mx-auto">
        <UploadForm onSubmit={handleSubmit} initialJobDescription={jobDescription} disabled={loading} />

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <MultiStepLoader loadingStates={LOADING_STATES} loading={loading} duration={2000} />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-800 border border-red-700 rounded-lg text-red-200"
          >
            <div className="flex items-center">
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="mt-2 text-sm text-red-300 underline">
              Dismiss
            </button>
          </motion.div>
        )}

        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 border border-gray-700 rounded-xl shadow-sm p-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Analysis Results</h2>
                <p className="text-gray-400">Based on your resume and the job description</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <PDFExport feedback={feedback?.feedback} questions={questions} parsedResume={parsed} />
                <button
                  onClick={clearSavedData}
                  className="flex items-center justify-center px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                >
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
   {activeTab === "feedback" && <Feedback feedback={feedback} />}
  {activeTab === "questions" && <InterviewQuestions questions={questions} />}
            </div>
          </motion.div>
        )}

        {!hasResults && hasSavedData && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
          >
            Saved analysis detected. You can continue where you left off.
          </motion.div>
        )}
      </div>
      <UpgradePopup
        isOpen={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
        limitType={limitType}
      />

    </div>
  );
}

export default ResumePage;
