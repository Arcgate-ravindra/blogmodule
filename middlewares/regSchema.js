const joi  = require('joi');

const regSchema  = joi.object({
    username: joi.string().required(),
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().min(10).max(10).required(),
    profile: joi.string().required(),
})

const validateSchema = (req,res,next) => {
        const {error} = regSchema.validate(req.body);
        if(error){
            return res.status(400).send({
                error : error.details[0].message
            })
        }else{
            next();
        }
}

module.exports = validateSchema;