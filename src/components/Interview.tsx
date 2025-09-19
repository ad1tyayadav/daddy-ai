// components/Interview.tsx
"use client";

import { useState } from "react";

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
}

export default function InterviewQuestions({ questions }: InterviewQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
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
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'technical':
        return '💻';
      case 'behavioral':
        return '👥';
      case 'system-design':
        return '📊';
      case 'cultural':
        return '🏢';
      default:
        return '❓';
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80 mt-8">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 sm:mb-0">
          Interview Preparation
          <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
            ({questions.length} questions)
          </span>
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={expandAll}
            className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300 border border-neutral-200 dark:border-neutral-800 rounded-md"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, index) => {
          const isExpanded = expandedQuestions.includes(index);
          
          return (
            <div key={index} className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              {/* Question header - clickable to expand/collapse */}
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 flex items-start justify-between text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-lg">{getTypeIcon(q.type)}</span>
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 capitalize">
                      {q.type}
                    </span>
                    <span className={`ml-3 text-sm font-medium px-2 py-1 rounded-full ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                    {q.question}
                  </h3>
                </div>
                <svg
                  className={`w-5 h-5 text-neutral-500 flex-shrink-0 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="p-4 bg-white dark:bg-neutral-900 space-y-5">
                  {/* Model Answer */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Model Answer
                    </h4>
                    <div className="text-sm text-neutral-700 dark:text-neutral-300 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800/30">
                      {q.modelAnswer}
                    </div>
                  </div>

                  {/* Tips */}
                  {q.tips && q.tips.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Answering Tips
                      </h4>
                      <ul className="space-y-2">
                        {q.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-green-500">✓</span>
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {q.followUps && q.followUps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Potential Follow-ups
                      </h4>
                      <ul className="space-y-2">
                        {q.followUps.map((followUp, fuIndex) => (
                          <li key={fuIndex} className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-purple-500">↳</span>
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{followUp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preparation Resources */}
                  {q.preparationResources && q.preparationResources.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                        Preparation Resources
                      </h4>
                      <ul className="space-y-2">
                        {q.preparationResources.map((resource, resIndex) => (
                          <li key={resIndex} className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-amber-500">📚</span>
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Red Flags */}
                  {q.redFlags && q.redFlags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Response Red Flags
                      </h4>
                      <ul className="space-y-2">
                        {q.redFlags.map((flag, flagIndex) => (
                          <li key={flagIndex} className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-red-500">⚠️</span>
                            <span className="text-sm text-red-700 dark:text-red-300">{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
          💡 Practice answering these questions aloud to improve your interview performance
        </p>
      </div>
    </div>
  );
}