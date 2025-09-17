export default function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #ddd", marginBottom: "1rem" }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: active === tab.id ? "#0070f3" : "transparent",
            color: active === tab.id ? "white" : "#0070f3",
            border: "none",
            cursor: "pointer",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
