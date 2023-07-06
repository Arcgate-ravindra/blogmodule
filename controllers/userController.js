const userModel = require('../models/userModel');
const slugify = require('slugify');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Redis = require("ioredis");
const client = new Redis();
require('dotenv').config();
const emailTransporter = require("../services/emailServices");
const upload = require('../utils/fileUpload');
const { date } = require('joi');
const { default: mongoose } = require('mongoose');


const secret_key = process.env.SECRET_KEY
const refresh_key = process.env.REFRESH_KEY


const createUser = async (req, res) => {

    try {
        const { username, first_name, last_name, email, password, phone, profile } = req.body;
        const userexist = await userModel.findOne({ email: email });
        if (userexist) {
            return res.status(400).send({
                message: "User already exists go and login",
            })
        }
        const slug = slugify(username);
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const user = new userModel({
            username: slug,
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: hash,
            phone: phone,
            profile: profile,
        })
        await user.save();
        return res.status(201).send({
            data : user,
            message: "user created successfully"
        })
    } catch (error) {
        console.log(`error generate while registration ${error.message}`);
    }

}

const userlogin = async (req, res) => {

    try {

        const { email, password } = req.body;
        const userExists = await userModel.findOne({ email: email });
        if (!userExists) {
            return res.status(404).send({
                message: "User not exists...enter correct email or register yourself first"
            })
        }
        const isMatch = bcrypt.compareSync(password, userExists['password']);
        if (!isMatch) {
            return res.status(404).send({
                message: "Wrong password",
            })
        }
        userExists.logged_in  = true;
        await userExists.save();
        const accessToken = jwt.sign({ id: userExists._id }, secret_key, { expiresIn: "24h" });
        const refreshToken = jwt.sign({ id: userExists._id }, refresh_key, { expiresIn: "1y" });
        return res.status(200).send(
            {
                accessToken: accessToken,
                refreshToken : refreshToken
            }
        );

    } catch (error) {

        console.log(`error generate while login ${error.message}`)
    }


}

const generateToken = async (req,res) => {

    try {
        const {token} = req.body;
    if(!token){
        return res.status(400).send("please enter the token");
    }
    const decodedToken = jwt.verify(token,refresh_key, (err,result) => {
        if(err){
            console.log(err);
        }else{
            return result;
        }
    }); 
    const accessToken = jwt.sign({ id: decodedToken.id }, secret_key, { expiresIn: "24h" });
    const refreshToken = jwt.sign({ id: decodedToken.id }, refresh_key, { expiresIn: "1y" });
    return res.status(200).send(
        {
            accessToken: accessToken,
            refreshToken : refreshToken
        }
    );

    } catch (error) {
        console.log(`error generate while getting the new access and refresh token ${error.message}`)
    }
    
}

const forgetpassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send({
            message: "please enter the email"
        })
    }
    const userExists = await userModel.findOne({ email: email });
    if (userExists) {
        const emailSendFun = await emailTransporter();
        console.log(emailSendFun);
        return res.status(200).send({
            message : "please check your email"
        })

    } else {
        return res.status(404).send(
            {
                message: "user not exists enter the valid email"
            }
        );
    }
}

const resetpassword = async (req, res) => {
    const { email, newpassword, confirmpassword } = req.body;
    if (!email && !newpassword && !confirmpassword) {
        return res.status(400).send({
            message: "please enter the required fields"
        })
    }
    if (confirmpassword !== newpassword) {
        return res.status(400).send({
            message: "new password and confirm password are not equal"
        })
    } else {
        const user = await userModel.findOne({ email: email });
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(confirmpassword, salt);
        user.password = hash;
        await user.save();
        return res.status(200).send({
            message: "password reset successfully"
        })
    }

}

const logout = async (req,res) => {
        await userModel.findOneAndUpdate({_id : new mongoose.Types.ObjectId(req.user.id)}, {
            $set : {
                logged_in : false
            }
        })
        return res.status(200).send("user logout successfully")
}

