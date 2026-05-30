require('dotenv').config()
const mongoose  = require('mongoose')

async function connectDB()
{

    const dbUri = process.env.MONGO_URI || process.env.MONGO_HOST || "mongodb://localhost:27017/uptime-monitor";
    await mongoose.connect(dbUri).then(()=>{

        console.log("connected to database: " + dbUri.split('@')[1] || dbUri)
    }).catch((err)=>{
        console.log("error connecting to database",err)
    })

}

module.exports =connectDB


