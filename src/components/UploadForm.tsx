"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FileUpload } from "./ui/file-upload";
import { IconUpload, IconFileDescription } from "@tabler/icons-react";

export default function UploadForm({
  onSubmit,
  initialJobDescription = "",
}: {
  onSubmit: (file: File, jobDescription: string) => Promise<void>;
  initialJobDescription?: string;
  disabled?: boolean; 
}) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [isLoading, setIsLoading] = useState(false);

  // Update job description when initialJobDescription changes
  useEffect(() => {
    setJobDescription(initialJobDescription);
  }, [initialJobDescription]);

  const handleFileChange = (files: File[]) => {
    setFile(files.length > 0 ? files[0] : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobDescription.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(file, jobDescription);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 mx-auto mt-6 w-full max-w-3xl"
    >
      <div className="rounded-2xl sm:p-8 shadow-xl border border-neutral-200/60 dark:border-neutral-700/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            Resume Analysis
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Upload your resume and job description for personalized feedback and interview preparation
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Upload Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              <IconUpload className="w-5 h-5 mr-2 text-blue-500" />
              Upload Resume (PDF, DOCX, TXT)
            </label>
            <div className="rounded-xl border-2 border-dashed border-neutral-300/70 hover:border-blue-400/50 transition-colors bg-white/80 dark:bg-neutral-800/50 dark:border-neutral-600/50 p-4">
              <FileUpload
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                maxFiles={1}
              />
            </div>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Selected: {file.name}
              </motion.div>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              <IconFileDescription className="w-5 h-5 mr-2 text-blue-500" />
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              required
              className="w-full rounded-xl border border-neutral-300/70 bg-white/80 px-4 py-3 text-sm text-neutral-800 shadow-sm transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/40 dark:border-neutral-600/50 dark:bg-neutral-800/50 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/30
                [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
              placeholder="Paste the job description here... (Responsibilities, requirements, technologies used, etc.)"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!file || !jobDescription.trim() || isLoading}
            whileHover={{
              scale: !(!file || !jobDescription.trim() || isLoading) ? 1.02 : 1,
            }}
            whileTap={{ scale: 0.98 }}
            className={`w-full rounded-xl sm:px-6 py-4 font-semibold text-lg transition-all duration-300 flex items-center justify-center
              ${!file || !jobDescription.trim() || isLoading
                ? "cursor-not-allowed bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-indigo-500 dark:from-blue-500 dark:to-indigo-500"
              }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Resume...
              </>
            ) : (
              "Analyze Resume & Generate Feedback"
            )}
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );
}