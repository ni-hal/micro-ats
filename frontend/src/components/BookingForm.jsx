import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import {
  LOCAL_TIMEZONE,
  localInputToUTCISOString,
  formatLocal,
  formatLocalDate,
} from "../utils/timezone.js";

export default function BookingForm({
  open,
  onClose,
  candidates,
  interviewers,
  presetInterviewerId,
  presetStart,
  onBooked,
}) {
  const [candidateId, setCandidateId] = useState("");
  const [interviewerId, setInterviewerId] = useState(presetInterviewerId || "");
  const [start, setStart] = useState(presetStart || "");
  const [durationMin, setDurationMin] = useState(45);
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setInterviewerId(presetInterviewerId || "");
      setStart(presetStart || "");
      setConflict(null);
      setError(null);
    }
  }, [open, presetInterviewerId, presetStart]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setConflict(null);

    if (!candidateId || !interviewerId || !start) {
      setError("Pick a candidate, interviewer, and start time.");
      return;
    }

    const startISO = localInputToUTCISOString(start);
    const endISO = new Date(new Date(startISO).getTime() + durationMin * 60000).toISOString();

    setSubmitting(true);
    try {
      const { slot } = await api.createSchedule({
        candidateId,
        interviewerId,
        startTime: startISO,
        endTime: endISO,
      });
      onBooked(slot);
      onClose();
    } catch (err) {
      if (err.status === 409) {
        setConflict(err.body);
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6, 12, 13, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          width: 400,
          background: "var(--panel-alt)",
          border: "1px solid var(--grid-line)",
          borderRadius: 12,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Book interview</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <label htmlFor="booking-candidate" style={fieldLabel}>Candidate</label>
        <select
          id="booking-candidate"
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select candidate…</option>
          {candidates.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} — {c.position}
            </option>
          ))}
        </select>

        <label htmlFor="booking-interviewer" style={fieldLabel}>Interviewer</label>
        <select
          id="booking-interviewer"
          value={interviewerId}
          onChange={(e) => setInterviewerId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select interviewer…</option>
          {interviewers.map((iv) => (
            <option key={iv._id} value={iv._id}>
              {iv.name} — {iv.role}
            </option>
          ))}
        </select>

        <label htmlFor="booking-start-time" style={fieldLabel}>Start time · {LOCAL_TIMEZONE} (your local time)</label>
        <input
          id="booking-start-time"
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          style={inputStyle}
        />

        <label htmlFor="booking-duration" style={fieldLabel}>Duration</label>
        <select
          id="booking-duration"
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value))}
          style={inputStyle}
        >
          <option value={30}>30 min</option>
          <option value={45}>45 min</option>
          <option value={60}>60 min</option>
        </select>

        {conflict && (
          <div
            style={{
              background: "var(--accent-coral-dim)",
              border: "1px solid var(--accent-coral)",
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
              color: "var(--text-primary)",
            }}
          >
            <strong style={{ color: "var(--accent-coral)" }}>409 · Conflict.</strong>{" "}
            This interviewer is already booked with{" "}
            <strong>{conflict.conflictingCandidateDetails?.name || conflict.conflictingCandidate}</strong> at{" "}
            <span className="mono">
              {formatLocalDate(conflict.conflictingSlot?.startTimeUTC)}{" "}
              {formatLocal(conflict.conflictingSlot?.startTimeUTC)}
            </span>
            . Pick a different time or interviewer.
          </div>
        )}
        {error && (
          <div style={{ color: "var(--accent-coral)", fontSize: 13 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 4,
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "var(--accent-cyan)",
            color: "#0f1a1c",
            fontWeight: 600,
            cursor: submitting ? "default" : "pointer",
          }}
        >
          {submitting ? "Checking availability…" : "Confirm booking"}
        </button>
      </form>
    </div>
  );
}

const fieldLabel = {
  fontSize: 11,
  color: "var(--text-faint)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontFamily: "var(--font-mono)",
  marginBottom: -6,
};

const inputStyle = {
  background: "var(--panel)",
  border: "1px solid var(--grid-line)",
  borderRadius: 8,
  padding: "9px 10px",
  color: "var(--text-primary)",
  fontSize: 13,
  fontFamily: "var(--font-ui)",
};
