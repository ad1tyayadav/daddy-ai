export default function ParsedResume({ parsed }: { parsed: any }) {
  if (!parsed) return null;

  return (
    <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "6px" }}>
      <h2>Parsed Resume</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(parsed, null, 2)}
      </pre>
    </div>
  );
}
