const InterviewSlot = require("../models/InterviewSlot");

/**
 * findConflictingSlot
 *
 * Two time windows [aStart, aEnd) and [bStart, bEnd) overlap iff:
 *     aStart < bEnd  AND  aEnd > bStart
 *
 * We only care about the SAME interviewer, and only about slots that are
 * still "Scheduled" (a Cancelled slot shouldn't block a new booking).
 * Optionally exclude a slot id (used when re-scheduling an existing slot,
 * so it doesn't conflict with itself).
 *
 * Returns the conflicting InterviewSlot document (populated with the
 * candidate's name/email) or null if the requested window is free.
 */
async function findConflictingSlot({ ownerId, interviewerId, startTimeUTC, endTimeUTC, excludeSlotId }) {
  const query = {
    owner: ownerId,
    interviewer: interviewerId,
    status: "Scheduled",
    startTimeUTC: { $lt: endTimeUTC },
    endTimeUTC: { $gt: startTimeUTC },
  };

  if (excludeSlotId) {
    query._id = { $ne: excludeSlotId };
  }

  const conflict = await InterviewSlot.findOne(query)
    .populate("candidate", "name email")
    .sort({ startTimeUTC: 1 });

  return conflict;
}

module.exports = { findConflictingSlot };
