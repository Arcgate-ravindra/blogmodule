const express = require('express');
const app = express();
require('dotenv').config();
const connection  = require('./config/db.config');
const userRouter = require("./routes/userRoute");
const addressRouter = require('./routes/addressRoute');
const blogRouter = require('./routes/blogRoute');
const path = require('path');


// datbbase connection
connection();



//middleware
app.use(express.json());
app.use('/images/users', express.static(path.join(__dirname, 'images', 'users')));
app.use('/images/blogs', express.static(path.join(__dirname, 'images', 'blogs')));



//api
app.use('/api/user', userRouter);
app.use('/api/address', addressRouter);
app.use('/api/blog', blogRouter);



//port
const Port = process.env.PORT || 4000

//server
app.listen(3000, () => {
    console.log(`Server is listening on the port :- ${Port}`)
})