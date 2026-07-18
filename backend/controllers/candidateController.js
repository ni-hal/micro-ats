const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");

async function listCandidates(req, res) {
  try {
    const candidates = await Candidate.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return res.json({ candidates });
  } catch (err) {
    console.error("[GET /api/candidates]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

async function createCandidate(req, res) {
  try {
    const { name, email, phone, position } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required." });
    }
    const candidate = await Candidate.create({ owner: req.user.id, name, email, phone, position });
    return res.status(201).json({ candidate });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "A candidate with this email already exists." });
    }
    console.error("[POST /api/candidates]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

// PATCH /api/candidates/:id/status  { status: "Applied" | "Technical Round" | "Offered" | "Rejected" }
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid candidate id." });
    }
    if (!Candidate.STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${Candidate.STATUS_VALUES.join(", ")}`,
      });
    }
    const candidate = await Candidate.findOneAndUpdate({ _id: id, owner: req.user.id }, { status }, { new: true });
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });
    return res.json({ candidate });
  } catch (err) {
    console.error("[PATCH /api/candidates/:id/status]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { listCandidates, createCandidate, updateStatus };
