const dm_uid_maps = require('../db/uid_mapsSchema');
const UID_CHAR_LENGTH = 16
async function validate(uid){
    try{
        if(!uid) return {code: 404, message: "uid not found"};
        if(uid.length !== UID_CHAR_LENGTH) return {code:  400, message : "uid length error"};
        const regex = /[^a-zA-Z0-9]/;
        if(regex.test(uid)) return {code:  400, message : "uid content error"};
        const uid_check = await dm_uid_maps.findOne({uid});
        if(!uid_check) return {code: 404, message : "uid integrity error"};
        if(!uid_check.valid) return {code: 403, message : "uid validity error"};
        return {code : 200, message: uid_check.type};
    }catch(err){
        return {code : 500, message: err};
    }
    
}

module.exports = {
    validate
}