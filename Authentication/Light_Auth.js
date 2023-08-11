require('dotenv').config();
const jwt = require('jsonwebtoken');

const DEVICE_ACCESS_TOKEN_TIMEOUT = process.env.DEVICE_ACCESS_TOKEN_TIMEOUT;

//end of helper functions

const get_token = (user_id) => {
    const payload = {
        user_id
    }
    const secret_key = process.env.ACCESS_SECRET_KEY;
    const token = jwt.sign(payload, secret_key, {expiresIn : DEVICE_ACCESS_TOKEN_TIMEOUT});
    return token;
};

const verify_token = (token)=>{
    try{
        if(!token){
            return {code : 404, message : "No token found"};
        }
        const secret_key = process.env.DEVICE_ACCESS_SECRET_KEY;
        const decoded = jwt.verify(token, secret_key);
        const {device_id} = decoded;
        return {code : 200, message: device_id};
    }catch(err){
        return { code : 401, message : "invalid device jwt"};
    }
};

module.exports = {
    get_token,
    verify_token
}