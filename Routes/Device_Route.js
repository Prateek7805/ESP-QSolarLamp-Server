const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');

const user_auth = require('../Authentication/User_Auth');
const dm_user = require('../DBO/Central_User_Device_Sch');
const device_joi = require('../Validation/Device_Joi');
const device_name_valid = require('../Validation/Device_Name');
const pass_valid = require('../Validation/Password');
const license_key_valid = require('../Validation/License_key');

router.use(body_parser.json());
router.use(cookie_parser());

router.post('/register', async (req, res)=>{
    try{
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);

        if(acc_check.code !== 200){
            const {code, message} = acc_check;
            return res.status(code).json({message});
        }

        const user_id = acc_check.message;

        const req_body = req.body;
        const joi_check = device_joi.register.validate(req_body);
        if(joi_check.error){
            return res.status(400).json({message: joi_check.error.details});
        }
        const {license_key, name, password} = req_body;

        const device_name_check = device_name_valid.validate(name);
        if(device_name_check.code !== 200){
            const {code, message} = device_name_check;
            return res.status(code).json({message});
        }

        const pass_check = pass_valid.validate(password);
        if(pass_check.code !== 200){
            const {code, message} = pass_check;
            return res.status(code).json({message});
        }
        
        const license_key_check = await license_key_valid.validate(license_key);
        if(license_key_check.code !== 200){
            const {code, message} = license_key_check;
            return res.status(code).json({message});
        }
        const license_key_db = license_key_check.message;

        const user = await dm_user.findById({_id: user_id});

        if(!user){
            return res.status(404).json({message: 'user not found'});
        }

        if(user.devices.some(device=>device.name === name)){
            return res.status(409).json({message: 'device name already exists'});
        }
        const hashed_password = await bcrypt.hash(password, 10);
        //add refresh token for mcu here
        const new_device = {
            name: name,
            password: hashed_password,
            status: {
                power : false,
                brightness: 30
            }
        };
        user.devices.push(new_device);
        await user.save();

        const device_id = user.devices.find(device=>device.name === name)._id;
        if(!device_id){
            return res.status(500).json({message: `device with name ${name} could not be created`});
        }

        license_key_db.device_id = device_id;
        await license_key_db.save();

        return res.status(200).json({message: 'Device successfully registered'});

    }catch(err){
        return res.status(500).json({message: err});
    }
});


module.exports = router;