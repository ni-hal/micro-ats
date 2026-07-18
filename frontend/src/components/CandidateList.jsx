import StatusToggle from "./StatusToggle.jsx";

export default function CandidateList({ candidates, selectedId, onSelect, onStatusChange }) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--grid-line)",
        borderRadius: 10,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-faint)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "2px 6px 10px",
        }}
      >
        Candidates · {candidates.length}
      </div>

      {candidates.map((c) => {
        const selected = c._id === selectedId;
        return (
          <div
            key={c._id}
            onClick={() => onSelect(c._id)}
            style={{
              padding: "10px 10px",
              borderRadius: 8,
              cursor: "pointer",
              background: selected ? "var(--panel-raised)" : "transparent",
              border: `1px solid ${selected ? "var(--accent-cyan)" : "transparent"}`,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{c.position}</span>
            <StatusToggle
              status={c.status}
              onChange={(status) => onStatusChange(c._id, status)}
            />
          </div>
        );
      })}

      {candidates.length === 0 && (
        <div style={{ color: "var(--text-faint)", fontSize: 13, padding: 8 }}>
          No candidates yet.
        </div>
      )}
    </div>
  );
}
