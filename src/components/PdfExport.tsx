/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import jsPDF from "jspdf";

interface PDFExportProps {
    feedback: any;
    questions: any[];
    parsedResume: any;
}

export default function PDFExport({ feedback, questions, }: PDFExportProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const downloadPDF = async () => {
        setIsGenerating(true);

        try {
            const pdf = new jsPDF("p", "mm", "a4");
            let y = 20;
            const lineHeight = 7;
            const pageHeight = 277;

            // Title
            pdf.setFontSize(22);
            pdf.text("Resume Analysis Report", 105, y, { align: "center" });
            y += 15;

            pdf.setFontSize(12);
            pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, y, { align: "center" });
            y += 20;

            // Feedback
            if (feedback) {
                pdf.setFontSize(16);
                pdf.text("Resume Feedback", 20, y);
                y += 10;

                pdf.setFontSize(12);
                pdf.text(`Suitability Score: ${feedback.score}/10`, 20, y);
                y += lineHeight;

                const scoreLines = pdf.splitTextToSize(feedback.scoreExplanation, 170);
                pdf.text(scoreLines, 20, y);
                y += scoreLines.length * lineHeight + 5;

                const tldrLines = pdf.splitTextToSize(feedback.tldr, 170);
                pdf.text(tldrLines, 20, y);
                y += tldrLines.length * lineHeight + 10;

                const addListSection = (title: string, items: string[], color?: string) => {
                    if (!items || items.length === 0) return;
                    pdf.setFontSize(14);
                    if (color) pdf.setTextColor(color);
                    pdf.text(title, 20, y);
                    pdf.setTextColor("#000000");
                    y += lineHeight;

                    pdf.setFontSize(12);
                    items.forEach(item => {
                        const lines = pdf.splitTextToSize(`• ${item}`, 170);
                        pdf.text(lines, 25, y);
                        y += lines.length * lineHeight;
                        if (y > pageHeight) { pdf.addPage(); y = 20; }
                    });
                    y += 5;
                };

                addListSection("Hard Truths:", feedback.brutalTruths);
                addListSection("Red Flags:", feedback.redFlags, "#d32f2f");

                // Suggestions
                if (feedback.suggestions && feedback.suggestions.length > 0) {
                    pdf.setFontSize(14);
                    pdf.text("Actionable Suggestions:", 20, y);
                    y += lineHeight;

                    pdf.setFontSize(12);
                    feedback.suggestions.forEach((s: any) => {
                        pdf.setFont('helvetica', 'bold');
                        pdf.text(`${s.priority} Priority:`, 25, y);
                        y += lineHeight;

                        pdf.setFont('helvetica', 'normal');
                        const currentLines = pdf.splitTextToSize(`Current: ${s.current}`, 165);
                        pdf.text(currentLines, 30, y);
                        y += currentLines.length * lineHeight;

                        const improvedLines = pdf.splitTextToSize(`Improved: ${s.improved}`, 165);
                        pdf.text(improvedLines, 30, y);
                        y += improvedLines.length * lineHeight;

                        if (s.explanation) {
                            const explanationLines = pdf.splitTextToSize(`Why: ${s.explanation}`, 165);
                            pdf.text(explanationLines, 30, y);
                            y += explanationLines.length * lineHeight;
                        }

                        y += 5;
                        if (y > pageHeight) { pdf.addPage(); y = 20; }
                    });
                }

                // Missing Keywords
                if (feedback.missingKeywords) {
                    pdf.setFontSize(14);
                    pdf.text("Missing Keywords", 20, y);
                    y += lineHeight;

                    pdf.setFontSize(12);
                    const renderKeywords = (title: string, arr: string[], color: string) => {
                        pdf.setFont('helvetica', 'bold');
                        pdf.text(title, 25, y);
                        y += lineHeight;
                        pdf.setFont('helvetica', 'normal');

                        const line = arr.join(", ");
                        const lines = pdf.splitTextToSize(line, 165);
                        pdf.setTextColor(color);
                        pdf.text(lines, 30, y);
                        y += lines.length * lineHeight;
                        pdf.setTextColor("#000000");
                    };
                    renderKeywords("Hard Skills:", feedback.missingKeywords.hardSkills, "#1976d2");
                    renderKeywords("Soft Skills:", feedback.missingKeywords.softSkills, "#388e3c");
                }

                // Example Bullets
                if (feedback.exampleBullets && feedback.exampleBullets.length > 0) {
                    pdf.setFontSize(14);
                    pdf.text("Rewritten Examples", 20, y);
                    y += lineHeight;

                    pdf.setFontSize(12);
                    feedback.exampleBullets.forEach((b: any) => {
                        const originalLines = pdf.splitTextToSize(`Original: ${b.original}`, 165);
                        pdf.setTextColor("#000000");
                        pdf.text(originalLines, 25, y);
                        y += originalLines.length * lineHeight;

                        const improvedLines = pdf.splitTextToSize(`Improved: ${b.improved}`, 165);
                        pdf.setTextColor("#7b1fa2");
                        pdf.text(improvedLines, 25, y);
                        y += improvedLines.length * lineHeight;

                        const explanationLines = pdf.splitTextToSize(b.explanation, 165);
                        pdf.setTextColor("#666666");
                        pdf.text(explanationLines, 25, y);
                        y += explanationLines.length * lineHeight;

                        pdf.setTextColor("#000000");
                        y += 5;
                        if (y > pageHeight) { pdf.addPage(); y = 20; }
                    });
                }
            }

            // Interview Questions
            if (questions && questions.length > 0) {
                if (y > pageHeight - 50) { pdf.addPage(); y = 20; }

                pdf.setFontSize(16);
                pdf.text("Interview Questions", 20, y);
                y += 15;

                pdf.setFontSize(12);
                questions.forEach((q: any, index: number) => {
                    if (y > pageHeight - 50) { pdf.addPage(); y = 20; }

                    pdf.setFont('helvetica', 'bold');
                    const questionLines = pdf.splitTextToSize(`${index + 1}. ${q.question}`, 170);
                    pdf.text(questionLines, 20, y);
                    y += questionLines.length * lineHeight;

                    pdf.setFont('helvetica', 'normal');
                    pdf.text(`Type: ${q.type} | Difficulty: ${q.difficulty}`, 20, y);
                    y += lineHeight;

                    pdf.text("Model Answer:", 20, y);
                    y += lineHeight;
                    const answerLines = pdf.splitTextToSize(q.modelAnswer, 165);
                    pdf.text(answerLines, 25, y);
                    y += answerLines.length * lineHeight + 5;

                    // Tips
                    if (q.tips && q.tips.length > 0) {
                        pdf.text("Answering Tips:", 25, y);
                        y += lineHeight;
                        q.tips.forEach((tip: string) => {
                            const lines = pdf.splitTextToSize(`• ${tip}`, 165);
                            pdf.text(lines, 30, y);
                            y += lines.length * lineHeight;
                            if (y > pageHeight) { pdf.addPage(); y = 20; }
                        });
                        y += 5;
                    }

                    // Follow-ups
                    if (q.followUps && q.followUps.length > 0) {
                        pdf.text("Potential Follow-up Questions:", 25, y);
                        y += lineHeight;
                        q.followUps.forEach((f: string) => {
                            const lines = pdf.splitTextToSize(`• ${f}`, 165);
                            pdf.text(lines, 30, y);
                            y += lines.length * lineHeight;
                            if (y > pageHeight) { pdf.addPage(); y = 20; }
                        });
                        y += 5;
                    }
                });
            }

            pdf.save("resume-analysis-report.pdf");
        } catch (err) {
            console.error("PDF generation failed:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <button
                onClick={downloadPDF}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating PDF...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF Report
                    </>
                )}
            </button>
        </>
    );
}