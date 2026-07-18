const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");
const Interviewer = require("../models/Interviewer");
const InterviewSlot = require("../models/InterviewSlot");
const { findConflictingSlot } = require("../utils/overlapCheck");

const { isValidObjectId } = mongoose;

/**
 * POST /api/schedule
 * body: { candidateId, interviewerId, startTime, endTime, round? }
 *
 * `startTime` / `endTime` MUST be ISO-8601 strings that unambiguously encode
 * an instant — either UTC ("2026-07-20T09:30:00.000Z") or with an explicit
 * offset ("2026-07-20T15:00:00+05:30"). `new Date(...)` normalizes either
 * form to UTC internally, which is exactly what we persist.
 */
async function createSchedule(req, res) {
  try {
    const { candidateId, interviewerId, startTime, endTime, round } = req.body;

    // --- basic payload validation -----------------------------------
    if (!candidateId || !interviewerId || !startTime || !endTime) {
      return res.status(400).json({
        error: "candidateId, interviewerId, startTime, and endTime are all required.",
      });
    }
    if (!isValidObjectId(candidateId) || !isValidObjectId(interviewerId)) {
      return res.status(400).json({ error: "candidateId / interviewerId must be valid Mongo ObjectIds." });
    }

    const hasExplicitTimezone = (value) =>
      typeof value === "string" && /(Z|[+-]\d{2}:\d{2})$/i.test(value);
    if (!hasExplicitTimezone(startTime) || !hasExplicitTimezone(endTime)) {
      return res.status(400).json({
        error: "startTime and endTime must be ISO-8601 timestamps with an explicit UTC Z or offset.",
      });
    }

    const startTimeUTC = new Date(startTime);
    const endTimeUTC = new Date(endTime);
    if (isNaN(startTimeUTC.getTime()) || isNaN(endTimeUTC.getTime())) {
      return res.status(400).json({ error: "startTime / endTime must be valid ISO-8601 date strings." });
    }
    if (endTimeUTC <= startTimeUTC) {
      return res.status(400).json({ error: "endTime must be after startTime." });
    }

    // --- confirm both sides of the booking actually exist ------------
    const [candidate, interviewer] = await Promise.all([
      Candidate.findOne({ _id: candidateId, owner: req.user.id }),
      Interviewer.findOne({ _id: interviewerId, owner: req.user.id }),
    ]);
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });
    if (!interviewer) return res.status(404).json({ error: "Interviewer not found." });

    // --- THE ANTI-AI TWIST: reject on overlap with 409 + who it clashes with ---
    const conflict = await findConflictingSlot({ ownerId: req.user.id, interviewerId, startTimeUTC, endTimeUTC });
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Interviewer already booked",
        error: "Scheduling conflict: interviewer is already booked during this window.",
        conflictingCandidate: conflict.candidate.name,
        conflictingCandidateDetails: {
          id: conflict.candidate._id,
          name: conflict.candidate.name,
        },
        conflictingSlot: {
          id: conflict._id,
          startTimeUTC: conflict.startTimeUTC,
          endTimeUTC: conflict.endTimeUTC,
        },
      });
    }

    // --- no conflict: create the slot and link it back to the candidate ---
    const slot = await InterviewSlot.create({
      owner: req.user.id,
      candidate: candidateId,
      interviewer: interviewerId,
      startTimeUTC,
      endTimeUTC,
      round: round || "Technical Round",
    });

    candidate.interviewSlots.push(slot._id);
    if (candidate.status === "Applied") candidate.status = "Technical Round";
    await candidate.save();

    const populated = await slot.populate([
      { path: "candidate", select: "name email status" },
      { path: "interviewer", select: "name email timezone" },
    ]);

    return res.status(201).json({ message: "Interview scheduled.", slot: populated });
  } catch (err) {
    console.error("[POST /api/schedule]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

// GET /api/interviewers/:id/schedule
async function listInterviewerSchedule(req, res) {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid interviewer id." });
  req.query.interviewerId = id;
  return listSchedule(req, res);
}

/**
 * GET /api/schedule?interviewerId=...
 * Returns all Scheduled slots (optionally filtered to one interviewer),
 * populated with candidate + interviewer, for the calendar grid.
 */
async function listSchedule(req, res) {
  try {
    const { interviewerId } = req.query;
    const query = { owner: req.user.id, status: "Scheduled" };
    if (interviewerId) {
      if (!isValidObjectId(interviewerId)) {
        return res.status(400).json({ error: "interviewerId must be a valid Mongo ObjectId." });
      }
      query.interviewer = interviewerId;
    }

    const slots = await InterviewSlot.find(query)
      .populate("candidate", "name email status")
      .populate("interviewer", "name email timezone")
      .sort({ startTimeUTC: 1 });

    return res.json({ slots });
  } catch (err) {
    console.error("[GET /api/schedule]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * PATCH /api/schedule/:slotId/cancel
 * Frees up the slot (used instead of hard-delete so history is preserved).
 */
async function cancelSchedule(req, res) {
  try {
    const { slotId } = req.params;
    if (!isValidObjectId(slotId)) {
      return res.status(400).json({ error: "slotId must be a valid Mongo ObjectId." });
    }
    const slot = await InterviewSlot.findOneAndUpdate(
      { _id: slotId, owner: req.user.id },
      { status: "Cancelled" },
      { new: true }
    );
    if (!slot) return res.status(404).json({ error: "Slot not found." });
    return res.json({ message: "Interview cancelled.", slot });
  } catch (err) {
    console.error("[PATCH /api/schedule/:slotId/cancel]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { createSchedule, listSchedule, listInterviewerSchedule, cancelSchedule };
