const express = require("express");
const router = express.Router();
const {
  createSchedule,
  listSchedule,
  cancelSchedule,
} = require("../controllers/scheduleController");

router.post("/", createSchedule);
router.get("/", listSchedule);
router.patch("/:slotId/cancel", cancelSchedule);

module.exports = router;
