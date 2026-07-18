import { LOCAL_TIMEZONE, formatLocal, formatUTC } from "../utils/timezone.js";
import { STAGE_COLOR } from "./StatusToggle.jsx";

const START_HOUR = 8; // grid window, in the viewer's LOCAL day
const END_HOUR = 19;
const ROW_HEIGHT = 34; // px per 30-minute row

function rowsForDay() {
  const rows = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    rows.push({ h, m: 0 });
    rows.push({ h, m: 30 });
  }
  return rows;
}

// Position (top offset, height) of a slot within today's local grid, in px.
function layoutForSlot(slot, dayAnchor) {
  const start = new Date(slot.startTimeUTC);
  const end = new Date(slot.endTimeUTC);

  const gridStart = new Date(dayAnchor);
  gridStart.setHours(START_HOUR, 0, 0, 0);

  const minutesFromGridStart = (start - gridStart) / 60000;
  const durationMinutes = (end - start) / 60000;

  return {
    top: (minutesFromGridStart / 30) * ROW_HEIGHT,
    height: Math.max((durationMinutes / 30) * ROW_HEIGHT, ROW_HEIGHT * 0.9),
  };
}

export default function CalendarGrid({ interviewers, slots, dayAnchor, onCellClick, flashSlotId }) {
  const rows = rowsForDay();
  const gridTemplateColumns = `72px repeat(${interviewers.length}, 1fr)`;

  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--grid-line)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* header row */}
      <div style={{ display: "grid", gridTemplateColumns, borderBottom: "1px solid var(--grid-line)" }}>
        <div style={{ padding: "10px 8px", fontSize: 10, color: "var(--text-faint)" }} className="mono">
          {LOCAL_TIMEZONE}
        </div>
        {interviewers.map((iv) => (
          <div
            key={iv._id}
            style={{
              padding: "10px 12px",
              borderLeft: "1px solid var(--grid-line)",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 13 }}>{iv.name}</span>
            <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{iv.role}</span>
          </div>
        ))}
      </div>

      {/* body: time rail + interviewer columns */}
      <div style={{ position: "relative", display: "grid", gridTemplateColumns }}>
        {/* time rail */}
        <div>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                height: ROW_HEIGHT,
                borderBottom: "1px solid var(--grid-line)",
                fontSize: 10,
                color: "var(--text-faint)",
                paddingTop: 2,
                paddingLeft: 6,
              }}
              className="mono"
            >
              {r.m === 0 ? `${String(r.h).padStart(2, "0")}:00` : ""}
            </div>
          ))}
        </div>

        {/* interviewer columns */}
        {interviewers.map((iv) => {
          const colSlots = slots.filter((s) => s.interviewer._id === iv._id);
          return (
            <div key={iv._id} style={{ position: "relative", borderLeft: "1px solid var(--grid-line)" }}>
              {rows.map((r, i) => (
                <div
                  key={i}
                  onClick={() => onCellClick(iv, r)}
                  style={{
                    height: ROW_HEIGHT,
                    borderBottom: "1px solid var(--grid-line)",
                    cursor: "pointer",
                  }}
                  className="grid-cell"
                />
              ))}

              {colSlots.map((slot) => {
                const { top, height } = layoutForSlot(slot, dayAnchor);
                const color = STAGE_COLOR[slot.candidate.status] || "var(--accent-cyan)";
                const isFlashing = slot._id === flashSlotId;
                return (
                  <div
                    key={slot._id}
                    style={{
                      position: "absolute",
                      top,
                      height,
                      left: 4,
                      right: 4,
                      borderRadius: 6,
                      background: `${color}1f`,
                      border: `1px solid ${color}`,
                      padding: "4px 8px",
                      overflow: "hidden",
                      boxShadow: isFlashing ? `0 0 0 2px var(--accent-coral)` : "none",
                      animation: isFlashing ? "hazard-flash 900ms ease-in-out 2" : "none",
                    }}
                    title={`${slot.candidate.name} · ${slot.round}`}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                      {slot.candidate.name}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                      <span className="mono" style={{ fontSize: 11, color }}>
                        {formatLocal(slot.startTimeUTC)}
                      </span>
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-faint)" }}>
                        {formatUTC(slot.startTimeUTC)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <style>{`
        .grid-cell:hover { background: var(--panel-alt); }
        @keyframes hazard-flash {
          0%, 100% { box-shadow: 0 0 0 2px var(--accent-coral); }
          50% { box-shadow: 0 0 0 2px transparent; }
        }
      `}</style>
    </div>
  );
}
