const mongooes = require('mongoose')
require('dotenv').config();

mongooes.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("connected to database")
})

module.exports=mongooes.connect
