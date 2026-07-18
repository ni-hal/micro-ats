import { useEffect, useState } from "react";
import { api, auth } from "./api/client.js";
import { LOCAL_TIMEZONE, utcISOToLocalInputValue } from "./utils/timezone.js";
import CandidateList from "./components/CandidateList.jsx";
import CalendarGrid from "./components/CalendarGrid.jsx";
import BookingForm from "./components/BookingForm.jsx";
import Login from "./components/Login.jsx";
import CandidateForm from "./components/CandidateForm.jsx";
import InterviewerForm from "./components/InterviewerForm.jsx";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function verifyExistingToken() {
      if (auth.getToken()) {
        try {
          const { user } = await api.me();
          setCurrentUser(user);
        } catch {
          auth.clearToken();
        }
      }
      setAuthChecked(true);
    }
    verifyExistingToken();
  }, []);

  if (!authChecked) return null;

  if (!currentUser) {
    return <Login onLoggedIn={setCurrentUser} />;
  }

  return <Dashboard currentUser={currentUser} onLogout={() => { auth.clearToken(); setCurrentUser(null); }} />;
}

function Dashboard({ currentUser, onLogout }) {
  const [candidates, setCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [presetInterviewerId, setPresetInterviewerId] = useState(null);
  const [presetStart, setPresetStart] = useState(null);
  const [flashSlotId, setFlashSlotId] = useState(null);

  const [candidateFormOpen, setCandidateFormOpen] = useState(false);
  const [interviewerFormOpen, setInterviewerFormOpen] = useState(false);

  const dayAnchor = new Date(); // "today" in the viewer's local timezone

  async function refresh() {
    try {
      const [c, iv, sc] = await Promise.all([
        api.getCandidates(),
        api.getInterviewers(),
        api.getSchedule(),
      ]);
      setCandidates(c.candidates);
      setInterviewers(iv.interviewers);
      setSlots(sc.slots);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleStatusChange(candidateId, status) {
    const prev = candidates;
    setCandidates((cs) => cs.map((c) => (c._id === candidateId ? { ...c, status } : c)));
    try {
      await api.updateCandidateStatus(candidateId, status);
    } catch (err) {
      setCandidates(prev); // revert on failure
      alert(`Couldn't update status: ${err.message}`);
    }
  }

  function openBookingAt(interviewer, row) {
    const anchor = new Date(dayAnchor);
    anchor.setHours(row.h, row.m, 0, 0);
    setPresetInterviewerId(interviewer._id);
    setPresetStart(utcISOToLocalInputValue(anchor.toISOString()));
    setFormOpen(true);
  }

  function handleBooked(slot) {
    setSlots((s) => [...s, slot]);
    setFlashSlotId(slot._id);
    setTimeout(() => setFlashSlotId(null), 1900);
    refresh();
  }

  if (loading) {
    return <Centered>Loading scheduler…</Centered>;
  }
  if (loadError) {
    return (
      <Centered>
        Couldn't reach the API ({loadError}). Is the backend running on :5000?
      </Centered>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gap-[18px] px-7 py-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan">
            Micro-ATS
          </div>
          <h1 className="mt-0.5 text-2xl font-bold text-primary">Smart Interview Scheduler</h1>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right text-xs text-dim">
            <div>Viewing in your local timezone</div>
            <div className="font-mono text-cyan">{LOCAL_TIMEZONE}</div>
          </div>
          <div className="h-8 w-px bg-gridline" />
          <div className="text-right text-xs text-dim">
            <div className="text-primary font-medium">{currentUser.name}</div>
            <button onClick={onLogout} className="text-faint hover:text-coral">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[280px_1fr] gap-[18px] items-start">
        <div className="h-[calc(100vh-130px)] flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setCandidateFormOpen(true)}
              className="flex-1 rounded-lg border border-cyan bg-[var(--accent-cyan-dim)] px-3 py-2 text-xs font-semibold text-cyan"
            >
              + Candidate
            </button>
            <button
              onClick={() => setInterviewerFormOpen(true)}
              className="flex-1 rounded-lg border border-violet bg-[var(--accent-violet-dim)] px-3 py-2 text-xs font-semibold text-violet"
            >
              + Interviewer
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <CandidateList
              candidates={candidates}
              selectedId={selectedCandidateId}
              onSelect={setSelectedCandidateId}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-dim">
              Click any open cell on an interviewer's column to book.
            </span>
            <button
              onClick={() => {
                setPresetInterviewerId(interviewers[0]?._id || null);
                setPresetStart(null);
                setFormOpen(true);
              }}
              className="rounded-lg border border-cyan bg-[var(--accent-cyan-dim)] px-3.5 py-2 text-[13px] font-semibold text-cyan"
            >
              + New booking
            </button>
          </div>

          <CalendarGrid
            interviewers={interviewers}
            slots={slots}
            dayAnchor={dayAnchor}
            onCellClick={openBookingAt}
            flashSlotId={flashSlotId}
          />
        </div>
      </div>

      <BookingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        candidates={candidates}
        interviewers={interviewers}
        presetInterviewerId={presetInterviewerId}
        presetStart={presetStart}
        onBooked={handleBooked}
      />

      <CandidateForm
        open={candidateFormOpen}
        onClose={() => setCandidateFormOpen(false)}
        onCreated={(candidate) => setCandidates((cs) => [candidate, ...cs])}
      />

      <InterviewerForm
        open={interviewerFormOpen}
        onClose={() => setInterviewerFormOpen(false)}
        onCreated={(interviewer) => setInterviewers((ivs) => [...ivs, interviewer].sort((a, b) => a.name.localeCompare(b.name)))}
      />
    </div>
  );
}

function Centered({ children }) {
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)" }}>
      {children}
    </div>
  );
}
