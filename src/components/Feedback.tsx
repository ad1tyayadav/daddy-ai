"use client";

import { useState } from "react";

interface Suggestion {
  priority: string;
  current: string;
  improved: string;
  explanation?: string;
}

interface FeedbackData {
  score: number;
  scoreExplanation: string;
  tldr: string;
  brutalTruths: string[];
  redFlags: string[];
  suggestions: Suggestion[];
  missingKeywords: {
    hardSkills: string[];
    softSkills: string[];
  };
  exampleBullets: Array<{
    original: string;
    improved: string;
    explanation: string;
  }>;
  structuralIssues: string[];
}

export default function Feedback({ feedback }: { feedback: FeedbackData }) {
  if (!feedback) return null;

  // State for collapsible sections
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [openSections, setOpenSections] = useState({
    brutalTruths: true,
    redFlags: true,
    suggestions: true,
    keywords: true,
    examples: true,
    structural: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 4) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          Resume Feedback
        </h2>
        <div className="flex items-center">
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mr-2">
            Overall Score:
          </span>
          <div className={`text-2xl font-bold ${getScoreColor(feedback.score)}`}>
            {feedback.score}/10
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Summary
        </h3>
        <p className="text-neutral-700 dark:text-neutral-300">
          {feedback.tldr}
        </p>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {feedback.scoreExplanation}
        </p>
      </div>

      <div className="space-y-6">
        {/* Brutal Truths */}
        {feedback.brutalTruths && feedback.brutalTruths.length > 0 && (
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("brutalTruths")}
              className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Hard Truths
                <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  ({feedback.brutalTruths.length})
                </span>
              </h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${openSections.brutalTruths ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.brutalTruths && (
              <div className="p-4 bg-white dark:bg-neutral-900">
                <ul className="space-y-3">
                  {feedback.brutalTruths.map((truth, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3 text-red-500">
                        ⚠️
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {truth}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Red Flags */}
        {feedback.redFlags && feedback.redFlags.length > 0 && (
          <div className="border border-red-200 dark:border-red-800/50 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("redFlags")}
              className="w-full p-4 bg-red-50 dark:bg-red-900/20 flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Critical Red Flags
                <span className="ml-2 text-sm font-normal text-red-600 dark:text-red-300">
                  ({feedback.redFlags.length})
                </span>
              </h3>
              <svg
                className={`w-5 h-5 text-red-600 dark:text-red-400 transform transition-transform ${openSections.redFlags ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.redFlags && (
              <div className="p-4 bg-white dark:bg-neutral-900">
                <ul className="space-y-3">
                  {feedback.redFlags.map((flag, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3 text-red-500">
                        🚩
                      </span>
                      <span className="text-red-700 dark:text-red-300">
                        {flag}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("suggestions")}
              className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Actionable Suggestions
                <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  ({feedback.suggestions.length})
                </span>
              </h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${openSections.suggestions ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.suggestions && (
              <div className="p-4 bg-white dark:bg-neutral-900">
                <div className="space-y-4">
                  {feedback.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${suggestion.priority === "Critical"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : suggestion.priority === "High"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }`}>
                          {suggestion.priority} Priority
                        </span>
                      </div>

                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          Current:
                        </h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                          {suggestion.current}
                        </p>
                      </div>

                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          Improved:
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                          {suggestion.improved}
                        </p>
                      </div>

                      {suggestion.explanation && (
                        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 italic">
                          {suggestion.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Missing Keywords */}
        {feedback.missingKeywords && (
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("keywords")}
              className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Missing Keywords
              </h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${openSections.keywords ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.keywords && (
              <div className="p-4 bg-white dark:bg-neutral-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Hard Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {feedback.missingKeywords.hardSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Soft Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {feedback.missingKeywords.softSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Example Bullets */}
        {feedback.exampleBullets && feedback.exampleBullets.length > 0 && (
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("examples")}
              className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Rewritten Examples
                <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  ({feedback.exampleBullets.length})
                </span>
              </h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${openSections.examples ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.examples && (
              <div className="p-4 bg-white dark:bg-neutral-900">
                <div className="space-y-4">
                  {feedback.exampleBullets.map((bullet, index) => (
                    <div key={index} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1 flex items-center">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                          Original:
                        </h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 p-3 rounded">
                          {bullet.original}
                        </p>
                      </div>

                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1 flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          Improved:
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-3 rounded">
                          {bullet.improved}
                        </p>
                      </div>

                      <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-2 rounded">
                        <span className="font-medium">Why this works better:</span> {bullet.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Structural Issues */}
        {feedback.structuralIssues && feedback.structuralIssues.length > 0 && (
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("structural")}
              className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Structural Issues
                <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  ({feedback.structuralIssues.length})
                </span>
              </h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${openSections.structural ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.structural && (
              <div className="p-4 bg-white dark:bg-neutral-900">
                <ul className="space-y-3">
                  {feedback.structuralIssues.map((issue, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3 text-orange-500">
                        🛠️
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {issue}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}