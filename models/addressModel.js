const { string } = require('joi');
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id : {type : mongoose.Schema.Types.ObjectId, required : true},
    street : {type : String, required : true},
    city : {type : String, required : true},
    state : {type : String, required : true}
})

const addressModel = mongoose.model('address', addressSchema);

module.exports = addressModel;