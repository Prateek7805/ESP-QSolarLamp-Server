const pv = require('password-validator');

const user_uuid_validator = new pv();

user_uuid_validator.has().not().spaces();

const validate = (uuid) => {
   const uuid_check = user_uuid_validator.validate(uuid, {list: true});
   if(uuid_check.length !== 0){
    return {code: 403, message: "Please provide a uuid without spaces"};
   }
   const regex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
   if(!regex.test(uuid)) return {code:  400, message : "Please provide the uuid with 0-9, A-F, a-f characters, 1st section 8, 2nd 3rd and 4th section 4 characters each and last section with 12 characters."};
   return {code: 200, message: "UUID validated successfully."};
}

module.exports = {validate}
