export default function Feedback({ feedback }: { feedback: any }) {
  if (!feedback) return null;

  return (
    <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "6px" }}>
      <h2>Resume Feedback</h2>
      <p><strong>Score:</strong> {feedback.score}</p>
      <p><strong>Summary:</strong> {feedback.tldr}</p>

      <h3>Suggestions</h3>
      <ul>
        {feedback.suggestions?.map((s: string, idx: number) => (
          <li key={idx}>{s}</li>
        ))}
      </ul>

      <h3>Keywords</h3>
      <p>{feedback.keywords?.join(", ")}</p>

      <h3>Strong Points</h3>
      <ul>
        {feedback.strongPoints?.map((p: string, idx: number) => (
          <li key={idx}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
