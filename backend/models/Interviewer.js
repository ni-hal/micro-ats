const mongoose = require("mongoose");

/**
 * Interviewer
 * Represents a technical interviewer who can be booked into InterviewSlots.
 * `timezone` is only used by the frontend as a *display convenience*
 * (e.g. showing "Interviewer's local time" next to the recruiter's local time).
 * It never affects how times are stored — everything in the DB is UTC.
 */
const interviewerSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, default: "Technical Interviewer", trim: true },
    department: { type: String, trim: true, default: "" },
    designation: { type: String, trim: true, default: "" },
    timezone: { type: String, default: "UTC" }, // IANA tz, e.g. "Asia/Kolkata"
  },
  { timestamps: true }
);

interviewerSchema.index({ owner: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Interviewer", interviewerSchema);
