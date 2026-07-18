const BASE = "/api";
const TOKEN_KEY = "micro_ats_token";

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, options = {}) {
  const token = auth.getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) auth.clearToken();
    // Attach the status so callers (e.g. booking form) can branch on 409 specifically.
    const err = new Error(data.error || `Request failed with ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  register: (name, username, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ name, username, password }) }),
  me: () => request("/auth/me"),

  getCandidates: () => request("/candidates"),
  createCandidate: (payload) =>
    request("/candidates", { method: "POST", body: JSON.stringify(payload) }),
  updateCandidateStatus: (id, status) =>
    request(`/candidates/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  getInterviewers: () => request("/interviewers"),
  getInterviewerSchedule: (id) => request(`/interviewers/${id}/schedule`),
  createInterviewer: (payload) =>
    request("/interviewers", { method: "POST", body: JSON.stringify(payload) }),

  getSchedule: (interviewerId) =>
    request(`/schedule${interviewerId ? `?interviewerId=${interviewerId}` : ""}`),
  createSchedule: (payload) =>
    request("/schedule", { method: "POST", body: JSON.stringify(payload) }),
  cancelSlot: (slotId) => request(`/schedule/${slotId}/cancel`, { method: "PATCH" }),
};
