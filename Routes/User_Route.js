const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');
const pass_valid = require('../Validation/Password');

//bcrypt
const bcrypt = require('bcrypt');

const dm_user = require('../DBO/Central_User_Device_Sch');
const user_joi = require('../Validation/User_Joi');
const user_auth = require('../Authentication/User_Auth');
const dm_license_key = require('../DBO/License_Key_Sch');


router.use(body_parser.json());
router.use(cookie_parser());
const dev_mode = process.env.DEV;

const cookie_options = {
    httpOnly: true,
    secure: !dev_mode,
    sameSite: 'Strict'
}

router.post('/signup', async (req, res)=>{
    try{
        const req_body = req.body;
        const joi_check = user_joi.sign_up.validate(req_body);
        if(joi_check.error){
            return res.status(400).json({message: joi_check.error.details});
        }
        const password = req_body.password;
        const pass_check = pass_valid.validate(password);
        
        //username, Email, password checks
        if(pass_check.code !== 200){
            const {code, message} = pass_check;
            return res.status(code).json({message});
        }

        //check user in DB
        const email = req_body.email;
        const existing_user = await dm_user.findOne({email});

        if(existing_user){
            return res.status(409).json({message : `user with Email : ${email} exists`});
        }
        //user does not exist
        
        const hashed_password = await bcrypt.hash(password, 10);

        //create a user in DB
        const user = new dm_user({
            ...req_body,
            password : hashed_password
        });

        await user.save();

        const access_token = user_auth.get_access_token(user._id);
        const refresh_token = user_auth.get_refresh_token(user._id);

        const save_result = await user_auth.save_ref_token_db(user._id, refresh_token);

        if(save_result.code !== 200){
            const {code, message} = save_result; 
            return res.status(code).json({message});
        }

        res.cookie('refresh_token', refresh_token,cookie_options);

        return res.status(200).json({access_token});
    }catch(err){
        console.log(err);
        return res.status(500).json({message: err});
    }
    
});

router.post('/login', async (req, res)=>{
    try{
        const req_body = req.body;
        const joi_check = user_joi.login.validate(req_body);
        if(joi_check.error){
            return res.status(400).json({message: joi_check.error.details});
        }
        //check user in DB

        const password = req_body.password;
        const pass_rule_check = pass_valid.sch_password.validate(password);
        if(!pass_rule_check){
            return res.status(400).json({message: `Invalid Email or password`}); //Incorrect password rules need to check DB
        }
        const email = req_body.email;
        const user = await dm_user.findOne({email});

        if(!user){
            return res.status(404).json({message : `user with Email : ${email} does not exist`});
        }
        //user does not exist
        
        const hashed_password = user.password;

        const password_check = await bcrypt.compare(password, hashed_password);

        if(!password_check){
            return res.status(401).json({message: `Invalid Email or password`});
        }

        const access_token = user_auth.get_access_token(user._id);
        const refresh_token = user_auth.get_refresh_token(user._id);

        const save_result = await user_auth.save_ref_token_db(user._id, refresh_token);

        if(save_result.code !== 200){
            const {code, message} = save_result; 
            return res.status(code).json({message});
        }
        res.cookie('refresh_token', refresh_token, cookie_options);

        return res.status(200).json({access_token});
    }catch(err){
        return res.status(500).json({message: err});
    }
    
});

router.get('/logout', async (req, res)=>{
try{
    const access_token = req.header('x-auth-token');
    const acc_check = user_auth.verify_access_token(access_token);
    if(acc_check.code !== 200){
        const {code, message} = acc_check;
        return res.status(code).json(message);
    }
    const user_id = acc_check.message;
    
    const refresh_token = req.cookies?.refresh_token;
    console.log(req.cookies);
    const ref_check = await user_auth.remove_ref_token_db(user_id, refresh_token);

    res.clearCookie('refresh_token');

    if(ref_check.code !== 200){
        const {code, message} = ref_check;
        return res.status(code).json({message});
    }
    //ref token removed
    return res.status(200).json({message: "user logged out successfully"});
}catch(err){
    return res.status(500).json({message: err});
}
});

router.post('/remove', async (req, res)=>{
    try{
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);
        if(acc_check.code !== 200){
            const {code, message} = acc_check;
            return res.status(code).json({message});
        }
        const req_body = req.body;
        const joi_check = user_joi.remove.validate(req_body);
        
        if(joi_check.error){
            return res.status(400).json({message: joi_check.error.details});
        }
        const password = req_body.password;
        const pass_rule_check = pass_valid.sch_password.validate(password);
        if(!pass_rule_check){
            return res.status(401).json({message: 'Invalid Password'});
        }
        const user_id = acc_check.message;
        const user = await dm_user.findById({_id: user_id});

        if(!user){
            return res.status(404).json({message: 'user not found'});
        }

        const hashed_password = user.password;
        const pass_check = await bcrypt.compare(password, hashed_password);

        if(!pass_check){
            return res.status(401).json({message: `Invalid Email or password`});
        }

        const _id = user._id;
        //unregister all devices
        const numDevices = user.devices.length;
        for(let i = 0; i<numDevices; i++){
            const device_id = user.devices[i]._id;
            const active_license = await dm_license_key.findOne({device_id});
            active_license.device_id = "";
            await active_license.save();
        }
        const dUser = await dm_user.findByIdAndDelete({_id});
        console.log(dUser);
        res.clearCookie('refresh_token');
        return res.status(200).json({message: `user ${user.email} has been removed`});
    }catch(err){
        return res.status(500).json({message: err});
    }
});

router.get('/access_token', async (req, res)=>{
    try{
        const refresh_token = req.cookies?.refresh_token;
        const ref_check = await user_auth.verify_refresh_token(refresh_token);
        if(ref_check.code !== 200){
            const {code, message} = ref_check;
            return res.status(code).json({message});
        }
        //refresh token verified
        const {user_id, rolled_refresh_token} = ref_check.message;
        
        const access_token = user_auth.get_access_token(user_id);
        res.cookie('refresh_token', rolled_refresh_token, cookie_options);
        res.status(200).json({access_token});
    }catch(err){
        return res.status(500).json({message: err});
    }
});

router.patch('/password', async (req, res)=>{
    try{
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);
        
        if(acc_check.code !== 200){
            const {code, message} = acc_check;
            return res.status(code).json({message});
        }   
        
        const user_id = acc_check.message;

        const joi_check = user_joi.password_change.validate(req.body);
        
        if(joi_check.error){
            return res.status(400).json({message: joi_check.error.details});
        }

        const req_body = req.body;
        const {old_password, new_password} = req_body;

        const old_pass_check = pass_valid.sch_password.validate(old_password);
        if(!old_pass_check){
            return res.status(401).json({message: "Old Password is Invalid"});
        }

        const new_pass_check = pass_valid.validate(new_password);
        if(new_pass_check.code !== 200){
            const {code, message} = new_pass_check;
            return res.status(code).json({message});
        }

        const user = await dm_user.findById({_id: user_id});
        
        if(!user){
            return res.status(404).json({message: "user not found"});
        }
        const hashed_old_password = user.password;

        const pass_check = await bcrypt.compare(old_password, hashed_old_password);
        
        if(!pass_check){
            return res.status(401).json({message: "Old Password is Invalid"});
        }

        const hashed_new_password = await bcrypt.hash(new_password, 10);
        user.password = hashed_new_password;
        await user.save();
        
        return res.status(200).json({message: "Password changed successfully"});
        
    }catch(err){
        return res.status(500).json({message: err});
    }
});

module.exports = router;