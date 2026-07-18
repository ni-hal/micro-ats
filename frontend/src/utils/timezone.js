// The single source of truth for "what timezone am I, the person looking at
// this screen, actually in right now" — read once from the browser.
export const LOCAL_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Format a UTC ISO string (as returned by the API, e.g. "2026-07-20T09:00:00.000Z")
 * into the *viewer's* local wall-clock time. This is what every slot the
 * dashboard renders goes through — the DB never leaves UTC, only the
 * presentation layer converts.
 */
export function formatLocal(isoUTC, opts = {}) {
  const date = new Date(isoUTC);
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...opts,
  }).format(date);
}

export function formatLocalDate(isoUTC) {
  const date = new Date(isoUTC);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatUTC(isoUTC) {
  const date = new Date(isoUTC);
  return date.toISOString().slice(11, 16) + " UTC";
}

/**
 * Take a <input type="datetime-local"> value (a *local* wall-clock string
 * with no timezone info, e.g. "2026-07-20T14:30") and turn it into a real
 * UTC instant to send to the API. `new Date(localString)` already
 * interprets that string as local time in the browser's own timezone,
 * so `.toISOString()` correctly converts it to UTC — this is the one
 * conversion point between "what the recruiter typed" and "what we store".
 */
export function localInputToUTCISOString(localDateTimeValue) {
  if (!localDateTimeValue) return null;
  const asLocalDate = new Date(localDateTimeValue);
  return asLocalDate.toISOString();
}

/** Inverse of the above, used to pre-fill a datetime-local input from a UTC ISO string. */
export function utcISOToLocalInputValue(isoUTC) {
  const date = new Date(isoUTC);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}
