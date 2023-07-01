const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');

const user_auth = require('../Authentication/User_Auth');
const dm_user = require('../DBO/Central_User_Device_Sch');
const dm_license_key = require('../DBO/License_Key_Sch');
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
        
        const license_key_check = license_key_valid.validate(license_key);
        if(license_key_check.code !== 200){
            const {code, message} = license_key_check;
            return res.status(code).json({message});
        }
        
        
        
    }catch(err){
        return res.status(500).json({message: err});
    }
});


module.exports = router;