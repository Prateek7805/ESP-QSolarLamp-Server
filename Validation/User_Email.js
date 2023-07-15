const pv = require('password-validator');

const validate = (data) => {
    const email = new pv();
    email.is().min(4)
    .is().max(150)
    .is().usingPlugin((value)=>{
        const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email_regex.test(value);
    });
    const email_valid = email.validate(data);
    if(!email_valid){
        return {code : 400, message: 'Invalid Email ID'}
    }
    return {code: 200, message: ''}
}
 
module.exports = {validate};