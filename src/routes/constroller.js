const express = require("express");

const router = express.Router();

const {
  createMonitor,
  getMonitors,
} = require("../controller/monitor_control");
const protect = require('../middleware/authMiddleware')
router.get("/", protect, getMonitors);

router.post("/", protect, createMonitor);

module.exports = router;


module.exports = router