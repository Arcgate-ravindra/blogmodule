const addressModel = require('../models/addressModel');
const Redis = require("ioredis");
const client = new Redis();


const createAddress = async(req, res) => {
    await addressModel.create(req.body);
    return res.status(400).send({
        message : "address created"
    })
}

const updateaddress = async (req, res) => {
    const { user_id } = req.params;
    const {username} = req.query
    const updatedaddress = await addressModel.findOneAndUpdate({ user_id : new mongoose.Types.ObjectId(user_id) }, {
        $set: req.body,
    }, { new: true }
    )
    const redisUser = await client.hgetall(username);
    const address= updatedaddress?.address;
    for(let key in address){
            if(redisUser.hasOwnProperty(key) && redisUser[key] !== address[key])
            {
                redisUser[key]  = address[key]
            }
    }
    await client.hset(username, redisUser);
    return res.send(updatedaddress);
}

module.exports = {createAddress,updateaddress};