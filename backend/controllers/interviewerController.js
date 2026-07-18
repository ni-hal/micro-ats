const Interviewer = require("../models/Interviewer");

async function listInterviewers(req, res) {
  try {
    const interviewers = await Interviewer.find({ owner: req.user.id }).sort({ name: 1 });
    return res.json({ interviewers });
  } catch (err) {
    console.error("[GET /api/interviewers]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

async function createInterviewer(req, res) {
  try {
    const { name, email, role, department, designation, timezone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required." });
    }
    const interviewer = await Interviewer.create({ owner: req.user.id, name, email, role, department, designation, timezone });
    return res.status(201).json({ interviewer });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "An interviewer with this email already exists." });
    }
    console.error("[POST /api/interviewers]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { listInterviewers, createInterviewer };
