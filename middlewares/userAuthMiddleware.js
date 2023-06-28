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
            message: "token expired"
        })
    }



}

const logoutChk = (req,res,next) => {
    if(req.user.logged_in === "false"){
        return res.status(400).send("please login for accessing this api")
    }else{
        next();
    }
}

const adminAccess = (req,res,next) => {
    if(req.user.role !== "admin"){
        return res.status(200).send("you are not an admin");
    }else{
        next();
    }
}

const userAccess = (req,res,next) => {
    if(req.user.role === "user")
    {
        next();
      
    }else if(req.user.role === "admin"){
        next();
    }else{
              return res.status(200).send("you are not allowed to do that");
    }
}

module.exports = {verifyToken,adminAccess,userAccess,logoutChk};