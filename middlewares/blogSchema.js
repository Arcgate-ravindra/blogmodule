const joi = require('joi');

const blogSchema = joi.object({
    title : joi.string().required(),
    image: joi.string().required(),
    description: joi.string().required(),
    created_by: joi.string().required(),
})

const validateBlog = (req,res,next) => {

    const {error} = blogSchema.validate(req.body);
    if(error){
        return res.status(400).send({
            error : error.details[0].message
        })
    }else{
        next();
    }
}

module.exports = validateBlog;