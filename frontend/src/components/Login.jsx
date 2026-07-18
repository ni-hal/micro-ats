import { useState } from "react";
import { api, auth } from "../api/client.js";

export default function Login({ onLoggedIn }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const registering = mode === "register";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = registering
        ? await api.register(name.trim(), username.trim(), password)
        : await api.login(username.trim(), password);
      auth.setToken(token);
      onLoggedIn(user);
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setMode(registering ? "login" : "register");
    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-gridline bg-panel-alt p-7 flex flex-col gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-cyan">Micro-ATS</div>
          <h1 className="text-xl font-semibold text-primary mt-1">{registering ? "Create account" : "Sign in"}</h1>
          <p className="text-sm text-dim mt-1">
            {registering ? "Set up recruiter access to the interview scheduler." : "Recruiter access to the interview scheduler."}
          </p>
        </div>

        {registering && <div className="flex flex-col gap-1.5">
          <label htmlFor="register-name" className="font-mono text-[11px] uppercase tracking-wide text-faint">Name</label>
          <input id="register-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} required
            className="rounded-lg border border-gridline bg-panel px-3 py-2 text-sm text-primary outline-none focus:border-cyan" placeholder="Your name" />
        </div>}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="auth-username" className="font-mono text-[11px] uppercase tracking-wide text-faint">Username</label>
          <input id="auth-username" autoFocus={!registering} value={username} onChange={(e) => setUsername(e.target.value)} required
            className="rounded-lg border border-gridline bg-panel px-3 py-2 text-sm text-primary outline-none focus:border-cyan" placeholder="admin" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="auth-password" className="font-mono text-[11px] uppercase tracking-wide text-faint">Password</label>
          <input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={registering ? 6 : undefined}
            className="rounded-lg border border-gridline bg-panel px-3 py-2 text-sm text-primary outline-none focus:border-cyan" placeholder="••••••••" />
        </div>

        {error && <div className="rounded-lg border border-coral bg-[var(--accent-coral-dim)] px-3 py-2 text-sm text-coral">{error}</div>}

        <button type="submit" disabled={submitting} className="mt-1 rounded-lg bg-cyan px-4 py-2.5 font-semibold text-bg disabled:opacity-60">
          {submitting ? (registering ? "Creating account…" : "Signing in…") : (registering ? "Create account" : "Sign in")}
        </button>

        <button type="button" onClick={switchMode} className="text-xs text-cyan hover:underline">
          {registering ? "Already have an account? Sign in" : "Need an account? Register"}
        </button>

        {!registering && <p className="text-xs text-faint text-center">

        </p>}
      </form>
    </div>
  );
}
