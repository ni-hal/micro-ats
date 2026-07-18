import { cloneElement, useState } from "react";
import { api } from "../api/client.js";

export default function CandidateForm({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setPosition("");
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !position.trim()) {
      setError("Name, email, and position are all required.");
      return;
    }

    setSubmitting(true);
    try {
      const { candidate } = await api.createCandidate({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        position: position.trim(),
      });
      onCreated(candidate);
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
          <h3 className="text-base font-semibold text-primary">New candidate</h3>
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
            placeholder="Priya Sharma"
            className={inputClass}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="priya.sharma@example.com"
            className={inputClass}
          />
        </Field>

        <Field label="Position">
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Backend Engineer"
            className={inputClass}
          />
        </Field>

        <Field label="Phone">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className={inputClass}
          />
        </Field>

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
          {submitting ? "Adding…" : "Add candidate"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  const controlId = `candidate-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label htmlFor={controlId} className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-faint">{label}</span>
      {cloneElement(children, { id: controlId })}
    </label>
  );
}

const inputClass =
  "rounded-lg border border-gridline bg-panel px-3 py-2 text-sm text-primary outline-none focus:border-cyan";
