require('dotenv').config()
const mongoose  = require('mongoose')

async function connectDB()
{

    await mongoose.connect(process.env.MONGO_HOST).then(()=>{

        console.log("connected to data base")
    }).catch((err)=>{
        console.log("error connecting to database",err)
    })

}

module.exports =connectDB


