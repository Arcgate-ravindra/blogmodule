const mongoose  =  require("mongoose");
require('dotenv').config();
const url = process.env.MONGODB_URL
const dbConnection = () => {
    mongoose.connect(url);
    const db = mongoose.connection;
    db.on('connected', function(){
        console.log("db is connected")
    })
    db.on('error', function(){
        console.log("db is not connected")
    })


}

module.exports = dbConnection;