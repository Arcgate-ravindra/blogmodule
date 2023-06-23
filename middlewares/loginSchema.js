const joi  = require('joi');

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
})


const validateLoginSchema = (req,res,next) => {
    const {error} = loginSchema.validate(req.body);
    if(error){
        return res.status(400).send({
            error : error.details[0].message
        })
    }else{
        next();
    }
}

module.exports = validateLoginSchema;