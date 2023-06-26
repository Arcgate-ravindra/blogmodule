const jwt = require('jsonwebtoken');
require('dotenv').config();
const userModel = require("../models/userModel")
const mongoose  = require('mongoose');

const verifyToken = async (req, res, next) => {

    const authHeader = req.headers["authorization"] || req.headers["Authorization"] ;
    if (!authHeader) {
        return res.status(400).send({
            message: "Enter the token"
        })
    }

    if (authHeader) {

        const token = authHeader.split(" ")[1];

        const user =  jwt.verify(token, process.env.SECRET_KEY);
      
        if(user){
            const userInfo = await userModel.findOne({_id : new mongoose.Types.ObjectId(user.id)})

            req.user = userInfo
            next();
        }
    }else{
        return res.status(400).send({
            message: "you are not authenticate"
        })
    }



}

module.exports = verifyToken;