import pdfParse from "pdf-parse";
import mammoth from "mammoth";

import type { ParsedResume } from "../types/types";

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  if (mimeType === "application/pdf" || filename.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (mimeType.startsWith("text/")) {
    return buffer.toString("utf-8");
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}

export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Simple regex heuristics
const emailRegex = /[^\s]+@[^\s]+\.[^\s]+/;
const phoneRegex = /\+?\d[\d\s().-]{7,15}\d/;
const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s?\d{4}(?:\s?[–-]\s?(?:Present|\d{4}))?/i;

export function parseResume(text: string): ParsedResume {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Contact + name
  const email = text.match(emailRegex)?.[0] ?? null;
  const phone = text.match(phoneRegex)?.[0] ?? null;
  const name = lines[0] && !lines[0].includes("@") ? lines[0] : null;

  // Sections (naive headings split)
  const sections: Record<string, string[]> = {};
  let current = "other";
  for (const line of lines) {
    const heading = matchHeading(line);
    if (heading) {
      current = heading;
      sections[current] = [];
    } else {
      if (!sections[current]) sections[current] = [];
      sections[current].push(line);
    }
  }

  // Skills
  const skills = (sections["skills"] || [])
    .join(" ")
    .split(/[,•|]/)
    .map(s => s.trim())
    .filter(Boolean);

  // Experience
  const expLines = sections["experience"] || [];
  const experiences = chunkByDates(expLines);

  // Education
  const eduLines = sections["education"] || [];
  const education = chunkByBlankLines(eduLines);

  const TECH_KEYWORDS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node",
  "Python", "Java", "C#", "SQL", "Postgres", "MongoDB",
  "AWS", "Docker", "Kubernetes", "Tailwind", "GraphQL",
];

  return {
    name,
    contact: { email, phone },
    summary: sections["summary"]?.join(" ") || null,
    skills,
    experience: experiences,
    education,
    techKeywords: TECH_KEYWORDS
  };
}

function matchHeading(line: string): string | null {
  const lower = line.toLowerCase().replace(/[:\-]+$/, "").trim();
  if (lower.includes("summary") || lower.includes("objective")) return "summary";
  if (lower.includes("skill")) return "skills";
  if (lower.includes("experience")) return "experience";
  if (lower.includes("education")) return "education";
  return null;
}

function chunkByDates(lines: string[]): ParsedResume["experience"] {
  const blocks: ParsedResume["experience"] = [];
  let current: { header: string; bullets: string[] } | null = null;
  for (const line of lines) {
    if (dateRegex.test(line)) {
      if (current) blocks.push(toExp(current));
      current = { header: line, bullets: [] };
    } else if (line.startsWith("•") || line.startsWith("-")) {
      current?.bullets.push(line.replace(/^[-•]\s*/, ""));
    } else {
      if (current) current.header += " " + line;
    }
  }
  if (current) blocks.push(toExp(current));
  return blocks;
}

function toExp(block: { header: string; bullets: string[] }) {
  return { title: block.header, company: null, dates: null, bullets: block.bullets };
}

function chunkByBlankLines(lines: string[]): string[] {
  const chunks: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (!line.trim()) {
      if (current.length) {
        chunks.push(current.join(" "));
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length) chunks.push(current.join(" "));
  return chunks;
}
