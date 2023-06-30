require('dotenv').config();
const jwt = require('jsonwebtoken');

const dm_user = require('../DBO/Central_User_Device_Sch');

const ACCESS_TOKEN_TIMEOUT = "20m";
const REFRESH_TOKEN_TIMEOUT = "3d";
//helper functions
const get_token_sign = (token) => {
    const signIndex = token.lastIndexOf('.') + 1;
    const sign = token.substring(signIndex);
    return sign;
}

//end of helper functions

const get_access_token = (user_id) => {
    const payload = {
        user_id
    }
    const secret_key = process.env.ACCESS_SECRET_KEY;
    const token = jwt.sign(payload, secret_key, {expiresIn : ACCESS_TOKEN_TIMEOUT});
    return token;
}

const get_refresh_token = (user_id) => {
    const payload = {
        user_id
    }
    const secret_key = process.env.REFRESH_SECRET_KEY;
    const token = jwt.sign(payload, secret_key, {expiresIn : REFRESH_TOKEN_TIMEOUT});
    return token;
}

const verify_access_token = (token)=>{
    try{
        if(!token){
            return {code : 404, message : "No token found"};
        }
        const secret_key = process.env.ACCESS_SECRET_KEY;
        const decoded = jwt.verify(token, secret_key);
        const {user_id} = decoded;
        return {code : 200, message: user_id};
    }catch(err){
        return { code : 403, message : "invalid jwt"};
    }
}


const verify_refresh_token = async (token)=>{
    try{
        if(!token){
            return {code : 404, message : "No token found"};
        }
        const secret_key = process.env.REFRESH_SECRET_KEY;
        const decoded = jwt.verify(token, secret_key);

        const {user_id} = decoded;
        const sign = get_token_sign(token);

        const db_user = await dm_user.findById({_id: user_id});
        
        const token_exists = db_user.refresh_tokens.some(_token => _token.token === sign);
        console.log(`result: ${db_user.refresh_tokens.some(_token => _token.token === sign)}`);
        if(!token_exists){
            db_user.refresh_tokens = [];
            await db_user.save();
            return {code: 404, message: 'old refresh token received logging out from all devices'};
        }

        //refresh token verified
        const rolled_refresh_token = get_refresh_token(user_id);
        const rolled_sign = get_token_sign(rolled_refresh_token);

        db_user.refresh_tokens = db_user.refresh_tokens.filter(_token=>_token.token !== sign);
        db_user.refresh_tokens.push({token : rolled_sign});
        await db_user.save();

        return {code : 200, message: {user_id, rolled_refresh_token}};
    }catch(err){
        return { code : 403, message : "invalid jwt"};
    }
}




const save_ref_token_db = async (user_id, token)=>{
    try{
        const sign = get_token_sign(token);
        const db_user = await dm_user.findById({_id: user_id});
        if(!db_user){
            return {code : 404 , message : "User not found"};
        }
        db_user.refresh_tokens.push({token: sign});

        await db_user.save();
        return {code : 200, message : "Refresh token saved"};
    }catch(err){
        return {code : 500, message : "Couldn't save the refresh token"};
    }
    
}

const remove_ref_token_db = async (user_id, token)=>{
    try{
        if(!token){
            return {code: 404, message: 'Refresh token not found'};
        }
        const db_user = await dm_user.findById({_id: user_id});
        if(!db_user){
            return {code : 404 , message : "User not found"};
        }
        const sign = get_token_sign(token);

        db_user.refresh_tokens = db_user.refresh_tokens.filter(_token=>_token.token !== sign);
    
        await db_user.save();
        return {code : 200, message : "Refresh token removed"};
    }catch(err){
        return {code : 500, message : "Couldn't save the refresh token"};
    }
}


module.exports = {
    get_access_token,
    get_refresh_token,
    verify_access_token,
    verify_refresh_token,
    save_ref_token_db,
    remove_ref_token_db
}