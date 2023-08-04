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
    power: joi.boolean().optional(),
    brightness: joi.number().optional(),
    data: joi.array().items(joi.string()).optional()
});

const update_name = joi.object({
    old_name : joi.string().required(),
    new_name : joi.string().required()
});

const update_password = joi.object({
    name : joi.string().required(),
    password : joi.string().required()
});

module.exports = {
    register, 
    update,
    unregister,
    update_name,
    update_password
}