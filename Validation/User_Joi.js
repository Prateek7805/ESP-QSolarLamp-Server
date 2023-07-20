const joi = require('joi');

const sign_up = joi.object({
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    origin: joi.string().min(12).max(256).required(),
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

const password_change = joi.object({
    old_password: joi.string().required(),
    new_password: joi.string().required()
});

module.exports = {
    sign_up,
    login,
    remove,
    password_change
}