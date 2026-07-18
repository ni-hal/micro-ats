const express = require("express");
const router = express.Router();
const {
  listCandidates,
  createCandidate,
  updateStatus,
} = require("../controllers/candidateController");

router.get("/", listCandidates);
router.post("/", createCandidate);
router.patch("/:id/status", updateStatus);

module.exports = router;
