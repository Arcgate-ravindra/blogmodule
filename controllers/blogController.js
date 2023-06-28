const { default: mongoose } = require('mongoose');
const blogModel = require('../models/blogModel');


const blogCreate = async (req, res) => {

    try {
        const data = await blogModel.create(req.body);
        return res.status(200).send({
            message: "blog create successfully",
            data: data
        })
    } catch (error) {
        console.log(`error generate while creating the blog ${error.message}`)
    }
   
}

const blogUpdate = async (req, res) => {
    try {
        if(!req.body){
            return res.status(400).send("please insert the the fields which you want to update");
        }
        const updatedData = await blogModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.params.id) }, { $set: { ...req.body, updatedAt: new Date() } }, { new: true });
        return res.status(200).send({
            message : "blog update successfully",
            data : updatedData
        })
    } catch (error) {
        console.log(`error generate while updating the blog ${error.message}`)
    }
    
}

const blogGetAll = async (req, res) => {
        try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search;
        let searchCondition = {};
        if(searchQuery){
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if(!dateRegex.test(searchQuery)){
                    return res.status(401).send("pleasee enter the date in this format : yyyy-mm-dd")
            }
            const date = new Date(searchQuery);
            const regexPattern = new RegExp(searchQuery,"i");
                searchCondition = {
                    $or : [
                        {title : regexPattern},
                        {description : regexPattern},
                        {
                            createdAt: {
                                $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                                $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                            }
                        }
                    ]
                     
                }
        }
            const data = await blogModel.aggregate([
                {
                            $match : searchCondition
                },
                {
                    $lookup : {
                        from : "users",
                        localField :  "created_by",
                        foreignField : "_id",
                        as : "blog-details"
                    }
                },
                {
                    $unwind : "$blog-details"
                },
                {
                    $skip : skip
            },
                {
                        $limit : limit
                },
                {
                    $sort : {createdAt : -1}
                },
                {
                    $project : {
                        title : 1,
                        description : 1,
                        image : 1,
                        created_by : {  $concat: ["$blog-details.first_name", " ", "$blog-details.last_name"]},
                        createdAt : 1,
                        updatedAt : 1, 
                    }
                }
            ])
            const totalData = await blogModel.find().countDocuments();
        const totalPage = Math.ceil(totalData / limit);
        return res.send({
            data : data,
            page : page,
            totalPage : totalPage,
            dataPerPage : data?.length,

        });
        } catch (error) {
            console.log(`error generate while getting all the blog ${error.message}`)
        }
}

const blogget = async (req, res) => {

    try {
        if(!req.params.id){
            return res.status(400).send("id is undefined");
        }
        const data = await blogModel.aggregate([
            {
                $match : {_id : new mongoose.Types.ObjectId(req.params.id)}
            },
            {
                $lookup : {
                    from : "users",
                    localField :  "created_by",
                    foreignField : "_id",
                    as : "blog-details"
                }
            },
            {
                $unwind : "$blog-details"
            },
            {
                $project : {
                    title : 1,
                    description : 1,
                    image : 1,
                    created_by : {  $concat: ["$blog-details.first_name", " ", "$blog-details.last_name"]},
                    createdAt : 1,
                    updatedAt : 1, 
                }
            }
        ])
        return res.status(200).send(data);
    } catch (error) {
        console.log(`error generate while getting the single blog ${error.message}`)
    }

}

const blogdelete = async (req, res) => {
    try {
        if(!req.params.id){
            return res.status(400).send("id is undefined");
        }
        await blogModel.findByIdAndDelete({_id : new mongoose.Types.ObjectId(req.params.id)});
        return res.status(200).send("data deleted successfully")
    } catch (error) {
        console.log(`error generate while deleting the blog ${error.message}`)
    }   
         
}

module.exports = { blogCreate, blogUpdate, blogGetAll, blogget, blogdelete }