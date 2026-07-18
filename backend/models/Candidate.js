const mongoose = require("mongoose");

const STATUS_VALUES = ["Applied", "Technical Round", "HR Round", "Offered", "Rejected"];

/**
 * Candidate
 * A candidate can have MANY InterviewSlots (one per round, or re-scheduled rounds).
 * We keep a denormalized `interviewSlots` array of ObjectId refs on the candidate
 * for fast "show me this candidate's whole pipeline" reads, while InterviewSlot
 * itself remains the source of truth for any single booking (and is what the
 * overlap-conflict check queries against interviewer + time).
 */
const candidateSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    // Retained for existing records and the scheduler's candidate selector.
    position: { type: String, trim: true, default: "Candidate" },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "Applied",
    },
    interviewSlots: [
      { type: mongoose.Schema.Types.ObjectId, ref: "InterviewSlot" },
    ],
  },
  { timestamps: true }
);

candidateSchema.statics.STATUS_VALUES = STATUS_VALUES;
candidateSchema.index({ owner: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Candidate", candidateSchema);
