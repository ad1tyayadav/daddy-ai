export default function InterviewQuestions({ questions }: { questions: any[] }) {
  if (!questions || questions.length === 0) return <p>No questions generated.</p>;

  return (
    <div>
      <h2>Interview Questions</h2>
      {questions.map((q, idx) => (
        <div
          key={idx}
          style={{
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}
        >
          <p><strong>Q{idx + 1}:</strong> {q.q}</p>
          <p><strong>Answer:</strong> {q.answer}</p>
          <p><strong>Tip:</strong> {q.tip}</p>
        </div>
      ))}
    </div>
  );
}
