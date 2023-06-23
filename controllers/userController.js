const userModel = require('../models/userModel');
const slugify = require('slugify');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Redis = require("ioredis");
const client = new Redis();
require('dotenv').config();
const emailTransporter = require("../services/emailServices");

const secret_key = process.env.SECRET_KEY

const createUser = async (req, res) => {

    try {
        const { username, first_name, last_name, email, password, phone, profile } = req.body;
        const userexist = await userModel.findOne({ email: email });
        if (userexist) {
            return res.status(200).send({
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
        return res.status(200).send({
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
            return res.status(400).send({
                message: "User not exists...enter correct email or register yourself first"
            })
        }
        const isMatch = bcrypt.compareSync(password, userExists['password']);
        if (!isMatch) {
            return res.status(400).send({
                message: "Wrong password",
            })
        }
        const token = jwt.sign({ id: userExists._id }, secret_key, { expiresIn: "24h" });
        return res.status(200).send(
            {
                message: token
            }
        );

    } catch (error) {

        console.log(`error generate while login ${error.message}`)
    }


}

const forgetpassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(401).send({
            message: "please enter the email"
        })
    }
    const userExists = await userModel.findOne({ email: email });
    if (userExists) {
        const emailSendFun = await emailTransporter();
        console.log(emailSendFun);
    
    }else {
        return res.status(200).send(
            {
                message: "user not exists enter the valid email"
            }
        );
    }
}

const resetpassword = async (req, res) => {
    const { email, newpassword, confirmpassword } = req.body;
    if (!email && !newpassword && !confirmpassword) {
        return res.status(401).send({
            message: "please enter the required fields"
        })
    }
    if (confirmpassword !== newpassword ){
        return res.status(200).send({
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

const getALLUser = async (req, res) => {

    try {

        const usersData = await userModel.aggregate([
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
                    user_details: "$user-details",
                }
            }
        ])
        return res.send(usersData);

    } catch (error) {

        console.log(`error generate while get all user ${error.message}`)
    }

}

const getUser = async (req, res) => {

    try {
        const { username } = req.params;
        const userRedisData = await client.hgetall(username);
        if (Object.keys(userRedisData).length !== 0) {
            console.log("data comes from redis server");
            return res.send(userRedisData);
        } else {
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
            const redisData = {};
            user.forEach(async element => {
                for (let key in element) {
                    redisData[key] = element[key];
                }
            });
            await client.hset(username, redisData)
            return res.send(user);
        }

    } catch (error) {

        console.log(`error generate while get single user ${error.message}`)
    }


}

const updateuser = async (req, res) => {

    try {
        const { username } = req.params;
        const updatedUser = await userModel.findOneAndUpdate({ username: username }, {
            $set: req.body,
        }, { new: true }
        )
        const redisUser = await client.hgetall(username);
        for (let key in updatedUser) {
            if (redisUser.hasOwnProperty(key) && redisUser[key] !== updatedUser[key]) {
                redisUser[key] = updatedUser[key]
            }
        }

        await client.hset(username, redisUser);
        return res.send(updatedUser);
    } catch (error) {

        console.log(`error generate while updating the user ${error.message}`)

    }

}






module.exports = { createUser, userlogin, getALLUser, getUser, updateuser, forgetpassword, resetpassword };


