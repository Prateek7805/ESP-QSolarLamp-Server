const joi = require('joi');
const login = joi.object({
    lk: joi.string().required(),
    name: joi.string().required(),
    pass: joi.string().required()
});
const update = joi.object({
    power: joi.boolean().optional(),
    brightness: joi.number().optional(),
    data: joi.array().items(joi.string()).optional()
});

module.exports = {
    login,
    update
}