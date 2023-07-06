const jwt = require('jsonwebtoken');
require('dotenv').config();
const userModel = require("../models/userModel")
const mongoose  = require('mongoose');

const verifyToken = async (req, res, next) => {

    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"] ;
        if (!authHeader) {
            return res.status(400).send({
                message: "Enter the token"
            })
        }

        if (authHeader) {
    
            const token = authHeader.split(" ")[1];
    
            jwt.verify(token, process.env.SECRET_KEY, async (err,result) => {
                if(err)
                {
                    return res.status(401).send("token expired");
                }else{
                    const userInfo = await userModel.findOne({_id : new mongoose.Types.ObjectId(result.id)})
                    req.user = userInfo
                    next();
                }
            })  
        }       
    } catch (error) {
            console.log(`Error while verifying the token ${error.message}`);
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
        return res.status(400).send("you are not an admin");
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

module.exports = {verifyToken,adminAccess,userAccess,logoutChk}