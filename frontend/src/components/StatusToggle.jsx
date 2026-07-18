const STAGES = ["Applied", "Technical Round", "HR Round", "Offered", "Rejected"];

const STAGE_COLOR = {
  Applied: "var(--text-dim)",
  "Technical Round": "var(--accent-amber)",
  "HR Round": "var(--accent-violet)",
  Offered: "var(--accent-cyan)",
  Rejected: "var(--accent-coral)",
};

export default function StatusToggle({ status, onChange, disabled }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {STAGES.map((stage) => {
        const active = stage === status;
        return (
          <button
            key={stage}
            disabled={disabled}
            onClick={() => onChange(stage)}
            title={`Mark as ${stage}`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              padding: "4px 7px",
              borderRadius: 4,
              border: `1px solid ${active ? STAGE_COLOR[stage] : "var(--grid-line)"}`,
              background: active ? STAGE_COLOR[stage] + "22" : "transparent",
              color: active ? STAGE_COLOR[stage] : "var(--text-faint)",
              cursor: disabled ? "default" : "pointer",
              transition: "all 120ms ease",
              whiteSpace: "nowrap",
            }}
          >
            {stage === "Technical Round" ? "Tech" : stage === "HR Round" ? "HR" : stage.slice(0, 4)}
          </button>
        );
      })}
    </div>
  );
}

export { STAGES, STAGE_COLOR };
