"use client";
import { useState } from "react";

export default function UploadForm({
  onSubmit,
}: {
  onSubmit: (file: File, jobDescription: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (file) onSubmit(file, jobDescription);
      }}
      style={{ marginBottom: "2rem" }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <label>Upload Resume:</label>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Job Description:</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={5}
          required
          style={{ width: "100%" }}
        />
      </div>
      <button type="submit" disabled={!file || !jobDescription.trim()}>
        Analyze Resume
      </button>
    </form>
  );
}