const getALLUser = async (req, res) => {

    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search;
        let searchCondition = {};
        if (searchQuery) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if(!dateRegex.test(searchQuery)){
                    return res.status(401).send("pleasee enter the date in this format : yyyy-mm-dd")
            }
            const date = new Date(searchQuery);
            const regexPattern = new RegExp(searchQuery, 'i');
            searchCondition = {
                $or: [
                    { first_name: regexPattern },
                    { last_name: regexPattern },
                    { email: regexPattern },
                    { phone: regexPattern },
                    {
                        createdAt: {
                            $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                            $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                        }
                    }

                ]
            }
        }
        const usersData = await userModel.aggregate([
            {
                $match: searchCondition
            },
            {
                $lookup:
                {
                    from: "addresses",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "user-details"
                }
            },
            {
                $unwind: "$user-details"
            }, 
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort : {createdAt : -1}
            },
            {
                $project: {
                    username: 1,
                    first_name: 1,
                    last_name: 1,
                    phone: 1,
                    email: 1,
                    profile: 1,
                    createdAt : 1,
                    user_details: "$user-details",
                }
            }
        ])
        const totalData = await userModel.find().countDocuments();
        const totalPage = Math.ceil(totalData / limit);
        return res.status(200).send({
            data: usersData,
            page: page,
            totalPage: totalPage,
            dataPerPage : usersData?.length,

        });

    } catch (error) {

        console.log(`error generate while get all user ${error.message}`)
    }

}

const getUser = async (req, res) => {

    try {
        const { username} = req.params;

        if(!username || username === 'null' || username === 'undefined'){
                return res.status(400).send("enter the username or username is not valid");
        }
        //const userRedisData = await client.hgetall(username);
        // if (Object.keys(userRedisData).length !== 0) {
        //     console.log("data comes from redis server");
        //     return res.send(userRedisData);
        // } else {
            const user = await userModel.aggregate([
                {
                    $match: { username: username }
                },
                {
                    $lookup:
                    {
                        from: "addresses",
                        localField: "_id",
                        foreignField: "user_id",
                        as: "user-details"
                    }
                },
                {
                    $unwind: "$user-details"
                },
                {
                    $project: {
                        username: 1,
                        first_name: 1,
                        last_name: 1,
                        phone: 1,
                        email: 1,
                        profile: 1,
                        street: "$user-details.street",
                        city: "$user-details.city",
                        state: "$user-details.state"

                    }
                }
            ])
            // const redisData = {};
            // user.forEach(async element => {
            //     for (let key in element) {
            //         redisData[key] = element[key];
            //     }
            // });
            // await client.hset(username, redisData)
            return res.send(user);
      //  }

    } catch (error) {

        console.log(`error generate while get single user ${error.message}`)
    }


}

const updateuser = async (req, res) => {

    try {
        const { username } = req.params;
        if(!username || username === 'null' || username === 'undefined'){
            return res.status(400).send("enter the username or username is not valid");
    }
        const updatedUser = await userModel.findOneAndUpdate({ username: username }, {
            $set: req.body,
        }, { new: true }
        )
        // const redisUser = await client.hgetall(username);
        // for (let key in updatedUser) {
        //     if (redisUser.hasOwnProperty(key) && redisUser[key] !== updatedUser[key]) {
        //         redisUser[key] = updatedUser[key]
        //     }
        // }

        // await client.hset(username, redisUser);
        return res.status(201).send(updatedUser);
    } catch (error) {

        console.log(`error generate while updating the user ${error.message}`)

    }

}

const delUser = async (req,res) => {
            let {id} = req.params;
            if(!ObjectId. isValid(id)){
                return res.status(400).send("the id you have entered is not the valid object id")
            }
            await userModel.findByIdAndDelete(id); 
            return res.status(200).send("user deleted successfully!")
}

const fileUplaod = async (req, res) => {

    try {

        await new Promise((resolve, reject) => {
            upload.single('file')(req, res, (err) => {
                if (err) {
                    reject(err);
                } else {
                    if (!req.file) {
                        reject(new Error('No file uploaded'));
                    } else {
                        path = `http://localhost:3000/${req.file.path}`;
                        resolve();
                    }
                }
            });
        });
        // const user = await userModel.findOne({_id : new mongoose.Types.ObjectId(req.user._id) });
        // user.profile = path;
        // await user.save()
        return res.status(200).send({ message: 'File uploaded successfully', path: path });

    } catch (error) {
        console.log(`error generate while uploading the file ${error.message}`)
    }


}






module.exports = { createUser, userlogin, getALLUser, getUser, updateuser, delUser,forgetpassword, resetpassword, fileUplaod, generateToken, logout };


