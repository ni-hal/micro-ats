const express = require("express");
const router = express.Router();
const {
  listInterviewers,
  createInterviewer,
} = require("../controllers/interviewerController");
const { listInterviewerSchedule } = require("../controllers/scheduleController");

router.get("/", listInterviewers);
router.post("/", createInterviewer);
router.get("/:id/schedule", listInterviewerSchedule);

module.exports = router;
