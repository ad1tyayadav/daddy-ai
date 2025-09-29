"use client";

import { useEffect, useState } from "react";
import { 
  ChevronDown, 
  Monitor, 
  Users, 
  BarChart3, 
  Building, 
  HelpCircle,
  CheckCircle,
  ArrowRight,
  BookOpen,
  AlertTriangle
} from "lucide-react";
import UpgradePopup from "./PopUp";

interface InterviewQuestion {
  type: string;
  difficulty: string;
  question: string;
  modelAnswer: string;
  tips: string[];
  followUps: string[];
  preparationResources: string[];
  redFlags: string[];
}

interface InterviewQuestionsProps {
  questions: InterviewQuestion[];
  limitReached?: boolean;
  onCloseRedirect?: () => void;
}

export default function InterviewQuestions({ questions, limitReached, onCloseRedirect }: InterviewQuestionsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const expandAll = () => {
    setExpandedQuestions(questions.map((_, index) => index));
  };

  const collapseAll = () => {
    setExpandedQuestions([]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-300 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-300 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "technical": return <Monitor className="w-4 h-4" />;
      case "behavioral": return <Users className="w-4 h-4" />;
      case "system-design": return <BarChart3 className="w-4 h-4" />;
      case "cultural": return <Building className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "technical": return "text-blue-400";
      case "behavioral": return "text-purple-400";
      case "system-design": return "text-green-400";
      case "cultural": return "text-orange-400";
      default: return "text-gray-400";
    }
  };

  useEffect(() => {
    if (limitReached || !questions || questions.length === 0) {
      setIsPopupOpen(true);
    }
  }, [limitReached, questions]);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    if (onCloseRedirect) onCloseRedirect();
  };

  // Show popup if limit reached or no questions
  if (limitReached || !questions || questions.length === 0) {
    return (
      <UpgradePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        limitType="questions"
      />
    );
  }

  // Render questions if we have them
  return (
    <>
      <UpgradePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        limitType="questions"
      />
      
      <div className="min-h-screen sm:p-6 lg:p-8">
        <div className="mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <div className="text-xl sm:text-5xl font-bold text-white">🎯</div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">Interview Preparation</h1>
              <p className="text-gray-400 text-sm sm:text-base">
                {questions.length} curated questions to ace your interview
              </p>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={expandAll}
                className="px-4 py-2 text-sm font-medium text-blue-300 hover:text-blue-200 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all duration-200"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-500/10 border border-gray-500/20 rounded-lg hover:bg-gray-500/20 transition-all duration-200"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4 sm:space-y-6">
            {questions.map((q, index) => {
              const isExpanded = expandedQuestions.includes(index);
              return (
                <div
                  key={index}
                  className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm"
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full p-4 sm:p-6 hover:bg-gray-700/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`flex items-center space-x-2 ${getTypeColor(q.type)}`}>
                            {getTypeIcon(q.type)}
                            <span className="text-sm font-medium capitalize">{q.type}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-lg font-semibold text-white leading-relaxed pr-4">{q.question}</h3>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-700/50">
                      <div className="space-y-6 mt-4">
                        {/* Model Answer */}
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <CheckCircle className="w-4 h-4 text-blue-400" />
                            <h4 className="text-sm font-semibold text-blue-300">Model Answer</h4>
                          </div>
                          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{q.modelAnswer}</p>
                          </div>
                        </div>

                        {/* Tips */}
                        {q.tips?.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-2 mb-3">
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                              <h4 className="text-sm font-semibold text-emerald-300">Answering Tips</h4>
                            </div>
                            <div className="space-y-2">
                              {q.tips.map((tip, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-ups */}
                        {q.followUps?.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-2 mb-3">
                              <ArrowRight className="w-4 h-4 text-purple-400" />
                              <h4 className="text-sm font-semibold text-purple-300">Potential Follow-ups</h4>
                            </div>
                            <div className="space-y-2">
                              {q.followUps.map((fu, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                  <ArrowRight className="w-3 h-3 text-purple-400 mt-1 flex-shrink-0" />
                                  <p className="text-gray-300 text-sm leading-relaxed">{fu}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resources */}
                        {q.preparationResources?.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-2 mb-3">
                              <BookOpen className="w-4 h-4 text-amber-400" />
                              <h4 className="text-sm font-semibold text-amber-300">Preparation Resources</h4>
                            </div>
                            <div className="space-y-2">
                              {q.preparationResources.map((res, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-gray-300 text-sm leading-relaxed">{res}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Red Flags */}
                        {q.redFlags?.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-2 mb-3">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              <h4 className="text-sm font-semibold text-red-300">Response Red Flags</h4>
                            </div>
                            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                              {q.redFlags.map((flag, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                  <AlertTriangle className="w-3 h-3 text-red-400 mt-1 flex-shrink-0" />
                                  <p className="text-red-300 text-sm leading-relaxed">{flag}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Tip */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl px-6 py-4">
              <span className="text-2xl">💡</span>
              <p className="text-gray-300 text-sm">
                Practice answering these questions aloud to improve your interview performance
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}