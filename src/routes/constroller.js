const express = require("express");

const router = express.Router();

const {
  createMonitor,
  getMonitors,
  deleteMonitor,
} = require("../controller/monitor_control");
const protect = require('../middleware/authMiddleware')
router.get("/", protect, getMonitors);
router.post("/", protect, createMonitor);
router.delete("/:id", protect, deleteMonitor);

module.exports = router;