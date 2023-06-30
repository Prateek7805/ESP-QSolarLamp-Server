const pv = require('password-validator');

const sch_password = new pv();

sch_password.is().min(8)
.is().max(20)
.has().uppercase()
.has().lowercase()
.has().digits()
.has().symbols();

const validate = (password)=>{
    const pel = sch_password.validate(password, {list: true}).map(item=>{
        if(item.endsWith('s')){
            return item.substring(0, item.length - 1);
        }
        return item;
    });
    const initial_check = ['min', 'max'];
    if(pel.length === 0) return {code: 200, message: 'password validated'};
    if(initial_check.some(item=>pel.includes(item)))
        return {code: 400, message: 'Please enter a password between 8 and 20 characters'};
    return {code: 400, message: `Please enter a password with atleast 1 ${pel.join(',')} characters`};
    
}
module.exports =  {
                    validate,
                    sch_password
                  };
