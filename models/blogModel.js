
const mongoose  = require('mongoose');

const blogSchema = new mongoose.Schema({
    title : {type : String, required : true},
    description : {type : String , required : true},
    image : {type : String},
    created_by : {type : mongoose.Schema.Types.ObjectId, required : true}
},{timestamps : true})

const blogModel = new mongoose.model('blog', blogSchema);

module.exports = blogModel;