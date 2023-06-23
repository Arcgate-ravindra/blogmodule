const express = require('express');
const app = express();
require('dotenv').config();
const connection  = require('./config/db.config');
const userRouter = require("./routes/userRoute");
const addressRouter = require('./routes/addressRoute');


// datbbase connection
connection();



//middleware
app.use(express.json());



//api
app.use('/api/user', userRouter);
app.use('/api/address', addressRouter);


//port
const Port = process.env.PORT || 4000

//server
app.listen(3000, () => {
    console.log(`Server is listening on the port :- ${Port}`)
})