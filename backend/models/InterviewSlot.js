const mongoose = require("mongoose");

/**
 * InterviewSlot
 * The booking itself: one candidate, one interviewer, one UTC time window.
 *
 * IMPORTANT — timezone contract:
 *   startTimeUTC / endTimeUTC are Mongo `Date` objects. Mongo/BSON always
 *   stores Date as milliseconds-since-epoch (UTC) regardless of what
 *   timezone the client that sent it was in. The frontend is responsible
 *   for converting the recruiter's local-time input to UTC (or an ISO
 *   string with offset) before it hits this API, and for converting back
 *   to the *viewer's* local timezone when rendering.
 */
const interviewSlotSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interviewer",
      required: true,
    },
    startTimeUTC: { type: Date, required: true },
    endTimeUTC: { type: Date, required: true },
    round: { type: String, default: "Technical Round", trim: true },
    status: {
      type: String,
      enum: ["Scheduled", "Cancelled", "Completed"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

// Speeds up the overlap-conflict query: "all Scheduled slots for this interviewer"
interviewSlotSchema.index({ owner: 1, interviewer: 1, status: 1, startTimeUTC: 1 });

interviewSlotSchema.pre("validate", function (next) {
  if (this.startTimeUTC && this.endTimeUTC && this.endTimeUTC <= this.startTimeUTC) {
    return next(new Error("endTimeUTC must be after startTimeUTC"));
  }
  next();
});

module.exports = mongoose.model("InterviewSlot", interviewSlotSchema);
