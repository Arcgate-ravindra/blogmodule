const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: { type: String},
        first_name: { type: String},
        last_name: { type: String},
        email: { type: String},
        password: { type: String},
        phone: { type: String},
        profile: { type: String},
        role: { type: String, default: "user" },
        logged_in : {type : Boolean}
    }, { timestamps: true }
)

const userModel = new mongoose.model('user', userSchema);

module.exports = userModel;