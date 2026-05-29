const express = require('express')
const app = express()
const cors = require('cors')
app.use(express.json())
app.use(cors())
const monitorRouter = require('./routes/constroller')
const logRouter = require('./routes/log.routes')
const authRoutes = require('./routes/authRoutes')
app.use('/api/auth', authRoutes)
app.use('/api/monitors', monitorRouter)
app.use('/api/logs', logRouter)

app.get("/", (req, res) => {
    res.send("API Monitor Running");
});
module.exports = app