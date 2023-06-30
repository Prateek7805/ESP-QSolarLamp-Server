const joi = require('joi');

const sign_up = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    date_of_birth: joi.string().optional(),
    creation_date: joi.date().default(Date.now).optional()
});

const login = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});

const remove = joi.object({
    password:joi.string().required()
});

module.exports = {
    sign_up,
    login,
    remove
}