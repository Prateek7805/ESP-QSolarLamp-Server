const dm_license_key = require('../DBO/License_Key_Sch');
const LICENSE_KEY_LENGTH = 16
async function validate(lkey){
    try{
        if(!lkey) return {code: 404, message: "license key not found"};
        if(lkey.length !== LICENSE_KEY_LENGTH) return {code:  400, message : "license key length error"};
        const regex = /[^a-zA-Z0-9]/;
        if(regex.test(lkey)) return {code:  400, message : "license key content error"};
        const lkey_check = await dm_license_key.findOne({license_key: lkey});
        if(!lkey_check) return {code: 404, message : "license key integrity error"};
        if(!lkey_check.valid) return {code: 403, message : "license key validity error"};
        return {code : 200, message: lkey_check.type};
    }catch(err){
        return {code : 500, message: err};
    }
}

module.exports = {
    validate
}