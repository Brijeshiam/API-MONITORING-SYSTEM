const express = require('express')
const router = express.Router()
const getUserLogs = require('../controller/log.controller')
const protect = require('../middleware/authMiddleware')

router.get('/', protect, getUserLogs)

module.exports = router