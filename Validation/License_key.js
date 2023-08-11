const dm_license_key = require('../DBO/License_Key_Sch');
const LICENSE_KEY_LENGTH = 16
const linking_check = (existing, device_exists)=>{
    if((!existing && device_exists) || (existing && !device_exists)){
        return {code: 400, message: device_exists? "license key already registered to a user" : "Device not registered"};
    }
    return {code : 200};
}
async function validate(lkey, existing=false){
    try{
        if(!lkey) return {code: 404, message: "license key not found"};
        if(lkey.length !== LICENSE_KEY_LENGTH) return {code:  400, message : "license key length error"};
        const regex = /[^a-zA-Z0-9]/;
        if(regex.test(lkey)) return {code:  400, message : "license key content error"};
        const lkey_check = await dm_license_key.findOne({license_key: lkey});
        if(!lkey_check) return {code: 400, message : "license key integrity error"};
        if(!lkey_check.valid) return {code: 401, message : "license key validity error"};
        const link_check = linking_check(existing, lkey_check.device_id !== '')
        if(link_check.code !== 200){
            return link_check;
        }
        return {code : 200, message: lkey_check};
    }catch(err){
        console.log(err);
        return {code : 500, message: err};
    }
}


module.exports = {
    validate
}