/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ChevronDown, CheckCircle, AlertCircle, Lightbulb, Tag, FileText } from "lucide-react";
import UpgradePopup from "./PopUp";

interface Suggestion {
  priority: "High" | "Medium" | "Low";
  suggestion: string;
  example: string;
}

interface FeedbackData {
  score: number;
  scoreExplanation: string;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestions: Suggestion[];
  missingKeywords: {
    hardSkills: string[];
    softSkills: string[];
  };
  exampleBullets: Array<{
    original: string;
    improved: string;
    reasoning: string;
  }>;
}

interface FeedbackProps {
  feedback?: FeedbackData;
  limitReached?: boolean;
  onCloseRedirect?: () => void;
}

export default function Feedback({ feedback, limitReached, onCloseRedirect }: FeedbackProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    strengths: true,
    improvements: true,
    suggestions: true,
    keywords: true,
    examples: true
  });

    const [isPopupOpen, setIsPopupOpen] = useState(false);

      useEffect(() => {
    if (limitReached || !feedback) {
      setIsPopupOpen(true);
    }
  }, [limitReached, feedback]);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    if (onCloseRedirect) onCloseRedirect();
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-yellow-400";
    if (score >= 4) return "text-orange-400";
    return "text-red-400";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-500/10 text-red-300 border-red-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
      case "Low": return "bg-blue-500/10 text-blue-300 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-300 border-gray-500/20";
    }
  };

  // Show popup if limit reached or feedback missing
if (limitReached || !feedback) {
  return (
      <UpgradePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        limitType="feedback"
      />
      );
}

  return (
    <>
      {/* Popup */}
      <UpgradePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        limitType="feedback"
      />

      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <div className={`text-5xl sm:text-6xl lg:text-7xl font-bold ${getScoreColor(feedback.score)}`}>
                {feedback.score}/10
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">Resume Score</h1>
            </div>

            {/* Summary */}
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="absolute -top-3 left-6 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 rounded-full text-sm font-medium text-white">
                Summary
              </div>
              <p className="text-gray-300 leading-relaxed mt-2">
                {feedback.summary}
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4 sm:space-y-6">
            {/* Strengths */}
            {feedback.strengths?.length > 0 && (
              <Section title="Strengths" icon={<CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />} sectionKey="strengths" openSections={openSections} toggleSection={toggleSection} items={feedback.strengths} color="emerald" />
            )}

            {/* Areas for Improvement */}
            {feedback.areasForImprovement?.length > 0 && (
              <Section title="Areas for Improvement" icon={<AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />} sectionKey="improvements" openSections={openSections} toggleSection={toggleSection} items={feedback.areasForImprovement} color="orange" />
            )}

            {/* Suggestions */}
            {feedback.suggestions?.length > 0 && (
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                <button onClick={() => toggleSection("suggestions")} className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-700/30 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <h2 className="text-sm sm:text-xl font-semibold text-white">
                      Actionable Suggestions
                      <span className="ml-2 text-sm font-normal text-gray-400">({feedback.suggestions.length})</span>
                    </h2>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openSections.suggestions ? "rotate-180" : ""}`} />
                </button>
                {openSections.suggestions && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-700/50">
                    <div className="space-y-4 sm:space-y-6 mt-4">
                      {feedback.suggestions.map((sugg, idx) => (
                        <div key={idx} className="space-y-3">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(sugg.priority)}`}>
                            {sugg.priority} Priority
                          </span>
                          <p className="text-gray-300 leading-relaxed pl-4 border-l-2 border-yellow-500/30 text-sm sm:text-base">
                            {sugg.suggestion}
                          </p>
                          {sugg.example && (
                            <div className="ml-4 p-3 bg-gray-700/30 rounded-lg">
                              <p className="text-xs sm:text-sm text-gray-400">
                                <span className="font-medium text-gray-300">Example:</span> {sugg.example}
                              </p>
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
              <KeywordsSection feedback={feedback} openSections={openSections} toggleSection={toggleSection} />
            )}

            {/* Example Bullets */}
            {feedback.exampleBullets?.length > 0 && (
              <ExampleBulletsSection bullets={feedback.exampleBullets} openSections={openSections} toggleSection={toggleSection} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable Section
function Section({ title, icon, sectionKey, openSections, toggleSection, items, color }: any) {
  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
      <button onClick={() => toggleSection(sectionKey)} className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-700/30 transition-all duration-200">
        <div className="flex items-center space-x-3">
          {icon}
          <h2 className="text-sm sm:text-xl font-semibold text-white">
            {title}
            <span className="ml-2 text-sm font-normal text-gray-400">({items.length})</span>
          </h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openSections[sectionKey] ? "rotate-180" : ""}`} />
      </button>
      {openSections[sectionKey] && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-700/50">
          <div className="space-y-3 mt-4">
            {items.map((item: string, idx: number) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className={`w-1.5 h-1.5 bg-${color}-400 rounded-full mt-2 flex-shrink-0`}></div>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Keywords Section
function KeywordsSection({ feedback, openSections, toggleSection }: any) {
  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
      <button onClick={() => toggleSection("keywords")} className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-700/30 transition-all duration-200">
        <div className="flex items-center space-x-3">
          <Tag className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <h2 className="text-sm sm:text-xl font-semibold text-white">
            Missing Keywords
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({feedback.missingKeywords.hardSkills.length + feedback.missingKeywords.softSkills.length})
            </span>
          </h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openSections.keywords ? "rotate-180" : ""}`} />
      </button>
      {openSections.keywords && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-700/50">
          <div className="space-y-6 mt-4">
            {feedback.missingKeywords.hardSkills.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-medium text-white mb-3">Hard Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {feedback.missingKeywords.hardSkills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-2 sm:px-3 py-1 bg-red-500/10 text-red-300 rounded-lg text-xs sm:text-sm border border-red-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {feedback.missingKeywords.softSkills.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-medium text-white mb-3">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {feedback.missingKeywords.softSkills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-2 sm:px-3 py-1 bg-blue-500/10 text-blue-300 rounded-lg text-xs sm:text-sm border border-blue-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Example Bullets Section
function ExampleBulletsSection({ bullets, openSections, toggleSection }: any) {
  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
      <button onClick={() => toggleSection("examples")} className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-700/30 transition-all duration-200">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <h2 className="text-sm sm:text-xl font-semibold text-white">
            Rewritten Examples
            <span className="ml-2 text-sm font-normal text-gray-400">({bullets.length})</span>
          </h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openSections.examples ? "rotate-180" : ""}`} />
      </button>
      {openSections.examples && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-700/50">
          <div className="space-y-6 sm:space-y-8 mt-4">
            {bullets.map((b: any, idx: number) => (
              <div key={idx} className="space-y-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-red-400 mb-2">Before:</h4>
                  <p className="text-gray-300 p-3 sm:p-4 bg-red-500/5 rounded-lg border-l-4 border-red-500/30 text-sm sm:text-base leading-relaxed">{b.original}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-emerald-400 mb-2">After:</h4>
                  <p className="text-gray-300 p-3 sm:p-4 bg-emerald-500/5 rounded-lg border-l-4 border-emerald-500/30 text-sm sm:text-base leading-relaxed">{b.improved}</p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-700/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    <span className="font-medium text-gray-300">Why this works better:</span> {b.reasoning}
                  </p>
                </div>
                {idx < bullets.length - 1 && <div className="border-b border-gray-700/50"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}