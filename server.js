const app = require('./src/app')
const connectDB = require('./src/config/db')
const startMonitoring = require('./src/services/serviceMonitors')
connectDB()
startMonitoring()
app.listen(3000,()=>{

    console.log("server is running on port 3000")
})  
