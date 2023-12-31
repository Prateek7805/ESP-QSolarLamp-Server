const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
const bcrypt = require('bcrypt');

const light_joi = require('../Validation/Light_Joi');
const device_name_valid = require('../Validation/Device_Name');
const pass_valid = require('../Validation/Password');
const license_key_valid = require('../Validation/License_key');

const dm_user = require('../DBO/Central_User_Device_Sch');

const light_auth = require('../Authentication/Light_Auth');

router.use(body_parser.json());

router.post('/login', async (req, res) => {
    try {
        const req_body = req.body;
        const joi_check = light_joi.login.validate(req_body);
        if (joi_check.error) {
            return res.status(400).json({ message: joi_check.error.details });
        }
        const { lk, name, pass } = req_body;
        const lk_check = await license_key_valid.validate(lk, true);//existing ->true
        if (lk_check.code !== 200) {
            const { code, message } = lk_check;
            return res.status(code).json({ message });
        }
        const name_check = device_name_valid.sch_device_name.validate(name);
        if (!name_check) {
            return res.status(400).json({ message: "Device name is invalid" });
        }
        const pass_check = pass_valid.sch_password.validate(pass);
        if (!pass_check) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const license_key_db = lk_check.message;
        const { device_id } = license_key_db;
        const user = await dm_user.findOne({ 'devices._id': device_id }, { "devices.$": 1 });

        if (!user) {
            return res.status(404).json({ message: "User not registered" });
        }
        const device = user.devices[0];
        const locked = device.locked;
        if(locked){
            return res.status(403).json({message: "Device is locked, please contact support"});
        }
        const device_name_check = device.name === name;
        if (!device_name_check) {
            return res.status(404).json({ message: "Device name incorrect" });
        }
        const hashed_password = device.password;
        const password_check = await bcrypt.compare(pass, hashed_password);
        if (!password_check) {
            return res.status(401).json({ message: "Incorrect Password" });
        }
        const token = light_auth.get_token(device_id);
        return res.status(200).send(token);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
});

router.get('/status', async (req, res)=>{
    try{
        const token = req.header('x-auth-token');
        const token_check = light_auth.verify_token(token);
        if(token_check.code !== 200){
            const {code, message} = token_check;
            return res.status(code).json({message});
        }
        const device_id = token_check.message;
        const user = await dm_user.findOne({'devices._id': device_id}, {'_id': 0, 'devices.$' : 1});
        const device_status = user.devices[0].status;
        return res.status(200).json(device_status);
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: err });
    }
});

module.exports = router;