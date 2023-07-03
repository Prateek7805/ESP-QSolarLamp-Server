const joi = require('joi');

const register = joi.object({
    license_key: joi.string().required(),
    name: joi.string().required(),
    password : joi.string().required()
});

const unregister = joi.object({
    name: joi.string().required()
});
const update = joi.object({
    power: joi.boolean().required(),
    brightness: joi.number().optional(),
    data: joi.array().items(joi.string()).optional()
});



module.exports = {
    register, 
    update,
    unregister
}