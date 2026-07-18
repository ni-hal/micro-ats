import { cloneElement, useState } from "react";
import { api } from "../api/client.js";

const COMMON_TIMEZONES = [
  "UTC",
  "Asia/Kolkata",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function InterviewerForm({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function reset() {
    setName("");
    setEmail("");
    setRole("");
    setDepartment("");
    setDesignation("");
    setTimezone("UTC");
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    setSubmitting(true);
    try {
      const { interviewer } = await api.createInterviewer({
        name: name.trim(),
        email: email.trim(),
        role: role.trim() || "Technical Interviewer",
        department: department.trim(),
        designation: designation.trim(),
        timezone,
      });
      onCreated(interviewer);
      reset();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-gridline bg-panel-alt p-5 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-primary">New interviewer</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-dim hover:text-primary"
          >
            ✕
          </button>
        </div>

        <Field label="Full name">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Amara Okafor"
            className={inputClass}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="amara.okafor@company.com"
            className={inputClass}
          />
        </Field>

        <Field label="Role / specialty">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Systems Design Interviewer"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Department">
            <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Engineering" className={inputClass} />
          </Field>
          <Field label="Designation">
            <input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Staff Engineer" className={inputClass} />
          </Field>
        </div>

        <Field label="Home timezone (display only)">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={inputClass}
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-faint -mt-1">
          Purely informational — all bookings are still stored in UTC and
          rendered in each viewer's own browser timezone.
        </p>

        {error && (
          <div className="rounded-lg border border-coral bg-[var(--accent-coral-dim)] px-3 py-2 text-sm text-coral">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-lg bg-cyan px-4 py-2.5 font-semibold text-bg disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add interviewer"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  const controlId = `interviewer-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label htmlFor={controlId} className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-faint">{label}</span>
      {cloneElement(children, { id: controlId })}
    </label>
  );
}

const inputClass =
  "rounded-lg border border-gridline bg-panel px-3 py-2 text-sm text-primary outline-none focus:border-cyan";
