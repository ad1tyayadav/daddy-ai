/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getFile } from "@/lib/fileStore";

export const runtime = "nodejs";

// Simple regex-based resume parser
function parseResumeText(text: string) {
  // Basic structure with fallbacks
  const result: any = {
    name: "",
    contact: {},
    summary: "",
    skills: [],
    experience: [],
    education: [],
  };

  // Try to extract name (first line that looks like a name)
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length > 0) {
    // Simple heuristic: assume the first non-empty line is the name
    result.name = lines[0];
  }

  // Extract email
  const emailMatch = text.match(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  );
  if (emailMatch) {
    result.contact.email = emailMatch[0];
  }

  // Extract phone (simple pattern)
  const phoneMatch = text.match(
    /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/
  );
  if (phoneMatch) {
    result.contact.phone = phoneMatch[0];
  }

  // Try to find sections using common headings
  const sections = {
    experience: ["experience", "work experience", "employment", "work history"],
    education: ["education", "academic", "qualifications"],
    skills: ["skills", "technical skills", "competencies", "technologies"],
    summary: ["summary", "objective", "profile"],
  };

  // Extract section content
  Object.entries(sections).forEach(([section, keywords]) => {
    const lowerText = text.toLowerCase();

    for (const keyword of keywords) {
      const index = lowerText.indexOf(keyword);
      if (index !== -1) {
        // Find the content after the section heading
        const afterHeading = text.substring(index + keyword.length);
        const nextSectionIndex = Math.min(
          ...Object.values(sections)
            .flat()
            .map((k) => afterHeading.toLowerCase().indexOf(k))
            .filter((i) => i > 0)
        );

        if (nextSectionIndex > 0) {
          result[section] = afterHeading.substring(0, nextSectionIndex).trim();
        } else {
          result[section] = afterHeading.trim();
        }
        break;
      }
    }
  });

  // Try to parse experience into array of objects
  if (typeof result.experience === "string") {
    // Simple parsing: split by likely job entries
    const experienceEntries = result.experience.split(
      /(?=\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\b|\d{4})/
    );

    result.experience = experienceEntries
      .filter((entry: { trim: () => { (): any; new(): any; length: number; }; }) => entry.trim().length > 0)
      .map((entry: string) => {
        // Try to extract title, company, and bullets
        const lines = entry
          .split("\n")
          .filter((line) => line.trim().length > 0);

        if (lines.length === 0) return null;

        const experienceItem: any = {
          title: "",
          company: "",
          bullets: [],
        };

        // First line might contain title and company
        const firstLine = lines[0];
        const titleCompanyMatch =
          firstLine.match(/(.*?)\s+at\s+(.*)/i) ||
          firstLine.match(/(.*?),\s*(.*)/);

        if (titleCompanyMatch) {
          experienceItem.title = titleCompanyMatch[1].trim();
          experienceItem.company = titleCompanyMatch[2].trim();
        } else {
          experienceItem.title = firstLine.trim();
        }

        // Remaining lines as bullets
        if (lines.length > 1) {
          experienceItem.bullets = lines
            .slice(1)
            .filter((line) => line.trim().length > 0)
            .map((line) => line.replace(/^[-•*]\s*/, "").trim());
        }

        return experienceItem;
      })
      .filter((item: null) => item !== null);
  }

  // Parse skills into array
  if (typeof result.skills === "string") {
    result.skills = result.skills
      .split(/[,;•\-]|\n/)
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);
  }

  return result;
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: `Invalid JSON in request body  Error ${parseError}` },
        { status: 400 }
      );
    }
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "No fileId provided" },
        { status: 400 }
      );
    }

    const file = getFile(fileId);
    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    let rawText = "";
    if (file.mimeType.includes("pdf") || file.filename.endsWith(".pdf")) {
      // Use pdf2json
      const PDFParser = (await import("pdf2json")).default;
      const pdfParser = new PDFParser();

      rawText = await new Promise((resolve, reject) => {
        let text = "";

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pdfParser.on("pdfParser_dataError", (_errData: any) => {
          reject(new Error("Failed to parse PDF"));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
          try {
            text = pdfData.Pages.map((page: any) =>
              page.Texts.map((textObj: any) =>
                decodeURIComponent(textObj.R[0].T)
              ).join(" ")
            ).join("\n");

            resolve(text);
          } catch (e) {
            reject(e);
          }
        });

        pdfParser.parseBuffer(file.buffer);
      });
    } else if (
      file.mimeType.includes("officedocument.wordprocessingml.document") ||
      file.filename.endsWith(".docx")
    ) {
      const mammoth = (await import("mammoth")).default;
      const { value } = await mammoth.extractRawText({ buffer: file.buffer });
      rawText = value;
    } else {
      rawText = file.buffer.toString("utf8");
    }

    // Parse the raw text into structured data
    const structuredData = parseResumeText(rawText);

    return NextResponse.json({
      success: true,
      parsed: {
        rawText,
        structured: structuredData,
      },
    });
  } catch (err: any) {
    console.error("Parse error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Parse failed" },
      { status: 500 }
    );
  }
}
