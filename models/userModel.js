const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        profile: { type: String, required: true },
        role: { type: String, default: "user" },
    }, { timestamps: true }
)

const userModel = new mongoose.model('user', userSchema);

module.exports = userModel;