const joi  = require('joi');

const addressSchema = joi.object({
    user_id : joi.string().required(),
    street: joi.string().required(),
    city: joi.string().required(),
    state: joi.string().required(),
})


const validateAddressSchema = (req,res,next) => {
    const {error} = addressSchema.validate(req.body);
    if(error){
        return res.status(400).send({
            error : error.details[0].message
        })
    }else{
        next();
    }
}

module.exports = validateAddressSchema;